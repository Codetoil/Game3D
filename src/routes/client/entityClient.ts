/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Mixin } from "ts-mixer";
import { PlayerInputController } from "./clientInputController";
import { WorldClient } from "./worldClient";
import { Entity, Player } from "../common/entity";
import type { World } from "../common/world";

export abstract class EntityClient extends Entity {
    public texture?: BABYLON.Texture;
}

export class PlayerClient extends Mixin(EntityClient, Player) {
    public inputController: PlayerInputController;

    public constructor() {
        super();
        this.inputController = new PlayerInputController();
    }

    public setWorld(world: World): Player {
        super.setWorld(world);
        this.inputController.setEngine(this.world.game.engine);
        return this;
    }

    protected checkCollisions(): void {
        // No collision check on client
    }
}