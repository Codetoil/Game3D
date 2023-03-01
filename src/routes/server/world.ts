/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";

export class World {
  public grounds: BABYLON.Mesh[];
  public walls: BABYLON.Mesh[];
  public engine: BABYLON.Engine;
  public scene: BABYLON.Scene;

  public tick() {}
}
