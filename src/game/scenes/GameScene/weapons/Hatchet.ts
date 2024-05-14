import { Game } from "..";
import { Enemy } from "../sprites/Enemy";
import { Weapon } from "./Weapon";

export class Hatchet extends Weapon {
  id = "hatchet";
  damage = 8;
  fireRate = 2_500;
  speed = 500;
  knockback = 5;

  constructor(scene: Game) {
    super(scene);

    this.possibleUpgrades = [this.damageUpgrade(), this.fireRateUpgrade()];
  }

  fire() {
    if (!this.player.closestEnemy) return;

    const baseAngle = Phaser.Math.Angle.BetweenPoints(
      this.player,
      this.player.closestEnemy
    );

    this.createProjectile(baseAngle);
  }

  createProjectile(angle: number) {
    const hatchet = this.scene.physics.add.sprite(
      this.scene.player.x,
      this.scene.player.y,
      "hatchet"
    );
    hatchet.setScale(2);
    hatchet.body.setCircle(10);
    hatchet.body.setOffset(0, 8);
    hatchet.setData("damage", this.damage);
    hatchet.setData("fromWeapon", this);
    hatchet.setData("alreadyHit", []);

    // let accelerateTowardsPlayer = true;
    // this.scene.time.delayedCall(100, () => (accelerateTowardsPlayer = false));
    // hatchet.update = () => {
    //   if (!accelerateTowardsPlayer) return;

    //   const angleToPlayer = Phaser.Math.Angle.BetweenPoints(
    //     this.player,
    //     hatchet
    //   );
    //   const direction = new Phaser.Math.Vector2(
    //     Math.cos(angleToPlayer),
    //     Math.sin(angleToPlayer)
    //   );

    //   hatchet.setAcceleration(
    //     direction.x * this.speed * -1,
    //     direction.y * this.speed * -1
    //   );
    // };

    hatchet.setRotation(angle + Math.PI / 2);
    const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
    hatchet.setVelocity(direction.x * this.speed, direction.y * this.speed);
    hatchet.setAcceleration(
      direction.x * this.speed * -1,
      direction.y * this.speed * -1
    );
    hatchet.setAngularAcceleration(360);

    this.scene.time.delayedCall(5_000, () => {
      hatchet.destroy();
    });
    this.scene.projectiles.add(hatchet);
  }

  onProjectileHit(projectile: Phaser.GameObjects.Sprite, enemy: Enemy) {
    (enemy as Enemy).takeDamage(
      this,
      projectile.getData("damage"),
      projectile.getCenter(),
      this.knockback
    );

    const alreadyHitArray = projectile.getData("alreadyHit") || [];
    const enemyId = enemy.getData("id");
    alreadyHitArray.push(enemyId);
    projectile.setData("alreadyHit", alreadyHitArray);

    this.scene.time.delayedCall(150, () => {
      const alreadyHitArray =
        (projectile.getData("alreadyHit") as string[]) || [];
      projectile.setData(
        "alreadyHit",
        alreadyHitArray.filter((id) => id !== enemyId)
      );
    });
  }

  damageUpgrade() {
    return {
      name: "Hatchet: Damage",
      description: "Increase damage by 5",
      execute: () => {
        this.damage += 2;
      },
    };
  }

  fireRateUpgrade() {
    return {
      name: "Hatchet: Fire Rate",
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

