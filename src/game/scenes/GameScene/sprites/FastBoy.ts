import { Game } from "..";
import { Enemy } from "./Enemy";

export class FastBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y);
    this.baseSpeed = 160;
    this.speed = 160;
    this.baseTint = 0x00ff00;
    this.health = 15;
    this.totalHealth = 15;
    this.xp = 5;

    this.setTint(0x00ff00);
  }
}

