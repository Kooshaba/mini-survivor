import { GameObjects, Scene } from "phaser";

import { EventBus } from "../../EventBus";
import { Enemy } from "./sprites/Enemy";
import { ExperienceOrb } from "./sprites/ExperienceOrb";
import { Player } from "./sprites/Player";
import { RenderDepth } from "./types";
import { Minimap } from "./Minimap";
import { createEnemyManager } from "./createEnemyManager";
import { shuffle } from "lodash";

export class Game extends Scene {
  title: GameObjects.Text;
  player: Player;

  enemies: Phaser.GameObjects.Group;
  enemyManager: ReturnType<typeof createEnemyManager>;

  projectiles: Phaser.GameObjects.Group;
  weapons: Phaser.GameObjects.Group;
  experienceOrbs: Phaser.GameObjects.Group;

  experienceBar: GameObjects.Graphics;
  levelText: GameObjects.Text;

  minimap: Minimap;
  killCountText: Phaser.GameObjects.Text;

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
    this.experienceOrbs = this.add.group();

    this.player = new Player(this, 512, 384);
    this.player.queuedLevelUps.push({
      upgradeChoices: shuffle(this.player.initialUpgrades()).slice(0, 3),
      timeAcquired: this.time.now - 600,
    });

    this.killCountText = this.add
      .text(parseInt(this.game.config.width.toString()) - 48, 24, "0")
      .setScrollFactor(0)
      .setDepth(RenderDepth.UI);
    this.killCountText.setShadow(2, 2, "#000000", 2);

    const spawnCircle = new Phaser.Geom.Circle(512, 384, 800);
    const points = spawnCircle.getPoints(8);
    points.forEach((point) => {
      this.enemies.add(new Enemy(this, point.x, point.y));
    });

    this.minimap = new Minimap(this);

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.enemies, (_p, _e) => {
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
  }

  pickupExperience() {
    this.experienceOrbs.getChildren().forEach((orb) => {
      (orb as ExperienceOrb).checkPickup(this.player);
    });
  }

  moveExperienceOrbs() {
    this.experienceOrbs.getChildren().forEach((_orb) => {
      const orb = _orb as ExperienceOrb;
      const rangeToPlayer = Phaser.Math.Distance.Between(
        orb.x,
        orb.y,
        this.player.x,
        this.player.y
      );

      if (rangeToPlayer < 20) {
        this.player.onReceiveXp(orb.value);

        orb.destroy();
        return;
      }

      if (orb.goTowardsPlayerSpeed) {
        this.physics.moveToObject(orb, this.player, orb.goTowardsPlayerSpeed);
      }
    });
  }

  drawExperienceBar() {
    this.levelText?.destroy();
    this.levelText = this.add.text(512, 718, `${this.player.level}`, {
      fontSize: "20px",
      color: "#ffffff",
    });
    this.levelText.setOrigin(0.5);
    this.levelText.setScrollFactor(0);

    this.experienceBar?.destroy();
    this.experienceBar = this.add.graphics();
    this.experienceBar.setDepth(RenderDepth.UI);
    this.experienceBar.setScrollFactor(0);
    this.experienceBar.fillStyle(0xffffff, 1);
    this.experienceBar.fillRect(0, 748, 1024, 20);

    this.experienceBar.fillStyle(0x00ff00, 1);
    this.experienceBar.fillRect(
      0,
      748,
      1024 * (this.player.experience / this.player.xpToNextLevel),
      20
    );
  }

  drawKillCount() {
    this.killCountText.setText(this.player.killCount.toString());
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    this.player.update(time, delta);

    this.enemies.getChildren().forEach((enemy) => {
      enemy.update();
    });

    this.enemyManager.update(time, delta);

    this.pickupExperience();
    this.moveExperienceOrbs();
    this.drawExperienceBar();
    this.drawKillCount();

    this.minimap.update();
  }
}

