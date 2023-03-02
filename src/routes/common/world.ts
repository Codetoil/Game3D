/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";

export class Ground {
  public mesh!: BABYLON.AbstractMesh;

  public setMesh(mesh: BABYLON.AbstractMesh): Ground {
    this.mesh = mesh;
    return this;
  }
}

export class Wall {
  public mesh!: BABYLON.AbstractMesh;

  public setMesh(mesh: BABYLON.AbstractMesh): Wall {
    this.mesh = mesh;
    return this;
  }
}

export abstract class AbstractWorld {
  public scene!: BABYLON.Scene;
  public grounds!: Ground[];
  public walls!: Wall[];

  public abstract load(): void;
  public abstract tick(): void;
}
