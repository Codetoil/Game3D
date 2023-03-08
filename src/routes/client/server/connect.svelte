<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
  import xss from "xss";
  import type {
    DisconnectSuccessfulPacket,
    Packet,
    RequestDisconnectPacket,
  } from "../../network/packets";
  import ServerWorker from "./server-worker.js?sharedworker";

  export let worker: SharedWorker | null = null;

  export let send: (packet: Packet) => void;

  export function connectToLocal() {
    if (!worker) {
      console.info("Connecting to local server");
      worker = new ServerWorker();
      worker.onerror = (evt) => console.error(evt.error);
      worker.port.onmessage = (ev: MessageEvent) => {
        if ('_packet_name' in ev.data)
        {
          console.debug("Recieved Packet: " + xss((ev.data as Packet)._packet_name));
        }
        else
        {
          console.debug("Recieved: " + xss("" + ev.data));
        }
        if ("_disconnect_successful" in ev.data) {
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
      send({
        _packet_name: "Request Disconnect Packet",
        _request_disconnect: 0,
      } as RequestDisconnectPacket);
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
