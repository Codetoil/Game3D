/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

export interface HandshakePacket
{
    version: number;
    address: string;
    port: number; // 0-65565
    nextState: number;
}