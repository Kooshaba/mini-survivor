import { Game } from "../GameScene";
import { Enemy } from "../sprites/Enemy";

export type Upgrade = {
  name: string;
  description: string;
  execute: () => void;
  canAppear?: () => boolean;
};

export class Weapon extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  id = "";
  damage: number = 1;
  timer: Phaser.Time.TimerEvent;
  fireRate: number = 1000;
  knockback: number = 0;

  totalDamageDealt = 0;
  timeEquipped = 0;

  possibleUpgrades: Upgrade[] = [];

  constructor(scene: Game) {
    super(scene, 0, 0, "");
  }

  equip() {
    this.timer = this.scene.time.addEvent({
      delay: this.fireRate,
      callback: this.fire,
      callbackScope: this,
      loop: true,
    });

    this.scene.player.weapons.push(this);
  }

  unequip() {
    this.timer.remove();
    this.scene.player.weapons = this.scene.player.weapons.filter(
      (w) => w.id !== this.id
    );
  }

  fire() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time: number, _delta: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProjectileHit(_p: Phaser.GameObjects.Sprite, _enemy: Enemy) {}
}

