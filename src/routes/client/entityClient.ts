/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Mixin } from "ts-mixer";
import { PlayerInputController } from "./clientInputController";
import { WorldClient } from "./worldClient";
import { Entity, Player } from "../common/entity";

export abstract class EntityClient extends Entity {
    public texture?: BABYLON.Texture;
    public world!: WorldClient;

    public setWorld(world: WorldClient): EntityClient {
        super.setWorld(world);
        return this;
    }
}

export class PlayerClient extends Mixin(EntityClient, Player) {
    public world!: WorldClient;
    public inputController: PlayerInputController;

    public constructor() {
        super();
        this.inputController = new PlayerInputController();
    }

    public setWorld(world: WorldClient): PlayerClient {
        super.setWorld(world);
        this.inputController.setEngine(this.world.scene.getEngine());
        return this;
    }

    protected checkCollisions(): void {
        // No collision check on client
    }
}