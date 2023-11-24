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

import type * as BABYLON from "@babylonjs/core";
import type { World } from "./world";

export abstract class Game {
    public abstract name: string;
    public world!: World | undefined;
    public engine!: BABYLON.Engine;
    public scene!: BABYLON.Scene;
    public camera!: BABYLON.Camera;
    public started: boolean = false;
    public stopped: boolean = false;
    public abstract createEngine(): Promise<BABYLON.Engine>;
    public abstract createScene(): Promise<BABYLON.Scene>;
    public abstract setMenuCamera(): void;

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
        if (!this.started || this.stopped || !(this.world !== undefined)) return;
        this.world.tick();
    }
}