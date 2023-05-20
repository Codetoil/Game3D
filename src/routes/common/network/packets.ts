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
    packet_name: string;
    packet_id: number;
    packet_state: State;
}

// To Server
export class HandshakePacket implements Packet {
    packet_name: string = "Handshake";
    packet_id: number = 0x00;
    packet_state: State = State.HANDSHAKING;
    protocol: number;
    nextState: State;

    constructor(protocol: number, nextState: State) {
        this.protocol = protocol;
        this.nextState = nextState;
    }
}

export class LoginStartPacket implements Packet {
    packet_name: string = "Login Start";
    packet_id: number = 0x00;
    packet_state: State = State.LOGIN;
    playerName: string;
    playerUUID?: string;

    constructor(playerName: string, playerUUID?: string) {
        this.playerName = playerName;
        this.playerUUID = playerUUID;
    }
}

export class DisconnectStartPacket implements Packet {
    packet_name: string = "Disconnect Start";
    packet_id: number = 0x70;
    packet_state: State = State.PLAY;
}

// To Client
export class LoginSuccessPacket implements Packet {
    packet_name: string = "Login Success";
    packet_id: number = 0x02;
    packet_state: State = State.LOGIN;
    uuid: string;
    username: string;
    properties: Array<Property>;

    constructor(uuid: string, username: string, properties: Array<Property>) {
        this.uuid = uuid;
        this.username = username;
        this.properties = properties;
    }
}

export class DisconnectPacket implements Packet {
    packet_name: string = "Disconnect (at login)";
    packet_id: number = 0x00;
    packet_state: State = State.LOGIN;
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }
}

export class DisconnectSuccessPacket implements Packet {
    packet_name: string = "Disconnect Success";
    packet_id: number = 0x71;
    packet_state: State = State.PLAY;
}

export class KickPacket implements Packet {
    packet_name: string = "Kick";
    packet_id: number = 0x72;
    packet_state: State = State.PLAY;
}