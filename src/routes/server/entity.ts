/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { WallClient } from "../client/worldClient";
import type { InputController } from "./inputController";
import { Wall, World } from "./world";

export abstract class Entity {
  public world: World;

  public pos: BABYLON.Vector3;
  public velH: BABYLON.Vector3;
  public vely: number;
  public rot: BABYLON.Quaternion;

  public onGround: boolean;
  public onWall: boolean;

  public abstract gravity: number;

  public constructor(world: World) {
    this.world = world;
    this.velH = new BABYLON.Vector3(0.0, 0.0, 0.0);
    this.vely = 0.0;
  }

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

  protected checkCollisions() {
    this.onGround = this.world.grounds
      .map((ground: BABYLON.Mesh) =>
        this.mesh.intersectsMesh(ground, false)
          ? this.mesh.intersectsMesh(ground, true)
          : false
      )
      .reduce((p, c) => p || c, false);
    this.onWall = this.world.walls
      .map((wall: BABYLON.Mesh) =>
        this.mesh.intersectsMesh(wall, false)
          ? this.mesh.intersectsMesh(wall, true)
          : false
      )
      .reduce((p, c) => p || c, false);
  }
}

export abstract class Player extends Entity {
  public maxHSpeed: number;
  public canWallJump = true;
  public lastWallWallJumpedFrom: Wall = null;
  public jumpState = false;
  public inputController: InputController;
  public facingDirection: BABYLON.Vector3;

  public get gravity(): number {
    if (this.onWall) return -1.667;
    if (this.inputController.jumpPressed) return -1.8;
    return -2.0;
  }

  public constructor(world: World) {
    super(world);
    // this.inputController = new PlayerInputController(world.engine);
  }

  protected get hMovementScaleFactor() {
    return this.onGround ? 5.0 : 1.0;
  }

  public accelerateAndRotateH(x: number, z: number) {
    let r = Math.sqrt(x ** 2 + z ** 2);

    // Deadzone
    if (r > 0.01) {
      let r1 = Math.abs(x) + Math.abs(z);
      x *= r / r1;
      z *= r / r1;

      if (this.onGround) {
        this.mesh.rotationQuaternion = BABYLON.Vector3.Up()
          .scale(Math.atan2(z, x))
          .toQuaternion();

        this.facingDirection = new BABYLON.Vector3(z, 0.0, x).normalize();
      }

      this.velH = this.velH.add(
        new BABYLON.Vector3(
          this.hMovementScaleFactor * z,
          0.0,
          this.hMovementScaleFactor * x
        )
      );
    }

    if (this.onGround) {
      this.velH.scaleToRef(0.7, this.velH);
    }
  }

  public jump() {
    this.vely = 28.0;
  }

  public wallJump() {
    if (!this.facingDirection) return;
    let ray = new BABYLON.Ray(this.pos, this.facingDirection, 1);
    let rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.show(this.world.scene, BABYLON.Color3.Red());
    let hit = this.world.scene.pickWithRay(ray, (mesh: BABYLON.Mesh) => {
      return this.world.walls.includes(mesh);
    });
    let wall = hit.pickedMesh;
    if (!wall) return;
    if (this.lastWallWallJumpedFrom !== wall) {
      let normalV: BABYLON.Vector3 = hit.getNormal(true);
      console.debug([wall, normalV]);
      let rayNormal = new BABYLON.Ray(hit.pickedPoint, normalV, 1);
      new BABYLON.RayHelper(rayNormal).show(
        this.world.scene,
        BABYLON.Color3.Blue()
      );
      let normal: BABYLON.Quaternion = new BABYLON.Quaternion(
        normalV.x,
        normalV.y,
        normalV.z,
        0.0
      );
      this.mesh.rotationQuaternion = normal
        .multiply(this.mesh.rotationQuaternion.multiply(normal))
        .normalize();
      this.velH = this.velH.subtract(
        normalV.scale(2 * BABYLON.Vector3.Dot(this.velH, normalV))
      );
      this.vely = 28.0;
      this.canWallJump = false;
      this.lastWallWallJumpedFrom = wall as Mesh;
    }
  }

  private executeJumpRoutine() {
    if (!this.inputController.jumpPressed) {
      this.jumpState = false;
      this.canWallJump = true;
    } else {
      if (this.onGround && !this.jumpState) {
        this.jump();
        this.jumpState = true;
      }
      if (
        this.canWallJump &&
        this.onWall &&
        !this.onGround &&
        this.inputController.joystick.length() > 0.1
      ) {
        this.wallJump();
      }
    }
    if (this.onGround) {
      this.lastWallWallJumpedFrom = null;
    }
  }

  private applyHMovementInfluences() {
    if (this.inputController.sprintHeld && this.onGround) {
      this.maxHSpeed *= 1.3;
    } else if (this.inputController.sprintHeld && !this.onGround) {
      this.maxHSpeed *= 1.2;
    }
    if (this.velH.length() > this.maxHSpeed) {
      this.velH = this.velH.normalize().scale(this.maxHSpeed);
    }
  }

  private applyGravity() {
    if (!this.onGround) {
      this.vely += this.gravity;
    }
    if (this.onGround && this.vely < 0.0) {
      this.vely = 0.0;
    }
  }

  private moveMesh() {
    this.maxHSpeed = 2.5 + 10.0 * this.inputController.joystick.length();

    if (this.inputController.joystick != null) {
      this.accelerateAndRotateH(
        this.inputController.joystick.x,
        this.inputController.joystick.z
      );
    }
    this.executeJumpRoutine();

    this.applyHMovementInfluences();
    this.applyGravity();

    let deltay = this.vely + (!this.onGround ? this.gravity / 2 : 0.0);
    if (Math.abs(deltay) > 50) {
      deltay = 50 * (deltay === 0 ? 0 : deltay > 0 ? 1 : -1);
    }
    let deltaPos = new BABYLON.Vector3(this.velH.x, deltay, this.velH.z).scale(
      1.0 / 60.0
    );

    this.mesh.position = this.mesh.position.add(deltaPos);
    this.pos = this.mesh.position;
    this.rot = this.mesh.rotationQuaternion;
  }

  public tick(cameraAngle: BABYLON.Quaternion) {
    console.assert(!!cameraAngle, "Camera angle cannot be undefined");

    this.checkCollisions();
    this.inputController.tick();
    this.inputController.joystick.rotateByQuaternionToRef(cameraAngle, this.inputController.joystick);
    this.checkCollisions();

    this.moveMesh();
  }
}
