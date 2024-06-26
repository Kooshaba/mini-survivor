import { GameObjects, Scene } from "phaser";

import { EventBus } from "../../EventBus";
import { Enemy } from "./sprites/Enemy";
import { Pickup } from "./sprites/Pickup";
import { Player } from "./sprites/Player";
import { RenderDepth } from "./types";
import { Minimap } from "./Minimap";
import { createEnemyManager } from "./createEnemyManager";
import { shuffle } from "lodash";
import { getGameDimensions } from "../../utils";
import Joystick from "phaser3-rex-plugins/plugins/input/virtualjoystick/VirtualJoyStick";

export class Game extends Scene {
  title: GameObjects.Text;
  player: Player;

  enemies: Phaser.GameObjects.Group;
  enemyManager: ReturnType<typeof createEnemyManager>;

  projectiles: Phaser.GameObjects.Group;
  weapons: Phaser.GameObjects.Group;
  pickups: Phaser.GameObjects.Group;

  experienceBar: GameObjects.Graphics;
  levelText: GameObjects.BitmapText;

  minimap: Minimap;
  killCountText: GameObjects.BitmapText;

  roundTime: number = 0;
  timerText: GameObjects.DynamicBitmapText;

  joystick:
    | {
        forceX: number;
        forceY: number;
        force: number;
      }
    | undefined;

  constructor() {
    super("Game");
  }

  create() {
    const map = this.make.tilemap({ key: "world" });
    const tileset = map.addTilesetImage("ground", "ground");
    if (!tileset) throw new Error("Tileset not found");
    const layer = map.createLayer("Tile Layer 1", tileset);
    if (!layer) throw new Error("Layer not found");

    layer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, 4000, 4000);
    this.cameras.main.setBounds(0, 0, 4000, 4000);
    this.cameras.main.setRoundPixels(true);

    this.enemies = this.add.group();
    this.projectiles = this.add.group();
    this.pickups = this.add.group();

    this.player = new Player(this, 2000, 2000);
    this.player.queuedLevelUps.push({
      upgradeChoices: shuffle(this.player.initialUpgrades()).slice(0, 3),
      timeAcquired: this.time.now - 600,
    });

    this.killCountText = this.add
      .bitmapText(
        parseInt(this.game.config.width.toString()) - 48,
        24,
        "satoshi-14",
        "0"
      )
      .setScrollFactor(0)
      .setDepth(RenderDepth.UI);

    const spawnCircle = new Phaser.Geom.Circle(2000, 2000, 800);
    const points = spawnCircle.getPoints(8);
    points.forEach((point) => {
      this.enemies.add(new Enemy(this, point.x, point.y));
    });

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    // this.cameras.main.setZoom(2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.overlap(this.player, this.enemies, (_p, _e) => {
      const player = _p as Player;
      const enemy = _e as Enemy;

      player.takeDamage(enemy.damage);
    });
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (p, enemy) => {
        (p as GameObjects.Sprite)
          .getData("fromWeapon")
          .onProjectileHit(p, enemy);
      },
      (p, enemy) => {
        const enemyIds = (p as GameObjects.Sprite).getData("alreadyHit");
        const hitEnemyId = (enemy as GameObjects.Sprite).getData("id");
        const stop = enemyIds?.includes(hitEnemyId);
        return !stop;
      }
    );

    this.enemyManager = createEnemyManager(this);
    this.enemyManager.queueEnemySpawn();

    EventBus.emit("current-scene-ready", this);

    this.drawExperienceBar();

    if (this.sys.game.device.input.touch && this.plugins) {
      this.joystick = new Joystick(this, {
        x: getGameDimensions(this.game).width / 2,
        y: getGameDimensions(this.game).height / 2 + 160,
        radius: 48,
      });
    }

    const gameDimensions = getGameDimensions(this.game);
    const bigScreen = gameDimensions.width > 600;
    const timerX = bigScreen ? gameDimensions.width / 2 : 24;
    const timerY = bigScreen ? 24 : 48;
    this.timerText = this.add.dynamicBitmapText(timerX, timerY, "satoshi", "");
    this.timerText
      .setOrigin(bigScreen ? 0.5 : 0, 0)
      .setScrollFactor(0)
      .setDepth(RenderDepth.UI);
    this.roundTime = 0;

    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-ESC", () => {
        this.scene.pause("Game");
        this.scene.launch("SummaryScene", { player: this.player });
      });
    }
  }

  pickupExperience() {
    this.pickups.getChildren().forEach((orb) => {
      (orb as Pickup).checkPickup(this.player);
    });
  }

  movePickUps() {
    this.pickups.getChildren().forEach((_orb) => {
      const pickup = _orb as Pickup;
      const rangeToPlayer = Phaser.Math.Distance.Between(
        pickup.x,
        pickup.y,
        this.player.x,
        this.player.y
      );

      if (rangeToPlayer < 20) {
        pickup.trigger(this.player);
        pickup.destroy();
        return;
      }

      if (pickup.goTowardsPlayerSpeed) {
        this.physics.moveToObject(pickup, this.player, pickup.goTowardsPlayerSpeed);
      }
    });
  }

  drawExperienceBar() {
    this.levelText?.destroy();
    this.levelText = this.add.bitmapText(
      this.getGameWidth() / 2,
      this.getGameHeight() - 48,
      "satoshi",
      `${this.player.level}`
    );
    this.levelText.setOrigin(0.5);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(RenderDepth.UI);

    this.experienceBar?.destroy();
    this.experienceBar = this.add.graphics();
    this.experienceBar.setDepth(RenderDepth.UI);
    this.experienceBar.setScrollFactor(0);
    this.experienceBar.fillStyle(0xffffff, 1);
    this.experienceBar.fillRect(
      0,
      this.getGameHeight() - 20,
      this.getGameWidth(),
      20
    );

    this.experienceBar.fillStyle(0x00ff00, 1);
    this.experienceBar.fillRect(
      0,
      this.getGameHeight() - 20,
      this.getGameWidth() *
        (this.player.experience / this.player.xpToNextLevel),
      20
    );
  }

  getGameHeight() {
    return parseInt(this.game.config.height.toString());
  }

  getGameWidth() {
    return parseInt(this.game.config.width.toString());
  }

  updateKillCount() {
    this.killCountText.setText(this.player.killCount.toString());
    this.killCountText.setX(
      parseInt(this.game.config.width.toString()) -
        48 -
        this.killCountText.width / 2
    );

    if (!this.tweens.isTweening(this.killCountText)) {
      // Create a shake effect
      this.tweens.add({
        targets: this.killCountText,
        y: "-=5",
        yoyo: true,
        duration: 50,
        ease: "Power1",
        repeat: 1,
      });
    }
  }

  drawTimerText() {
    const milliseconds = Math.floor(this.roundTime);
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);

    seconds %= 60;
    minutes %= 60;

    const secondsStr = seconds.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");

    this.timerText.setText(`${minutesStr}:${secondsStr}`);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    this.player.update(time, delta);

    this.enemies.getChildren().forEach((enemy) => {
      enemy.update();
    });

    this.projectiles.getChildren().forEach((p) => p.update());

    this.enemyManager.update(time, delta);

    this.pickupExperience();
    this.movePickUps();

    this.roundTime += delta;
    this.drawTimerText();
  }
}

