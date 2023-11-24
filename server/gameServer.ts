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

import * as BABYLON from "@babylonjs/core";
import { Game } from "../common/game";
import { WorldServer } from "./worldServer";

export class GameServer extends Game {
    public name: string = "Server";

    public createEngine(): Promise<BABYLON.Engine> {
        this.engine = new BABYLON.NullEngine();
        return new Promise((resolve, _reject) => resolve(this.engine));
    }
    public createScene(): Promise<BABYLON.Scene> {
        this.world = new WorldServer(this);
        this.world!.load();
        this.world!.game.scene.onBeforeRenderObservable.add(
            this.tick.bind(this)
        );
        this.engine.runRenderLoop(() => {
            if (
                this.started &&
                !this.stopped &&
                this.world!.game.scene
            ) {
                try {
                    this.world!.tick();
                } catch (e: any) {
                    console.error(e);
                    this.stopped = true;
                }
            } else if (this.stopped && this.engine) {
                this.engine.stopRenderLoop();
                console.error("Stopping server...");
            }
        });
        return new Promise((resolve, _reject) => resolve(this.world!.game.scene));
    }

    public setMenuCamera(): void {} // Do nothing
}