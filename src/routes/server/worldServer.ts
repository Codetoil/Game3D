/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import { Wall, Ground, World } from "../common/world";

export class WorldServer extends World {
    public load(engine: BABYLON.Engine) {
        this.read(engine);
        this.send();
    }

    public read(engine: BABYLON.Engine) {
        this.scene = new BABYLON.Scene(engine);
        this.grounds = [];
        this.walls = [];

        //Ground
        var ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox(
            "ground",
            { width: 20.0, depth: 20.0, height: 0.5 },
            this.scene
        );
        ground.material = new BABYLON.StandardMaterial("groundMat", this.scene);
        (ground.material as BABYLON.StandardMaterial).diffuseColor =
            new BABYLON.Color3(1, 1, 1);
        ground.material.backFaceCulling = false;
        ground.position = new BABYLON.Vector3(5, -10, -15);
        ground.rotation = new BABYLON.Vector3(0, 0, 0);
        this.grounds.push(new Ground().setMesh(ground));

        var wall: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox(
            "wall",
            { width: 15, height: 15, depth: 0.75 },
            this.scene
        );
        wall.material = new BABYLON.StandardMaterial("wallMat", this.scene);
        (wall.material as BABYLON.StandardMaterial).diffuseColor =
            new BABYLON.Color3(1, 1, 1);
        wall.material.backFaceCulling = false;
        wall.position = new BABYLON.Vector3(3.2, -2.5, -15);
        wall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
        this.walls.push(new Wall().setMesh(wall));

        var wall2: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox(
            "wall2",
            { width: 15, height: 15, depth: 0.75 },
            this.scene
        );
        wall2.material = wall.material;
        wall2.position = new BABYLON.Vector3(6.8, -2.5, -15);
        wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
        this.walls.push(new Wall().setMesh(wall2));

        var platform = BABYLON.MeshBuilder.CreateBox(
            "platform1",
            { width: 5.0, depth: 5.0, height: 0.5 },
            this.scene
        );
        platform.material = wall.material;
        platform.position = new BABYLON.Vector3(17, -10, -10);
        this.grounds.push(new Ground().setMesh(platform));

        var dbox = BABYLON.MeshBuilder.CreateBox(
            "dbox",
            { width: 1, height: 2, depth: 1 },
            this.scene
        );
        dbox.position = wall.position;
        dbox.material = new BABYLON.StandardMaterial("dboxMat", this.scene);
        (dbox.material as BABYLON.StandardMaterial).diffuseColor =
            new BABYLON.Color3(0, 1, 1);
        dbox.material.backFaceCulling = false;
        dbox.setEnabled(false);
    }

    public send() {

    }

    public tick() {

    }
}
