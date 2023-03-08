/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */
/**
 * Uses the M*necraft protocol for networking. 
 */

export interface Property {
    name: string;
    value: string;
    signature?: string;
}

export interface Packet {
    _packet_name: string;
}

// To Server
export interface HandshakePacket extends Packet {
    _handshake: number;
    version: number;
    address: string;
    port: number; // 0-65565
    nextState: number;
}

export interface LoginStart extends Packet {
    _login_start: number;
    name: string;
    playerUUID?: string;
}

export interface RequestDisconnectPacket extends Packet {
    _request_disconnect: number;
}

// To Client
export interface LoginSuccessfulPacket extends Packet {
    _login_successful: number;
    uuid: string;
    username: string;
    properties: Array<Property>;
}

export interface DisconnectSuccessfulPacket extends Packet {
    _disconnect_successful: number;
}