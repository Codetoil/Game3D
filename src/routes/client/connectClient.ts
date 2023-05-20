/** 
 *  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
 */
import {
  DisconnectStartPacket,
  DisconnectSuccessPacket,
  State,
  type Packet,
  LoginSuccessPacket,
  HandshakePacket,
  LoginStartPacket,
  DisconnectPacket,
} from "../common/network/packets";
import serverWorkerURL from "./server/server-worker.js?sharedworker&url";
import { PROTOCOL } from "../common/version";
import type { Game } from "../common/game";
import { WorldClient } from "./worldClient";

export let worker: SharedWorker | null = null;

export let current_state: State = State.HANDSHAKING;

export let send: (packet: Packet) => void | null = null;

export let game: Game | null = null;

export function setGame(game$: Game) {
  console.debug("game = game$")
  game = game$;
}

export function connectToLocal(name: string, event: MouseEvent, playerUUID?: string) {
  if (!worker) {
    console.info("Connecting to local server");
    worker = new SharedWorker(serverWorkerURL, {
      type: 'module'
    });
    worker.onerror = (evt) => console.error(evt.error);
    worker.port.onmessage = (ev: MessageEvent) => {
      if (
        typeof (ev.data) === 'object' &&
        "packet_name" in ev.data &&
        "packet_id" in ev.data &&
        "packet_state" in ev.data
      ) {
        console.debug(
          "[Client] Recieved Packet: " + (ev.data as Packet).packet_name
        )
        if (ev.data.packet_state === current_state) {
          console.debug("Packet matches user state, activating: " + current_state)
          // Login Success Packet
          if ((ev.data as Packet).packet_id === 0x02 && (ev.data as Packet).packet_state === State.LOGIN) {
            console.info("Login successful! Username: \"" + (ev.data as LoginSuccessPacket).username
              + "\" UUID: " + ev.data.uuid)
            console.info("Given User properties: [" + (ev.data as LoginSuccessPacket).properties + "]")
            console.debug("Switching user state to PLAY...")
            current_state = State.PLAY
            console.info("Loading World...")
            game?.scene.removeCamera(game.camera);
            game.world = new WorldClient(game);
            game?.world.load();
          }
          // Disconnnect (at login) Packet
          if ((ev.data as Packet).packet_id === 0x00 && (ev.data as Packet).packet_state === State.LOGIN) {
            worker?.port.close();
            worker = null;
            send = null;
            game?.scene.removeCamera(game.camera);
            game.world = null;
            game?.setMenuCamera();
            console.error("Failed to connect " + (ev.data as DisconnectPacket).reason);
            console.debug("Switching user state to HANDSHAKING...")
            current_state = State.HANDSHAKING
          }
          // Disconnect Success Packet
          if ((ev.data as Packet).packet_id === 0x71 && (ev.data as Packet).packet_state === State.PLAY) {
            worker?.port.close();
            worker = null;
            send = null;
            game?.scene.removeCamera(game.camera);
            game.world = null;
            game?.setMenuCamera();
            console.info("Disconnect Successful!");
            console.debug("Switching user state to HANDSHAKING...")
            current_state = State.HANDSHAKING
          }
          // Kick Packet
          if ((ev.data as Packet).packet_id === 0x72 && (ev.data as Packet).packet_state === State.PLAY) {
            worker?.port.close();
            worker = null;
            send = null;
            game?.scene.removeCamera(game.camera);
            game.world = null;
            game?.setMenuCamera();
            console.info("Kicked!");
            console.debug("Switching user state to HANDSHAKING...")
            current_state = State.HANDSHAKING
          }
        }
        else {
          console.error("Packet for Wrong State: " + (ev.data as Packet).packet_state)
        }
      } else {
        console.debug("Recieved: " + ev.data);
      }
    };
    worker.port.onmessageerror = (ev: MessageEvent) => {
      console.error("Failed to send message: " + ev.data);
    };
    worker.port.start();
    send = (packet: Packet) => {
      console.debug("Sending packet " + packet.packet_name + " over port " + worker?.port)
      worker?.port.postMessage(packet);
    };
    connect(name, playerUUID);
  }
}

export function connectToLAN(name: string, playerUUID?: string) {
  console.info("Connecting to server over LAN");
  // TODO Not implemented yet
}

export function connectToServer(name: string, playerUUID?: string) {
  console.info("Connecting to server over Network");
  // TODO Not implemented yet
}

export function connect(name: string, playerUUID?: string) {
  send(new HandshakePacket(PROTOCOL, State.LOGIN))
  current_state = State.LOGIN
  send(new LoginStartPacket(name, playerUUID))
}

export function disconnect(event: MouseEvent) {
  if (!!worker) {
    console.info("Requesting to disconnect from server");
    send(new DisconnectStartPacket());
  }
}

export function forceDisconnect(event: MouseEvent) {
  if (!!worker) {
    console.info("Forcefully disconnecting from server");
    worker.port.close();
    worker = null;
    send = null;
    game?.scene.removeCamera(game.camera);
    game.world = null;
    game?.setMenuCamera();
    console.debug("Switching user state to HANDSHAKING...")
    current_state = State.HANDSHAKING
  }
}
