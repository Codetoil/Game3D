/**
 *  Game3D, a 3D Platformer built for the web.
 *  Copyright (C) 2021-2023  Codetoil
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as BABYLON from "@babylonjs/core";
import { PlayerClient } from "./entityClient";
import { World } from "../common/world";

export class WorldClient extends World {
    public player!: PlayerClient;

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
