<!-- 
  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->

<script lang="ts">

import * as BABYLON from "@babylonjs/core";
import { onMount } from "svelte";
import { Game } from "../game";
import { PlayerClient } from "./entityClient";
import { WorldClient } from "./worldClient";

export class GameClient extends Game {
  public ready: Promise<GameClient> = new Promise((resolve, reject) => {
      onMount(() => this.init(resolve, reject));
    });
  public canvas!: HTMLCanvasElement;

  public camera!: BABYLON.ArcFollowCamera;
  public world!: WorldClient;

  public init(resolve: (value: GameClient | PromiseLike<GameClient>) => void, reject: (reason?: any) => void): GameClient {
    this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    return super.init(oldArgs => resolve(this.convertFromValue(oldArgs)), reject) as GameClient;
  }

  private convertFromValue(value: Game | PromiseLike<Game>): GameClient | PromiseLike<GameClient>
  {
    if (value instanceof GameClient)
    {
      return value as GameClient
    }
    else if (this.isGameClientPromiseLike(value))
    {
      return value as PromiseLike<GameClient>
    }
    else
    {
      throw new Error("Not of the form")
    }
  }

  private isGameClientPromiseLike(object: any): object is PromiseLike<GameClient> {
    return 'then' in object;
  }

  public async createEngine(): Promise<BABYLON.Engine> {
    const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
    console.log("Using WebGPU: " + webGPUSupported)
    if (webGPUSupported) {
      this.engine = new BABYLON.WebGPUEngine(this.canvas, {
        antialias: true,
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
    this.world = new WorldClient();
    this.world.scene = new BABYLON.Scene(this.engine);
    // Lights
    var _lightHemi: BABYLON.Light = new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      this.world.scene
    );
    // Create the player entity
    this.world.player = new PlayerClient()
      .setWorld(this.world)
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
          this.world.scene
        )
      )
      .setPositionAndRotation(
        new BABYLON.Vector3(5, -5, -10),
        BABYLON.Quaternion.Identity()
      ) as PlayerClient;
    this.world.player.mesh.material = new BABYLON.StandardMaterial(
      "playerMat",
      this.world.scene
    );
    
    this.world.player.texture = new BABYLON.Texture(
      "%sveltekit.assets%/temp_player.png",
      this.world.scene
    );
    (this.world.player.mesh.material as BABYLON.StandardMaterial).diffuseTexture =
      this.world.player.texture;
    this.world.player.texture.hasAlpha = true;
    this.world.player.onGround = true;

    this.camera = new BABYLON.ArcFollowCamera(
      "camera",
      Math.PI / 2,
      0.5,
      10,
      this.world.player.mesh,
      this.world.scene
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

    this.world.initialize();

    this.world.scene.collisionsEnabled = true;

    this.world.scene.onBeforeRenderObservable.add(this.beforeRender.bind(null, this));

    //new BABYLON.AsciiArtPostProcess("pp", camera, "ariel").activate(camera);

    return this.world.scene;
  }

  private beforeRender(gameClient: GameClient) {
    if (!gameClient.started || gameClient.stopped) return;
    gameClient.world.tick();
    gameClient.world.player.tick(gameClient.camera.rotationQuaternion);
  }
}

export class EventHandler {
  public static onResize(gameClient: GameClient) {
    gameClient.engine.resize();
  }
}

var gameClient: GameClient = new GameClient();

gameClient.ready.then((value) => {
  window.addEventListener("resize", EventHandler.onResize.bind(null, value));

  value.engine.runRenderLoop(() => {
    if (
      value.started &&
      !value.stopped &&
      value.world.scene &&
      value.world.scene.activeCamera
    ) {
      try {
        value.world.scene.render();
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
</script>

<canvas id="renderCanvas"></canvas>

<style>
  #renderCanvas {
    width: 100%;
    height: 100%;
    display: block;
    font-size: 0;
  }
</style>