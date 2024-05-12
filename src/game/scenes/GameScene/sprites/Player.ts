import { Game } from "../GameScene";
import { createTrailPainter } from "../createTrailPainter";
import { RenderDepth } from "../types";
import { Axe } from "../weapons/Axe";
import { Bow } from "../weapons/Bow";
import { Knife } from "../weapons/Knife";
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
  health: number = 100;
  totalHealth: number = 100;
  immune: boolean = false;

  killCount = 0;

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
  ];

  weapons: Weapon[] = [];

  lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("rogue-idle");
    this.body.setCircle(10);
    this.body.setOffset(6, 10);
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
  }

  takeDamage(damage: number) {
    if (this.immune) return;

    this.health -= damage;
    this.immune = true;
    this.scene.time.delayedCall(300, () => {
      this.immune = false;
    });
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
      this.scene.scene.start("MainMenu");
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
    this.healthBar.fillRect(
      24,
      224,
      160 * (this.health / this.totalHealth),
      16
    );
    this.healthBar.setDepth(RenderDepth.UI);
    this.healthBar.setScrollFactor(0);
  }

  update(time: number, delta: number): void {
    this.move(delta);
    this.weapons.map((w) => {
      w.update(time, delta);
      w.timeEquipped += delta;
    });
    this.checkLevelUps();
    this.trailPainter.onUpdate();
  }

  move(delta: number) {
    if (!this.scene.input.keyboard) return;
    let moveVector = new Phaser.Math.Vector2(0, 0);

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

    moveVector = moveVector.normalize().scale(this.moveSpeed * (delta / 1000));
    this.setPosition(
      Math.round(this.x + moveVector.x),
      Math.round(this.y + moveVector.y)
    );

    if (moveVector.length() > 0) {
      this.lastDirection = moveVector.clone().normalize();
    }
  }

  incrementKillCount() {
    this.killCount++;
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
        return !this.weapons.find((w) => w.id === "bow");
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
        return !this.weapons.find((w) => w.id === "axe");
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
        return !this.weapons.find((w) => w.id === "sickle");
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
        return !this.weapons.find((w) => w.id === "knife");
      },
    };
  }
}

