/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import "./debug/eventLogger"
import { EventLogger } from "./debug/eventLogger";

/**
 * @type {SharedWorkerGlobalScope}
 */
// @ts-ignore
let sw = self;

let eventLogger = console = new EventLogger(console);
/**
 * @type {((this: MessagePort, ev: MessageEvent<any>) => any)[]}
 */
let listeners = [];

sw.onerror = (evt) => {
    eventLogger.ports.forEach(port => {
        console.error("Error: " + evt);
    })
}

sw.onconnect = (evt) => {
    eventLogger.ports = evt.ports;

    evt.ports.forEach(port => {
        port.onmessage = (ev) => {
            if (typeof ev.data == 'string' && ev.data === 'disconnect'
            && ev.currentTarget instanceof MessagePort) {
                ev.currentTarget.postMessage("disconnect")
                ev.currentTarget?.close();
                if (currentlyActiveClients().length == 0) {
                    self.close();
                }
            };
        }
        port.onmessageerror = (_ev) => {
            self.close();
        }

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
};

/**
 * @returns {Array<MessagePort>}
 */
function currentlyActiveClients() {
    throw new Error("Function not implemented.");
}
