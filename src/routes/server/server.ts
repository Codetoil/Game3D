/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { WorldServer } from "./worldServer";

export abstract class Server {
    public world!: WorldServer;

    public init() {

    }

    public tick() {
        this.world.tick();
    }
}