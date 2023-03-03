/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { PlayerClient } from "./entityClient";
import { Quaternion } from "@babylonjs/core";
import { World } from "../common/world";

export class WorldClient extends World {
    public camera!: BABYLON.ArcFollowCamera;

    public player!: PlayerClient;

    public load(): void {
        // Lights
        var _lightHemi: BABYLON.Light = new BABYLON.HemisphericLight(
            "hemi",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        // Create the player entity
        this.player = new PlayerClient()
            .setWorld(this)
            .setMesh(
                BABYLON.MeshBuilder.CreateCapsule(
                    "player",
                    {
                        radius: 0.75,
                        height: 3,
                        subdivisions: 10,
                        tessellation: 10,
                        capSubdivisions: 10,
                    },
                    this.scene
                )
            )
            .setPositionAndRotation(
                new BABYLON.Vector3(5, -5, -10),
                BABYLON.Quaternion.Identity()
            ) as PlayerClient;
        this.player.mesh.material = new BABYLON.StandardMaterial(
            "playerMat",
            this.scene
        );

        this.player.texture = new BABYLON.Texture(
            "%sveltekit.assets%/temp_player.png",
            this.scene
        );
        (this.player.mesh.material as BABYLON.StandardMaterial).diffuseTexture =
            this.player.texture;
        this.player.texture.hasAlpha = true;
        this.player.onGround = true;

        this.camera = new BABYLON.ArcFollowCamera(
            "camera",
            Math.PI / 2,
            0.5,
            10,
            this.player.mesh,
            this.scene
        );
        this.camera.orthoBottom = -10;
        this.camera.orthoLeft = -10;
        this.camera.orthoRight = 10;
        this.camera.orthoTop = 10;
        // this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            this.camera.rotationQuaternion = new BABYLON.Vector3(
                Math.PI / 2,
                0.0,
                0.0
            ).toQuaternion();
        } else {
            this.camera.rotationQuaternion = new BABYLON.Vector3(
                Math.PI / 2,
                0,
                0.25
            ).toQuaternion();
        }
    }

    public tick() { }
}
