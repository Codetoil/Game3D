/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */
import type * as BABYLON from "@babylonjs/core";
import type { Entity } from "./entity";
import type { World } from "./world";

export interface InputController {
    sprintHeld: boolean;
    jumpPressed: boolean;
    joystick: BABYLON.Vector3;

    tick(entity: Entity, world: World): void;
}
