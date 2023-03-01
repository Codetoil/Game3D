/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

export abstract class Ground {}

export abstract class Wall {}

export abstract class World {
  public grounds: Ground[];
  public walls: Wall[];

  public initialize() {
    grounds = [];
    walls = [];
  }

  public tick() {}
}
