/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import * as BABYLON from "@babylonjs/core";
import type { EntityServer } from "../server/entitySever";
import type { InputController } from "../common/inputController";
import type { WorldServer } from "../server/worldServer";
import { PlayerClient } from "./entityClient";
import { WorldClient } from "./worldClient";

export class PlayerInputController implements InputController {
    public joystick: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public sprintHeld: boolean = false;
    public jumpPressed: boolean = false;
    private deviceSourceManager!: BABYLON.DeviceSourceManager;

    public setEngine(engine: BABYLON.Engine): void {
        this.deviceSourceManager = new BABYLON.DeviceSourceManager(engine);
    }

    private setJoystickIfBigger(x: number, z: number): void {
        if (x ** 2 + z ** 2 > this.joystick.lengthSquared()) {
            this.joystick.x = x;
            this.joystick.z = z;
        }
    }

    public tick(entity: EntityServer, world: WorldServer): void {
        if (!(entity instanceof PlayerClient)) {
            throw new Error("Entity is not a client player.");
        }
        if (!(world instanceof WorldClient)) {
            throw new Error("World is not a client world.");
        }
        let worldClient = world as WorldClient;
        this.sprintHeld = false;
        this.jumpPressed = false;
        this.joystick = BABYLON.Vector3.Zero();
        if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
            let keyboardSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.Keyboard
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.Keyboard>;
            this.sprintHeld =
                this.sprintHeld ||
                keyboardSource.getInput(16) === 1 ||
                keyboardSource.getInput(76) === 1;
            this.jumpPressed =
                this.jumpPressed ||
                keyboardSource.getInput(32) === 1 ||
                keyboardSource.getInput(74) === 1;
            this.setJoystickIfBigger(
                keyboardSource.getInput(87) - keyboardSource.getInput(83),
                keyboardSource.getInput(68) - keyboardSource.getInput(65)
            );
            this.setJoystickIfBigger(
                keyboardSource.getInput(38) - keyboardSource.getInput(40),
                keyboardSource.getInput(39) - keyboardSource.getInput(37)
            );
        }
        if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Generic)) {
            let gamepadSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.Generic
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.Generic>;
            this.sprintHeld =
                this.sprintHeld ||
                gamepadSource.getInput(0) === 1 ||
                gamepadSource.getInput(3) === 1;
            this.setJoystickIfBigger(
                -gamepadSource.getInput(15),
                gamepadSource.getInput(14)
            );
            this.jumpPressed =
                this.jumpPressed ||
                gamepadSource.getInput(1) === 1 ||
                gamepadSource.getInput(2) === 1;
        }
        if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Switch)) {
            let gamepadSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.Switch
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.Switch>;
            this.sprintHeld =
                this.sprintHeld ||
                gamepadSource.getInput(BABYLON.SwitchInput.A) === 1 ||
                gamepadSource.getInput(BABYLON.SwitchInput.B) === 1;
            this.setJoystickIfBigger(
                -gamepadSource.getInput(BABYLON.SwitchInput.LStickXAxis),
                gamepadSource.getInput(BABYLON.SwitchInput.LStickYAxis)
            );
            this.jumpPressed =
                this.jumpPressed ||
                gamepadSource.getInput(BABYLON.SwitchInput.X) === 1 ||
                gamepadSource.getInput(BABYLON.SwitchInput.Y) === 1;
        }
        if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Xbox)) {
            let gamepadSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.Xbox
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.Xbox>;
            this.sprintHeld =
                this.sprintHeld ||
                gamepadSource.getInput(BABYLON.XboxInput.B) === 1 ||
                gamepadSource.getInput(BABYLON.XboxInput.A) === 1;
            this.setJoystickIfBigger(
                -gamepadSource.getInput(BABYLON.XboxInput.LStickXAxis),
                gamepadSource.getInput(BABYLON.XboxInput.LStickYAxis)
            );
            this.jumpPressed =
                this.jumpPressed ||
                gamepadSource.getInput(BABYLON.XboxInput.X) === 1 ||
                gamepadSource.getInput(BABYLON.XboxInput.Y) === 1;
        }
        if (
            this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualSense)
        ) {
            let gamepadSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.DualSense
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.DualSense>;
            this.sprintHeld =
                this.sprintHeld ||
                gamepadSource.getInput(BABYLON.DualSenseInput.Square) === 1 ||
                gamepadSource.getInput(BABYLON.DualSenseInput.Triangle) === 1;
            this.setJoystickIfBigger(
                -gamepadSource.getInput(BABYLON.DualSenseInput.LStickXAxis),
                gamepadSource.getInput(BABYLON.DualSenseInput.LStickYAxis)
            );
            this.jumpPressed =
                this.jumpPressed ||
                gamepadSource.getInput(BABYLON.DualSenseInput.Circle) === 1 ||
                gamepadSource.getInput(BABYLON.DualSenseInput.Cross) === 1;
        }

        
        if (
            this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualShock)
        ) {
            let gamepadSource = this.deviceSourceManager.getDeviceSource(
                BABYLON.DeviceType.DualShock
            ) as BABYLON.DeviceSource<BABYLON.DeviceType.DualShock>;
            this.sprintHeld =
                this.sprintHeld ||
                gamepadSource.getInput(BABYLON.DualShockInput.Square) === 1 ||
                gamepadSource.getInput(BABYLON.DualShockInput.Triangle) === 1;
            this.setJoystickIfBigger(
                -gamepadSource.getInput(BABYLON.DualShockInput.LStickXAxis),
                gamepadSource.getInput(BABYLON.DualShockInput.LStickYAxis)
            );
            this.jumpPressed =
                this.jumpPressed ||
                gamepadSource.getInput(BABYLON.DualShockInput.Circle) === 1 ||
                gamepadSource.getInput(BABYLON.DualShockInput.Cross) === 1;
        }
        this.joystick.rotateByQuaternionToRef(
            worldClient.camera.rotationQuaternion,
            this.joystick
        );
    }
}
