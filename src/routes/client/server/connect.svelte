<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->
<script lang="ts">
  import xss from "xss";
  import ServerWorker from "./server-worker.js?sharedworker";

  export let worker: SharedWorker | null = null;

  export function connectToLocal() {
    if (!worker) {
      console.info("Connecting to local server");
      worker = new ServerWorker();
      worker.onerror = (evt) => console.error(evt.error);
      worker.port.onmessage = (ev: MessageEvent) => {
        console.debug("Recieved: " + xss("" + ev.data));
        if (typeof ev.data === "string" && ev.data === "disconnect") {
          console.info("Disconnecting from server");
          worker?.port.close();
          worker = null;
        }
      };
      worker.port.onmessageerror = (ev: MessageEvent) => {
        console.error("Failed to send message: " + ev.data);
      };
      worker.port.start();
    }
  }

  export function connectToLAN() {
    if (!worker) {
      console.info("Connecting to server over LAN");
      // TODO Not implemented yet
    }
  }

  export function connectToServer() {
    if (!worker) {
      console.info("Connecting to server over Network");
      // TODO Not implemented yet
    }
  }

  export function disconnect() {
    if (!!worker) {
      console.info("Requesting to disconnect from server");
      worker.port.postMessage("disconnect");
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
