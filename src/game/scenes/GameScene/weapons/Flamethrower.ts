import { Game } from "../GameScene";
import { Enemy } from "../sprites/Enemy";
import { Weapon } from "./Weapon";

export class Flamethrower extends Weapon {
  id = "flamethrower";
  damage = 6;
  fireRate = 3000;
  range = 150;
  burnDuration = 2000;
  knockback = 5;

  constructor(scene: Game) {
    super(scene);
    this.possibleUpgrades = [
      this.damageUpgrade(),
      this.rangeUpgrade(),
      this.fireRateUpgrade(),
      this.burnDurationUpgrade(),
    ];
  }

  fire() {
    this.player.drawXpCircleEffect(this.range, 0xff0000);

    const enemiesInRange = this.scene.enemies.getChildren().filter((e) => {
      const enemy = e as Enemy;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= this.range;
    });

    enemiesInRange.forEach((enemy) => {
      (enemy as Enemy).takeDamage(this, this.damage, this.getCenter(), this.knockback);
      this.applyBurnEffect(enemy as Enemy);
    });
  }

  applyBurnEffect(enemy: Enemy) {
    const burnDamage = this.damage / 2;
    const burnInterval = 500;
    const burnTicks = this.burnDuration / burnInterval;

    for (let i = 1; i <= burnTicks; i++) {
      this.scene.time.delayedCall(burnInterval * i, () => {
        if (enemy.health > 0) {
          enemy.takeDamage(this, burnDamage, this.getCenter(), 0);
        }
      });
    }
  }

  damageUpgrade() {
    return {
      name: "Flamethrower: Damage",
      description: "Increases the damage of the flamethrower",
      execute: () => {
        this.damage += 1; // Reduced upgrade impact
      },
    };
  }

  rangeUpgrade() {
    return {
      name: "Flamethrower: Range",
      description: "Increases the range of the flamethrower",
      execute: () => {
        this.range += 25; // Reduced upgrade impact
      },
    };
  }

  fireRateUpgrade() {
    return {
      name: "Flamethrower: Fire Rate",
      description: "Increases the fire rate of the flamethrower",
      execute: () => {
        this.fireRate -= 5; // Reduced upgrade impact
        this.unequip();
        this.equip();
      },
      canAppear: () => this.fireRate > 100, // Adjusted condition
    };
  }

  burnDurationUpgrade() {
    return {
      name: "Flamethrower: Burn Duration",
      description: "Increases the burn duration of the flamethrower",
      execute: () => {
        this.burnDuration += 500; // Reduced upgrade impact
      },
    };
  }
}

