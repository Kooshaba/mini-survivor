import { Game } from "..";
import { createTrailPainter } from "../createTrailPainter";
import { Enemy } from "../sprites/Enemy";
import { Weapon } from "./Weapon";

export class Shield extends Weapon {
  id = "shield";
  damage = 15;
  fireRate = 2_500;
  speed = 150;
  knockback = 45;
  pierce = 10;

  constructor(scene: Game) {
    super(scene);

    this.possibleUpgrades = [this.damageUpgrade(), this.fireRateUpgrade()];
  }

  fire() {
    if (!this.player.closestEnemy) return;

    this.createProjectile(0, this.player.getBottomCenter().y);
    this.createProjectile(Math.PI, this.player.getBottomCenter().y);
  }

  createProjectile(angle: number, bounceY: number) {
    const shield = this.scene.physics.add.sprite(
      this.scene.player.x,
      this.scene.player.y,
      "shield"
    );
    shield.setScale(2);
    shield.setData("damage", this.damage);
    shield.setData("fromWeapon", this);
    shield.setData("alreadyHit", []);
    shield.setData("pierce", this.pierce);

    const trailPainter = createTrailPainter(shield);
    shield.update = () => {
      trailPainter.onUpdate();
      if (shield.getBottomCenter().y >= bounceY) {
        shield.setVelocityY(-300);
        shield.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => shield.clearTint());
      }
    };

    const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
    shield.setVelocity(direction.x * this.speed, -300);
    shield.setAccelerationY(800);

    this.scene.time.delayedCall(5_000, () => {
      shield.destroy();
    });
    this.scene.projectiles.add(shield);
  }

  onProjectileHit(projectile: Phaser.GameObjects.Sprite, enemy: Enemy) {
    (enemy as Enemy).takeDamage(
      this,
      projectile.getData("damage"),
      projectile.getCenter(),
      this.knockback
    );
    const pierce = projectile.getData("pierce");
    if (pierce > 0) {
      projectile.setData("pierce", pierce - 1);

      const alreadyHitArray = projectile.getData("alreadyHit") || [];
      alreadyHitArray.push(enemy.getData("id"));
      projectile.setData("alreadyHit", alreadyHitArray);
    } else {
      projectile.destroy();
    }
  }

  damageUpgrade() {
    return {
      name: "Shield: Damage",
      description: "Increase damage by 5",
      execute: () => {
        this.damage += 2;
      },
    };
  }

  fireRateUpgrade() {
    return {
      name: "Shield: Fire Rate",
      description: "Increase damage by 5",
      execute: () => {
        this.fireRate -= 150;
        this.unequip();
        this.equip();
      },
      canAppear: () => {
        return this.fireRate > 200;
      },
    };
  }
}

