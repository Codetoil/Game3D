/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { World } from "./world";

export abstract class Game {
    public abstract name: string;
    public world!: World;
    public engine!: BABYLON.Engine;
    public scene!: BABYLON.Scene;
    public camera!: BABYLON.Camera;
    public started: boolean = false;
    public stopped: boolean = false;
    public abstract async createEngine(): Promise<BABYLON.Engine>;
    public abstract async createScene(): Promise<BABYLON.Scene>;
    public abstract async setMenuCamera(): void;

    public init(resolve: (value: Game | PromiseLike<Game>) => void, reject: (reason?: any) => void) {
        this.createEngine()
            .then((engine) => {
                if (!engine) reject(new Error("engine should not be null."));
                this.engine = engine;
                this.createScene()
                    .then((scene) => {
                        if (!scene) reject(new Error("scene should not be null."));
                        this.scene = scene;
                        resolve(this);
                    })
                    .catch(function (e) {
                        console.error("The available createScene function failed.");
                        console.error(e);
                        reject(e);
                    });
            })
            .catch((e) => {
                console.error("The available createEngine function failed.");
                console.error(e);
                reject(e);
            }).then(
                () => {
                    this.started = true
                    console.info("Started " + this.name);
                }
            );
    }

    public tick(): void {
        if (!this.started || this.stopped || !(this.world !== null)) return;
        this.world.tick();
    }
}