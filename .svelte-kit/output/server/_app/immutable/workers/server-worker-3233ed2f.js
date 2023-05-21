(function() {
  "use strict";
  var State = /* @__PURE__ */ ((State2) => {
    State2[State2["HANDSHAKING"] = 0] = "HANDSHAKING";
    State2[State2["STATUS"] = 1] = "STATUS";
    State2[State2["LOGIN"] = 2] = "LOGIN";
    State2[State2["PLAY"] = 3] = "PLAY";
    return State2;
  })(State || {});
  class ClientboundLoginSuccessPacket {
    constructor(uuid, username, properties) {
      this.packetName = "Clientbound Login Success";
      this.packetId = 2;
      this.packetState = 2;
      this.uuid = uuid;
      this.username = username;
      this.properties = properties;
    }
  }
  class ClientboundDisconnectPacket {
    constructor(reason) {
      this.packetName = "Clientbound Disconnect at Login";
      this.packetId = 0;
      this.packetState = 2;
      this.reason = reason;
    }
  }
  class ClientboundDisconnectSuccessPacket {
    constructor() {
      this.packetName = "Clientbound Disconnect Success";
      this.packetId = 113;
      this.packetState = 3;
    }
  }
  class ClientboundKickPacket {
    constructor(reason) {
      this.packetName = "Clientbound Kick";
      this.packetId = 114;
      this.packetState = 3;
      this.reason = reason;
    }
  }
  class ClientboundKeepAlivePacket {
    constructor(keepAliveID) {
      this.packetName = "Clientbound Keep Alive";
      this.packetId = 18;
      this.packetState = 3;
      this.keepAliveID = keepAliveID;
    }
  }
  let PROTOCOL = 0;
  let sw = self;
  let portStates = /* @__PURE__ */ new Map();
  let portHasGottenKeepAlive = /* @__PURE__ */ new Map();
  let portKeepAliveIds = /* @__PURE__ */ new Map();
  let portIntervals = /* @__PURE__ */ new Map();
  sw.onerror = (evt) => {
    console.error("Error: " + evt);
  };
  function disconnectPort(port) {
    console.info("Closing connection with user at port " + port);
    port.close();
    portStates.delete(port);
    portHasGottenKeepAlive.delete(port);
    portKeepAliveIds.delete(port);
    portIntervals.delete(port);
    if (portStates.size < 1) {
      console.info("All players offline, disconnecting...");
      sw.close();
    }
  }
  function closeConnectionPort(port) {
    port.postMessage(new ClientboundDisconnectSuccessPacket());
    disconnectPort(port);
  }
  function kickPlayerPort(port, reason) {
    port.postMessage(new ClientboundKickPacket(reason));
    disconnectPort(port);
  }
  function loginRefusePort(port, reason) {
    port.postMessage(new ClientboundDisconnectPacket(reason));
    disconnectPort(port);
  }
  sw.onconnect = (evt) => {
    evt.ports;
    portStates.set(evt.source, State.HANDSHAKING);
    portHasGottenKeepAlive.set(evt.source, false);
    portIntervals.set(evt.source, setInterval(() => {
      if (!portHasGottenKeepAlive.get(evt.source)) {
        console.warn("User with port " + evt.source + " timed out, kicking.");
        clearInterval(portIntervals.get(evt.source));
        kickPlayerPort(evt.source, "Timeout");
        return;
      }
      portHasGottenKeepAlive.set(evt.source, false);
      let keepAliveId = Math.random();
      portKeepAliveIds.set(evt.source, keepAliveId);
      evt.source?.postMessage(new ClientboundKeepAlivePacket(keepAliveId));
    }, 2e4));
    evt.ports.forEach((port) => {
      port.onmessage = (ev) => {
        if ("packetName" in ev.data && "packetId" in ev.data && "packetState" in ev.data && ev.data.packetState === portStates.get(port)) {
          console.debug(
            "[Server] Recieved Packet: " + ev.data.packetName
          );
          if (ev.data.packetId === 0 && ev.data.packetState === State.HANDSHAKING) {
            if (ev.data.protocol < PROTOCOL) {
              loginRefusePort(port, "Newer server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
            } else if (ev.data.protocol > PROTOCOL) {
              loginRefusePort(port, "Outdated server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
            } else {
              if (ev.data.nextState === State.STATUS) {
                console.debug("Switching state for port " + port + " to STATUS");
                portStates.set(port, State.STATUS);
              } else if (ev.data.nextState === State.LOGIN) {
                console.debug("Switching state for port " + port + " to LOGIN");
                portStates.set(port, State.LOGIN);
              } else {
                loginRefusePort(port, "Status not of valid options [Status, Login]: " + ev.data.nextState);
              }
            }
          }
          if (ev.data.packetId === 0 && ev.data.packetState === State.LOGIN) {
            let playerUUID = !!ev.data.playerUUID ? ev.data.playerUUID : "temp";
            let playerName = ev.data.playerName;
            port.postMessage(new ClientboundLoginSuccessPacket(playerUUID, playerName, []));
            console.debug("Switching state for port " + port + " to PLAY");
            portStates.set(port, State.PLAY);
            console.info("User at port " + port + " logging in with UUID " + playerUUID);
            let keepAliveId = Math.random();
            portKeepAliveIds.set(evt.source, keepAliveId);
            evt.source?.postMessage(new ClientboundKeepAlivePacket(keepAliveId));
          }
          if (ev.data.packetId === 112 && ev.data.packetState === State.PLAY) {
            console.info("User at port " + port + " requesting disconnect, closing connection.");
            closeConnectionPort(port);
          }
          if (ev.data.packetId === 35 && ev.data.packetState === State.PLAY) {
            console.debug("Recieved Keep-Alive from user at port " + port);
            portHasGottenKeepAlive.set(port, true);
          }
        } else {
          console.debug("Recieved: " + ev.data);
        }
      };
      port.onmessageerror = (ev) => {
        if (eventLogger) {
          oldconsole.error("Failed: " + ev);
        } else {
          console.error("Failed: " + ev);
        }
      };
      port.start();
    });
  };
})();
