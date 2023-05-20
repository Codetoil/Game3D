/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import { LoginSuccessPacket, DisconnectPacket, DisconnectSuccessPacket, KickPacket, State } from "../../common/network/packets";
import { PROTOCOL as PROTOCOL } from "../../common/version";
import { EventLogger } from "./eventLogger"

/**
 * @type {SharedWorkerGlobalScope}
 */
// @ts-ignore
let sw = self;

console.debug("TEST!")

let oldconsole = console;
let eventLogger = console = new EventLogger(console);
let portAmount = 0;
let portStates = new Map();

sw.onerror = (evt) => {
    console.error("Error: " + evt);
}

function disconnectPort(port) {
    port.close();
    portStates.delete(port);
    portAmount--;
    if (portAmount < 1) {
        sw.close();
    }
}

function letDisconnectPort(port, reason) {
    port.postMessage(new DisconnectSuccessPacket(reason));
    disconnectPort(port)
}

function kickPlayerPort(port, reason) {
    port.postMessage(new KickPacket(reason));
    disconnectPort(port)
}

function loginRefusePort(port, reason) {
    port.postMessage(new DisconnectPacket(reason));
    disconnectPort(port)
}

sw.onconnect = (evt) => {
    eventLogger.ports = evt.ports;
    portAmount++;

    evt.ports.forEach(port => {
        port.onmessage = (ev) => {
            if (!portStates.has(port)) portStates.set(port, State.HANDSHAKING);
            if (
                "packet_name" in ev.data &&
                "packet_id" in ev.data &&
                "packet_state" in ev.data &&
                ev.data.packet_state === portStates.get(port)
            ) {
                console.debug(
                    "[Server] Recieved Packet: " + ev.data.packet_name
                )
                if (ev.data.packet_id === 0x00 && ev.data.packet_state === State.HANDSHAKING)
                {
                    if (ev.data.protocol < PROTOCOL) {
                        loginRefusePort(port, "Newer server protocol! " + PROTOCOL + " vs " + ev.data.version);
                    }
                    else if (ev.data.protocol > PROTOCOL) {
                        loginRefusePort(port, "Outdated server protocol! " + PROTOCOL + " vs " + ev.data.version);
                    }
                    else
                    {
                        if (ev.data.nextState === State.STATUS)
                        {
                            // ignore for now
                            console.debug("Switching state for port " + port + " to STATUS");
                            portStates.set(port, State.STATUS);
                        }
                        else if (ev.data.nextState === State.LOGIN)
                        {
                            console.debug("Switching state for port " + port + " to LOGIN");
                            portStates.set(port, State.LOGIN);
                        }
                        else
                        {
                            loginRefusePort(port, "Status not of valid options [Status, Login]: " + ev.data.nextState)
                        }
                    }
                }
                if (ev.data.packet_id === 0x00 && ev.data.packet_state === State.LOGIN) {
                    // Do something with the game server
                    let playerUUID = ev.data.playerUUID !== null ? ev.data.playerUUID : "temp";
                    let playerName = ev.data.playerName;
                    port.postMessage(new LoginSuccessPacket(playerUUID, playerName))
                    console.debug("Switching state for port " + port + " to PLAY");
                    portStates.set(port, State.PLAY);
                }

            } else {
                console.debug("Recieved: " + ev.data);
            }
        }

        port.onmessageerror = (ev) => {
            oldconsole.error("Failed: " + ev)
        }

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
};