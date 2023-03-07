<!-- 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
-->

<script lang="ts">
    import xss from "xss";
    import Logger from "../../../../lib/logger.svelte"
    let worker: SharedWorker | null = new SharedWorker("../../src/routes/client/server/shared-worker.js", {
        name: "Server Thread"
    });
    worker.addEventListener('error', (evt) => console.error(evt.error));
    worker.port.start();
    worker.port.addEventListener("message", (ev: MessageEvent) => {
        console.info("Event Data: " + ev.data);
        if (typeof ev.data === 'string' && ev.data === "disconnect")
        {
            console.error("Disconnected");
        }
        else if (typeof ev.data === 'string' && ev.data.startsWith("log"))
        {
            console.log("Server: " + xss(ev.data.substring(3)) + "<br>");
        }
    });
    worker.port.addEventListener("messageerror", (ev: MessageEvent) => {
        console.error("Failed to send message: " + ev.data);
    });
</script>

<Logger />