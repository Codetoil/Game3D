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

import * as uuid from "uuid"

export enum State {
    HANDSHAKING,
    LOGIN,
    CONFIG,
    PLAY
}

export class PacketType {
    public id: number;
    public state: State;
    public toBuffer: (packet: Packet) => ArrayBuffer;
    public fromBuffer: (buffer: ArrayBuffer) => Packet;

    public constructor(id: number, state: State, toBuffer: (packet: Packet) => ArrayBuffer, 
        fromBuffer: (buffer: ArrayBuffer) => Packet)
    {
        this.id = id;
        this.state = state;
        this.toBuffer = toBuffer;
        this.fromBuffer = fromBuffer;
    }
};

let packetTypes: Set<PacketType> = new Set<PacketType>();

export abstract class Packet
{
    private _packetType: PacketType;

    public constructor(packetType: PacketType)
    {
        this._packetType = packetType;
    }

    
    public get packetType() : PacketType {
        return this.packetType;
    }   
}

export function fromBuffer(buffer: ArrayBuffer): Packet
{
    let intBuffer: Int8Array = new Int8Array(buffer);
    let id = intBuffer.at(0) as number;
    let state = intBuffer.at(1) as State;

    for (const packetType of packetTypes) {
        if (packetType.id === id && packetType.state === state)
        {
            return packetType.fromBuffer(buffer)
        }
    }
    throw "Invalid packet for State: " + id + ":" + state
}

export function toBuffer(packet: Packet): ArrayBuffer
{
    return packet.packetType.toBuffer(packet);
}

export function registerPacketType(packetType: PacketType): void
{
    packetTypes.add(packetType);
}

let clientboundKeepAlivePacketType: PacketType;

export class ClientboundKeepAlivePacket extends Packet {
    keepAliveID: number;

    public constructor(keepAliveID: number)
    {
        super(clientboundKeepAlivePacketType);
        this.keepAliveID = keepAliveID;
    }
}

registerPacketType(clientboundKeepAlivePacketType = new PacketType(3, State.PLAY, (packet) => {
    let buffer: ArrayBuffer = new ArrayBuffer(4);
    let int8Buffer: Int8Array = new Int8Array(buffer);
    let int16Buffer: Int16Array = new Int16Array(buffer);
    int8Buffer.set([3, State.PLAY]);
    int16Buffer.set([(packet as ClientboundKeepAlivePacket).keepAliveID], 1);    
    return buffer;
}, (buffer) => {
    let intBuffer: Int16Array = new Int16Array(buffer);
    let keepAliveID: number = intBuffer.at(1) as number;

    return new ClientboundKeepAlivePacket(keepAliveID);
}));


let serverboundHandshakePacketType: PacketType;

export class ServerboundHandshakePacket extends Packet {
    protocol: number;
    nextState: State;

    public constructor(protocol: number, state: State)
    {
        super(serverboundHandshakePacketType);
        this.protocol = protocol;
        this.nextState = state;
    }
}

registerPacketType(serverboundHandshakePacketType = new PacketType(0, State.HANDSHAKING, (packet) => {
    let serverboundHandshakePacket: ServerboundHandshakePacket = packet as ServerboundHandshakePacket;
    let buffer: ArrayBuffer = new ArrayBuffer(7);
    let int8Buffer: Int8Array = new Int8Array(buffer, 0, 3);
    int8Buffer.set([0, State.HANDSHAKING, serverboundHandshakePacket.nextState]);
    let int16Buffer: Int32Array = new Int32Array(buffer, 3, 1);
    int16Buffer.set([serverboundHandshakePacket.protocol]);
    return buffer;
}, (buffer) => {
    let int8Buffer: Int8Array = new Int8Array(buffer, 0, 3);
    let int32Buffer: Int32Array = new Int32Array(buffer, 3, 1);
    let nextState: State = int8Buffer.at(3) as State;
    let protocol: number = int32Buffer.at(0) as number;

    return new ServerboundHandshakePacket(nextState, protocol);
}));

let serverboundLoginStartPacketType: PacketType;

export class ServerboundLoginStartPacket extends Packet {
    name: string;
    uuid: string | undefined;

    public constructor(name: string, uuid: string | undefined)
    {
        super(serverboundLoginStartPacketType);
        this.name = name;
        this.uuid = uuid;
    }
}

registerPacketType(serverboundLoginStartPacketType = new PacketType(3, State.PLAY, (packet) => {
    let serverboundLoginStartPacket = packet as ServerboundLoginStartPacket;
    let buffer: ArrayBuffer = new ArrayBuffer(260);
    let uint8Buffer: Uint8Array = new Uint8Array(buffer, 0, 4);
    let uint16Buffer: Uint16Array = new Uint16Array(buffer, 4, 256);
    uint8Buffer.set([3, State.PLAY]);
    for (let i = 0; i < Math.min(256, serverboundLoginStartPacket.name.length); i++)
    {
        uint16Buffer.set([serverboundLoginStartPacket.name.charCodeAt(i)], i);
    }
    if (serverboundLoginStartPacket.name.length < 256)
    {
        uint16Buffer.set([0], serverboundLoginStartPacket.name.length);
    }

    return buffer;
}, (buffer) => {
    let intBuffer: Int16Array = new Int16Array(buffer);
    let keepAliveID: number = intBuffer.at(1) as number;

    return new ServerboundLoginStartPacket(keepAliveID);
}));
