import { Game } from "..";
import { Enemy } from "./Enemy";

export class HugeBoy extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "pit fiend");
    this.baseSpeed = 50;
    this.speed = 50;
    this.health = 400;
    this.totalHealth = 400;
    this.xp = 100;
    this.damage = 10;
    this.xpDropChance = 1;

    this.setScale(6);
  }
}

