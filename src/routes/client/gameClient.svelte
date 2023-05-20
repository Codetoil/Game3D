<!-- 
  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
  import * as BABYLON from "@babylonjs/core";
  import * as DEVALUE from "devalue";
  import { onMount } from "svelte";
  import { Game } from "../common/game";
  import { WorldClient } from "./worldClient";

  export class GameClient extends Game {
    public name: string = "Game";
    public ready: Promise<GameClient> = new Promise((resolve, reject) => {
      onMount(() => this.init(resolve, reject));
    });
    public canvas!: HTMLCanvasElement;

    public clientWorld!: WorldClient;

    public init(
      resolve: (value: GameClient | PromiseLike<GameClient>) => void,
      reject: (reason?: any) => void
    ) {
      this.canvas = document.getElementById(
        "renderCanvas"
      ) as HTMLCanvasElement;
      super.init((oldArgs) => resolve(this.convertFromValue(oldArgs)), reject);
    }

    private convertFromValue(
      value: Game | PromiseLike<Game>
    ): GameClient | PromiseLike<GameClient> {
      if (value instanceof GameClient) {
        return value as GameClient;
      } else if (this.isGameClientPromiseLike(value)) {
        return value as PromiseLike<GameClient>;
      } else {
        throw new Error("Not of the form");
      }
    }

    private isGameClientPromiseLike(
      object: any
    ): object is PromiseLike<GameClient> {
      return "then" in object;
    }

    public async createEngine(): Promise<BABYLON.Engine> {
      const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
      console.log("Using WebGPU: " + webGPUSupported);
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
      this.clientWorld = new WorldClient();
      this.clientWorld.load(this.engine);

      this.clientWorld.scene.onBeforeRenderObservable.add(
        this.beforeRender.bind(null, this)
      );

      return this.clientWorld.scene;
    }

    private beforeRender(gameClient: GameClient) {
      if (!gameClient.started || gameClient.stopped) return;
      gameClient.clientWorld.tick();
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
        value.clientWorld.scene &&
        value.clientWorld.scene.activeCamera
      ) {
        try {
          value.clientWorld.scene.render();
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

<canvas id="renderCanvas" />

<style>
  #renderCanvas {
    width: 100%;
    height: 100%;
    display: block;
    font-size: 0;
  }
</style>
