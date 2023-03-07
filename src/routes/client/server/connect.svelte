<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->

<script lang="ts">
    export let worker: SharedWorker | null = null;

    export function connectToLocal() {
        console.info("Connecting to local server")
        worker = new SharedWorker("src/routes/client/server/shared-worker.js", {
            name: "Server Thread"
        });
        worker.addEventListener('error', (evt) => console.error(evt.error));
        worker.port.addEventListener("message", (ev: MessageEvent) => {
            console.info("Event Data: " + ev.data);
            if (typeof ev.data === 'string' && ev.data === "disconnect")
            {
                console.info("Disconnected from server");
            }
        });
        worker.port.addEventListener("messageerror", (ev: MessageEvent) => {
            console.error("Failed to send message: " + ev.data);
        });
        worker.port.start();
    }

    export function connectToLAN() {
        console.info("Connecting to server over LAN")
        // TODO Not implemented yet
    }

    export function connectToServer() {
        console.info("Connecting to server over Network")
        // TODO Not implemented yet
    }

    export function disconnect() {
        console.info("Disconnecting from server")
        console.info(worker)
        console.info(worker?.port)
        if (!!worker) {
            worker.port.postMessage('disconnect');
        }
    }
</script>

<button on:click="{connectToLocal}">Connect to Server</button>
<button on:click="{disconnect}">Disconnect from Server</button>
