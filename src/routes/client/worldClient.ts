/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { PlayerClient } from "./entityClient";
import { Quaternion } from "@babylonjs/core";
import { World } from "../common/world";

export class WorldClient extends World {
    public cameraAngle: BABYLON.Quaternion = Quaternion.Zero();

    public player!: PlayerClient;

    public load(): void {
        // Start networking
    }

    public tick() {

    }
}