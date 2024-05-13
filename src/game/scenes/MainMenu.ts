import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";
import { RenderDepth } from "./GameScene/types";
import { getGameDimensions } from "../utils";

export class MainMenu extends Scene {
  title: GameObjects.BitmapText;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.title = this.add
      .bitmapText(
        getGameDimensions(this.game).width / 2,
        240,
        "satoshi",
        "Mini Survivor"
      )
      .setOrigin(0.5)
      .setDepth(RenderDepth.UI);

    this.add
      .bitmapText(
        getGameDimensions(this.game).width / 2,
        340,
        "satoshi-14",
        "Click anywhere to start"
      )
      .setOrigin(0.5)
      .setDepth(RenderDepth.UI);

    EventBus.emit("current-scene-ready", this);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
