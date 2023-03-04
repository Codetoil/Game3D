<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->

<script lang="ts">
    import Logger from "../../../../lib/logger.svelte"
    let worker: SharedWorker | null = new SharedWorker("../../src/routes/client/server/shared-worker.js", {
        name: "Server Thread"
    });
    worker.port.start();
    worker.port.addEventListener("message", (ev: MessageEvent) => {
        if (ev.data === "disconnect")
        {
            worker = null;
        }
        else if (ev.data instanceof String && ev.data.startsWith("log"))
        {
            console.log("Server: " + xss(ev.data.substring(3)) + "<br>");
        }
    });
</script>

<Logger />