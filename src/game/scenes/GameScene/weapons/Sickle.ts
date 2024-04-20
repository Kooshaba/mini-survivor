import { Game } from "..";
import { Enemy } from "../sprites/Enemy";
import { RenderDepth } from "../types";
import { Weapon } from "./Weapon";

export class Sickle extends Weapon {
  knockback = 15;
  fireRate = 2_000;

  constructor(scene: Game) {
    super(scene);
    this.damage = 18;
    this.possibleUpgrades = [];

    this.id = "sickle";
    this.possibleUpgrades = [
      this.knockbackUpgrade(),
      this.damageUpgrade(),
      this.fireRateUpgrade(),
    ];

    this.createProjectile();
  }

  createProjectile() {
    const player = this.scene.player;
    const sickle = this.scene.physics.add.sprite(
      this.scene.player.x,
      this.scene.player.y,
      "sickle"
    );

    sickle.setCircle(10);
    sickle.setScale(3, 0);
    sickle.body.setOffset(0.5);
    sickle.setDepth(RenderDepth.PROJECTILE);
    sickle.setData("hitEnemies", []);
    sickle.setData("fromWeapon", this);
    sickle.setPosition(player.x, player.y - 40);
    this.scene.projectiles.add(sickle);

    this.scene.add.tween({
      targets: sickle,
      scaleY: 3,
      duration: 150,
    });

    const updateSickleLocation = () => {
      sickle.setPosition(
        this.scene.player.x + Math.cos(sickle.rotation - Math.PI / 2) * 80 + 16,
        this.scene.player.y + Math.sin(sickle.rotation - Math.PI / 2) * 80
      );
    };
    const shouldFlip = this.scene.player.lastDirection.x < 0;
    if (shouldFlip) {
      sickle.flipX = true;
    }
    const flip = shouldFlip ? -1 : 1;
    const startRotation = ((-1 * Math.PI) / 2) * flip;
    sickle.setRotation(startRotation);
    this.scene.add.tweenchain({
      targets: sickle,
      tweens: [
        {
          targets: sickle,
          rotation: startRotation - 0.4 * flip,
          duration: 300,
          ease: "Power1",
          onUpdate: updateSickleLocation,
        },
        {
          targets: sickle,
          rotation: startRotation + (Math.PI + 0.4) * flip,
          duration: 200,
          ease: "Power1",
          onUpdate: updateSickleLocation,
        },
        {
          targets: sickle,
          scaleY: 0,
          rotation: startRotation + (Math.PI + 0.7) * flip,
          duration: 100,
          onUpdate: updateSickleLocation,
          onComplete: () => {
            sickle.destroy();
          },
        },
      ],
    });

    this.scene.time.delayedCall(this.fireRate, () => {
      this.createProjectile();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time: number, _delta: number) {}

  onProjectileHit(p: Phaser.Physics.Arcade.Sprite, enemy: Enemy) {
    const hitEnemies = p.getData("hitEnemies") as Enemy[];

    if (hitEnemies.find((e) => e === enemy.getData("id"))) return;

    hitEnemies.push(enemy.getData("id"));
    p.setData("hitEnemies", hitEnemies);
    this.scene.time.delayedCall(500, () => {
      const hitEnemies = p.getData("hitEnemies") as Enemy[];
      if (!hitEnemies) return;
      const index = hitEnemies.findIndex((e) => e === enemy.getData("id"));
      hitEnemies.splice(index, 1);
      p.setData("hitEnemies", hitEnemies);
    });

    enemy.takeDamage(
      this,
      this.damage,
      this.scene.player.getCenter(),
      this.knockback
    );
  }

  damageUpgrade() {
    return {
      name: "Sickle: Damage",
      description: "Increase damage by 5",
      execute: () => {
        this.damage += 3;
      },
    };
  }

  fireRateUpgrade() {
    return {
      name: "Sickle: Fire Rate",
      description: "Increase fire rate by 10%",
      execute: () => {
        this.fireRate -= 100;
      },
    };
  }

  knockbackUpgrade() {
    return {
      name: "Sickle: Knockback",
      description: "Increase knockback by 5",
      execute: () => {
        this.knockback += 5;
      },
    };
  }
}

