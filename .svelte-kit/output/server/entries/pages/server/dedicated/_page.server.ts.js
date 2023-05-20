import * as BABYLON from "@babylonjs/core";
import { G as Game } from "../../../../chunks/game.js";
class GameServer extends Game {
  constructor() {
    super(...arguments);
    this.name = "Server";
  }
  convertFromValue(value) {
    if (value instanceof GameServer) {
      return value;
    } else if (this.isGameServerPromiseLike(value)) {
      return value;
    } else {
      throw new Error("Not of the form");
    }
  }
  isGameServerPromiseLike(object) {
    return "then" in object;
  }
  createEngine() {
    this.engine = new BABYLON.NullEngine();
    return new Promise((resolve, _reject) => resolve(this.engine));
  }
  createScene() {
    this.world.scene.onBeforeRenderObservable.add(
      this.tick
    );
    this.engine.runRenderLoop(() => {
      if (this.started && !this.stopped && this.world.scene) {
        try {
          this.world.tick();
        } catch (e) {
          console.error(e);
          this.stopped = true;
        }
      } else if (this.stopped && this.engine) {
        this.engine.stopRenderLoop();
        console.error("Stopping server...");
      }
    });
    return new Promise((resolve, _reject) => resolve(this.world.scene));
  }
}
const load = async ({ params }) => {
  let gameServer = new GameServer();
  const ready = new Promise((resolve, reject) => gameServer.init);
  ready.then((value) => {
    value.engine.runRenderLoop(() => {
      if (value.started && !value.stopped && value.world.scene && value.world.scene.activeCamera) {
        try {
          value.world.scene.render();
        } catch (e) {
          console.error(e);
          value.stopped = true;
        }
      } else if (value.stopped && value.engine) {
        value.engine.stopRenderLoop();
        console.error("Stopping game...");
      }
    });
  });
};
export {
  load
};
