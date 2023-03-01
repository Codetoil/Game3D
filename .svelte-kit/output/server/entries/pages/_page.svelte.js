import { c as create_ssr_component, v as validate_component } from "../../chunks/index.js";
import * as BABYLON from "@babylonjs/core";
import xss from "xss";
class World {
  tick() {
  }
}
class PlayerInputController {
  constructor(engine) {
    this.deviceSourceManager = new BABYLON.DeviceSourceManager(engine);
    this.joystick = new BABYLON.Vector3(0, 0, 0);
    this.sprintHeld = false;
    this.jumpPressed = false;
  }
  setJoystickIfBigger(x, z) {
    if (x ** 2 + z ** 2 > this.joystick.lengthSquared()) {
      this.joystick.x = x;
      this.joystick.z = z;
    }
  }
  tick(cameraAngle) {
    this.sprintHeld = false;
    this.jumpPressed = false;
    this.joystick = this.joystick.scale(0);
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
      let keyboardSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Keyboard
      );
      this.sprintHeld = this.sprintHeld || keyboardSource.getInput(16) === 1 || keyboardSource.getInput(76) === 1;
      this.jumpPressed = this.jumpPressed || keyboardSource.getInput(32) === 1 || keyboardSource.getInput(74) === 1;
      this.setJoystickIfBigger(
        keyboardSource.getInput(87) - keyboardSource.getInput(83),
        keyboardSource.getInput(68) - keyboardSource.getInput(65)
      );
      this.setJoystickIfBigger(
        keyboardSource.getInput(38) - keyboardSource.getInput(40),
        keyboardSource.getInput(39) - keyboardSource.getInput(37)
      );
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Generic)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Generic
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(0) === 1 || gamepadSource.getInput(3) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(15),
        gamepadSource.getInput(14)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(1) === 1 || gamepadSource.getInput(2) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Switch)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Switch
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(3) === 1 || gamepadSource.getInput(2) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(23),
        gamepadSource.getInput(22)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(0) === 1 || gamepadSource.getInput(1) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualShock)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualShock
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(3) === 1 || gamepadSource.getInput(2) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(19),
        gamepadSource.getInput(18)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(0) === 1 || gamepadSource.getInput(1) === 1;
    }
    this.joystick.rotateByQuaternionToRef(cameraAngle, this.joystick);
  }
}
class Entity {
  constructor(world) {
    this.world = world;
    this.velH = new BABYLON.Vector3(0, 0, 0);
    this.vely = 0;
  }
  setMesh(mesh) {
    this.mesh = mesh;
    return this;
  }
  setPositionAndRotation(pos, rot) {
    this.pos = this.mesh.position = pos;
    this.rot = this.mesh.rotationQuaternion = rot;
    return this;
  }
  checkCollisions() {
    this.onGround = this.world.grounds.map(
      (ground) => this.mesh.intersectsMesh(ground, false) ? this.mesh.intersectsMesh(ground, true) : false
    ).reduce((p, c) => p || c, false);
    this.onWall = this.world.walls.map(
      (wall) => this.mesh.intersectsMesh(wall, false) ? this.mesh.intersectsMesh(wall, true) : false
    ).reduce((p, c) => p || c, false);
  }
}
class Player extends Entity {
  constructor(world) {
    super(world);
    this.canWallJump = true;
    this.lastWallWallJumpedFrom = null;
    this.jumpState = false;
    this.inputController = new PlayerInputController(world.engine);
  }
  get gravity() {
    if (this.onWall)
      return -1.667;
    if (this.inputController.jumpPressed)
      return -1.8;
    return -2;
  }
  get hMovementScaleFactor() {
    return this.onGround ? 5 : 1;
  }
  accelerateAndRotateH(x, z) {
    let r = Math.sqrt(x ** 2 + z ** 2);
    if (r > 0.01) {
      let r1 = Math.abs(x) + Math.abs(z);
      x *= r / r1;
      z *= r / r1;
      if (this.onGround) {
        this.mesh.rotationQuaternion = BABYLON.Vector3.Up().scale(Math.atan2(z, x)).toQuaternion();
        this.facingDirection = new BABYLON.Vector3(z, 0, x).normalize();
      }
      this.velH = this.velH.add(
        new BABYLON.Vector3(
          this.hMovementScaleFactor * z,
          0,
          this.hMovementScaleFactor * x
        )
      );
    }
    if (this.onGround) {
      this.velH.scaleToRef(0.7, this.velH);
    }
  }
  jump() {
    this.vely = 28;
  }
  wallJump() {
    if (!this.facingDirection)
      return;
    let ray = new BABYLON.Ray(this.pos, this.facingDirection, 1);
    let rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.show(this.world.scene, BABYLON.Color3.Red());
    let hit = this.world.scene.pickWithRay(ray, (mesh) => {
      return this.world.walls.includes(mesh);
    });
    let wall = hit.pickedMesh;
    if (!wall)
      return;
    if (this.lastWallWallJumpedFrom !== wall) {
      let normalV = hit.getNormal(true);
      console.debug([wall, normalV]);
      let rayNormal = new BABYLON.Ray(hit.pickedPoint, normalV, 1);
      new BABYLON.RayHelper(rayNormal).show(
        this.world.scene,
        BABYLON.Color3.Blue()
      );
      let normal = new BABYLON.Quaternion(
        normalV.x,
        normalV.y,
        normalV.z,
        0
      );
      this.mesh.rotationQuaternion = normal.multiply(this.mesh.rotationQuaternion.multiply(normal)).normalize();
      this.velH = this.velH.subtract(
        normalV.scale(2 * BABYLON.Vector3.Dot(this.velH, normalV))
      );
      this.vely = 28;
      this.canWallJump = false;
      this.lastWallWallJumpedFrom = wall;
    }
  }
  executeJumpRoutine() {
    if (!this.inputController.jumpPressed) {
      this.jumpState = false;
      this.canWallJump = true;
    } else {
      if (this.onGround && !this.jumpState) {
        this.jump();
        this.jumpState = true;
      }
      if (this.canWallJump && this.onWall && !this.onGround && this.inputController.joystick.length() > 0.1) {
        this.wallJump();
      }
    }
    if (this.onGround) {
      this.lastWallWallJumpedFrom = null;
    }
  }
  applyHMovementInfluences() {
    if (this.inputController.sprintHeld && this.onGround) {
      this.maxHSpeed *= 1.3;
    } else if (this.inputController.sprintHeld && !this.onGround) {
      this.maxHSpeed *= 1.2;
    }
    if (this.velH.length() > this.maxHSpeed) {
      this.velH = this.velH.normalize().scale(this.maxHSpeed);
    }
  }
  applyGravity() {
    if (!this.onGround) {
      this.vely += this.gravity;
    }
    if (this.onGround && this.vely < 0) {
      this.vely = 0;
    }
  }
  moveMesh() {
    this.maxHSpeed = 2.5 + 10 * this.inputController.joystick.length();
    if (this.inputController.joystick != null) {
      this.accelerateAndRotateH(
        this.inputController.joystick.x,
        this.inputController.joystick.z
      );
    }
    this.executeJumpRoutine();
    this.applyHMovementInfluences();
    this.applyGravity();
    let deltay = this.vely + (!this.onGround ? this.gravity / 2 : 0);
    if (Math.abs(deltay) > 50) {
      deltay = 50 * (deltay === 0 ? 0 : deltay > 0 ? 1 : -1);
    }
    let deltaPos = new BABYLON.Vector3(this.velH.x, deltay, this.velH.z).scale(
      1 / 60
    );
    this.mesh.position = this.mesh.position.add(deltaPos);
    this.pos = this.mesh.position;
    this.rot = this.mesh.rotationQuaternion;
  }
  tick(cameraAngle) {
    console.assert(!!cameraAngle, "Camera angle cannot be undefined");
    this.checkCollisions();
    this.inputController.tick(cameraAngle);
    this.checkCollisions();
    this.moveMesh();
  }
}
const game_svelte_svelte_type_style_lang = "";
const css = {
  code: "#renderCanvas.svelte-1a46o45{width:100%;height:100%;display:block;font-size:0}",
  map: null
};
const Game = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  class Game3D {
    constructor() {
      this.started = false;
      this.stopped = false;
      this.ready = new Promise((resolve, reject) => {
      }).then(() => {
        this.started = true;
        console.info("Starting game...");
        return this;
      });
    }
    async createEngine() {
      const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        this.engine = new BABYLON.WebGPUEngine(this.canvas, { antialiasing: true, stencil: true });
        await this.engine.initAsync();
      } else {
        this.engine = new BABYLON.Engine(
          this.canvas,
          true,
          {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false
          }
        );
      }
      return this.engine;
    }
    async createScene() {
      this.scene = new BABYLON.Scene(this.engine);
      new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
      this.world = new World();
      this.world.engine = this.engine;
      this.world.scene = this.scene;
      this.player = new Player(this.world).setMesh(BABYLON.MeshBuilder.CreateCapsule(
        "player",
        {
          radius: 0.75,
          height: 3,
          subdivisions: 10,
          tessellation: 10,
          capSubdivisions: 10
        },
        this.scene
      )).setPositionAndRotation(new BABYLON.Vector3(5, -5, -10), BABYLON.Quaternion.Identity());
      this.player.mesh.material = new BABYLON.StandardMaterial("playerMat", this.scene);
      this.player.texture = new BABYLON.Texture("%sveltekit.assets%/temp_player.png", this.scene);
      this.player.mesh.material.diffuseTexture = this.player.texture;
      this.player.texture.hasAlpha = true;
      this.player.onGround = true;
      this.camera = new BABYLON.ArcFollowCamera("camera", Math.PI / 2, 0.5, 10, this.player.mesh, this.scene);
      this.camera.orthoBottom = -10;
      this.camera.orthoLeft = -10;
      this.camera.orthoRight = 10;
      this.camera.orthoTop = 10;
      if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
        this.camera.rotationQuaternion = new BABYLON.Vector3(Math.PI / 2, 0, 0).toQuaternion();
      } else {
        this.camera.rotationQuaternion = new BABYLON.Vector3(Math.PI / 2, 0, 0.25).toQuaternion();
      }
      this.world.grounds = [];
      this.world.walls = [];
      var ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 20, depth: 20, height: 0.5 }, this.scene);
      ground.material = new BABYLON.StandardMaterial("groundMat", this.scene);
      ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
      ground.material.backFaceCulling = false;
      ground.position = new BABYLON.Vector3(5, -10, -15);
      ground.rotation = new BABYLON.Vector3(0, 0, 0);
      this.world.grounds.push(ground);
      var wall = BABYLON.MeshBuilder.CreateBox("wall", { width: 15, height: 15, depth: 0.75 }, this.scene);
      wall.material = new BABYLON.StandardMaterial("wallMat", this.scene);
      wall.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
      wall.material.backFaceCulling = false;
      wall.position = new BABYLON.Vector3(3.2, -2.5, -15);
      wall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
      this.world.walls.push(wall);
      var wall2 = BABYLON.MeshBuilder.CreateBox("wall2", { width: 15, height: 15, depth: 0.75 }, this.scene);
      wall2.material = wall.material;
      wall2.position = new BABYLON.Vector3(6.8, -2.5, -15);
      wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
      this.world.walls.push(wall2);
      var platform = BABYLON.MeshBuilder.CreateBox("platform1", { width: 5, depth: 5, height: 0.5 }, this.scene);
      platform.material = wall.material;
      platform.position = new BABYLON.Vector3(17, -10, -10);
      this.world.grounds.push(platform);
      var dbox = BABYLON.MeshBuilder.CreateBox("dbox", { width: 1, height: 2, depth: 1 }, this.scene);
      dbox.position = wall.position;
      dbox.material = new BABYLON.StandardMaterial("dboxMat", this.scene);
      dbox.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
      dbox.material.backFaceCulling = false;
      dbox.setEnabled(false);
      this.scene.collisionsEnabled = true;
      this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(null, this));
      return this.scene;
    }
    beforeRender(game3D2) {
      if (!game3D2.started || game3D2.stopped)
        return;
      game3D2.world.tick();
      game3D2.player.tick(game3D2.camera.rotationQuaternion);
    }
  }
  class EventHandler {
    static onResize(game3D2) {
      game3D2.engine.resize();
    }
  }
  var game3D = new Game3D();
  game3D.ready.then((value) => {
    window.addEventListener("resize", EventHandler.onResize.bind(null, value));
    value.engine.runRenderLoop(() => {
      if (value.started && !value.stopped && value.scene && value.scene.activeCamera) {
        try {
          value.scene.render();
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
  if ($$props.Game3D === void 0 && $$bindings.Game3D && Game3D !== void 0)
    $$bindings.Game3D(Game3D);
  if ($$props.EventHandler === void 0 && $$bindings.EventHandler && EventHandler !== void 0)
    $$bindings.EventHandler(EventHandler);
  $$result.css.add(css);
  return `<canvas id="${"renderCanvas"}" class="${"svelte-1a46o45"}"></canvas>`;
});
const Logger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let logText = "";
  class NewConsole {
    get Console() {
      throw new Error("Do not use, use `new NewConsole()`, instead");
    }
    constructor(oldConsole) {
      this.oldConsole = oldConsole;
      this.countMap = /* @__PURE__ */ new Map();
    }
    hasFormatSpecifiers(formatString) {
      return Object.values(formatString).reduce(
        (previousValue, currentCharacter) => {
          return {
            foundSymbol: currentCharacter === "%",
            hasFormatSpecifiers: previousValue.hasFormatSpecifiers || previousValue.foundSymbol && (currentCharacter === "s" || currentCharacter === "d" || currentCharacter === "i" || currentCharacter === "f" || currentCharacter === "o" || currentCharacter === "0"),
            specifierEnd: 0
          };
        },
        {
          foundSymbol: false,
          hasFormatSpecifiers: false,
          specifierEnd: 0
        }
      ).hasFormatSpecifiers;
    }
    printer(logLevel, args) {
      let argsStr = Object.values(args).reduce(
        (previousValue, currentCharacter) => {
          return previousValue + " " + currentCharacter;
        },
        ""
      );
      logText += xss("[" + logLevel + "] " + argsStr) + "<br>";
    }
    formatter(args) {
      let target = args[0];
      let current = args[1];
      let result = args.filter((_e, i) => {
        return i > 1;
      });
      let specifierPos = Object.values(target).reduce(
        (previousValue, currentCharacter) => {
          return {
            foundSymbol: currentCharacter === "%",
            hasFormatSpecifiers: previousValue.hasFormatSpecifiers || previousValue.foundSymbol && (currentCharacter === "s" || currentCharacter === "d" || currentCharacter === "i" || currentCharacter === "f" || currentCharacter === "o" || currentCharacter === "0"),
            specifierEnd: previousValue.specifierEnd + (previousValue.hasFormatSpecifiers ? 0 : 1)
          };
        },
        {
          foundSymbol: false,
          hasFormatSpecifiers: false,
          specifierEnd: 0
        }
      ).specifierEnd - 2;
      let specifier = Object.values(target).splice(specifierPos, 2).reduce(
        (previousValue, currentCharacter) => {
          return previousValue + currentCharacter;
        },
        ""
      );
      let converted;
      switch (specifier) {
        case "%s":
          converted = String(current);
          break;
        case "%d":
        case "%i":
          if (typeof current === "symbol") {
            converted = NaN;
          } else {
            converted = parseInt(current, 10);
          }
          break;
        case "%f":
          if (typeof current === "symbol") {
            converted = NaN;
          } else {
            converted = parseFloat(current);
          }
          break;
        case "%o":
          converted = current;
          break;
        case "%0":
          converted = current;
          break;
        default:
          converted = current;
          break;
      }
      target = Object.values(target).splice(0, specifierPos).reduce(
        (previousValue, currentCharacter) => {
          return previousValue + currentCharacter;
        },
        ""
      ) + converted + Object.values(target).splice(specifierPos + 2).reduce(
        (previousValue, currentCharacter) => {
          return previousValue + currentCharacter;
        },
        ""
      );
      result.unshift(target);
      if (!this.hasFormatSpecifiers(target))
        return result;
      if (result.length === 1)
        return result;
      return this.formatter(result);
    }
    logger(logLevel, formatString, rest) {
      if (!!rest) {
        this.printer(logLevel, [formatString]);
      } else {
        if (!!formatString && !this.hasFormatSpecifiers(formatString)) {
          this.printer(logLevel, [formatString, ...rest]);
        } else {
          this.printer(logLevel, this.formatter([formatString, ...rest]));
        }
      }
    }
    assert(value = false, message = "Assertion failed", ...optionalParams) {
      if (value)
        return;
      this.logger("assert", message, optionalParams);
      this.oldConsole.assert(value, message, optionalParams);
    }
    clear() {
      this.oldConsole.clear();
    }
    debug(message, ...optionalParams) {
      this.logger("debug", message, optionalParams);
      this.oldConsole.debug(message, optionalParams);
    }
    error(message, ...optionalParams) {
      this.logger("error", message, optionalParams);
      this.oldConsole.error(message, optionalParams);
    }
    info(message, ...optionalParams) {
      this.logger("info", message, optionalParams);
      this.oldConsole.info(message, optionalParams);
    }
    log(message, ...optionalParams) {
      this.logger("log", message, optionalParams);
      this.oldConsole.log(message, optionalParams);
    }
    table(tabularData, properties) {
      this.oldConsole.table(tabularData, properties);
    }
    trace(message, ...optionalParams) {
      this.oldConsole.trace(message, optionalParams);
    }
    warn(message, ...optionalParams) {
      this.logger("warn", message, optionalParams);
      this.oldConsole.warn(message, optionalParams);
    }
    dir(item, options = {}) {
      this.oldConsole.dir(item, options);
    }
    dirxml(...data) {
      this.oldConsole.dirxml(data);
    }
    count(label = "default") {
      this.oldConsole.count(label);
    }
    countReset(label = "default") {
      this.oldConsole.countReset(label);
    }
    group(...label) {
      this.oldConsole.group(label);
    }
    groupCollapsed(...label) {
      this.oldConsole.groupCollapsed(label);
    }
    groupEnd() {
      this.oldConsole.groupEnd();
    }
    time(label = "default") {
      this.oldConsole.time(label);
    }
    timeLog(label = "default", ...data) {
      this.oldConsole.timeLog(label, data);
    }
    timeStamp(label = "default") {
      this.oldConsole.timeStamp(label);
    }
    timeEnd(label = "default") {
      this.oldConsole.timeEnd(label);
    }
    profile(label = "default") {
      this.oldConsole.profile(label);
    }
    profileEnd(label = "default") {
      this.oldConsole.profileEnd(label);
    }
  }
  console = new NewConsole(console);
  if ($$props.NewConsole === void 0 && $$bindings.NewConsole && NewConsole !== void 0)
    $$bindings.NewConsole(NewConsole);
  return `<p id="${"log"}"><!-- HTML_TAG_START -->${logText}<!-- HTML_TAG_END --></p>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Game, "Game").$$render($$result, {}, {}, {})}
${validate_component(Logger, "Logger").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
