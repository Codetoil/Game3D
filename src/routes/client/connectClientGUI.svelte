<script lang="ts">
    import { connectToLocal, disconnect, forceDisconnect } from "./connectClient";

</script>

<button on:click={connectToLocal.bind(null, "Codetoil")}>Connect to Server</button>
<button on:click={disconnect}>Disconnect from Server</button>
<button on:click={forceDisconnect}>Forcefully Disconnect from Server</button>