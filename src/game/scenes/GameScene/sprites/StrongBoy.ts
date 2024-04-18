import { Game } from "..";
import { Enemy } from "./Enemy";

export class StrongBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y);
    this.baseSpeed = 20;
    this.speed = 20;
    this.baseTint = 0xffa500;
    this.health = 400;
    this.totalHealth = 400;
    this.xp = 10;
    this.xpDropChance = 1;

    this.setTint(0xffa500);
    this.setScale(1.5);
  }
}

