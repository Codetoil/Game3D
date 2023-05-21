import { c as create_ssr_component, v as validate_component } from "../../chunks/index2.js";
import * as BABYLON from "@babylonjs/core";
import "devalue";
import { G as Game } from "../../chunks/game.js";
import { Mixin } from "ts-mixer";
class World {
  constructor(game) {
    this.game = game;
  }
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
}
class PlayerClient extends Mixin(EntityClient, Player) {
  constructor() {
    super();
    this.inputController = new PlayerInputController();
  }
  setWorld(world) {
    super.setWorld(world);
    this.inputController.setEngine(this.world.game.engine);
    return this;
  }
  checkCollisions() {
  }
}
class WorldClient extends World {
  constructor(game) {
    super(game);
  }
  load() {
    new BABYLON.HemisphericLight(
      "hemi",
      new BABYLON.Vector3(0, 1, 0),
      this.game.scene
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
        this.game.scene
      )
    ).setPositionAndRotation(
      new BABYLON.Vector3(5, -5, -10),
      BABYLON.Quaternion.Identity()
    );
    this.player.mesh.material = new BABYLON.StandardMaterial(
      "playerMat",
      this.game.scene
    );
    this.player.texture = new BABYLON.Texture(
      "temp_player.png",
      this.game.scene
    );
    this.player.mesh.material.diffuseTexture = this.player.texture;
    this.player.texture.hasAlpha = true;
    this.player.onGround = true;
    this.game.camera = new BABYLON.ArcFollowCamera(
      "camera",
      Math.PI / 2,
      0.5,
      10,
      this.player.mesh,
      this.game.scene
    );
    this.game.camera.orthoBottom = -10;
    this.game.camera.orthoLeft = -10;
    this.game.camera.orthoRight = 10;
    this.game.camera.orthoTop = 10;
    if (this.game.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
      this.game.camera.rotationQuaternion = new BABYLON.Vector3(
        Math.PI / 2,
        0,
        0
      ).toQuaternion();
    } else {
      this.game.camera.rotationQuaternion = new BABYLON.Vector3(
        Math.PI / 2,
        0,
        0.25
      ).toQuaternion();
    }
  }
  tick() {
  }
}
var State = /* @__PURE__ */ ((State2) => {
  State2[State2["HANDSHAKING"] = 0] = "HANDSHAKING";
  State2[State2["STATUS"] = 1] = "STATUS";
  State2[State2["LOGIN"] = 2] = "LOGIN";
  State2[State2["PLAY"] = 3] = "PLAY";
  return State2;
})(State || {});
class ServerboundHandshakePacket {
  constructor(protocol, nextState) {
    this.packetName = "Serverbound Handshake";
    this.packetId = 0;
    this.packetState = 0;
    this.protocol = protocol;
    this.nextState = nextState;
  }
}
class ServerboundLoginStartPacket {
  constructor(playerName, playerUUID) {
    this.packetName = "Serverbound Login Start";
    this.packetId = 0;
    this.packetState = 2;
    this.playerName = playerName;
    this.playerUUID = playerUUID;
  }
}
class ServerboundDisconnectStartPacket {
  constructor() {
    this.packetName = "Serverbound Disconnect Start";
    this.packetId = 112;
    this.packetState = 3;
  }
}
class ServerboundKeepAlivePacket {
  constructor(keepAliveID) {
    this.packetName = "Serverbound Keep Alive";
    this.packetId = 35;
    this.packetState = 3;
    this.keepAliveID = keepAliveID;
  }
}
let PROTOCOL = 0;
function keepAliveTimeoutCallback(connectClient) {
  console.warn("Timed out from server!");
  connectClient.disconnect();
  return;
}
class ConnectClient {
  constructor() {
    this.currentState = State.HANDSHAKING;
    this.game = null;
    this.hasGottenKeepAlive = false;
  }
  setGame(game) {
    console.debug("game = game$");
    this.game = game;
  }
  connect(name, event, playerUUID) {
    this.send(new ServerboundHandshakePacket(PROTOCOL, State.LOGIN));
    this.currentState = State.LOGIN;
    this.send(new ServerboundLoginStartPacket(name, playerUUID));
  }
  disconnect() {
    if (!!this.keepAliveTimeout) {
      clearTimeout(this.keepAliveTimeout);
    }
    this.game?.scene.removeCamera(this.game.camera);
    this.game.world = null;
    this.game?.setMenuCamera();
    console.debug("Switching user state to HANDSHAKING...");
    this.currentState = State.HANDSHAKING;
  }
  requestDisconnect(event) {
    this.send(new ServerboundDisconnectStartPacket());
  }
  forceDisconnect(event) {
    this.disconnect();
  }
  clientboundPackets(packet) {
    console.debug(
      "[Client] Recieved Packet: " + packet.packetName
    );
    if (packet.packetState === this.currentState) {
      if (packet.packetId === 2 && packet.packetState === State.LOGIN) {
        console.info('Login successful! Username: "' + packet.username + '" UUID: ' + packet.uuid);
        console.info("Given User properties: [" + packet.properties + "]");
        console.debug("Switching user state to PLAY...");
        this.currentState = State.PLAY;
        console.info("Loading World...");
        this.game?.scene.removeCamera(this.game.camera);
        this.game.world = new WorldClient(this.game);
        this.game?.world.load();
        this.hasGottenKeepAlive = false;
        this.keepAliveTimeout = window.setTimeout(ConnectClient.keepAliveTimeoutCallback, 3e4, this);
      }
      if (packet.packetId === 0 && packet.packetState === State.LOGIN) {
        this.disconnect();
        console.error("Failed to connect: " + packet.reason);
      }
      if (packet.packetId === 113 && packet.packetState === State.PLAY) {
        this.disconnect();
        console.info("Disconnect Successful!");
      }
      if (packet.packetId === 114 && packet.packetState === State.PLAY) {
        this.disconnect();
        console.error("Kicked: " + packet.reason);
      }
      if (packet.packetId === 18 && packet.packetState === State.PLAY) {
        this.hasGottenKeepAlive = true;
        this.send(new ServerboundKeepAlivePacket(packet.keepAliveID));
        clearTimeout(this.keepAliveTimeout);
        this.keepAliveTimeout = window.setTimeout(keepAliveTimeoutCallback, 3e4, this);
      }
    } else {
      console.error("Packet for Wrong State: " + packet.packetState + " vs " + this.currentState);
    }
  }
}
const serverWorkerURL = "/_app/immutable/workers/server-worker-3233ed2f.js";
class ConnectClientLocal extends ConnectClient {
  constructor() {
    super(...arguments);
    this.worker = null;
  }
  send(packet) {
    if (!this.worker) {
      console.error('Tried to send packet " ' + packet.packetName + '" without active worker thread!');
      return;
    }
    console.debug('Sending packet "' + packet.packetName + '" over port ' + this.worker?.port);
    this.worker?.port.postMessage(packet);
  }
  connect(name, event, playerUUID) {
    if (!!this.worker) {
      console.error("Tried to connect to server while already connected!");
      return;
    }
    console.info("Connecting to local server");
    this.worker = new SharedWorker(serverWorkerURL, {
      type: "module"
    });
    this.worker.onerror = (evt) => console.error(evt.error);
    this.worker.port.onmessage = (ev) => {
      if (typeof ev.data === "object" && "packetName" in ev.data && "packetId" in ev.data && "packetState" in ev.data) {
        this.clientboundPackets(ev.data);
      } else {
        console.debug("Recieved: " + ev.data);
      }
    };
    this.worker.port.onmessageerror = (ev) => {
      console.error("Failed to send message: " + ev.data);
    };
    this.worker.port.start();
    super.connect(name, event, playerUUID);
  }
  disconnect() {
    if (!this.worker) {
      console.error("Tried to disconnect from server despite not being connect to one!");
      return;
    }
    this.worker.port.close();
    this.worker = null;
    super.disconnect();
  }
  requestDisconnect(event) {
    if (!this.worker) {
      console.error("Tried to request disconnection from server despite not being connect to one!");
      return;
    }
    console.info("Requesting to disconnect from local server");
    super.requestDisconnect(event);
  }
  forceDisconnect(event) {
    if (!this.worker) {
      console.error("Tried to forcefully disconnect from server despite not being connect to one!");
      return;
    }
    console.info("Forcefully disconnecting from local server");
    this.disconnect();
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
      super();
      this.name = "Game";
      this.ready = new Promise((resolve, reject) => {
      });
      this.connectClient = new ConnectClientLocal();
      this.connectClient.setGame(this);
    }
    init(resolve, reject) {
      this.canvas = document.getElementById("renderCanvas");
      super.init(resolve, reject);
    }
    isGameClientPromiseLike(object) {
      return "then" in object;
    }
    async createEngine() {
      const webGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
      console.log("Using WebGPU: " + webGPUSupported);
      if (webGPUSupported && false) {
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
      this.scene = new BABYLON.Scene(this.engine);
      this.setMenuCamera();
      this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));
      return this.scene;
    }
    async setMenuCamera() {
      this.camera = new BABYLON.UniversalCamera("default", new BABYLON.Vector3(0, 0, 0), this.scene);
    }
    beforeRender() {
      if (!this.started || this.stopped || !this.world)
        return;
      this.world.tick();
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
      if (value.started && !value.stopped && value.scene && value.scene.activeCamera) {
        try {
          value.scene.render();
        } catch (e) {
          console.error(e);
          value.stopped = true;
        }
      } else if (value.stopped && value.engine) {
        value.engine.stopRenderLoop();
        console.error("Stopped game.");
      }
    });
  });
  if ($$props.GameClient === void 0 && $$bindings.GameClient && GameClient !== void 0)
    $$bindings.GameClient(GameClient);
  if ($$props.EventHandler === void 0 && $$bindings.EventHandler && EventHandler !== void 0)
    $$bindings.EventHandler(EventHandler);
  $$result.css.add(css);
  return `


<canvas id="renderCanvas" class="svelte-1a46o45"></canvas>
<button>Connect to Server</button>
<button>Disconnect from Server</button>
<button>Forcefully Disconnect from Server</button>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `


${validate_component(GameClient_1, "GameClient").$$render($$result, {}, {}, {})}
`;
});
export {
  Page as default
};
