import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
import * as BABYLON from "@babylonjs/core";
import { W as World, G as Game } from "../../chunks/world.js";
import * as NetSerializer from "net-serializer";
import NetSerializer__default from "net-serializer";
import * as uuid from "uuid";
import { Mixin } from "ts-mixer";
const uuidType = {
  bytes: [{ type: "uint8" }]
};
var State = /* @__PURE__ */ ((State2) => {
  State2[State2["HANDSHAKING"] = 0] = "HANDSHAKING";
  State2[State2["STATUS"] = 1] = "STATUS";
  State2[State2["LOGIN"] = 2] = "LOGIN";
  State2[State2["CONFIG"] = 3] = "CONFIG";
  State2[State2["PLAY"] = 4] = "PLAY";
  return State2;
})(State || {});
const stateType = { type: "uint8" };
const genericPacketInfoType = {
  packetName: { type: "string" },
  packetId: { type: "uint8" },
  packetState: stateType
};
const _ServerboundHandshakePacketData = class _ServerboundHandshakePacketData2 {
  constructor(protocol, nextState) {
    this.protocol = protocol;
    this.nextState = nextState;
  }
  pack() {
    return NetSerializer.pack(
      _ServerboundHandshakePacketData2.packetInfoType,
      {
        protocol: this.protocol,
        nextState: this.nextState.valueOf()
      }
    );
  }
  unpack(buffer) {
    const value = NetSerializer.unpack(buffer, _ServerboundHandshakePacketData2.packetInfoType);
    this.protocol = value.protocol;
    this.nextState = value.nextState;
  }
};
_ServerboundHandshakePacketData.genericPacketInfo = {
  packetName: "Serverbound Handshake",
  packetId: 0,
  packetState: 0 .valueOf()
};
_ServerboundHandshakePacketData.packetInfoType = {
  protocol: { type: "uint32" },
  nextState: stateType
};
let ServerboundHandshakePacketData = _ServerboundHandshakePacketData;
const _ServerboundLoginStartPacketData = class _ServerboundLoginStartPacketData2 {
  constructor(playerName, playerUUID) {
    this.playerName = playerName;
    this.playerUUID = playerUUID;
  }
  pack() {
    return NetSerializer.pack(
      _ServerboundLoginStartPacketData2.packetInfoType,
      {
        playerName: this.playerName,
        playerUUID: !!this.playerUUID ? uuid.parse(this.playerUUID) : []
      }
    );
  }
  unpack(buffer) {
    const value = NetSerializer.unpack(buffer, _ServerboundLoginStartPacketData2.packetInfoType);
    this.playerName = value.playerName;
    if (value.playerUUID.length != 0) {
      this.playerUUID = uuid.stringify(value.playerUUID);
    }
  }
};
_ServerboundLoginStartPacketData.genericPacketInfo = {
  packetName: "Serverbound Login Start",
  packetId: 0,
  packetState: 2 .valueOf()
};
_ServerboundLoginStartPacketData.packetInfoType = {
  playerName: { type: "string" },
  playerUUID: uuidType
};
let ServerboundLoginStartPacketData = _ServerboundLoginStartPacketData;
const _ServerboundDisconnectStartPacketData = class _ServerboundDisconnectStartPacketData2 {
  pack() {
    return NetSerializer.pack(
      _ServerboundDisconnectStartPacketData2.packetInfoType,
      {}
    );
  }
  unpack(buffer) {
    NetSerializer.unpack(buffer, _ServerboundDisconnectStartPacketData2.packetInfoType);
  }
};
_ServerboundDisconnectStartPacketData.genericPacketInfo = {
  packetName: "Serverbound Disconnect Start",
  packetId: 112,
  packetState: 4 .valueOf()
};
_ServerboundDisconnectStartPacketData.packetInfoType = {};
let ServerboundDisconnectStartPacketData = _ServerboundDisconnectStartPacketData;
const _ServerboundKeepAlivePacketData = class _ServerboundKeepAlivePacketData2 {
  constructor(keepAliveID) {
    this.keepAliveID = keepAliveID;
  }
  pack() {
    return NetSerializer.pack(
      _ServerboundKeepAlivePacketData2.packetInfoType,
      {
        keepAliveID: this.keepAliveID
      }
    );
  }
  unpack(buffer) {
    const value = NetSerializer.unpack(buffer, _ServerboundKeepAlivePacketData2.packetInfoType);
    this.keepAliveID = value.keepAliveID;
  }
};
_ServerboundKeepAlivePacketData.genericPacketInfo = {
  packetName: "Serverbound Keep Alive",
  packetId: 35,
  packetState: 4 .valueOf()
};
_ServerboundKeepAlivePacketData.packetInfoType = {
  keepAliveID: { type: "uint32" }
};
let ServerboundKeepAlivePacketData = _ServerboundKeepAlivePacketData;
const _ClientboundKeepAlivePacketData = class _ClientboundKeepAlivePacketData2 {
  constructor(keepAliveID) {
    this.keepAliveID = keepAliveID;
  }
  pack() {
    return NetSerializer.pack(
      _ClientboundKeepAlivePacketData2.packetInfoType,
      {
        keepAliveID: this.keepAliveID
      }
    );
  }
  unpack(buffer) {
    const value = NetSerializer.unpack(buffer, _ClientboundKeepAlivePacketData2.packetInfoType);
    this.keepAliveID = value.keepAliveID;
  }
};
_ClientboundKeepAlivePacketData.genericPacketInfo = {
  packetName: "Clientbound Keep Alive",
  packetId: 18,
  packetState: 4 .valueOf()
};
_ClientboundKeepAlivePacketData.packetInfoType = {
  keepAliveID: { type: "uint32" }
};
let ClientboundKeepAlivePacketData = _ClientboundKeepAlivePacketData;
let PROTOCOL = 0;
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
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(BABYLON.SwitchInput.A) === 1 || gamepadSource.getInput(BABYLON.SwitchInput.B) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(BABYLON.SwitchInput.LStickXAxis),
        gamepadSource.getInput(BABYLON.SwitchInput.LStickYAxis)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(BABYLON.SwitchInput.X) === 1 || gamepadSource.getInput(BABYLON.SwitchInput.Y) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Xbox)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Xbox
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(BABYLON.XboxInput.B) === 1 || gamepadSource.getInput(BABYLON.XboxInput.A) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(BABYLON.XboxInput.LStickXAxis),
        gamepadSource.getInput(BABYLON.XboxInput.LStickYAxis)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(BABYLON.XboxInput.X) === 1 || gamepadSource.getInput(BABYLON.XboxInput.Y) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualSense)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualSense
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(BABYLON.DualSenseInput.Square) === 1 || gamepadSource.getInput(BABYLON.DualSenseInput.Triangle) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(BABYLON.DualSenseInput.LStickXAxis),
        gamepadSource.getInput(BABYLON.DualSenseInput.LStickYAxis)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(BABYLON.DualSenseInput.Circle) === 1 || gamepadSource.getInput(BABYLON.DualSenseInput.Cross) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualShock)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualShock
      );
      this.sprintHeld = this.sprintHeld || gamepadSource.getInput(BABYLON.DualShockInput.Square) === 1 || gamepadSource.getInput(BABYLON.DualShockInput.Triangle) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(BABYLON.DualShockInput.LStickXAxis),
        gamepadSource.getInput(BABYLON.DualShockInput.LStickYAxis)
      );
      this.jumpPressed = this.jumpPressed || gamepadSource.getInput(BABYLON.DualShockInput.Circle) === 1 || gamepadSource.getInput(BABYLON.DualShockInput.Cross) === 1;
    }
    this.joystick.rotateByQuaternionToRef(
      worldClient.game.camera.rotationQuaternion,
      this.joystick
    );
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
class ConnectClient {
  constructor(game) {
    this.currentState = State.HANDSHAKING;
    this.hasGottenKeepAlive = false;
    this.keepAliveTimeout = void 0;
    this.setGame(game);
  }
  setGame(game) {
    console.debug("game = game$");
    this.game = game;
  }
  send(packet) {
    let packetInfoBuffer = NetSerializer__default.pack(packet.genericPacketInfo, genericPacketInfoType);
    let packetDataBuffer = packet.packetData.pack();
    let buffer = new Uint8Array(2 + packetInfoBuffer.byteLength + packetDataBuffer.byteLength);
    let high = packetInfoBuffer.byteLength >> 8 & 255;
    let low = packetInfoBuffer.byteLength & 255;
    buffer.set([low, high], 0);
    buffer.set(new Uint8Array(packetInfoBuffer), 2);
    buffer.set(new Uint8Array(packetDataBuffer), packetInfoBuffer.byteLength + 2);
    this.socket.send(buffer);
  }
  connect(name, event, playerUUID) {
    this.send({
      genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
      packetData: new ServerboundHandshakePacketData(PROTOCOL, State.LOGIN)
    });
    this.currentState = State.LOGIN;
    this.send({
      genericPacketInfo: ClientboundKeepAlivePacketData.genericPacketInfo,
      packetData: new ServerboundLoginStartPacketData(name, playerUUID)
    });
  }
  disconnect() {
    if (!!this.keepAliveTimeout) {
      clearTimeout(this.keepAliveTimeout);
      this.keepAliveTimeout = void 0;
    }
    this.game?.scene.removeCamera(this.game.camera);
    this.game.world = void 0;
    this.game?.setMenuCamera();
    console.debug("Switching user state to HANDSHAKING...");
    this.currentState = State.HANDSHAKING;
  }
  requestDisconnect(event) {
    this.send({
      genericPacketInfo: ServerboundDisconnectStartPacketData.genericPacketInfo,
      packetData: new ServerboundDisconnectStartPacketData()
    });
  }
  forceDisconnect(event) {
    this.disconnect();
  }
  clientboundPackets(packet) {
    console.debug(
      "[Client] Received Packet: " + packet.genericPacketInfo.packetName
    );
    if (packet.genericPacketInfo.packetState === this.currentState) {
      if (packet.genericPacketInfo.packetId === 2 && packet.genericPacketInfo.packetState === State.LOGIN) {
        console.info('Login successful! Username: "' + packet.packetData.username + '" UUID: ' + packet.packetData.uuid);
        console.info("Given User properties: [" + packet.packetData.properties + "]");
        console.debug("Switching user state to PLAY...");
        this.currentState = State.PLAY;
        console.info("Loading World...");
        this.game?.scene.removeCamera(this.game.camera);
        this.game.world = new WorldClient(this.game);
        this.game?.world.load();
        this.hasGottenKeepAlive = false;
        this.keepAliveTimeout = window.setTimeout(ConnectClient.keepAliveTimeoutCallback, 3e4, this);
      }
      if (packet.genericPacketInfo.packetId === 0 && packet.genericPacketInfo.packetState === State.LOGIN) {
        this.disconnect();
        console.error("Failed to connect: " + packet.packetData.reason);
      }
      if (packet.genericPacketInfo.packetId === 113 && packet.genericPacketInfo.packetState === State.PLAY) {
        this.disconnect();
        console.info("Disconnect Successful!");
      }
      if (packet.genericPacketInfo.packetId === 114 && packet.genericPacketInfo.packetState === State.PLAY) {
        this.disconnect();
        console.error("Kicked: " + packet.packetData.reason);
      }
      if (packet.genericPacketInfo.packetId === 18 && packet.genericPacketInfo.packetState === State.PLAY) {
        this.hasGottenKeepAlive = true;
        this.send(
          /** @type {import("../../common/network/packets").Packet} */
          {
            genericPacketInfo: ServerboundKeepAlivePacketData.genericPacketInfo,
            packetData: new ServerboundKeepAlivePacketData(packet.packetData.keepAliveID)
          }
        );
        clearTimeout(this.keepAliveTimeout);
        this.keepAliveTimeout = window.setTimeout(ConnectClient.keepAliveTimeoutCallback, 3e4, this);
      }
    } else {
      console.error("Packet for Wrong State: " + packet.genericPacketInfo.packetState + " vs " + this.currentState);
    }
  }
  static keepAliveTimeoutCallback(connectClient) {
    console.warn("Timed out from server!");
    connectClient.disconnect();
    return;
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
      this.connectClient = new ConnectClient(this);
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
      console.log("Engine initialized...");
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
  return `  <canvas id="renderCanvas" class="svelte-1a46o45"></canvas> <button data-svelte-h="svelte-1e7pysx">Connect to Server</button> <button data-svelte-h="svelte-jzc4o2">Disconnect from Server</button> <button data-svelte-h="svelte-luy4bh">Forcefully Disconnect from Server</button>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `  ${validate_component(GameClient_1, "GameClient").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
