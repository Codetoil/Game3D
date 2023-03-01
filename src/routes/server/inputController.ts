export interface InputController {
  sprintHeld: boolean;
  jumpPressed: boolean;
  joystick: BABYLON.Vector3;

  public tick();
}
