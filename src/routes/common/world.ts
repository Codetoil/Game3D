/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
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
