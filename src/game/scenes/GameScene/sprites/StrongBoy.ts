import { Game } from "..";
import { Enemy } from "./Enemy";

export class StrongBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y);
    this.baseSpeed = 70;
    this.speed = 70;
    this.baseTint = 0xffa500;
    this.health = 100;
    this.totalHealth = 100;
    this.xp = 10;

    this.setTint(0xffa500);
    this.setScale(1.5);
  }
}

