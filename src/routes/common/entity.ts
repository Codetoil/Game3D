/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import type { InputController } from "./inputController";
import type { Wall, World } from "./world";

export abstract class Entity {
    public mesh!: BABYLON.Mesh;
    public inputController!: InputController;
    public world!: World;

    public pos!: BABYLON.Vector3;
    public velH: BABYLON.Vector3 = new BABYLON.Vector3(0.0, 0.0, 0.0);
    public vely: number = 0.0;
    public rot!: BABYLON.Quaternion;
    public facingDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1).normalize();

    public onGround: boolean = false;
    public onWall: boolean = false;

    public abstract gravity: number;


    public setMesh(mesh: BABYLON.Mesh): Entity {
        this.mesh = mesh;
        return this;
    }

    public setPositionAndRotation(
        pos: BABYLON.Vector3,
        rot: BABYLON.Quaternion
    ): Entity {
        this.pos = this.mesh.position = pos;
        this.rot = this.mesh.rotationQuaternion = rot;
        return this;
    }

    protected abstract checkCollisions(): void;

    public setWorld(world: World): Entity {
        this.world = world;
        return this;
    }
}

export abstract class Player extends Entity {
    public maxHSpeed: number = -1.0;
    public canWallJump: boolean = true;
    public lastWallWallJumpedFrom: BABYLON.Nullable<Wall> = null;
    public jumpState: boolean = false;

    public get gravity(): number {
        if (this.onWall) return -1.667;
        if (this.inputController.jumpPressed) return -1.8;
        return -2.0;
    }

    protected get hMovementScaleFactor() {
        return this.onGround ? 5.0 : 1.0;
    }
}