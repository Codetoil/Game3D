/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { World, Ground, Wall } from "../server/world";
import * as BABYLON from "@babylonjs/core"

export class GroundClient extends Ground {
    public mesh: BABYLON.Mesh;
}

export class WallClient extends Wall {
    public mesh: BABYLON.Mesh;
}

export class WorldClient extends World
{
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
}