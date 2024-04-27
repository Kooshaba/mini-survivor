import { Game } from "../GameScene";
import { Enemy } from "../sprites/Enemy";
import { RenderDepth } from "../types";
import { Weapon } from "./Weapon";

export class Bow extends Weapon {
  id = "bow";
  weaponRotation = 0;
  targetAngle = 0;
  rotationSpeed = 0.08;
  closestEnemy: Enemy | null = null;
  minRange = 600;
  fireRate = 1_500;
  damage = 80;
  knockback = 0;
  pierce = 3;

  lastFiredAt = 0;

  constructor(scene: Game) {
    super(scene);
    this.setTexture("bow");
    this.setDepth(RenderDepth.PROJECTILE);
    this.setPosition(this.scene.player.x + 40, this.scene.player.y);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setDirectControl(true);

    this.possibleUpgrades = [this.fireRateUpgrade(), this.damageUpgrade()];
  }

  fire() {
    if (this.closestEnemy === null) return;
    this.createProjectile();
    this.lastFiredAt = this.scene.time.now;
  }

  createProjectile() {
    const arrow = this.scene.physics.add.sprite(this.x, this.y, "arrow");
    arrow.setDepth(RenderDepth.PROJECTILE);

    const firingAngle =
      this.rotation + Phaser.Math.RND.realInRange(-0.05, 0.05);
    arrow.setRotation(firingAngle);
    arrow.setVelocityX(Math.cos(firingAngle) * 600);
    arrow.setVelocityY(Math.sin(firingAngle) * 600);

    arrow.setScale(1.4);
    arrow.body.setCircle(8);
    arrow.body.setOffset(0, 6);
    arrow.setData("hitEnemies", []);
    arrow.setData("fromWeapon", this);

    this.scene.time.delayedCall(5_000, () => arrow.destroy());

    this.scene.projectiles.add(arrow);
  }

  onProjectileHit(p: Phaser.GameObjects.Sprite, enemy: Enemy): void {
    const hitEnemies = p.getData("hitEnemies") as Enemy[];

    if (hitEnemies.find((e) => e === enemy.getData("id"))) return;
    hitEnemies.push(enemy.getData("id"));
    enemy.takeDamage(this, this.damage, p.getCenter(), this.knockback);

    if (hitEnemies.length >= this.pierce) {
      p.destroy();
    }
  }

  update(time: number, delta: number) {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Number.MAX_VALUE;

    this.scene.enemies.getChildren().forEach((e) => {
      const enemy = e as Enemy;
      const distance = Phaser.Math.Distance.BetweenPoints(
        this.scene.player,
        enemy
      );
      if (distance < this.minRange && distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.targetAngle = Phaser.Math.Angle.BetweenPoints(
        this.scene.player,
        closestEnemy
      );
      this.closestEnemy = closestEnemy;
    } else {
      this.closestEnemy = null;
    }

    const angle = Phaser.Math.Angle.RotateTo(
      this.rotation,
      this.targetAngle,
      (this.rotationSpeed * delta) / 16
    );
    this.setRotation(angle);

    const timeSinceLastFire = this.scene.time.now - this.lastFiredAt;
    let bowRecoilOffset = 0;
    if (timeSinceLastFire >= 150) {
      bowRecoilOffset = 0;
    } else {
      const progress = timeSinceLastFire / 150;
      const easedProgress = Phaser.Math.Easing.Bounce.InOut(progress);
      bowRecoilOffset = 10 - Math.min(easedProgress * 10, 10);
    }

    this.setPosition(
      this.scene.player.x + Math.cos(angle) * (20 - bowRecoilOffset),
      this.scene.player.y + Math.sin(angle) * (20 - bowRecoilOffset)
    );
  }

  fireRateUpgrade() {
    return {
      name: "Bow: Fire Rate",
      description: "Increases the fire rate of the bow",
      execute: () => {
        this.fireRate -= 100;
        this.unequip();
        this.equip();
      },
    };
  }

  damageUpgrade() {
    return {
      name: "Bow: Damage",
      description: "Increases the damage of the bow",
      execute: () => {
        this.damage += 8;
      },
    };
  }
}

