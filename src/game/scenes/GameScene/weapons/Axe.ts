import { Game } from "..";
import { Enemy } from "../sprites/Enemy";
import { RenderDepth } from "../types";
import { Weapon } from "./Weapon";

export class Axe extends Weapon {
  id = "axe";
  weaponRotation = 0;
  rotationSpeed = 0.015;
  knockback = 0;
  dmgDelay = 250;
  damage = 5;

  axes: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(scene: Game) {
    super(scene);

    this.possibleUpgrades = [];
    this.possibleUpgrades = [this.damageUpgrade(), this.additionAxeUpgrade()];

    this.createProjectile();
  }

  createProjectile() {
    const axe = this.scene.physics.add.sprite(
      this.scene.player.x,
      this.scene.player.y,
      "axe"
    );

    axe.setScale(2);
    axe.setDepth(RenderDepth.PROJECTILE);
    axe.body.setCircle(8);
    axe.body.setOffset(0, 6);
    axe.setData("hitEnemies", []);
    axe.setData("fromWeapon", this);
    this.axes.push(axe);
    this.scene.projectiles.add(axe);
  }

  update(_time: number, delta: number) {
    this.weaponRotation += (this.rotationSpeed * delta) / 16;

    const angle = this.weaponRotation;
    for (let i = 0; i < this.axes.length; i++) {
      const axe = this.axes[i];
      const offset = i * ((Math.PI * 2) / 3);
      axe.setRotation(angle + offset + Math.PI / 2);
      axe.setPosition(
        this.scene.player.x + Math.cos(angle + offset) * 120,
        this.scene.player.y + Math.sin(angle + offset) * 120
      );
    }
  }

  onProjectileHit(p: Phaser.Physics.Arcade.Sprite, enemy: Enemy) {
    const hitEnemies = p.getData("hitEnemies") as Enemy[];

    if (hitEnemies.find((e) => e === enemy.getData("id"))) return;

    hitEnemies.push(enemy.getData("id"));
    p.setData("hitEnemies", hitEnemies);
    this.scene.time.delayedCall(1_000, () => {
      const hitEnemies = p.getData("hitEnemies") as Enemy[];
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
      name: "Axe: Damage",
      description: "Increase damage by 5",
      execute: () => {
        this.damage += 1;
      },
    };
  }

  additionAxeUpgrade() {
    return {
      name: "Axe: Additional Axe",
      description: "Add an additional axe",
      execute: () => {
        this.createProjectile();
      },
      canAppear: () => this.axes.length < 3,
    };
  }

  rotationSpeedUpgrade() {
    return {
      name: "Axe: Rotation Speed",
      description: "Increase rotation speed by 0.005",
      execute: () => {
        this.rotationSpeed += 0.005;
      },
    };
  }
}

