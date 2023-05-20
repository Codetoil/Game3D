/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import type { PageServerLoad } from './$types';
import { GameServer } from "./server";

export const load = (async ({ params }) => {
    let gameServer = new GameServer();
    let ready = new Promise<GameServer>((resolve, reject) => gameServer.init);
    ready.then((value) => {
        value.engine.runRenderLoop(() => {
            if (
                value.started &&
                !value.stopped &&
                value.world.scene &&
                value.world.scene.activeCamera
            ) {
                try {
                    value.world.scene.render();
                } catch (e: any) {
                    console.error(e);
                    value.stopped = true;
                }
            } else if (value.stopped && value.engine) {
                value.engine.stopRenderLoop();
                console.error("Stopping game...");
            }
        });
    })
}) satisfies PageServerLoad;

