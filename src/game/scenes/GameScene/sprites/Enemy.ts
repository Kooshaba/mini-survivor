import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { ExperienceOrb } from "./ExperienceOrb";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  speed = 100;
  baseSpeed = 100;
  health: number = 20;
  totalHealth: number = 20;
  baseTint: number = 0xffffff;
  xp: number = 3;
  damage: number = 5;

  healthBar: Phaser.GameObjects.Graphics;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "skeleton-idle");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("skeleton-idle");
    this.body.setCircle(10);
    this.setData("id", this.generateId());
    this.setDepth(RenderDepth.ENEMY);
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  takeDamage(damage: number) {
    this.speed = 20;
    this.scene.tweens.add({
      targets: this,
      speed: this.baseSpeed,
      duration: 1500,
    });

    const damageText = this.scene.add
      .text(this.x, this.y, `${damage}`, {
        fontSize: "10px",
        color: "#ffffff",
      })
      .setShadow(1, 1, "#000000", 1, true, true)
      .setDepth(RenderDepth.UI);

    this.scene.tweens.add({
      targets: damageText,
      y: this.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        damageText.destroy();
      },
    });

    this.health -= damage;
    this.scene.tweens.add({
      targets: this,
      tint: 0xff0000,
      duration: 100,
      onComplete: () => {
        this.setTint(this.baseTint);
        if (this.health <= 0) {
          this.onDeath();
        }
      },
    });
  }

  onDeath() {
    if (!this.scene) return;

    const circle = new Phaser.Geom.Circle(this.x, this.y, 20);
    const points = circle.getPoints(this.xp);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      const orb = new ExperienceOrb(this.scene, point.x, point.y);
      orb.setAlpha(0);
      orb.setScale(0);
      this.scene.tweens.add({
        targets: orb,
        alpha: 1,
        scale: 0.6,
        duration: 150,
      });
    }

    this.healthBar?.destroy();
    this.destroy();
  }

  drawHealthBar() {
    this.healthBar?.destroy();
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(
      this.x - 12,
      this.y - 20,
      24 * (this.health / this.totalHealth),
      5
    );
    this.healthBar.setDepth(RenderDepth.UI);
  }

  update() {
    this.scene.physics.moveToObject(this, this.scene.player, this.speed);
    if (this.scene.player.x < this.x) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    if (this.totalHealth > 50) {
      this.drawHealthBar();
    }
  }
}

