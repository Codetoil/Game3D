import "@babylonjs/core";
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
    if (!this.started || this.stopped || !(this.world !== null))
      return;
    this.world.tick();
  }
}
export {
  Game as G
};
