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

import * as NetSerializer from "net-serializer";
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

    public constructor(id: number, state: State)
    {
        this.id = id;
        this.state = state;
    }
};

let packetTypes: Set<PacketType> = new Set<PacketType>();

export abstract class Packet
{
    public id: number;
    public state: State;

    public constructor(id: number, state: State)
    {
        this.id = id;
        this.state = state;
    }

    public abstract toBuffer(): ArrayBuffer;
    public abstract fromBuffer(buffer: ArrayBuffer): PacketType;
}

export function fromBuffer(buffer: ArrayBuffer): PacketType
{
    let intBuffer: Int8Array = new Int8Array(buffer);
    let id = intBuffer.at(0) as number;
    let state = intBuffer.at(1) as State;

    for (const packetType of packetTypes) {
        if (packetType.id === id && packetType.state === state)
        {
            return packetType;
        }
    }
    throw "Invalid packet for State: " + id + ":" + state
}