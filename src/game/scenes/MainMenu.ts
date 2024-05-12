import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";
import { RenderDepth } from "./GameScene/types";

export class MainMenu extends Scene {
  title: GameObjects.BitmapText;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.title = this.add
      .bitmapText(512, 240, "satoshi", "Mini Survivor")
      .setOrigin(0.5)
      .setDepth(RenderDepth.UI);

    this.add
      .bitmapText(512, 340, "satoshi", "Click anywhere to start", 18)
      .setOrigin(0.5)
      .setDepth(RenderDepth.UI);

    EventBus.emit("current-scene-ready", this);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
