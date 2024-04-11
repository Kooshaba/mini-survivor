import { GameObjects, Scene } from "phaser";

import { EventBus } from "../../EventBus";
import { Enemy } from "./sprites/Enemy";
import { ExperienceOrb } from "./sprites/ExperienceOrb";
import { Player } from "./sprites/Player";
import { FastBoy } from "./sprites/FastBoy";
import { StrongBoy } from "./sprites/StrongBoy";
import { RenderDepth } from "./types";
import { Axe } from "./weapons/Axe";
import { Knife } from "./weapons/Knife";
import { Minimap } from "./Minimap";
import { HugeBoy } from "./sprites/HugeBoy";

export class Game extends Scene {
  title: GameObjects.Text;
  player: Player;

  enemies: Phaser.GameObjects.Group;
  projectiles: Phaser.GameObjects.Group;
  weapons: Phaser.GameObjects.Group;
  experienceOrbs: Phaser.GameObjects.Group;

  experienceBar: GameObjects.Graphics;
  levelText: GameObjects.Text;

  minimap: Minimap;

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
    this.weapons = this.add.group();

    this.player = new Player(this, 512, 384);
    new Knife(this).equip();
    new Axe(this).equip();

    this.minimap = new Minimap(this);

    this.cameras.main.startFollow(this.player);
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

    this.time.delayedCall(1000, this.spawnEnemy, [], this);

    EventBus.emit("current-scene-ready", this);
  }

  spawnEnemy() {
    const boundLines = [
      this.physics.world.bounds.getLineA(),
      this.physics.world.bounds.getLineB(),
      this.physics.world.bounds.getLineC(),
      this.physics.world.bounds.getLineD(),
    ];
    const randomLine = Phaser.Math.RND.pick(boundLines);
    const randomPoint = randomLine.getRandomPoint();

    const seed = Phaser.Math.RND.integerInRange(0, 100);
    const enemies: Enemy[] = [];
    if (seed > 90) {
      enemies.push(new FastBoy(this, randomPoint.x, randomPoint.y));
    } else if (seed > 80) {
      enemies.push(new StrongBoy(this, randomPoint.x, randomPoint.y));
    } else if (seed > 70) {
      enemies.push(new HugeBoy(this, randomPoint.x, randomPoint.y));
    } else {
      const count = Phaser.Math.RND.integerInRange(1, 10);
      for (let i = 0; i < count; i++) {
        const positionOffset = new Phaser.Math.Vector2(
          Phaser.Math.RND.integerInRange(-10, 10),
          Phaser.Math.RND.integerInRange(-10, 10)
        );
        enemies.push(
          new Enemy(
            this,
            randomPoint.x + positionOffset.x,
            randomPoint.y + positionOffset.y
          )
        );
      }
    }

    enemies.forEach((e) => this.enemies.add(e));
    this.time.delayedCall(
      Math.max(800 - this.player.level * 10, 150),
      this.spawnEnemy,
      [],
      this
    );
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
        this.player.onReceiveXp(1);

        orb.destroy();
        return;
      }

      if (orb.goTowardsPlayer) {
        this.physics.moveToObject(orb, this.player, orb.goTowardsPlayer);
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

  update() {
    if (!this.player) return;

    this.player.update();

    this.enemies.getChildren().forEach((enemy) => {
      enemy.update();
    });

    this.pickupExperience();
    this.moveExperienceOrbs();
    this.drawExperienceBar();

    this.minimap.update();
  }
}

