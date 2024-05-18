import { Game } from "../GameScene";
import { createTrailPainter } from "../createTrailPainter";
import { RenderDepth } from "../types";
import { Axe } from "../weapons/Axe";
import { Bow } from "../weapons/Bow";
import { Flamethrower } from "../weapons/Flamethrower";
import { Hatchet } from "../weapons/Hatchet";
import { Knife } from "../weapons/Knife";
import { Shield } from "../weapons/Shield";
import { Sickle } from "../weapons/Sickle";
import { Upgrade, Weapon } from "../weapons/Weapon";
import { Enemy } from "./Enemy";

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  experience = 0;
  level = 1;
  xpToNextLevel = 6;
  xpBonus = 0;

  moveSpeed = 180;
  pickupRadius = 100;

  healthBar: Phaser.GameObjects.Graphics | undefined;
  healthBarText: Phaser.GameObjects.BitmapText | undefined;

  dead: boolean;
  health: number = 100;
  totalHealth: number = 100;
  immune: boolean = false;

  killCount = 0;

  closestEnemy: Enemy | undefined;

  trailPainter: ReturnType<typeof createTrailPainter>;

  queuedLevelUps: {
    upgradeChoices: Upgrade[];
    timeAcquired: number;
  }[] = [];

  possibleUpgrades = [
    this.moveSpeedUpgrade(),
    this.pickupUpgrade(),
    this.maxHealthUpgrade(),
    this.xpBonusUpgrade(),
    this.equipAxe(),
    this.equipBow(),
    this.equipKnife(),
    this.equipSickle(),
    this.equipHatchet(),
    this.equipShield(),
    // this.equipFlamethrower(),
  ];

  weapons: Weapon[] = [];

  lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("hunter-idle");
    this.setScale(2);
    this.body.setCircle(5);
    this.body.setOffset(2, 4);
    this.body.setDirectControl(true);
    this.setDepth(RenderDepth.PLAYER);

    this.drawHealthBar();

    this.scene.time.addEvent({
      delay: 5_000,
      loop: true,
      callback: () => {
        this.weapons.forEach((w) => {
          console.log(w.id);
          console.log(`Total Damage: ${w.totalDamageDealt}`);
          console.log(`Time Equipped: ${w.timeEquipped}`);
          console.log(`DPS ${w.totalDamageDealt / (w.timeEquipped / 1000)}`);
        });
      },
    });

    this.trailPainter = createTrailPainter(this);
  }

  initialUpgrades() {
    return [
      this.equipAxe(),
      this.equipBow(),
      this.equipKnife(),
      this.equipSickle(),
      this.equipHatchet(),
      this.equipShield(),
    ];
  }

  onReceiveXp(amount: number) {
    amount += amount * (1 + this.xpBonus);

    this.experience += amount;
    while (this.experience >= this.xpToNextLevel) {
      this.levelUp();
      this.drawHealthBar();
    }

    const effectRadius = Math.min(10 + amount * 3, 60);
    this.drawXpCircleEffect(effectRadius, 0x00ff00);
    this.scene.drawExperienceBar();
  }

  heal(amount: number) {
    this.health = Math.min(this.health + amount, this.totalHealth);
    this.drawHealthBar();

    this.drawXpCircleEffect(100, 0xffc0cb); // pink color
  }

  takeDamage(damage: number) {
    if (this.immune) return;

    this.health -= damage;
    this.immune = true;
    this.drawHealthBar();

    this.scene.cameras.main.shake(100, 0.01);

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
      this.immune = true;
      this.dead = true;
      this.trailPainter.destroy();
      this.play("hunter-death");
      this.on("animationcomplete", () => {
        this.scene.scene.pause("Game");
        this.scene.scene.launch("SummaryScene", {
          player: this,
          gameOver: true,
        });
      });
    } else {
      this.scene.time.delayedCall(300, () => {
        this.immune = false;
      });
    }
  }

  levelUp() {
    this.level++;
    this.experience -= this.xpToNextLevel;
    this.xpToNextLevel = this.level * 20 + Math.ceil(Math.log2(this.level) * 3);

    this.drawXpCircleEffect(300, 0xffffff);
    // Knockback nearby enemies
    this.scene.enemies.getChildren().forEach((_enemy) => {
      const enemy = _enemy as Enemy;
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y
      );
      if (distance <= 300) {
        enemy.knockback(50, this.getCenter());
      }
    });

    let possibleUpgrades = this.weapons.map((w) => w.possibleUpgrades).flat();
    possibleUpgrades.push(...this.possibleUpgrades);
    possibleUpgrades = possibleUpgrades.filter((u) =>
      u.canAppear ? u.canAppear() : true
    );
    const upgradeChoices = Phaser.Math.RND.shuffle(possibleUpgrades).slice(
      0,
      3
    );

    this.queuedLevelUps.push({
      upgradeChoices,
      timeAcquired: this.scene.time.now,
    });
  }

  drawXpCircleEffect(endRadius: number, color: number) {
    const graphics = this.scene.add.graphics();
    const circle = new Phaser.Geom.Circle(this.x, this.y, 1);

    this.scene.tweens.add({
      targets: circle,
      radius: endRadius,
      duration: 300,
      onUpdate: (tween) => {
        const progress = tween.progress;

        circle.setTo(this.x, this.y, progress * endRadius);

        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillCircleShape(circle);
        graphics.setAlpha(1 - progress);
      },
      onComplete: () => {
        graphics.destroy();
      },
    });
  }

  async checkLevelUps() {
    const lastLevelUp = this.queuedLevelUps[this.queuedLevelUps.length - 1];
    if (!lastLevelUp) return;

    if (lastLevelUp.timeAcquired + 500 < this.scene.time.now) {
      this.scene.scene.pause("Game");

      for (const levelUp of this.queuedLevelUps) {
        const promise = new Promise<void>((resolve) => {
          this.scene.scene.launch("UpgradeScene", {
            upgradeChoices: levelUp.upgradeChoices,
            player: this,
            onFinish: () => resolve(),
          });
        });

        await promise;
      }

      this.queuedLevelUps = [];
      this.scene.scene.resume("Game");
    }
  }

  drawHealthBar() {
    this.healthBar?.destroy();
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(24, 24, 160 * (this.health / this.totalHealth), 16);
    this.healthBar.setDepth(RenderDepth.UI);
    this.healthBar.setScrollFactor(0);

    if (!this.healthBarText) {
      this.healthBarText = this.scene.add.dynamicBitmapText(
        24 + 80,
        29,
        "satoshi-14",
        `${this.health}/${this.totalHealth}`
      );
      this.healthBarText.setScrollFactor(0);
      this.healthBarText.setDepth(RenderDepth.UI + 2);
      this.healthBarText.setOrigin(0.5, 0.5);
    }

    if (!this.scene.tweens.isTweening(this.healthBarText)) {
      this.scene.tweens.add({
        targets: this.healthBarText,
        y: "-=3",
        duration: 50,
        yoyo: true,
        repeat: 1,
      });
    }
    this.healthBarText.setText(`${this.health}/${this.totalHealth}`);
  }

  findClosestEnemy() {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Number.MAX_VALUE;

    this.scene.enemies.getChildren().forEach((e) => {
      const enemy = e as Enemy;
      const distance = Phaser.Math.Distance.BetweenPoints(
        this.scene.player,
        enemy
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.closestEnemy = closestEnemy;
    } else {
      this.closestEnemy = undefined;
    }
  }

  update(time: number, delta: number): void {
    if (this.dead) return;

    this.move(delta);
    this.weapons.map((w) => {
      w.update(time, delta);
      w.timeEquipped += delta;
    });
    this.checkLevelUps();
    this.trailPainter.onUpdate();
    this.findClosestEnemy();
  }

  move(delta: number) {
    let moveVector = new Phaser.Math.Vector2(0, 0);
    let forceModifier = 1;
    if (this.scene.input.keyboard) {
      // Move the player left or right
      if (this.scene.input.keyboard.addKey("A").isDown) {
        moveVector.set(-1, 0);
        this.setFlipX(true);
      } else if (this.scene.input.keyboard.addKey("D").isDown) {
        moveVector.set(1, 0);
        this.setFlipX(false);
      } else {
        moveVector.set(0, 0);
      }

      // Move the player up or down
      if (this.scene.input.keyboard.addKey("W").isDown) {
        moveVector.set(moveVector.x, -1);
      } else if (this.scene.input.keyboard.addKey("S").isDown) {
        moveVector.set(moveVector.x, 1);
      } else {
        moveVector.set(moveVector.x, 0);
      }
    }

    if (this.scene.joystick) {
      moveVector = new Phaser.Math.Vector2(
        this.scene.joystick.forceX,
        this.scene.joystick.forceY
      );
      forceModifier = Math.min(this.scene.joystick.force, 100) / 100;
    }

    moveVector = moveVector
      .normalize()
      .scale(this.moveSpeed * forceModifier * (delta / 1000));
    this.setPosition(this.x + moveVector.x, this.y + moveVector.y);

    if (moveVector.length() > 0) {
      if (this.anims.currentAnim?.key !== "hunter-walk")
        this.play("hunter-walk");
      this.lastDirection = moveVector.clone().normalize();
    } else {
      if (this.anims.currentAnim?.key !== "hunter-idle")
        this.play("hunter-idle");
    }
  }

  incrementKillCount() {
    this.killCount++;
    this.scene.updateKillCount();
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
        this.scene.player.drawHealthBar();
      },
    };
  }

  xpBonusUpgrade() {
    return {
      name: "Player: XP Bonus",
      description: "Increases the player's XP bonus",
      execute: () => {
        this.xpBonus += 0.05;
      },
    };
  }

  equipBow() {
    return {
      name: "Gain Bow",
      description: "",
      execute: () => {
        new Bow(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "bow") && this.weapons.length < 4
        );
      },
    };
  }

  equipAxe() {
    return {
      name: "Gain Axe",
      description: "",
      execute: () => {
        new Axe(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "axe") && this.weapons.length < 4
        );
      },
    };
  }

  equipSickle() {
    return {
      name: "Gain Sickle",
      description: "",
      execute: () => {
        new Sickle(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "sickle") &&
          this.weapons.length < 4
        );
      },
    };
  }

  equipKnife() {
    return {
      name: "Gain Knife",
      description: "",
      execute: () => {
        new Knife(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "knife") && this.weapons.length < 4
        );
      },
    };
  }

  equipHatchet() {
    return {
      name: "Gain Hatchet",
      description: "",
      execute: () => {
        new Hatchet(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "hatchet") &&
          this.weapons.length < 4
        );
      },
    };
  }

  equipShield() {
    return {
      name: "Gain Shield",
      description: "",
      execute: () => {
        new Shield(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "shield") &&
          this.weapons.length < 4
        );
      },
    };
  }

  equipFlamethrower() {
    return {
      name: "Gain Flamethrower",
      description: "",
      execute: () => {
        new Flamethrower(this.scene).equip();
      },
      canAppear: () => {
        return (
          !this.weapons.find((w) => w.id === "flamethrower") &&
          this.weapons.length < 4
        );
      },
    };
  }
}

