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

import {
    ServerboundDisconnectStartPacketData,
    ClientboundLoginSuccessPacketData,
    State,
    type Packet,
    type PacketData,
    ServerboundHandshakePacketData,
    ServerboundLoginStartPacketData,
    ClientboundKickPacketData,
    ServerboundKeepAlivePacketData,
    ClientboundKeepAlivePacketData,
    ClientboundDisconnectPacketData,
    genericPacketInfoType
} from "../common/network/packets";
import type { Game } from "../common/game";
import { PROTOCOL } from "../common/version";
import { WorldClient } from "./worldClient";
import NetSerializer from "net-serializer";

export class ConnectClient {
    protected currentState: State = State.HANDSHAKING;
    protected game!: Game;
    protected hasGottenKeepAlive: boolean = false;
    protected keepAliveTimeout: number | undefined = undefined;
    protected socket!: WebSocket;

    public constructor(game: Game) {
        this.setGame(game);
    }

    public setGame(game: Game) {
        console.debug("game = game$")
        this.game = game;
    }

    public send(packet: Packet): void {
        let packetInfoBuffer = NetSerializer.pack(packet.genericPacketInfo, genericPacketInfoType);
        let packetDataBuffer = packet.packetData.pack();
        let buffer = new Uint8Array(2 + packetInfoBuffer.byteLength + packetDataBuffer.byteLength);
        let high = ((packetInfoBuffer.byteLength >> 8) & 0xff);
        let low = packetInfoBuffer.byteLength & 0xff;
        buffer.set([low, high], 0) // Big-Endian
        buffer.set(new Uint8Array(packetInfoBuffer), 2)
        buffer.set(new Uint8Array(packetDataBuffer), packetInfoBuffer.byteLength + 2);
        this.socket.send(buffer);
    }

    public connect(name: string, event: MouseEvent, playerUUID?: string) {
        this.send({
            genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
            packetData: new ServerboundHandshakePacketData(PROTOCOL, State.LOGIN)
        })
        this.currentState = State.LOGIN
        this.send({
            genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
            packetData: new ServerboundLoginStartPacketData(name, playerUUID)
        })
    }

    public disconnect() {
        if (!!this.keepAliveTimeout) {
            clearTimeout(this.keepAliveTimeout);
            this.keepAliveTimeout = undefined;
        }
        this.game?.scene.removeCamera(this.game.camera);
        this.game.world = undefined;
        this.game?.setMenuCamera();
        console.debug("Switching user state to HANDSHAKING...");
        this.currentState = State.HANDSHAKING;
    }

    public requestDisconnect(event: MouseEvent) {
        this.send({
            genericPacketInfo: ServerboundDisconnectStartPacketData.genericPacketInfo,
            packetData: new ServerboundDisconnectStartPacketData()
        });
    }

    public forceDisconnect(event: MouseEvent) {
        this.disconnect();
    }

    public clientboundPackets(packet: Packet) {
        console.debug(
            "[Client] Received Packet: " + packet.genericPacketInfo.packetName
        )
        if (packet.genericPacketInfo.packetState === this.currentState) {
            // Login Success Packet
            if (packet.genericPacketInfo.packetId === 0x02 && packet.genericPacketInfo.packetState === State.LOGIN) {
                console.info("Login successful! Username: \"" + (packet.packetData as ClientboundLoginSuccessPacketData).username
                    + "\" UUID: " + (packet.packetData as ClientboundLoginSuccessPacketData).uuid)
                console.info("Given User properties: [" + (packet.packetData as ClientboundLoginSuccessPacketData).properties + "]")
                console.debug("Switching user state to PLAY...")
                this.currentState = State.PLAY
                console.info("Loading World...")
                this.game?.scene.removeCamera(this.game.camera);
                this.game.world = new WorldClient(this.game);
                this.game?.world.load();
                this.hasGottenKeepAlive = false;
                this.keepAliveTimeout = window.setTimeout(ConnectClient.keepAliveTimeoutCallback, 30000, this);
            }
            // Disconnnect (at login) Packet
            if (packet.genericPacketInfo.packetId === 0x00 && packet.genericPacketInfo.packetState === State.LOGIN) {
                this.disconnect();
                console.error("Failed to connect: " + (packet.packetData as ClientboundDisconnectPacketData).reason);
            }
            // Disconnect Success Packet
            if (packet.genericPacketInfo.packetId === 0x71 && packet.genericPacketInfo.packetState === State.PLAY) {
                this.disconnect();
                console.info("Disconnect Successful!");
            }
            // Kick Packet
            if (packet.genericPacketInfo.packetId === 0x72 && packet.genericPacketInfo.packetState === State.PLAY) {
                this.disconnect();
                console.error("Kicked: " + (packet.packetData as ClientboundKickPacketData).reason);
            }
            // Keep Alive Packet
            if (packet.genericPacketInfo.packetId === 0x12 && packet.genericPacketInfo.packetState === State.PLAY) {
                this.hasGottenKeepAlive = true;
                this.send(/** @type {import("../../common/network/packets").Packet} */ ({
                    genericPacketInfo: ServerboundKeepAlivePacketData.genericPacketInfo,
                    packetData: new ServerboundKeepAlivePacketData((packet.packetData as ClientboundKeepAlivePacketData).keepAliveID)
                }));
                clearTimeout(this.keepAliveTimeout);
                this.keepAliveTimeout = window.setTimeout(ConnectClient.keepAliveTimeoutCallback, 30000, this);
            }
        }
        else {
            console.error("Packet for Wrong State: " + (packet as Packet).genericPacketInfo.packetState + " vs " + this.currentState);
        }
    }

    public static keepAliveTimeoutCallback(connectClient: ConnectClient) {
        console.warn("Timed out from server!")
        connectClient.disconnect();
        return;
    }
}