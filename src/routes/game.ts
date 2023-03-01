/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";

export abstract class Game {
    public ready: Promise<Game> = new Promise((resolve, reject) => {
        return this.init(resolve, reject);
    });
    public started: boolean = false;
    public stopped: boolean = false;

    public engine!: BABYLON.Engine;

    public abstract createEngine(): Promise<BABYLON.Engine>;
    public abstract createScene(): Promise<BABYLON.Scene>;

    public init(resolve: (value: Game | PromiseLike<Game>) => void, reject: (reason?: any) => void): Game {
        this.createEngine()
            .then((engine) => {
                if (!engine) reject(new Error("engine should not be null."));
                this.createScene()
                .then((scene) => {
                    if (!scene) reject(new Error("scene should not be null."));
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
                    this.started = true;
                    console.info("Starting game...");
                }
            );
        return this;
    }
}