import { c as create_ssr_component, v as validate_component } from "../../chunks/index.js";
import * as BABYLON from "@babylonjs/core";
import "devalue";
import { G as Game } from "../../chunks/game.js";
import { Mixin } from "ts-mixer";
import xss from "xss";
class World {
}
class Entity {
  constructor() {
    this.velH = new BABYLON.Vector3(0, 0, 0);
    this.vely = 0;
    this.facingDirection = new BABYLON.Vector3(0, 0, 1).normalize();
    this.onGround = false;
    this.onWall = false;
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
  setWorld(world) {
    this.world = world;
    return this;
  }
}
class Player extends Entity {
  constructor() {
    super(...arguments);
    this.maxHSpeed = -1;
    this.canWallJump = true;
    this.lastWallWallJumpedFrom = null;
    this.jumpState = false;
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
}
class EntityServer extends Entity {
  setWorld(world) {
    this.world = world;
    return this;
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
      (ground) => this.mesh.intersectsMesh(ground.mesh, false) ? this.mesh.intersectsMesh(ground.mesh, true) : false
    ).reduce((p, c) => p || c, false);
    this.onWall = this.world.walls.map(
      (wall) => this.mesh.intersectsMesh(wall.mesh, false) ? this.mesh.intersectsMesh(wall.mesh, true) : false
    ).reduce((p, c) => p || c, false);
  }
}
class PlayerServer extends Mixin(EntityServer, Player) {
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
    let hitNullable = this.world.scene.pickWithRay(ray, (mesh) => {
      return this.world.walls.map((wall1) => wall1.mesh).includes(mesh);
    });
    if (!hitNullable)
      return;
    let hit = hitNullable;
    if (!hit.pickedMesh)
      return;
    let wall = hit.pickedMesh;
    if (!(this.lastWallWallJumpedFrom === null) && this.lastWallWallJumpedFrom?.mesh !== wall) {
      let normalVectorNullable = hit.getNormal(true);
      if (!normalVectorNullable)
        return;
      let normalVector = normalVectorNullable;
      console.debug([wall, normalVector]);
      if (!hit.pickedPoint)
        return;
      let rayNormal = new BABYLON.Ray(hit.pickedPoint, normalVector, 1);
      new BABYLON.RayHelper(rayNormal).show(
        this.world.scene,
        BABYLON.Color3.Blue()
      );
      let normal = new BABYLON.Quaternion(
        normalVector.x,
        normalVector.y,
        normalVector.z,
        0
      );
      console.assert(!!this.mesh.rotationQuaternion, "Rotation Quaternion cannot be null");
      this.mesh.rotationQuaternion = normal.multiply(this.mesh.rotationQuaternion.multiply(normal)).normalize();
      this.velH = this.velH.subtract(
        normalVectorNullable.scale(2 * BABYLON.Vector3.Dot(this.velH, normalVectorNullable))
      );
      this.vely = 28;
      this.canWallJump = false;
      this.lastWallWallJumpedFrom.mesh = wall;
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
    console.assert(!!this.mesh.rotationQuaternion, "Rotation quaternion cannot be undefined");
    this.rot = this.mesh.rotationQuaternion;
  }
  tick(cameraAngle) {
    console.assert(!!cameraAngle, "Camera angle cannot be undefined");
    this.checkCollisions();
    this.inputController.tick(this, this.world);
    this.inputController.joystick.rotateByQuaternionToRef(cameraAngle, this.inputController.joystick);
    this.checkCollisions();
    this.moveMesh();
  }
}
class PlayerInputController {
  constructor() {
    this.joystick = BABYLON.Vector3.Zero();
    this.sprintHeld = false;
    this.jumpPressed = false;
  }
  setEngine(engine) {
    this.deviceSourceManager = new BABYLON.DeviceSourceManager(engine);
  }
  setJoystickIfBigger(x, z) {
    if (x ** 2 + z ** 2 > this.joystick.lengthSquared()) {
      this.joystick.x = x;
      this.joystick.z = z;
    }
  }
  tick(entity, world) {
    if (!(entity instanceof PlayerClient)) {
      throw new Error("Entity is not a client player.");
    }
    if (!(world instanceof WorldClient)) {
      throw new Error("World is not a client world.");
    }
    let worldClient = world;
    this.sprintHeld = false;
    this.jumpPressed = false;
    this.joystick = BABYLON.Vector3.Zero();
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
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualSense)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualSense
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(3) === 1 || gamepadSource.getInput(2) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(19),
        gamepadSource.getInput(18)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(0) === 1 || gamepadSource.getInput(1) === 1;
    }
    this.joystick.rotateByQuaternionToRef(
      worldClient.camera.rotationQuaternion,
      this.joystick
    );
  }
}
class EntityClient extends Entity {
  setWorld(world) {
    super.setWorld(world);
    return this;
  }
}
class PlayerClient extends Mixin(EntityClient, Player) {
  constructor() {
    super();
    this.inputController = new PlayerInputController();
  }
  setWorld(world) {
    super.setWorld(world);
    this.inputController.setEngine(this.world.scene.getEngine());
    return this;
  }
  checkCollisions() {
  }
}
class WorldClient extends World {
  load(engine) {
    this.scene = new BABYLON.Scene(engine);
    new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.player = new PlayerClient().setWorld(this).setMesh(
      BABYLON.MeshBuilder.CreateCapsule(
        "player",
        {
          capSubdivisions: 10,
          height: 3,
          radius: 0.75,
          subdivisions: 10,
          tessellation: 10
        },
        this.scene
      )
    ).setPositionAndRotation(
      new BABYLON.Vector3(5, -5, -10),
      BABYLON.Quaternion.Identity()
    );
    this.player.mesh.material = new BABYLON.StandardMaterial(
      "playerMat",
      this.scene
    );
    this.player.texture = new BABYLON.Texture(
      "%sveltekit.assets%/temp_player.png",
      this.scene
    );
    this.player.mesh.material.diffuseTexture = this.player.texture;
    this.player.texture.hasAlpha = true;
    this.player.onGround = true;
    this.camera = new BABYLON.ArcFollowCamera(
      "camera",
      Math.PI / 2,
      0.5,
      10,
      this.player.mesh,
      this.scene
    );
    this.camera.orthoBottom = -10;
    this.camera.orthoLeft = -10;
    this.camera.orthoRight = 10;
    this.camera.orthoTop = 10;
    if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
      this.camera.rotationQuaternion = new BABYLON.Vector3(
        Math.PI / 2,
        0,
        0
      ).toQuaternion();
    } else {
      this.camera.rotationQuaternion = new BABYLON.Vector3(
        Math.PI / 2,
        0,
        0.25
      ).toQuaternion();
    }
  }
  tick() {
  }
}
const gameClient_svelte_svelte_type_style_lang = "";
const css = {
  code: "#renderCanvas.svelte-1a46o45{width:100%;height:100%;display:block;font-size:0}",
  map: null
};
const GameClient_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  class GameClient extends Game {
    constructor() {
      super(...arguments);
      this.name = "Game";
      this.ready = new Promise((resolve, reject) => {
      });
    }
    init(resolve, reject) {
      this.canvas = document.getElementById("renderCanvas");
      super.init((oldArgs) => resolve(this.convertFromValue(oldArgs)), reject);
    }
    convertFromValue(value) {
      if (value instanceof GameClient) {
        return value;
      } else if (this.isGameClientPromiseLike(value)) {
        return value;
      } else {
        throw new Error("Not of the form");
      }
    }
    isGameClientPromiseLike(object) {
      return "then" in object;
    }
    async createEngine() {
      const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
      console.log("Using WebGPU: " + webGPUSupported);
      if (webGPUSupported) {
        this.engine = new BABYLON.WebGPUEngine(this.canvas, { antialias: true, stencil: true });
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
      this.clientWorld = new WorldClient();
      this.clientWorld.load(this.engine);
      this.clientWorld.scene.onBeforeRenderObservable.add(this.beforeRender.bind(null, this));
      return this.clientWorld.scene;
    }
    beforeRender(gameClient2) {
      if (!gameClient2.started || gameClient2.stopped)
        return;
      gameClient2.clientWorld.tick();
    }
  }
  class EventHandler {
    static onResize(gameClient2) {
      gameClient2.engine.resize();
    }
  }
  var gameClient = new GameClient();
  gameClient.ready.then((value) => {
    window.addEventListener("resize", EventHandler.onResize.bind(null, value));
    value.engine.runRenderLoop(() => {
      if (value.started && !value.stopped && value.clientWorld.scene && value.clientWorld.scene.activeCamera) {
        try {
          value.clientWorld.scene.render();
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
  if ($$props.GameClient === void 0 && $$bindings.GameClient && GameClient !== void 0)
    $$bindings.GameClient(GameClient);
  if ($$props.EventHandler === void 0 && $$bindings.EventHandler && EventHandler !== void 0)
    $$bindings.EventHandler(EventHandler);
  $$result.css.add(css);
  return `


<canvas id="renderCanvas" class="svelte-1a46o45"></canvas>`;
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
    formatImpl(formatString) {
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
      );
    }
    hasFormatSpecifiers(formatString) {
      return this.formatImpl(formatString).hasFormatSpecifiers;
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
      let specifierPos = this.formatImpl(target).specifierEnd - 2;
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
      logText = "";
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
  return `<button>Clear console</button><br>
<p id="log"><!-- HTML_TAG_START -->${logText}<!-- HTML_TAG_END --></p>`;
});
class DisconnectStartPacket {
  constructor() {
    this.packet_name = "Disconnect Start";
    this.packet_id = 112;
    this.packet_state = 3;
  }
}
class DisconnectSuccessPacket {
  constructor() {
    this.packet_name = "Disconnect Success";
    this.packet_id = 113;
    this.packet_state = 3;
  }
}
const ServerWorkerURL = "data:application/javascript;base64,LyoqCiAqIEFMTCBSSUdIVFMgUkVTRVJWRUQgQ29kZXRvaWwgKGMpIDIwMjEtMjAyMwogKi8KCi8vLyA8cmVmZXJlbmNlIHR5cGVzPSJAc3ZlbHRlanMva2l0IiAvPgovLy8gPHJlZmVyZW5jZSBuby1kZWZhdWx0LWxpYj0idHJ1ZSIvPgovLy8gPHJlZmVyZW5jZSBsaWI9ImVzMjAyMCIgLz4KLy8vIDxyZWZlcmVuY2UgbGliPSJ3ZWJ3b3JrZXIiIC8+CgppbXBvcnQgeyBEaXNjb25uZWN0U3RhcnRQYWNrZXQsIERpc2Nvbm5lY3RTdWNjZXNzUGFja2V0IH0gZnJvbSAiLi4vLi4vbmV0d29yay9wYWNrZXRzIjsKaW1wb3J0IHsgRXZlbnRMb2dnZXIgfSBmcm9tICIuL2V2ZW50TG9nZ2VyIjsKCi8qKgogKiBAdHlwZSB7U2hhcmVkV29ya2VyR2xvYmFsU2NvcGV9CiAqLwovLyBAdHMtaWdub3JlCmxldCBzdyA9IHNlbGY7CgpsZXQgb2xkY29uc29sZSA9IGNvbnNvbGU7CmxldCBldmVudExvZ2dlciA9IGNvbnNvbGUgPSBuZXcgRXZlbnRMb2dnZXIoY29uc29sZSk7CmxldCBwb3J0QW1vdW50ID0gMDsKCnN3Lm9uZXJyb3IgPSAoZXZ0KSA9PiB7CiAgICBjb25zb2xlLmVycm9yKCJFcnJvcjogIiArIGV2dCk7Cn0KCmZ1bmN0aW9uIGRpc2Nvbm5lY3RQb3J0KHBvcnQpIHsKICAgIHBvcnQucG9zdE1lc3NhZ2UobmV3IERpc2Nvbm5lY3RTdWNjZXNzUGFja2V0KCkpOwogICAgcG9ydC5jbG9zZSgpOwogICAgcG9ydEFtb3VudC0tOwogICAgaWYgKHBvcnRBbW91bnQgPCAxKSB7CiAgICAgICAgc3cuY2xvc2UoKTsKICAgIH0KfQoKc3cub25jb25uZWN0ID0gKGV2dCkgPT4gewogICAgZXZlbnRMb2dnZXIucG9ydHMgPSBldnQucG9ydHM7CiAgICBwb3J0QW1vdW50Kys7CgogICAgZXZ0LnBvcnRzLmZvckVhY2gocG9ydCA9PiB7CiAgICAgICAgcG9ydC5vbm1lc3NhZ2UgPSAoZXYpID0+IHsKICAgICAgICAgICAgaWYgKGV2LmRhdGEgaW5zdGFuY2VvZiBEaXNjb25uZWN0U3RhcnRQYWNrZXQgJiYgZXYuY3VycmVudFRhcmdldCBpbnN0YW5jZW9mIE1lc3NhZ2VQb3J0KSB7CiAgICAgICAgICAgICAgICBkaXNjb25uZWN0UG9ydChldi5jdXJyZW50VGFyZ2V0KTsKICAgICAgICAgICAgfTsKICAgICAgICB9CgogICAgICAgIHBvcnQub25tZXNzYWdlZXJyb3IgPSAoZXYpID0+IHsKICAgICAgICAgICAgb2xkY29uc29sZS5lcnJvcihldikKICAgICAgICB9CgogICAgICAgIHBvcnQuc3RhcnQoKTsgLy8gUmVxdWlyZWQgd2hlbiB1c2luZyBhZGRFdmVudExpc3RlbmVyLiBPdGhlcndpc2UgY2FsbGVkIGltcGxpY2l0bHkgYnkgb25tZXNzYWdlIHNldHRlci4KICAgIH0pOwp9Ow==";
function connectToLAN() {
  console.info("Connecting to server over LAN");
}
function connectToServer() {
  console.info("Connecting to server over Network");
}
function connect() {
}
const Connect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { worker = null } = $$props;
  let { send } = $$props;
  function connectToLocal() {
    if (!worker) {
      console.info("Connecting to local server");
      worker = new SharedWorker(ServerWorkerURL);
      worker.onerror = (evt) => console.error(evt.error);
      worker.port.onmessage = (ev) => {
        if ("packet_name" in ev.data && "packet_id" in ev.data && "packet_state" in ev.data) {
          console.debug("Recieved Packet: " + xss(ev.data.packet_name));
        } else {
          console.debug("Recieved: " + xss("" + ev.data));
        }
        if (ev.data instanceof DisconnectSuccessPacket) {
          console.info("Disconnecting from server");
          worker?.port.close();
          worker = null;
        }
      };
      worker.port.onmessageerror = (ev) => {
        console.error("Failed to send message: " + ev.data);
      };
      worker.port.start();
      send = (packet) => {
        worker?.port.postMessage(packet);
      };
    }
  }
  function disconnect() {
    if (!!worker) {
      console.info("Requesting to disconnect from server");
      send(new DisconnectStartPacket());
    }
  }
  function forceDisconnect() {
    if (!!worker) {
      console.info("Forcefully disconnecting from server");
      worker.port.close();
      worker = null;
    }
  }
  if ($$props.worker === void 0 && $$bindings.worker && worker !== void 0)
    $$bindings.worker(worker);
  if ($$props.send === void 0 && $$bindings.send && send !== void 0)
    $$bindings.send(send);
  if ($$props.connectToLocal === void 0 && $$bindings.connectToLocal && connectToLocal !== void 0)
    $$bindings.connectToLocal(connectToLocal);
  if ($$props.connectToLAN === void 0 && $$bindings.connectToLAN && connectToLAN !== void 0)
    $$bindings.connectToLAN(connectToLAN);
  if ($$props.connectToServer === void 0 && $$bindings.connectToServer && connectToServer !== void 0)
    $$bindings.connectToServer(connectToServer);
  if ($$props.connect === void 0 && $$bindings.connect && connect !== void 0)
    $$bindings.connect(connect);
  if ($$props.disconnect === void 0 && $$bindings.disconnect && disconnect !== void 0)
    $$bindings.disconnect(disconnect);
  if ($$props.forceDisconnect === void 0 && $$bindings.forceDisconnect && forceDisconnect !== void 0)
    $$bindings.forceDisconnect(forceDisconnect);
  return `


<button>Connect to Server</button>
<button>Disconnect from Server</button>
<button>Forcefully Disconnect from Server</button>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `


${validate_component(GameClient_1, "Game").$$render($$result, {}, {}, {})}
${validate_component(Connect, "Connect").$$render($$result, {}, {}, {})}
${validate_component(Logger, "Logger").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
