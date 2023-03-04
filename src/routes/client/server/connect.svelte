<script lang="ts">
    export let worker: SharedWorker | null = null;

    export function connectToLocal() {
        worker = new SharedWorker("src/routes/client/server/shared-worker.js", {
            name: "Server Thread"
        });
        worker.port.start();
        worker.port.addEventListener("message", (ev: MessageEvent) => {
            if (!(ev.data === "disconnect")) return;
            worker = null;
        });
    }

    export function connectToLAN() {
        // TODO Not implemented yet
    }

    export function connectToServer() {
        // TODO Not implemented yet
    }

    export function disconnect() {
        if (!!worker) {
            worker.port.postMessage('disconnect');
        }
    }
</script>

<button on:click="{connectToLocal()}">Connect to Server</button>
<button on:click="{disconnect()}">Disconnect from Server</button>
