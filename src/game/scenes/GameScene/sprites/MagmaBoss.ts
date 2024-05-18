import { Game } from "..";
import { Enemy } from "./Enemy";

export class MagmaBoss extends Enemy {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "magma elemental");
    this.baseSpeed = 80;
    this.speed = 80;
    this.health = 4_000;
    this.totalHealth = 4_000;
    this.xp = 1_000;
    this.damage = 50;
    this.xpDropChance = 1;

    this.setScale(12);
  }
}

