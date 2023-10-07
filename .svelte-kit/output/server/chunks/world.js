class Game {
  constructor() {
    this.started = false;
    this.stopped = false;
  }
  init(resolve, reject) {
    this.createEngine().then((engine) => {
      if (!engine)
        reject(new Error("engine should not be null."));
      this.engine = engine;
      this.createScene().then((scene) => {
        if (!scene)
          reject(new Error("scene should not be null."));
        this.scene = scene;
        resolve(this);
      }).catch(function(e) {
        console.error("The available createScene function failed.");
        console.error(e);
        reject(e);
      });
    }).catch((e) => {
      console.error("The available createEngine function failed.");
      console.error(e);
      reject(e);
    }).then(
      () => {
        this.started = true;
        console.info("Started " + this.name);
      }
    );
  }
  tick() {
    if (!this.started || this.stopped || !(this.world !== void 0))
      return;
    this.world.tick();
  }
}
class Ground {
  setMesh(mesh) {
    this.mesh = mesh;
    return this;
  }
}
class Wall {
  setMesh(mesh) {
    this.mesh = mesh;
    return this;
  }
}
class World {
  constructor(game) {
    this.game = game;
  }
}
export {
  Game as G,
  World as W,
  Ground as a,
  Wall as b
};
