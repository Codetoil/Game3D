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

export class Property {
    public name_: string;
    private value_: string;
    private signature_?: string;

    public constructor(name: string, value: string, signature?: string)
    {
        this.name_ = name;
        this.value_ = value;
        this.signature_ = signature;
    }

    public get name(): string {
        return this.name_;
    }

    public get value(): string {
        return this.value_;
    }

    public get signature(): string | undefined {
        return this.signature_;
    }

    public pack(): PropertyPacketType {
        return {
            name: this.name_,
            value: this.value_,
            signature: (!!this.signature_ ? this.signature_ : "")
        };
    }

    public unpack(propertyPacketType: PropertyPacketType) {
        this.name_ = propertyPacketType.name;
        this.value_ = propertyPacketType.value;
        if (propertyPacketType.signature !== "")
        {
            this.signature_ = propertyPacketType.signature;
        }
    }
}

type PropertyPacketType = {
    name: string,
    value: string,
    signature: string
};

const propertyType = {
    name: { type: 'string' },
    value: { type: 'string' },
    signature: { type: 'string' }
}

type UUIDPacketType = Uint8Array;

const uuidType = {
    bytes: [{ type: 'uint8' }]
}

export enum State {
    HANDSHAKING,
    STATUS,
    LOGIN,
    CONFIG,
    PLAY
}

type StatePacketType = number;

const stateType = { type: 'uint8' }

export interface Packet {
    genericPacketInfo: GenericPacketInfo;
    packetData: PacketData;
}

export interface PacketData {
    pack(): ArrayBuffer;
    unpack(buffer: ArrayBuffer): void;
}

export type GenericPacketInfo = {
    packetName: string,
    packetId: number,
    packetState: State
}

export type GenericPacketInfoPacketType = {
    packetName: string,
    packetId: number,
    packetState: StatePacketType
}

export const genericPacketInfoType = {
    packetName: { type: 'string' },
    packetId: { type: 'uint8' },
    packetState: stateType
};

export function getPacketFromGPIServerbound(genericPacketInfo: GenericPacketInfo)
{
    if (genericPacketInfo.packetId === 0x00 && genericPacketInfo.packetState === State.HANDSHAKING) return ServerboundHandshakePacketData;
    if (genericPacketInfo.packetId === 0x00 && genericPacketInfo.packetState === State.LOGIN) return ServerboundLoginStartPacketData;
    if (genericPacketInfo.packetId === 0x70 && genericPacketInfo.packetState === State.PLAY) return ServerboundDisconnectStartPacketData;
    if (genericPacketInfo.packetId === 0x23 && genericPacketInfo.packetState === State.PLAY) return ServerboundKeepAlivePacketData;
}

export function getPacketFromGPIClientbound(genericPacketInfo: GenericPacketInfo)
{
    if (genericPacketInfo.packetId === 0x00 && genericPacketInfo.packetState === State.LOGIN) return ClientboundDisconnectPacketData;
    if (genericPacketInfo.packetId === 0x02 && genericPacketInfo.packetState === State.LOGIN) return ClientboundLoginSuccessPacketData;
}

// To Server
export class ServerboundHandshakePacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Handshake",
        packetId: 0x00,
        packetState: State.HANDSHAKING.valueOf()
    };
    public static packetInfoType = {
        protocol: { type: 'uint32' },
        nextState: stateType
    };
    protocol: number;
    nextState: State;

    constructor(protocol: number, nextState: State) {
        this.protocol = protocol;
        this.nextState = nextState;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundHandshakePacketData.packetInfoType,
            {
                protocol: this.protocol,
                nextState: this.nextState.valueOf()
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            protocol: number,
            nextState: StatePacketType
        } = NetSerializer.unpack(buffer, ServerboundHandshakePacketData.packetInfoType);
        this.protocol = value.protocol;
        this.nextState = value.nextState;
    }
}

export class ServerboundLoginStartPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Login Start",
        packetId: 0x00,
        packetState: State.LOGIN.valueOf()
    };
    public static packetInfoType = {
        playerName: { type: 'string' },
        playerUUID: uuidType
    };
    playerName: string;
    playerUUID?: string;

    constructor(playerName: string, playerUUID?: string) {
        this.playerName = playerName;
        this.playerUUID = playerUUID;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundLoginStartPacketData.packetInfoType,
            {
                playerName: this.playerName,
                playerUUID: !!this.playerUUID ? uuid.parse(this.playerUUID) : []
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            playerName: string,
            playerUUID: UUIDPacketType
        } = NetSerializer.unpack(buffer, ServerboundLoginStartPacketData.packetInfoType);
        this.playerName = value.playerName;
        if (value.playerUUID.length != 0) {
            this.playerUUID = uuid.stringify(value.playerUUID)
        }
    }
}

export class ServerboundDisconnectStartPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Disconnect Start",
        packetId: 0x70,
        packetState: State.PLAY.valueOf()
    };
    public static packetInfoType = {
    };

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundDisconnectStartPacketData.packetInfoType,
            {
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
        } = NetSerializer.unpack(buffer, ServerboundDisconnectStartPacketData.packetInfoType);
    }
}

export class ServerboundKeepAlivePacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Keep Alive",
        packetId: 0x23,
        packetState: State.PLAY.valueOf()
    };
    public static packetInfoType = {
        keepAliveID: { type: 'uint32' }
    };
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundKeepAlivePacketData.packetInfoType,
            {
                keepAliveID: this.keepAliveID
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            keepAliveID: number
        } = NetSerializer.unpack(buffer, ServerboundKeepAlivePacketData.packetInfoType);
        this.keepAliveID = value.keepAliveID;
    }
}

// To Client
export class ClientboundDisconnectPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Disconnect at Login",
        packetId: 0x00,
        packetState: State.LOGIN.valueOf()
    };
    public static packetInfoType = {
        reason: { type: 'string' }
    };
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundDisconnectPacketData.packetInfoType,
            {
                reason: this.reason
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            reason: string
        } = NetSerializer.unpack(buffer, ClientboundDisconnectPacketData.packetInfoType);
        this.reason = value.reason;
    }
}

export class ClientboundLoginSuccessPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Login Success",
        packetId: 0x02,
        packetState: State.LOGIN.valueOf()
    };
    public static packetInfoType = {
        uuid: uuidType,
        username: { type: 'string' },
        properties: [propertyType]
    };
    uuid: string;
    username: string;
    properties: Array<Property>;

    constructor(uuid: string, username: string, properties: Array<Property>) {
        this.uuid = uuid;
        this.username = username;
        this.properties = properties;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundLoginSuccessPacketData.packetInfoType,
            {
                uuid: uuid.parse(this.uuid),
                username: this.username,
                properties: this.properties.map((property) => property.pack())
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            uuid: UUIDPacketType,
            username: string,
            properties: PropertyPacketType[]
        } = NetSerializer.unpack(buffer, ClientboundLoginSuccessPacketData.packetInfoType);
        this.uuid = uuid.stringify(value.uuid)
        this.username = value.username;
        this.properties = value.properties.map((propertyPacketType) => {
            let property: Property = new Property("", "");
            property.unpack(propertyPacketType);
            return property;
        });
    }
}

export class ClientboundDisconnectSuccessPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Disconnect Success",
        packetId: 0x71,
        packetState: State.PLAY.valueOf()
    };
    public static packetInfoType = {
    };

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundDisconnectSuccessPacketData.packetInfoType,
            {
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
        } = NetSerializer.unpack(buffer, ClientboundDisconnectSuccessPacketData.packetInfoType);
    }
}

export class ClientboundKickPacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Kick",
        packetId: 0x72,
        packetState: State.PLAY.valueOf()
    };
    public static packetInfoType = {
        reason: { type: 'string' }
    };
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundKickPacketData.packetInfoType,
            {
                reason: this.reason
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            reason: string
        } = NetSerializer.unpack(buffer, ClientboundKickPacketData.packetInfoType);
        this.reason = value.reason;
    }
}

export class ClientboundKeepAlivePacketData implements PacketData {
    public static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Keep Alive",
        packetId: 0x12,
        packetState: State.PLAY.valueOf()
    };
    public static packetInfoType = {
        keepAliveID: { type: 'uint32' }
    };
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundKeepAlivePacketData.packetInfoType,
            {
                keepAliveID: this.keepAliveID
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            keepAliveID: number
        } = NetSerializer.unpack(buffer, ClientboundKeepAlivePacketData.packetInfoType);
        this.keepAliveID = value.keepAliveID;
    }
}