/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { PlayerClient } from "./entityClient";
import { World } from "../common/world";
import type { Game } from "../common/game";

export class WorldClient extends World {
    public player!: PlayerClient;

    constructor(game: Game) {
        super(game);
    }

    public load(): void {

        // Lights
        var _lightHemi: BABYLON.Light = new BABYLON.HemisphericLight(
            "hemi",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        // Create the player entity
        this.player = new PlayerClient()
            .setWorld(this)
            .setMesh(
                BABYLON.MeshBuilder.CreateCapsule(
                    "player",
                    {
                        capSubdivisions: 10,
                        height: 3,
                        radius: 0.75,
                        subdivisions: 10,
                        tessellation: 10,
                    },
                    this.game.scene
                )
            )
            .setPositionAndRotation(
                new BABYLON.Vector3(5, -5, -10),
                BABYLON.Quaternion.Identity()
            ) as PlayerClient;
        this.player.mesh.material = new BABYLON.StandardMaterial(
            "playerMat",
            this.game.scene
        );

        this.player.texture = new BABYLON.Texture(
            "temp_player.png",
            this.game.scene
        );
        (this.player.mesh.material as BABYLON.StandardMaterial).diffuseTexture =
            this.player.texture;
        this.player.texture.hasAlpha = true;
        this.player.onGround = true;

        this.game.camera = new BABYLON.ArcFollowCamera(
            "camera",
            Math.PI / 2,
            0.5,
            10,
            this.player.mesh,
            this.game.scene
        );
        (this.game.camera as BABYLON.ArcFollowCamera).orthoBottom = -10;
        (this.game.camera as BABYLON.ArcFollowCamera).orthoLeft = -10;
        (this.game.camera as BABYLON.ArcFollowCamera).orthoRight = 10;
        (this.game.camera as BABYLON.ArcFollowCamera).orthoTop = 10;
        // this.game.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        if (this.game.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            (this.game.camera as BABYLON.ArcFollowCamera).rotationQuaternion = new BABYLON.Vector3(
                Math.PI / 2,
                0.0,
                0.0
            ).toQuaternion();
        } else {
            (this.game.camera as BABYLON.ArcFollowCamera).rotationQuaternion = new BABYLON.Vector3(
                Math.PI / 2,
                0,
                0.25
            ).toQuaternion();
        }

    }

    public tick() { }
}
