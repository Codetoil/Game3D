<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
  import xss from "xss";
  import {
    DisconnectStartPacket,
    DisconnectSuccessPacket,
    type Packet,
  } from "../../network/packets";
  import ServerWorkerURL from "./server-worker.js?url";

  export let worker: SharedWorker | null = null;

  export let send: (packet: Packet) => void;

  export function connectToLocal() {
    if (!worker) {
      console.info("Connecting to local server");
      worker = new SharedWorker(ServerWorkerURL);
      worker.onerror = (evt) => console.error(evt.error);
      worker.port.onmessage = (ev: MessageEvent) => {
        if (
          "packet_name" in ev.data &&
          "packet_id" in ev.data &&
          "packet_state" in ev.data
        ) {
          console.debug(
            "Recieved Packet: " + xss((ev.data as Packet).packet_name)
          );
        } else {
          console.debug("Recieved: " + xss("" + ev.data));
        }
        if (ev.data instanceof DisconnectSuccessPacket) {
          console.info("Disconnecting from server");
          worker?.port.close();
          worker = null;
        }
      };
      worker.port.onmessageerror = (ev: MessageEvent) => {
        console.error("Failed to send message: " + ev.data);
      };
      worker.port.start();
      send = (packet: Packet) => {
        worker?.port.postMessage(packet);
      };
      connect();
    }
  }

  export function connectToLAN() {
    console.info("Connecting to server over LAN");
    // TODO Not implemented yet
  }

  export function connectToServer() {
    console.info("Connecting to server over Network");
    // TODO Not implemented yet
  }

  export function connect() {}

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

<button on:click={connectToLocal}>Connect to Server</button>
<button on:click={disconnect}>Disconnect from Server</button>
<button on:click={forceDisconnect}>Forcefully Disconnect from Server</button>
