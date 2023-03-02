/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Entity } from "./entity";
import { WorldServer } from "./worldServer";

export interface InputController {
  sprintHeld: boolean;
  jumpPressed: boolean;
  joystick: BABYLON.Vector3;

  tick(entity: Entity, world: WorldServer): void;
}
