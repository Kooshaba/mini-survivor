import { Game } from "..";
import { Enemy } from "./Enemy";

export class StrongBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y);
    this.baseSpeed = 50;
    this.speed = 50;
    this.baseTint = 0xffa500;
    this.health = 500;
    this.totalHealth = 500;
    this.xp = 10;
    this.xpDropChance = 1;

    this.setTint(0xffa500);
    this.setScale(1.5);
  }
}

