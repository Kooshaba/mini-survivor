import { Game } from "..";
import { Enemy } from "./Enemy";

export class StrongBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "efreet");
    this.baseSpeed = 50;
    this.speed = 50;
    this.health = 500;
    this.totalHealth = 500;
    this.xp = 10;
    this.xpDropChance = 1;

    this.setScale(3);
  }
}

