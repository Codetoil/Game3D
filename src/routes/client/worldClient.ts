/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { World, Ground, Wall } from "../server/world";
import * as BABYLON from "@babylonjs/core";
import { PlayerClient } from "./entityClient";
import { Quaternion } from "@babylonjs/core";

export class GroundClient extends Ground {
}

export class WallClient extends Wall {
}

export class WorldClient extends World {
  public cameraAngle: BABYLON.Quaternion = Quaternion.Zero();

  public player!: PlayerClient;
}
