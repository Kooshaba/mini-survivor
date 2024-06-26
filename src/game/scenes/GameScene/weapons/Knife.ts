import { Game } from "..";
import { createTrailPainter } from "../createTrailPainter";
import { Enemy } from "../sprites/Enemy";
import { Weapon } from "./Weapon";

export class Knife extends Weapon {
  id = "knife";
  damage = 10;
  fireRate = 1_000;
  count = 2;
  speed = 600;
  pierce = 1;
  knockback = 0;

  constructor(scene: Game) {
    super(scene);

    this.possibleUpgrades = [
      this.damageUpgrade(),
      this.countUpgrade(),
      this.fireRateUpgrade(),
      this.pierceUpgrade(),
    ];
  }

  fire() {
    const baseDirection = this.scene.player.lastDirection.clone().normalize();
    const baseAngle =
      Phaser.Math.Angle.Between(
        this.scene.player.x,
        this.scene.player.y,
        this.scene.player.x + baseDirection.x,
        this.scene.player.y + baseDirection.y
      ) -
      ((this.count - 1) * (Math.PI / 100)) / 2;

    for (let i = 0; i < this.count; i++) {
      this.createProjectile(baseAngle, i);
      this.scene.time.delayedCall(100, () => {
        this.createProjectile(baseAngle, i);
      });
    }
  }

  createProjectile(baseAngle: number, index: number) {
    const knife = this.scene.physics.add.sprite(
      this.scene.player.x,
      this.scene.player.y,
      "knife"
    );
    knife.body.setCircle(5);
    knife.body.setOffset(0, 8);
    knife.setData("damage", this.damage);
    knife.setData("pierce", this.pierce);
    knife.setData("fromWeapon", this);
    knife.setData("alreadyHit", []);

    const trailPainter = createTrailPainter(knife);
    knife.update = trailPainter.onUpdate;

    const angle = baseAngle + index * (Math.PI / 100);
    knife.setRotation(angle + Math.PI / 2);
    const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
    knife.setVelocity(direction.x * this.speed, direction.y * this.speed);

    this.scene.time.delayedCall(5000, () => {
      knife.destroy();
    });
    this.scene.projectiles.add(knife);
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
      name: "Knife: Damage",
      description: "Increases the damage of the knife",
      execute: () => {
        this.damage += 1;
      },
    };
  }

  countUpgrade() {
    return {
      name: "Knife: Count",
      description: "Increases the number of knives thrown",
      execute: () => {
        this.count += 1;
      },
      canAppear: () => this.count < 6,
    };
  }

  fireRateUpgrade() {
    return {
      name: "Knife: Fire Rate",
      description: "Increases the fire rate of the knives",
      execute: () => {
        this.fireRate -= 50;
        this.unequip();
        this.equip();
      },
      canAppear: () => this.fireRate > 200,
    };
  }

  pierceUpgrade() {
    return {
      name: "Knife: Pierce",
      description: "Increases the number of enemies the knife can pierce",
      execute: () => {
        this.pierce += 1;
      },
      canAppear: () => this.pierce < 5,
    };
  }
}

