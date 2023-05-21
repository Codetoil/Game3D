/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import { ClientboundLoginSuccessPacket, ClientboundDisconnectPacket, ClientboundDisconnectSuccessPacket, ClientboundKickPacket, ClientboundKeepAlivePacket, State } from "../../common/network/packets";
import { PROTOCOL as PROTOCOL } from "../../common/version";
// import { EventLogger } from "./eventLogger"

/**
 * @type {SharedWorkerGlobalScope}
 */
// @ts-ignore
let sw = self;

// let oldconsole = console;
// let eventLogger = console = new EventLogger(console);
let ports = [];
let portStates = new Map();
let portHasGottenKeepAlive = new Map();
let portKeepAliveIds = new Map();
let portIntervals = new Map();

sw.onerror = (evt) => {
    console.error("Error: " + evt);
}

function disconnectPort(port) {
    console.info("Closing connection with user at port " + port);
    port.close();
    portStates.delete(port);
    portHasGottenKeepAlive.delete(port);
    portKeepAliveIds.delete(port);
    portIntervals.delete(port);
    if (portStates.size < 1) {
        console.info("All players offline, disconnecting...")
        sw.close();
    }
}

function closeConnectionPort(port) {
    port.postMessage(new ClientboundDisconnectSuccessPacket());
    disconnectPort(port)
}

function kickPlayerPort(port, reason) {
    port.postMessage(new ClientboundKickPacket(reason));
    disconnectPort(port)
}

function loginRefusePort(port, reason) {
    port.postMessage(new ClientboundDisconnectPacket(reason));
    disconnectPort(port)
}

sw.onconnect = (evt) => {
    ports = evt.ports;
    portStates.set(evt.source, State.HANDSHAKING);
    portHasGottenKeepAlive.set(evt.source, false);
    portIntervals.set(evt.source, setInterval(() => {
        if (!portHasGottenKeepAlive.get(evt.source))
        {
            console.warn("User with port " + evt.source + " timed out, kicking.");
            clearInterval(portIntervals.get(evt.source));
            kickPlayerPort(evt.source, "Timeout");
            return;
        }
        portHasGottenKeepAlive.set(evt.source, false)
        let keepAliveId = Math.random();
        portKeepAliveIds.set(evt.source, keepAliveId)
        evt.source?.postMessage(new ClientboundKeepAlivePacket(keepAliveId));
    }, 20000));

    evt.ports.forEach(port => {
        port.onmessage = (ev) => {
            if (
                "packetName" in ev.data &&
                "packetId" in ev.data &&
                "packetState" in ev.data &&
                ev.data.packetState === portStates.get(port)
            ) {
                console.debug(
                    "[Server] Recieved Packet: " + ev.data.packetName
                )
                // Handshake Packet
                if (ev.data.packetId === 0x00 && ev.data.packetState === State.HANDSHAKING) {
                    if (ev.data.protocol < PROTOCOL) {
                        loginRefusePort(port, "Newer server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
                    }
                    else if (ev.data.protocol > PROTOCOL) {
                        loginRefusePort(port, "Outdated server protocol! " + PROTOCOL + " vs " + ev.data.protocol);
                    }
                    else {
                        if (ev.data.nextState === State.STATUS) {
                            // ignore for now
                            console.debug("Switching state for port " + port + " to STATUS");
                            portStates.set(port, State.STATUS);
                        }
                        else if (ev.data.nextState === State.LOGIN) {
                            console.debug("Switching state for port " + port + " to LOGIN");
                            portStates.set(port, State.LOGIN);
                        }
                        else {
                            loginRefusePort(port, "Status not of valid options [Status, Login]: " + ev.data.nextState)
                        }
                    }
                }
                // Login Start Packet
                if (ev.data.packetId === 0x00 && ev.data.packetState === State.LOGIN) {
                    let playerUUID = !!ev.data.playerUUID ? ev.data.playerUUID : "temp";
                    let playerName = ev.data.playerName;
                    port.postMessage(new ClientboundLoginSuccessPacket(playerUUID, playerName, []))
                    console.debug("Switching state for port " + port + " to PLAY");
                    portStates.set(port, State.PLAY);
                    console.info("User at port " + port + " logging in with UUID " + playerUUID);
                    let keepAliveId = Math.random();
                    portKeepAliveIds.set(evt.source, keepAliveId)
                    evt.source?.postMessage(new ClientboundKeepAlivePacket(keepAliveId));
                    // Do something with the game server
                }
                // Disconnect Start Packet
                if (ev.data.packetId === 0x70 && ev.data.packetState === State.PLAY) {
                    console.info("User at port " + port + " requesting disconnect, closing connection.");
                    closeConnectionPort(port);
                }
                // Keep Alive Packet
                if (ev.data.packetId === 0x23 && ev.data.packetState === State.PLAY) {
                    console.debug("Recieved Keep-Alive from user at port " + port)
                    portHasGottenKeepAlive.set(port, true);
                }
            } else {
                console.debug("Recieved: " + ev.data);
            }
        }

        port.onmessageerror = (ev) => {
            if (eventLogger) {
                oldconsole.error("Failed: " + ev)
            } else {
                console.error("Failed: " + ev)
            }
        }

        port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
    });
};