/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Game } from "../common/game";

export class GameServer extends Game {
    public name: string = "Server";

    private convertFromValue(
        value: Game | PromiseLike<Game>
    ): GameServer | PromiseLike<GameServer> {
        if (value instanceof GameServer) {
            return value as GameServer;
        } else if (this.isGameServerPromiseLike(value)) {
            return value as PromiseLike<GameServer>;
        } else {
            throw new Error("Not of the form");
        }
    }

    private isGameServerPromiseLike(
        object: any
    ): object is PromiseLike<GameServer> {
        return "then" in object;
    }

    public createEngine(): Promise<BABYLON.Engine> {
        this.engine = new BABYLON.NullEngine();
        return new Promise((resolve, _reject) => resolve(this.engine));
    }
    public createScene(): Promise<BABYLON.Scene> {
        this.world.scene.onBeforeRenderObservable.add(
            this.tick.bind(this)
        );
        this.engine.runRenderLoop(() => {
            if (
                this.started &&
                !this.stopped &&
                this.world.scene
            ) {
                try {
                    this.world.tick();
                } catch (e: any) {
                    console.error(e);
                    this.stopped = true;
                }
            } else if (this.stopped && this.engine) {
                this.engine.stopRenderLoop();
                console.error("Stopping server...");
            }
        });
        return new Promise((resolve, _reject) => resolve(this.world.scene));
    }
}