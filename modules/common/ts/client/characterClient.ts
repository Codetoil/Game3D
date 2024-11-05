/**
 *  Game3D, a 3D Platformer built for the web.
 *  Copyright (C) 2021-2024 Codetoil
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


import * as BABYLON from "@babylonjs/core";
import {Mixin} from "ts-mixer";
import {PlayerInputController} from "./clientInputController";
import {Character, Player} from "../common/character";
import type {World} from "../common/world";

export class CharacterClient extends Character {
    protected _texture?: BABYLON.Texture;

    public constructor() {
        super();
        this._inputController = new PlayerInputController();
    }

    public get texture(): BABYLON.Texture | undefined
    {
        return this._texture;
    }

    public set texture(texture: BABYLON.Texture)
    {
        this._texture = texture;
    }

    public set world(world: World) {
        this._world = world;
        (this._inputController as PlayerInputController).setEngine(this._world.game.babylonEngine);
    }
}