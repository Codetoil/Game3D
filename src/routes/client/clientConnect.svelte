<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
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
  import ServerWorker from "./server/server-worker.js?sharedworker";
  import { PROTOCOL } from "../common/version";

  export let worker: SharedWorker | null = null;

  export let current_state: State = State.HANDSHAKING;

  export let send: (packet: Packet) => void;

  export function connectToLocal(event: MouseEvent, name: string, playerUUID?: string) {
    if (!worker) {
      console.info("Connecting to local server");
      worker = new ServerWorker();
      worker.onerror = (evt) => console.error(evt.error);
      worker.port.onmessage = (ev: MessageEvent) => {
        if (
          "packet_name" in ev.data &&
          "packet_id" in ev.data &&
          "packet_state" in ev.data
        ) {
          console.debug(
            "[Client] Recieved Packet: " + (ev.data as Packet).packet_name
          )
          if (ev.data.packet_state === current_state)
          {
            console.debug("Packet matches user state, activating: " + current_state)
            if ((ev.data as Packet).packet_id === 0x02 && (ev.data as Packet).packet_state === State.LOGIN)
            {
              console.info("Login successful! Username: \"" + (ev.data as LoginSuccessPacket).username
                + "\" UUID: " + ev.data.uuid)
              console.info("Given User properties: [" + (ev.data as LoginSuccessPacket).properties + "]")
              console.info("Switching user state to PLAY...")
              current_state = State.PLAY
            }
            if ((ev.data as Packet).packet_id === 0x00 && (ev.data as Packet).packet_state === State.LOGIN)
            {
              worker?.port.close();
              worker = null;
              console.error("Failed to connect " + (ev.data as DisconnectPacket).reason);
              console.info("Switching user state to HANDSHAKING")
              current_state = State.HANDSHAKING
            }
            if ((ev.data as Packet).packet_id === 0x71 && (ev.data as Packet).packet_state === State.PLAY)
            {
              worker?.port.close();
              worker = null;
              console.info("Disconnect Successful!");
              console.info("Switching user state to HANDSHAKING")
              current_state = State.HANDSHAKING
            }
            if ((ev.data as Packet).packet_id === 0x72 && (ev.data as Packet).packet_state === State.PLAY)
            {
              worker?.port.close();
              worker = null;
              console.info("Kicked!");
              console.info("Switching user state to HANDSHAKING")
              current_state = State.HANDSHAKING
            }
          }
          else
          {
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

  export function disconnect() {
    if (!!worker) {
      console.info("Requesting to disconnect from server");
      send(new DisconnectStartPacket());
    }
  }

  export function forceDisconnect() {
    if (!!worker) {
      console.info("Forcefully disconnecting from server");
      worker.port.close();
      worker = null;
    }
  }
</script>

<button on:click={connectToLocal.bind(null, "Codetoil")}>Connect to Server</button>
<button on:click={disconnect}>Disconnect from Server</button>
<button on:click={forceDisconnect}>Forcefully Disconnect from Server</button>
