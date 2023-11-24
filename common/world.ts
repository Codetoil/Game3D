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
import type { Game } from "./game";

export class Ground {
    public mesh!: BABYLON.AbstractMesh;

    public setMesh(mesh: BABYLON.AbstractMesh): Ground {
        this.mesh = mesh;
        return this;
    }
}

export class Wall {
    public mesh!: BABYLON.AbstractMesh;

    public setMesh(mesh: BABYLON.AbstractMesh): Wall {
        this.mesh = mesh;
        return this;
    }
}

export abstract class World {
    public game: Game;
    public grounds!: Ground[];
    public walls!: Wall[];

    constructor(game: Game) {
        this.game = game;
    }

    public abstract load(): void;
    public abstract tick(): void;
}
