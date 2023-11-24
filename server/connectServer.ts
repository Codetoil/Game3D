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
import type WebSocket from 'modern-isomorphic-ws';
import { WebSocketServer } from "modern-isomorphic-ws";
import { Packet, PacketType, State, fromBuffer, toBuffer, ClientboundKeepAlivePacket } from "../common/network/packets";
import { PROTOCOL as PROTOCOL } from "../common/version";

let sockets: Mutable<WebSocket[]>;
let socketStates: Map<WebSocket, State> = new Map();
let socketHasGottenKeepAlive: Map<WebSocket, boolean> = new Map();
let socketKeepAliveIds: Map<WebSocket, number> = new Map();
let socketIntervals: Map<WebSocket, NodeJS.Timeout> = new Map();

const wss = new WebSocketServer({
    port: 8080
});

function send(packet: Packet, socket: WebSocket): void {
    socket.send(packet.toBuffer());
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
        send(new ClientboundKeepAlivePacket(keepAliveId), ws); // Clientbound KeepAlive
    }, 20000));

    sockets.forEach(socket => {
        socket.on('error', (evt) => {
            console.error("Error: " + evt);
        })

        socket.onmessage = (ev: WebSocket.MessageEvent) => {
            if (ev.data instanceof ArrayBuffer)
            {
                const packetType: PacketType = fromBuffer(ev.data);
                const packet = packetType.packetConstructor(ev.data);
            }
            else
            {
                console.warn("Recieved wrong type of packet: " + ev.data);
            }
        }
    });
});