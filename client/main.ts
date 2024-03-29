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
import { Player } from "./characterController";
import { World } from "./world";

export class Game3D {
  public ready: Promise<Game3D>;
  public started: boolean;
  public stopped: boolean;

  public engine: BABYLON.Engine;
  public canvas: HTMLCanvasElement;
  public scene: BABYLON.Scene;

  public player: Player;
  public camera: BABYLON.ArcFollowCamera;
  public world: World;

  constructor() {
    this.started = false;
    this.stopped = false;
    this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    this.ready = new Promise((resolve, reject) => {
      this.createEngine()
        .then((engine) => {
          if (!engine) reject(new Error("engine should not be null."));
          this.createScene()
            .then((scene) => {
              if (!scene) reject(new Error("scene should not be null."));
              resolve(this);
            })
            .catch(function (e) {
              console.error("The available createScene function failed.");
              console.error(e);
              reject(e);
            });
        })
        .catch((e) => {
          console.error("The available createEngine function failed.");
          console.error(e);
          reject(e);
        });
    }).then(() => {
      this.started = true;
      console.info("Starting game...");
      return this;
    });
  }

  public async createEngine(): Promise<BABYLON.Engine> {
    const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
    if (webGPUSupported) {
      this.engine = new BABYLON.WebGPUEngine(this.canvas, {
        antialiasing: true,
        stencil: true,
      });
      await (this.engine as BABYLON.WebGPUEngine).initAsync();
    } else {
      this.engine = new BABYLON.Engine(this.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false,
      });
    }
    return this.engine;
  }

  public async createScene(): Promise<BABYLON.Scene> {
    this.scene = new BABYLON.Scene(this.engine);
    // Lights
    var _lightHemi: BABYLON.Light = new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.world = new World();
    this.world.engine = this.engine;
    this.world.scene = this.scene;
    // Create the player entity
    this.player = new Player(this.world)
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
      ) as Player;
    this.player.mesh.material = new BABYLON.StandardMaterial(
      "playerMat",
      this.scene
    );
    this.player.texture = new BABYLON.Texture(
      "temp_player.png",
      this.scene
    );
    (this.player.mesh.material as BABYLON.StandardMaterial).diffuseTexture =
      this.player.texture;
    this.player.texture.hasAlpha = true;
    /*player.physicsImpostor = new BABYLON.PhysicsImpostor(
      player,
      BABYLON.PhysicsImpostor.CapsuleImpostor,
      { mass: 1 },
      scene
    );*/
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

    this.world.grounds = [];
    this.world.walls = [];
    /*var ceilings = [];*/
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
    /*ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 1 },
      scene
    );*/
    this.world.grounds.push(ground);

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
    /*wall.physicsImpostor = new BABYLON.PhysicsImpostor(
      wall,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 10 },
      scene
    );*/
    this.world.walls.push(wall);

    var wall2: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox(
      "wall2",
      { width: 15, height: 15, depth: 0.75 },
      this.scene
    );
    wall2.material = wall.material;
    wall2.position = new BABYLON.Vector3(6.8, -2.5, -15);
    wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    /*wall2.physicsImpostor = new BABYLON.PhysicsImpostor(
      wall2,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 10 },
      scene
    );*/
    //wall2.setEnabled(false);
    this.world.walls.push(wall2);

    var platform = BABYLON.MeshBuilder.CreateBox(
      "platform1",
      { width: 5.0, depth: 5.0, height: 0.5 },
      this.scene
    );
    platform.material = wall.material;
    platform.position = new BABYLON.Vector3(17, -10, -10);
    /*platform.physicsImpostor = new BABYLON.PhysicsImpostor(
      platform,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0 },
      scene
    );*/
    this.world.grounds.push(platform);

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

    this.scene.collisionsEnabled = true;

    this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(null, this));

    //new BABYLON.AsciiArtPostProcess("pp", camera, "ariel").activate(camera);

    return this.scene;
  }

  private beforeRender(game3D: Game3D) {
    if (!game3D.started || game3D.stopped) return;
    game3D.world.tick();
    game3D.player.tick(game3D.camera.rotationQuaternion);
  }
}

export class EventHandler {
  public static onResize(game3D: Game3D) {
    game3D.engine.resize();
  }
}

var game3D: Game3D = new Game3D();

game3D.ready.then((value) => {
  window.addEventListener("resize", EventHandler.onResize.bind(null, value));

  value.engine.runRenderLoop(() => {
    if (
      value.started &&
      !value.stopped &&
      value.scene &&
      value.scene.activeCamera
    ) {
      try {
        value.scene.render();
      } catch (e: any) {
        console.error(e);
        value.stopped = true;
      }
    } else if (value.stopped && value.engine) {
      value.engine.stopRenderLoop();
      console.error("Stopping game...");
    }
  });
});
