/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";

export abstract class Ground {
  public mesh: BABYLON.Mesh;
}

export abstract class Wall {
  public mesh: BABYLON.Mesh;
}

export abstract class World {
  public scene: BABYLON.Scene;
  public grounds: Ground[];
  public walls: Wall[];

  public initialize() {
    grounds = [];
    walls = [];
  }

  public tick() {}
}
