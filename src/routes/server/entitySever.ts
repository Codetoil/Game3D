/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Entity, Player } from "../common/entity";
import type { Ground, Wall } from "../common/world";
import type { WorldServer } from "./worldServer";
import { Mixin } from "ts-mixer";

export abstract class EntityServer extends Entity {
    public setWorld(world: WorldServer): EntityServer {
        this.world = world;
        return this;
    }

    public setMesh(mesh: BABYLON.Mesh): EntityServer {
        this.mesh = mesh;
        return this;
    }

    public setPositionAndRotation(
        pos: BABYLON.Vector3,
        rot: BABYLON.Quaternion
    ): EntityServer {
        this.pos = this.mesh.position = pos;
        this.rot = this.mesh.rotationQuaternion = rot;
        return this;
    }

    protected checkCollisions(): void {
        this.onGround = this.world.grounds
            .map((ground: Ground) =>
                this.mesh.intersectsMesh(ground.mesh, false)
                    ? this.mesh.intersectsMesh(ground.mesh, true)
                    : false
            )
            .reduce((p, c) => p || c, false);
        this.onWall = this.world.walls
            .map((wall: Wall) =>
                this.mesh.intersectsMesh(wall.mesh, false)
                    ? this.mesh.intersectsMesh(wall.mesh, true)
                    : false
            )
            .reduce((p, c) => p || c, false);
    }
}

export abstract class PlayerServer extends Mixin(EntityServer, Player) {
    public accelerateAndRotateH(x: number, z: number): void {
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

    public jump(): void {
        this.vely = 28.0;
    }

    public wallJump(): void {
        if (!this.facingDirection) return;
        let ray: BABYLON.Ray = new BABYLON.Ray(this.pos, this.facingDirection, 1);
        let rayHelper: BABYLON.RayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.world.scene, BABYLON.Color3.Red());
        let hitNullable: BABYLON.Nullable<BABYLON.PickingInfo> = this.world.scene.pickWithRay(ray, (mesh: BABYLON.AbstractMesh) => {
            return this.world.walls.map((wall1) => wall1.mesh).includes(mesh);
        });
        if (!hitNullable) return;
        let hit: BABYLON.PickingInfo = hitNullable;
        if (!hit.pickedMesh) return;
        let wall: BABYLON.AbstractMesh = hit.pickedMesh;
        if (!(this.lastWallWallJumpedFrom === null) && this.lastWallWallJumpedFrom?.mesh !== wall) {
            let normalVectorNullable: BABYLON.Nullable<BABYLON.Vector3> = hit.getNormal(true);
            if (!normalVectorNullable) return;
            let normalVector: BABYLON.Vector3 = normalVectorNullable;
            console.debug([wall, normalVector]);
            if (!hit.pickedPoint) return;
            let rayNormal = new BABYLON.Ray(hit.pickedPoint, normalVector, 1);
            new BABYLON.RayHelper(rayNormal).show(
                this.world.scene,
                BABYLON.Color3.Blue()
            );
            let normal: BABYLON.Quaternion = new BABYLON.Quaternion(
                normalVector.x,
                normalVector.y,
                normalVector.z,
                0.0
            );
            console.assert(!!this.mesh.rotationQuaternion, "Rotation Quaternion cannot be null");
            this.mesh.rotationQuaternion = normal
                .multiply((this.mesh.rotationQuaternion as BABYLON.Quaternion).multiply(normal))
                .normalize();
            this.velH = this.velH.subtract(
                normalVectorNullable.scale(2 * BABYLON.Vector3.Dot(this.velH, normalVectorNullable))
            );
            this.vely = 28.0;
            this.canWallJump = false;
            this.lastWallWallJumpedFrom.mesh = wall as BABYLON.AbstractMesh;
        }
    }

    private executeJumpRoutine(): void {
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

    private applyHMovementInfluences(): void {
        if (this.inputController.sprintHeld && this.onGround) {
            this.maxHSpeed *= 1.3;
        } else if (this.inputController.sprintHeld && !this.onGround) {
            this.maxHSpeed *= 1.2;
        }
        if (this.velH.length() > this.maxHSpeed) {
            this.velH = this.velH.normalize().scale(this.maxHSpeed);
        }
    }

    private applyGravity(): void {
        if (!this.onGround) {
            this.vely += this.gravity;
        }
        if (this.onGround && this.vely < 0.0) {
            this.vely = 0.0;
        }
    }

    private moveMesh(): void {
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
        console.assert(!!this.mesh.rotationQuaternion, "Rotation quaternion cannot be undefined");
        this.rot = this.mesh.rotationQuaternion as BABYLON.Quaternion;
    }

    public tick(cameraAngle: BABYLON.Quaternion): void {
        console.assert(!!cameraAngle, "Camera angle cannot be undefined");

        this.checkCollisions();
        this.inputController.tick(this, this.world);
        this.inputController.joystick.rotateByQuaternionToRef(cameraAngle, this.inputController.joystick);
        this.checkCollisions();

        this.moveMesh();
    }
}
