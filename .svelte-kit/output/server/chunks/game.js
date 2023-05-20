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
      this.createScene().then((scene) => {
        if (!scene)
          reject(new Error("scene should not be null."));
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
        console.info("Starting " + this.name + "...");
        this.world.load(this.engine);
      }
    );
  }
  tick() {
    if (!this.started || this.stopped)
      return;
    this.world.tick();
  }
}
export {
  Game as G
};
