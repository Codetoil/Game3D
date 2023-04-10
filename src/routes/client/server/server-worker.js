/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import { DisconnectStartPacket, DisconnectSuccessPacket } from "../../network/packets";
import { EventLogger } from "./eventLogger";

/**
 * @type {SharedWorkerGlobalScope}
 */
// @ts-ignore
let sw = self;

let oldconsole = console;
let eventLogger = console = new EventLogger(console);
let portAmount = 0;

sw.onerror = (evt) => {
    console.error("Error: " + evt);
}

function disconnectPort(port) {
    port.postMessage(new DisconnectSuccessPacket());
    port.close();
    portAmount--;
    if (portAmount < 1) {
        sw.close();
    }
}

sw.onconnect = (evt) => {
    eventLogger.ports = evt.ports;
    portAmount++;

    evt.ports.forEach(port => {
        port.onmessage = (ev) => {
            if (ev.data instanceof DisconnectStartPacket && ev.currentTarget instanceof MessagePort) {
                disconnectPort(ev.currentTarget);
            };
        }

        port.onmessageerror = (ev) => {
            oldconsole.error(ev)
        }

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
};