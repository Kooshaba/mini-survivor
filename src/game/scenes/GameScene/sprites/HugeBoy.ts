import { Game } from "..";
import { Enemy } from "./Enemy";

export class HugeBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y);
    this.baseSpeed = 50;
    this.speed = 50;
    this.baseTint = 0xff0000;
    this.health = 750;
    this.totalHealth = 750;
    this.xp = 250;
    this.damage = 10;

    this.setTint(0xff0000);
    this.setScale(3);
  }
}

