import { Game } from "..";
import { Enemy } from "./Enemy";

export class FastBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "hell hound");
    this.baseSpeed = 100;
    this.speed = 100;
    this.baseTint = 0x00ff00;
    this.health = 75;
    this.totalHealth = 75;
    this.xp = 10;
    this.xpDropChance = 1;
  }
}

