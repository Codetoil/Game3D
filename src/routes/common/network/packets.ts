/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */
/**
 * Heavily inspired by the M*necraft Networking Protocol 
 */

export interface Property {
    name: string;
    value: string;
    signature?: string;
}

export enum State {
    HANDSHAKING,
    STATUS,
    LOGIN,
    PLAY
}

export interface Packet {
    packetName: string;
    packetId: number;
    packetState: State;
}

// To Server
export class ServerboundHandshakePacket implements Packet {
    packetName: string = "Serverbound Handshake";
    packetId: number = 0x00;
    packetState: State = State.HANDSHAKING;
    protocol: number;
    nextState: State;

    constructor(protocol: number, nextState: State) {
        this.protocol = protocol;
        this.nextState = nextState;
    }
}

export class ServerboundLoginStartPacket implements Packet {
    packetName: string = "Serverbound Login Start";
    packetId: number = 0x00;
    packetState: State = State.LOGIN;
    playerName: string;
    playerUUID?: string;

    constructor(playerName: string, playerUUID?: string) {
        this.playerName = playerName;
        this.playerUUID = playerUUID;
    }
}

export class ServerboundDisconnectStartPacket implements Packet {
    packetName: string = "Serverbound Disconnect Start";
    packetId: number = 0x70;
    packetState: State = State.PLAY;
}

export class ServerboundKeepAlivePacket implements Packet {
    packetName: string = "Serverbound Keep Alive";
    packetId: number = 0x23;
    packetState: State = State.PLAY;
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }
}

// To Client
export class ClientboundLoginSuccessPacket implements Packet {
    packetName: string = "Clientbound Login Success";
    packetId: number = 0x02;
    packetState: State = State.LOGIN;
    uuid: string;
    username: string;
    properties: Array<Property>;

    constructor(uuid: string, username: string, properties: Array<Property>) {
        this.uuid = uuid;
        this.username = username;
        this.properties = properties;
    }
}

export class ClientboundDisconnectPacket implements Packet {
    packetName: string = "Clientbound Disconnect at Login";
    packetId: number = 0x00;
    packetState: State = State.LOGIN;
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }
}

export class ClientboundDisconnectSuccessPacket implements Packet {
    packetName: string = "Clientbound Disconnect Success";
    packetId: number = 0x71;
    packetState: State = State.PLAY;
}

export class ClientboundKickPacket implements Packet {
    packetName: string = "Clientbound Kick";
    packetId: number = 0x72;
    packetState: State = State.PLAY;
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }
}

export class ClientboundKeepAlivePacket implements Packet {
    packetName: string = "Serverbound Keep Alive";
    packetId: number = 0x12;
    packetState: State = State.PLAY;
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }
}