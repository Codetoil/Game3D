/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { serializer, fields } from 'serializers';

export const handshakePacket = serializer({
    id: fields.constant([0]),
    version: fields.constant(Array.from({length:1},(_v,k)=>k+1).map(v => v - 1)),
    address: fields.string(1, 255, false),
    port: fields.integer({
        min: 0,
        max: 65535
    }),
    nextState: fields.constant([1, 2]) // 1 for status, 2 for login
});