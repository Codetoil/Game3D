/**
 *  Game3D, a 3D Platformer built for the web.
 *  Copyright (C) 2021-2023  Codetoil
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { Mutable } from "$lib/mutable";
import WebSocket, { WebSocketServer } from 'ws';
import {  } from "../common/network/packets";
import { PROTOCOL as PROTOCOL } from "../common/version";
import * as NetSerializer from "net-serializer";

let sockets: Mutable<WebSocket[]>;
let socketStates: Map<WebSocket, State> = new Map();
let socketHasGottenKeepAlive: Map<WebSocket, boolean> = new Map();
let socketKeepAliveIds: Map<WebSocket, number> = new Map();
let socketIntervals: Map<WebSocket, NodeJS.Timeout> = new Map();

const wss = new WebSocketServer({
    port: 8080
});

function send(packet: Packet, socket: WebSocket): void {
    let packetInfoBuffer = NetSerializer.pack(packet.genericPacketInfo, genericPacketInfoType);
    let packetDataBuffer = packet.packetData.pack();
    let buffer = new Uint8Array(2 + packetInfoBuffer.byteLength + packetDataBuffer.byteLength);
    let high = ((packetInfoBuffer.byteLength >> 8) & 0xff);
    let low = packetInfoBuffer.byteLength & 0xff;
    buffer.set([low, high], 0) // Big-Endian
    buffer.set(new Uint8Array(packetInfoBuffer), 2)
    buffer.set(new Uint8Array(packetDataBuffer), packetInfoBuffer.byteLength + 2);
    socket.send(buffer);
}

function disconnectPort(socket: WebSocket) {
    console.info("Closing connection with user at socket " + socket);
    socket.close();
    socketStates.delete(socket);
    socketHasGottenKeepAlive.delete(socket);
    socketKeepAliveIds.delete(socket);
    socketIntervals.delete(socket);
}

function closeConnectionSocket(socket: WebSocket) {
    send({
        genericPacketInfo: ClientboundDisconnectSuccessPacketData.genericPacketInfo,
        packetData: new ClientboundDisconnectSuccessPacketData()
    }, socket);
    disconnectPort(socket)
}

function kickPlayerPort(socket: WebSocket, reason: string) {
    send({
        genericPacketInfo: ClientboundKickPacketData.genericPacketInfo,
        packetData: new ClientboundKickPacketData(reason)
    }, socket);
    disconnectPort(socket)
}

function loginRefuseSocket(socket: WebSocket, reason: string) {
    send({
        genericPacketInfo: ClientboundDisconnectPacketData.genericPacketInfo,
        packetData: new ClientboundDisconnectPacketData(reason)
    }, socket);
    disconnectPort(socket)
}

wss.on('connection', (ws) => {
    sockets.push(ws);
    socketStates.set(ws, State.HANDSHAKING);
    socketHasGottenKeepAlive.set(ws, false);
    socketIntervals.set(ws, setInterval(() => {
        if (!socketHasGottenKeepAlive.get(ws)) {
            console.warn("User with socket " + ws + " timed out, kicking.");
            clearInterval(socketIntervals.get(ws));
            kickPlayerPort(ws, "Timeout");
            return;
        }
        socketHasGottenKeepAlive.set(ws, false)
        let keepAliveId = Math.random();
        socketKeepAliveIds.set(ws, keepAliveId)
        send({
            genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
            packetData: new ClientboundKeepAlivePacketData(keepAliveId)
        }, ws);
    }, 20000));

    sockets.forEach(socket => {
        socket.on('error', (evt) => {
            console.error("Error: " + evt);
        })

        socket.onmessage = (ev) => {
            if (
                "packetName" in ev.data &&
                "packetId" in ev.data &&
                "packetState" in ev.data &&
                ev.data.packetState === socketStates.get(socket)
            ) {
                console.debug(
                    "[Server] Received Packet: " + ev.data.packetName
                )
                // Handshake Packet
                if (ev.data.packetId === 0x00 && ev.data.packetState === State.HANDSHAKING) {
                    if (ev.data.protocol < PROTOCOL) {
                        loginRefuseSocket(socket, "Newer server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
                    }
                    else if (ev.data.protocol > PROTOCOL) {
                        loginRefuseSocket(socket, "Outdated server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
                    }
                    else {
                        if (ev.data.nextState === State.STATUS) {
                            // ignore for now
                            console.debug("Switching state for socket " + socket + " to STATUS");
                            socketStates.set(socket, State.STATUS);
                        }
                        else if (ev.data.nextState === State.LOGIN) {
                            console.debug("Switching state for port " + socket + " to LOGIN");
                            socketStates.set(socket, State.LOGIN);
                        }
                        else {
                            loginRefuseSocket(socket, "Status not of valid options [Status, Login]: " + ev.data.nextState)
                        }
                    }
                }
                // Login Start Packet
                if (ev.data.packetId === 0x00 && ev.data.packetState === State.LOGIN) {
                    let playerUUID = !!ev.data.playerUUID ? ev.data.playerUUID : "temp";
                    let playerName = ev.data.playerName;
                    send({
                        genericPacketInfo: ClientboundLoginSuccessPacketData.genericPacketInfo,
                        packetData: new ClientboundLoginSuccessPacketData(playerUUID, playerName, [])
                    }, socket)
                    console.debug("Switching state for socket " + socket + " to PLAY");
                    socketStates.set(socket, State.PLAY);
                    console.info("User at socket " + socket + " logging in with UUID " + playerUUID);
                    let keepAliveId = Math.random();
                    socketKeepAliveIds.set(socket, keepAliveId)
                    send({
                        genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
                        packetData: new ClientboundKeepAlivePacketData(keepAliveId)
                    }, socket)
                    // Do something with the game server
                }
                // Disconnect Start Packet
                if (ev.data.packetId === 0x70 && ev.data.packetState === State.PLAY) {
                    console.info("User at socket " + socket + " requesting disconnect, closing connection.");
                    closeConnectionSocket(socket);
                }
                // Keep Alive Packet
                if (ev.data.packetId === 0x23 && ev.data.packetState === State.PLAY) {
                    console.debug("Received Keep-Alive from user at socket " + socket)
                    socketHasGottenKeepAlive.set(socket, true);
                }
            } else {
                console.debug("Received: " + ev.data);
            }
        }
    });
});