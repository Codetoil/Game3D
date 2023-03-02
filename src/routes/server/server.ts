/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { WorldServer } from "./worldServer";

export abstract class Server {
    public world!: WorldServer;

    public abstract init(): void;

    public tick() {
        this.world.tick();
    }
}