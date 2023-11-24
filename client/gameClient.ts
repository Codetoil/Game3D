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
import { Game } from "../common/game";
import { ConnectClient } from "./connectClient";

export class GameClient extends Game {
  public name: string = "Game";
  public ready: Promise<Game> = new Promise((resolve, reject) => {
    document.addEventListener("DOMContentLoaded", () => {
        this.init(resolve, reject);
    });
  });
  public canvas!: HTMLCanvasElement;
  public connectClient: ConnectClient;

  public constructor()
  {
    super();
    this.connectClient = new ConnectClient(this);
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
    console.log("Engine initialized...")
    return this.engine;
  }

  public async createScene(): Promise<BABYLON.Scene> {
    this.scene = new BABYLON.Scene(this.engine);
    this.setMenuCamera();

    this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));

    return this.scene;
  }

  public async setMenuCamera(): Promise<void> {
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
  window.addEventListener("resize", EventHandler.onResize.bind(null, value as GameClient));

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

document.getElementById("connectButton")?.addEventListener("click", () => {
  gameClient.connectClient.connect('Codetoil');
});

document.getElementById("disconnectButton")?.addEventListener("click", () => {
  gameClient.connectClient.requestDisconnect();
})

document.getElementById("forceDisconnectButton")?.addEventListener("click", () => {
  gameClient.connectClient.forceDisconnect();
})