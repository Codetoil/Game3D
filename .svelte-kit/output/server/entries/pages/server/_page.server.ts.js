import * as BABYLON from "@babylonjs/core";
import { W as World, a as Ground, b as Wall, G as Game } from "../../../chunks/world.js";
class WorldServer extends World {
  load() {
    this.read();
    this.send();
  }
  read() {
    this.grounds = [];
    this.walls = [];
    var ground = BABYLON.MeshBuilder.CreateBox(
      "ground",
      { width: 20, depth: 20, height: 0.5 },
      this.game.scene
    );
    ground.material = new BABYLON.StandardMaterial("groundMat", this.game.scene);
    ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ground.material.backFaceCulling = false;
    ground.position = new BABYLON.Vector3(5, -10, -15);
    ground.rotation = new BABYLON.Vector3(0, 0, 0);
    this.grounds.push(new Ground().setMesh(ground));
    var wall = BABYLON.MeshBuilder.CreateBox(
      "wall",
      { width: 15, height: 15, depth: 0.75 },
      this.game.scene
    );
    wall.material = new BABYLON.StandardMaterial("wallMat", this.game.scene);
    wall.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wall.material.backFaceCulling = false;
    wall.position = new BABYLON.Vector3(3.2, -2.5, -15);
    wall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    this.walls.push(new Wall().setMesh(wall));
    var wall2 = BABYLON.MeshBuilder.CreateBox(
      "wall2",
      { width: 15, height: 15, depth: 0.75 },
      this.game.scene
    );
    wall2.material = wall.material;
    wall2.position = new BABYLON.Vector3(6.8, -2.5, -15);
    wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    this.walls.push(new Wall().setMesh(wall2));
    var platform = BABYLON.MeshBuilder.CreateBox(
      "platform1",
      { width: 5, depth: 5, height: 0.5 },
      this.game.scene
    );
    platform.material = wall.material;
    platform.position = new BABYLON.Vector3(17, -10, -10);
    this.grounds.push(new Ground().setMesh(platform));
    var dbox = BABYLON.MeshBuilder.CreateBox(
      "dbox",
      { width: 1, height: 2, depth: 1 },
      this.game.scene
    );
    dbox.position = wall.position;
    dbox.material = new BABYLON.StandardMaterial("dboxMat", this.game.scene);
    dbox.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
    dbox.material.backFaceCulling = false;
    dbox.setEnabled(false);
  }
  send() {
  }
  tick() {
  }
}
class GameServer extends Game {
  constructor() {
    super(...arguments);
    this.name = "Server";
  }
  createEngine() {
    this.engine = new BABYLON.NullEngine();
    return new Promise((resolve, _reject) => resolve(this.engine));
  }
  createScene() {
    this.world = new WorldServer(this);
    this.world.load();
    this.world.game.scene.onBeforeRenderObservable.add(
      this.tick.bind(this)
    );
    this.engine.runRenderLoop(() => {
      if (this.started && !this.stopped && this.world.game.scene) {
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
    return new Promise((resolve, _reject) => resolve(this.world.game.scene));
  }
  setMenuCamera() {
  }
  // Do nothing
}
const load = async ({ params }) => {
  let gameServer = new GameServer();
  const ready = new Promise((resolve, reject) => gameServer.init);
  ready.then((value) => {
    value.engine.runRenderLoop(() => {
      if (value.started && !value.stopped && value.world?.game.scene && value.world?.game.scene.activeCamera) {
        try {
          value.world?.game.scene.render();
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
