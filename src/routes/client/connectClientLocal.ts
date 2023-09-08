/** 
 *  ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
 */

import type {
  Packet,
} from "../common/network/packets";
import serverWorkerURL from "./server/server-worker.js?sharedworker&url";
import { ConnectClient } from "./connectClient";

export class ConnectClientLocal extends ConnectClient {
  protected worker?: SharedWorker = undefined;

  public send(packet: Packet): void {
    if (!this.worker) {
      console.error("Tried to send packet \" " + packet.packetName + "\" without active worker thread!");
      return;
    }
    console.debug("Sending packet \"" + packet.packetName + "\" over port " + this.worker?.port)
    this.worker?.port.postMessage(packet);
  }

  public connect(name: string, event: MouseEvent, playerUUID?: string) {
    if (!!this.worker) {
      console.error("Tried to connect to server while already connected!");
      return;
    }
    console.info("Connecting to local server");
    this.worker = new SharedWorker(serverWorkerURL, {
      type: 'module'
    });
    this.worker.onerror = (evt) => console.error(evt.error);
    this.worker.port.onmessage = (ev: MessageEvent) => {
      if (
        typeof (ev.data) === 'object' &&
        "packetName" in ev.data &&
        "packetId" in ev.data &&
        "packetState" in ev.data
      ) {
        this.clientboundPackets(ev.data);
      } else {
        console.debug("Recieved: " + ev.data);
      }
    };
    this.worker.port.onmessageerror = (ev: MessageEvent) => {
      console.error("Failed to send message: " + ev.data);
    };
    this.worker.port.start();
    super.connect(name, event, playerUUID);
  }

  public disconnect() {
    if (!this.worker) {
      console.error("Tried to disconnect from server despite not being connect to one!");
      return;
    }
    this.worker.port.close();
    this.worker = undefined;
    super.disconnect()
  }

  public requestDisconnect(event: MouseEvent) {
    if (!this.worker) {
      console.error("Tried to request disconnection from server despite not being connect to one!");
      return;
    }
    console.info("Requesting to disconnect from local server");
    super.requestDisconnect(event);
  }

  public forceDisconnect(event: MouseEvent) {
    if (!this.worker) {
      console.error("Tried to forcefully disconnect from server despite not being connect to one!");
      return;
    }
    console.info("Forcefully disconnecting from local server");
    this.disconnect();
  }
}