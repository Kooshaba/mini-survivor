import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { ExperienceOrb } from "./ExperienceOrb";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  speed = 100;
  baseSpeed = 100;
  health: number = 25;
  totalHealth: number = 25;
  baseTint: number = 0xffffff;
  xp: number = 3;
  damage: number = 5;

  healthBar: Phaser.GameObjects.Graphics;

  glowSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "skeleton-idle");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("skeleton-idle");
    this.body.setCircle(10);
    this.setData("id", this.generateId());
    this.setDepth(RenderDepth.ENEMY);
    this.body.setOffset(6, 10);
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  takeDamage(
    damage: number,
    originPosition: Phaser.Math.Vector2,
    knockback: number
  ) {
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
    if (this.health <= 0) {
      this.health = 0;
    }

    if (!this.glowSprite) {
      if (knockback > 0) {
        this.setDirectControl(true);
        const knockbackAngle = Phaser.Math.Angle.BetweenPoints(
          originPosition,
          this
        );
        this.scene.tweens.add({
          targets: this,
          duration: 150,
          x: this.x + Math.cos(knockbackAngle) * knockback,
          y: this.y + Math.sin(knockbackAngle) * knockback,
          onComplete: () => {
            if (this) {
              this.setDirectControl(false);
            }
          },
        });
      }

      this.glowSprite = this.scene.add.sprite(this.x, this.y, "");
      const currentAnim = this.anims.currentAnim;
      if (currentAnim) {
        this.glowSprite.play(currentAnim.key);
        this.glowSprite.anims.setCurrentFrame(currentAnim.frames[0]);
        this.glowSprite.stop();
        this.glowSprite.setTintFill(0xffffff);
        this.glowSprite.setScale(this.scale * 0.9);
        this.glowSprite.setAlpha(1);
        this.glowSprite.setDepth(RenderDepth.PROJECTILE);
        this.glowSprite.setOrigin(this.originX, this.originY);
        this.glowSprite.flipX = this.flipX;
        this.scene.add.tween({
          targets: this.glowSprite,
          alpha: 0,
          duration: 75,
          yoyo: true,
          repeat: 1,
          onUpdate: () => {
            this.glowSprite?.setPosition(this.x, this.y);
          },
          onComplete: () => {
            this.glowSprite?.destroy();
            this.glowSprite = null;
            if (this.health <= 0) {
              this.onDeath();
            }
          },
        });
      }
    }
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

