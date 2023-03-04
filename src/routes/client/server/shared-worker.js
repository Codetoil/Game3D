/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2021" />
/// <reference lib="webworker" />

import { GameServer } from "../../server/dedicated/server";
import "./debug/eventLogger"

let gameServer = new GameServer();

addEventListener('connect', (evt) => {
    if (!(evt instanceof MessageEvent)) return;

    const port = evt.ports[0];

    port.addEventListener('message', (ev) => {
        if (ev.data == 'disconnect') 
        {
            port.postMessage('disconnect');
        }
        else if (ev.data instanceof String && ev.data.startsWith('log'))
        {
            console.log("Server: " + ev.data.substring(3))
        }
    })
    

    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
})