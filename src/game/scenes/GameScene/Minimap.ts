import { Game } from "./GameScene";
import { Enemy } from "./sprites/Enemy";
import { RenderDepth } from "./types";

export class Minimap {
  scene: Game;
  graphics: Phaser.GameObjects.Graphics;

  minimapSizeX: number;
  minimapSizeY: number;

  minimapRange: number;

  constructor(scene: Game) {
    this.scene = scene;
    this.graphics = scene.add.graphics();

    this.minimapSizeX = 200;
    this.minimapSizeY = 200;
    this.minimapRange = 500;
  }

  update() {
    this.graphics.clear();
    this.graphics.setDepth(RenderDepth.UI);
    this.graphics.setScrollFactor(0);
    this.graphics.fillStyle(0x000000, 0.5);
    this.graphics.fillCircle(this.minimapSizeX / 2, this.minimapSizeY / 2, 100);

    this.graphics.fillStyle(0x00ff00, 0.5);
    this.graphics.fillCircle(this.minimapSizeX / 2, this.minimapSizeY / 2, 2);

    this.scene.enemies.getChildren().forEach((e) => {
      const enemy = e as Enemy;

      if (
        Phaser.Math.Distance.BetweenPoints(this.scene.player, enemy) >
        this.minimapRange
      ) {
        return;
      }

      this.graphics.fillStyle(enemy.tint, 0.5);
      this.graphics.fillCircle(
        (enemy.x - this.scene.player.x) / 5 + this.minimapSizeX / 2,
        (enemy.y - this.scene.player.y) / 5 + this.minimapSizeY / 2,
        2 * enemy.scale
      );
    });
  }
}

