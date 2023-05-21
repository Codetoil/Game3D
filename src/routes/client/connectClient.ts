/** 
 *  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
 */
import {
    ServerboundDisconnectStartPacket,
    ClientboundLoginSuccessPacket,
    State,
    type Packet,
    ServerboundHandshakePacket,
    ServerboundLoginStartPacket,
    ClientboundKickPacket,
    ServerboundKeepAlivePacket,
    ClientboundKeepAlivePacket
} from "../common/network/packets";
import type { Game } from "../common/game";
import { PROTOCOL } from "../common/version";
import { WorldClient } from "./worldClient";

function keepAliveTimeoutCallback(connectClient: ConnectClient) {
    console.warn("Timed out from server!")
    connectClient.disconnect();
    return;
}

export class ConnectClient {

    protected currentState: State = State.HANDSHAKING;
    protected game: Game | null = null;
    protected hasGottenKeepAlive: boolean = false;
    protected keepAliveTimeout: NodeJS.Timer;

    public setGame(game: Game) {
        console.debug("game = game$")
        this.game = game;
    }

    public abstract send(packet: Packet): void;

    public connect(name: string, event: MouseEvent, playerUUID?: string) {
        this.send(new ServerboundHandshakePacket(PROTOCOL, State.LOGIN))
        this.currentState = State.LOGIN
        this.send(new ServerboundLoginStartPacket(name, playerUUID))
    }

    public disconnect() {
        if (!!this.keepAliveTimeout) {
            clearTimeout(this.keepAliveTimeout);
        }
        this.game?.scene.removeCamera(this.game.camera);
        this.game.world = null;
        this.game?.setMenuCamera();
        console.debug("Switching user state to HANDSHAKING...")
        this.currentState = State.HANDSHAKING
    }

    public requestDisconnect(event: MouseEvent) {
        this.send(new ServerboundDisconnectStartPacket());
    }

    public forceDisconnect(event: MouseEvent) {
        this.disconnect();
    }

    public clientboundPackets(packet: Packet) {
        console.debug(
            "[Client] Recieved Packet: " + packet.packetName
        )
        if (packet.packetState === this.currentState) {
            // Login Success Packet
            if (packet.packetId === 0x02 && packet.packetState === State.LOGIN) {
                console.info("Login successful! Username: \"" + (packet as ClientboundLoginSuccessPacket).username
                    + "\" UUID: " + packet.uuid)
                console.info("Given User properties: [" + (packet as ClientboundLoginSuccessPacket).properties + "]")
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
            if (packet.packetId === 0x00 && packet.packetState === State.LOGIN) {
                this.disconnect();
                console.error("Failed to connect: " + (packet as ClientboundDisconnectPacket).reason);
            }
            // Disconnect Success Packet
            if (packet.packetId === 0x71 && packet.packetState === State.PLAY) {
                this.disconnect();
                console.info("Disconnect Successful!");
            }
            // Kick Packet
            if (packet.packetId === 0x72 && packet.packetState === State.PLAY) {
                this.disconnect();
                console.error("Kicked: " + (packet as ClientboundKickPacket).reason);
            }
            // Keep Alive Packet
            if (packet.packetId === 0x12 && packet.packetState === State.PLAY) {
                this.hasGottenKeepAlive = true;
                this.send(new ServerboundKeepAlivePacket((packet as ClientboundKeepAlivePacket).keepAliveID));
                clearTimeout(this.keepAliveTimeout);
                this.keepAliveTimeout = window.setTimeout(keepAliveTimeoutCallback, 30000, this);
            }
        }
        else {
            console.error("Packet for Wrong State: " + (packet as Packet).packetState + " vs " + this.currentState);
        }
    }
}