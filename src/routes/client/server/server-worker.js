/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import EventLogger from "./eventLogger";

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

sw.onconnect = (evt) => {
    eventLogger.ports = evt.ports;
    portAmount++;

    evt.ports.forEach(port => {
        port.onmessage = (ev) => {
            if ('_request_disconnect' in ev.data && ev.currentTarget != null
                && ev.currentTarget instanceof MessagePort) {
                ev.currentTarget.postMessage({
                    _packet_name: "Disconnect Successful Packet",
                    _disconnect_successful: 0
                })
                ev.currentTarget?.close();
                portAmount--;
                if (portNumber === 0) {
                    sw.close();
                }
            };
        }

        port.onmessageerror = (ev) => {
            oldconsole.error(ev)
            self.close();
        }

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
};
