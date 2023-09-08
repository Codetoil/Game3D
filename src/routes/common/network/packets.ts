/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as NetSerializer from "net-serializer";
import * as uuid from "uuid"

export class Property {
    private name_: string;
    private value_: string;
    private signature_?: string;

    constructor(name: string, value: string, signature?: string)
    {
        this.name_ = name;
        this.value_ = value;
        this.signature_ = signature;
    }

    get name(): string {
        return this.name_;
    }

    get value(): string {
        return this.value_;
    }

    get signature(): string | undefined {
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

const genericPacketInfoType = {
    packetName: { type: 'string' },
    packetId: { type: 'uint8' },
    packetState: stateType
};

// To Server
export class ServerboundHandshakePacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Handshake",
        packetId: 0x00,
        packetState: State.HANDSHAKING.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
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
        return NetSerializer.pack(ServerboundHandshakePacket.packetInfoType,
            {
                packetInfo: ServerboundHandshakePacket.genericPacketInfo,
                protocol: this.protocol,
                nextState: this.nextState.valueOf()
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType
            protocol: number,
            nextState: StatePacketType
        } = NetSerializer.unpack(buffer, ServerboundHandshakePacket.packetInfoType);
        this.protocol = value.protocol;
        this.nextState = value.nextState;
    }
}

export class ServerboundLoginStartPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Login Start",
        packetId: 0x00,
        packetState: State.LOGIN.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
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
        return NetSerializer.pack(ServerboundLoginStartPacket.packetInfoType,
            {
                packetInfo: ServerboundLoginStartPacket.packetInfoType,
                playerName: this.playerName,
                playerUUID: !!this.playerUUID ? uuid.parse(this.playerUUID) : []
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType
            playerName: string,
            playerUUID: UUIDPacketType
        } = NetSerializer.unpack(buffer, ServerboundLoginStartPacket.packetInfoType);
        this.playerName = value.playerName;
        if (value.playerUUID.length != 0) {
            this.playerUUID = uuid.stringify(value.playerUUID)
        }
    }
}

export class ServerboundDisconnectStartPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Disconnect Start",
        packetId: 0x70,
        packetState: State.PLAY.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType
    };

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundDisconnectStartPacket.packetInfoType,
            {
                packetInfo: ServerboundDisconnectStartPacket.packetInfoType
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType
        } = NetSerializer.unpack(buffer, ServerboundDisconnectStartPacket.packetInfoType);
    }
}

export class ServerboundKeepAlivePacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Serverbound Keep Alive",
        packetId: 0x23,
        packetState: State.PLAY.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
        keepAliveID: { type: 'uint32' }
    };
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ServerboundKeepAlivePacket.packetInfoType,
            {
                packetInfo: ServerboundKeepAlivePacket.packetInfoType
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType,
            keepAliveID: number
        } = NetSerializer.unpack(buffer, ServerboundKeepAlivePacket.packetInfoType);
        this.keepAliveID = value.keepAliveID;
    }
}

// To Client
export class ClientboundLoginSuccessPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Login Success",
        packetId: 0x02,
        packetState: State.LOGIN.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
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
        return NetSerializer.pack(ClientboundLoginSuccessPacket.packetInfoType,
            {
                packetInfo: ClientboundLoginSuccessPacket.packetInfoType,
                uuid: uuid.parse(this.uuid),
                username: this.username,
                properties: this.properties.map((property) => property.pack())
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType,
            uuid: UUIDPacketType,
            username: string,
            properties: PropertyPacketType[]
        } = NetSerializer.unpack(buffer, ClientboundLoginSuccessPacket.packetInfoType);
        this.uuid = uuid.stringify(value.uuid)
        this.username = value.username;
        this.properties = value.properties.map((propertyPacketType) => {
            let property: Property = new Property("", "");
            property.unpack(propertyPacketType);
            return property;
        });
    }
}

export class ClientboundDisconnectPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Disconnect at Login",
        packetId: 0x00,
        packetState: State.LOGIN.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
        reason: { type: 'string' }
    };
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundDisconnectPacket.packetInfoType,
            {
                packetInfo: ClientboundDisconnectPacket.packetInfoType,
                reason: this.reason
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType,
            reason: string
        } = NetSerializer.unpack(buffer, ClientboundDisconnectPacket.packetInfoType);
        this.reason = value.reason;
    }
}

export class ClientboundDisconnectSuccessPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Disconnect Success",
        packetId: 0x71,
        packetState: State.PLAY.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType
    };

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundDisconnectSuccessPacket.packetInfoType,
            {
                packetInfo: ClientboundDisconnectSuccessPacket.packetInfoType
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType
        } = NetSerializer.unpack(buffer, ClientboundDisconnectSuccessPacket.packetInfoType);
    }
}

export class ClientboundKickPacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Kick",
        packetId: 0x72,
        packetState: State.PLAY.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
        reason: { type: 'string' }
    };
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundKickPacket.packetInfoType,
            {
                packetInfo: ClientboundKickPacket.packetInfoType,
                reason: this.reason
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfoPacketType
            reason: string
        } = NetSerializer.unpack(buffer, ClientboundKickPacket.packetInfoType);
        this.reason = value.reason;
    }
}

export class ClientboundKeepAlivePacket implements Packet {
    static genericPacketInfo: GenericPacketInfo = {
        packetName: "Clientbound Keep Alive",
        packetId: 0x12,
        packetState: State.PLAY.valueOf()
    };
    static packetInfoType = {
        packetInfo: genericPacketInfoType,
        keepAliveID: { type: 'uint32' }
    };
    keepAliveID: number;

    constructor(keepAliveID: number) {
        this.keepAliveID = keepAliveID;
    }

    public pack(): ArrayBuffer {
        return NetSerializer.pack(ClientboundKeepAlivePacket.packetInfoType,
            {
                packetInfo: ClientboundKeepAlivePacket.packetInfoType,
                keepAliveID: this.keepAliveID
            });
    }

    public unpack(buffer: ArrayBuffer): void {
        const value: {
            packetInfo: GenericPacketInfo,
            keepAliveID: number
        } = NetSerializer.unpack(buffer, ClientboundKeepAlivePacket.packetInfoType);
        this.keepAliveID = value.keepAliveID;
    }
}