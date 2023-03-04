/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { GameServer } from "../../server/dedicated/server";

let gameServer = new GameServer();

addEventListener('connect', (evt) => {
    if (!(evt instanceof MessageEvent)) return;

    const port = evt.ports[0];

    port.addEventListener('message', (ev) => {
        if (!(ev.data == 'disconnect')) return;
        port.postMessage('disconnect');
    })
    

    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
})