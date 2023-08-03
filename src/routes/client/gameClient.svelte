<!-- 
  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
  import * as BABYLON from "@babylonjs/core";
  import * as DEVALUE from "devalue";
  import { onMount } from "svelte";
  import { Game } from "../common/game";
  import type { WorldClient } from "./worldClient";
  import type { ConnectClient } from "./connectClient";
  import { ConnectClientLocal } from "./connectClientLocal";

  export class GameClient extends Game {
    public name: string = "Game";
    public ready: Promise<Game> = new Promise((resolve, reject) => {
      onMount(() => this.init(resolve, reject));
    });
    public canvas!: HTMLCanvasElement;
    public connectClient: ConnectClient;
    public world!: WorldClient;

    public constructor()
    {
      super();
      this.connectClient = new ConnectClientLocal();
      this.connectClient.setGame(this);
    }

    public init(
      resolve: (value: Game | PromiseLike<Game>) => void,
      reject: (reason?: any) => void
    ) {
      this.canvas = document.getElementById(
        "renderCanvas"
      ) as HTMLCanvasElement;
      super.init(resolve, reject);
    }

    private isGameClientPromiseLike(
      object: any
    ): object is PromiseLike<GameClient> {
      return "then" in object;
    }

    public async createEngine(): Promise<BABYLON.Engine> {
      const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
      console.log("Using WebGPU: " + webGPUSupported);
      if (webGPUSupported && false) {
        // Don't have neccesary packages for WebGPU
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
      this.scene = new BABYLON.Scene(this.engine);
      this.setMenuCamera();

      this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));

      return this.scene;
    }

    public async setMenuCamera(): void {
      this.camera = new BABYLON.UniversalCamera(
        "default",
        new BABYLON.Vector3(0, 0, 0),
        this.scene
      );
    }

    private beforeRender(): void {
      if (!this.started || this.stopped || !this.world) return;
      this.world.tick();
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
        console.error("Stopped game.");
      }
    });
  });
</script>

<canvas id="renderCanvas" />
<button on:click={gameClient.connectClient.connect.bind(gameClient.connectClient, "Codetoil")}>Connect to Server</button>
<button on:click={gameClient.connectClient.requestDisconnect.bind(gameClient.connectClient)}>Disconnect from Server</button>
<button on:click={gameClient.connectClient.forceDisconnect.bind(gameClient.connectClient)}>Forcefully Disconnect from Server</button>

<style>
  #renderCanvas {
    width: 100%;
    height: 100%;
    display: block;
    font-size: 0;
  }
</style>
