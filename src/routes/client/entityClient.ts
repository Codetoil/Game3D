/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Mixin } from "ts-mixer";
import { PlayerInputController } from "./playerInputController";
import { Entity, Player } from "../server/entity";
import { World } from "../server/world";
import { WorldClient } from "./worldClient";

export abstract class EntityClient extends Entity {
  public mesh: BABYLON.Mesh;
  public texture: BABYLON.Texture;
  public world: WorldClient;
}

export class PlayerClient extends Mixin(Player, EntityClient) {
  public world: WorldClient;
}
