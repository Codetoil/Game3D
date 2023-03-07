/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import { GameServer } from "../../server/dedicated/server";
import "./debug/eventLogger"
import { EventLogger } from "./debug/eventLogger";

let gameServer = new GameServer();
let eventLogger = new EventLogger(console);
/**
 * @type {((this: MessagePort, ev: MessageEvent<any>) => any)[]}
 */
let listeners = [];

addEventListener('connect', (evt) => {
    if (!(evt instanceof MessageEvent)) return;
    eventLogger.ports = evt.ports;

    evt.ports.forEach(port => listeners.forEach(listener => port.removeEventListener('message', listener)))

    evt.ports.forEach(port => {
        let listener = (/** @type {MessageEvent<any>} */ ev) => {
            if (typeof ev.data == 'string' && ev.data === 'disconnect') {
                ev.ports[0].close();
                if (evt.ports.length == 0)
                {
                    self.close();
                }
            };
        }
        listeners.push(listener);
        port.addEventListener('message', listener);

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
})