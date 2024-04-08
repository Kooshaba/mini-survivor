import { EventBus } from "../../../EventBus";
import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { Weapon } from "../weapons/Weapon";

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  experience = 0;
  level = 1;
  xpToNextLevel = 6;

  moveSpeed = 200;
  pickupRadius = 100;

  healthBar: Phaser.GameObjects.Graphics | undefined;
  health: number = 100;
  totalHealth: number = 100;
  immune: boolean = false;

  possibleUpgrades = [
    this.moveSpeedUpgrade(),
    this.pickupUpgrade(),
    this.maxHealthUpgrade(),
  ];

  weapons: Weapon[] = [];

  lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "wizard-idle");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("wizard-idle");
    this.body.setCircle(10);
    this.setDepth(RenderDepth.PLAYER);

    this.drawHealthBar();
  }

  onReceiveXp(amount: number) {
    this.experience += amount;
    if (this.experience >= this.xpToNextLevel) {
      this.levelUp();
      this.drawHealthBar();
    }

    const graphics = this.scene.add.graphics();
    const circle = new Phaser.Geom.Circle(this.x, this.y, 1);

    const endRadius = 40;
    this.scene.tweens.add({
      targets: circle,
      radius: endRadius,
      duration: 300,
      onUpdate: (tween) => {
        const progress = tween.progress;

        circle.setTo(this.x, this.y, progress * endRadius);

        graphics.clear();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircleShape(circle);
        graphics.setAlpha(1 - progress);
      },
      onComplete: () => {
        graphics.destroy();
      },
    });
  }

  takeDamage(damage: number) {
    if (this.immune) return;

    this.health -= damage;
    this.immune = true;
    this.scene.time.delayedCall(1000, () => {
      this.immune = false;
    });
    this.drawHealthBar();

    this.scene.cameras.main.shake(50, 0.01);

    this.scene.tweens.add({
      targets: this,
      tint: 0xff0000,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.setTint(0xffffff);
      },
    });

    if (this.health <= 0) {
      this.scene.scene.start("MainMenu");
    }
  }

  levelUp() {
    this.level++;
    this.experience = 0;
    this.xpToNextLevel = this.level * 5 + Math.ceil(Math.log2(this.level) * 3);

    this.scene.scene.pause();

    const possibleUpgrades = this.weapons.map((w) => w.possibleUpgrades).flat();
    possibleUpgrades.push(...this.possibleUpgrades);
    const upgradeChoices = Phaser.Math.RND.shuffle(possibleUpgrades).slice(
      0,
      3
    );

    EventBus.emit("player-level-up", {
      upgrades: upgradeChoices,
    });
  }

  drawHealthBar() {
    this.healthBar?.destroy();
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(24, 24, 160 * (this.health / this.totalHealth), 16);
    this.healthBar.setDepth(RenderDepth.UI);
    this.healthBar.setScrollFactor(0);
  }

  update(): void {
    this.move();
  }

  move() {
    if (!this.scene.input.keyboard) return;

    // Move the player left or right
    if (this.scene.input.keyboard.addKey("A").isDown) {
      this.body.setVelocityX(-1 * this.moveSpeed);
      this.setFlipX(true);
    } else if (this.scene.input.keyboard.addKey("D").isDown) {
      this.body.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
    } else {
      this.body.setVelocityX(0);
    }

    // Move the player up or down
    if (this.scene.input.keyboard.addKey("W").isDown) {
      this.body.setVelocityY(-1 * this.moveSpeed);
    } else if (this.scene.input.keyboard.addKey("S").isDown) {
      this.body.setVelocityY(this.moveSpeed);
    } else {
      this.body.setVelocityY(0);
    }

    if (this.body.velocity.length() > 0) {
      this.lastDirection = this.body.velocity.clone().normalize();
    }
  }

  moveSpeedUpgrade() {
    return {
      name: "Player: Move Speed",
      description: "Increases the player's move speed",
      execute: () => {
        this.moveSpeed += 15;
      },
    };
  }

  pickupUpgrade() {
    return {
      name: "Player: Pickup Radius",
      description: "Increases the player's pickup radius",
      execute: () => {
        this.pickupRadius += 10;
      },
    };
  }

  maxHealthUpgrade() {
    return {
      name: "Player: Max Health",
      description: "Increases the player's max health",
      execute: () => {
        this.totalHealth += 10;
        this.health += 10;
      },
    };
  }
}

