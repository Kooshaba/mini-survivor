import { getGameDimensions } from "../../utils";
import { Player } from "../GameScene/sprites/Player";
import { Upgrade } from "../GameScene/weapons/Weapon";

export class SummaryScene extends Phaser.Scene {
  player: Player;
  upgradeChoices: Upgrade[];
  onFinishCallback: () => void;

  constructor() {
    super("SummaryScene");
  }

  dropIn(obj: Phaser.GameObjects.Image | Phaser.GameObjects.BitmapText) {
    obj.setY(obj.y - 40);

    this.add.tween({
      targets: obj,
      y: obj.y + 40,
      alpha: 1,
      duration: 350,
    });
  }

  init(data: { player: Player; gameOver?: boolean }) {
    this.player = data.player;
    const gameOver = Boolean(data.gameOver);

    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-ESC", () => {
        this.scene.stop();
        this.scene.resume("Game");
      });
    }

    const dims = getGameDimensions(this.game);
    // Add this in your init method
    const background = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    );
    background.setOrigin(0, 0);
    background.setAlpha(0.8);

    const headerBgPosition = {
      x: dims.width / 2,
      y: 12,
    };
    const headerBg = this.add
      .image(headerBgPosition.x, headerBgPosition.y, "ui-header")
      .setOrigin(0.5, 0)
      .setScale(1.5)
      .setAlpha(0);
    this.dropIn(headerBg);

    const headerTextPosition = {
      x: dims.width / 2,
      y: 36,
    };
    const headerText = this.add
      .bitmapText(
        headerTextPosition.x,
        headerTextPosition.y,
        "satoshi",
        gameOver ? "Game Over" : "Summary"
      )
      .setOrigin(0.5, 0)
      .setAlpha(0);
    this.dropIn(headerText);

    const body = this.add
      .image(dims.width / 2, 100, "ui-body")
      .setOrigin(0.5, 0)
      .setScale(1.4, 1)
      .setAlpha(0);

    this.dropIn(body);

    this.player.weapons.forEach((w, i) => {
      const t = this.add
        .bitmapText(
          dims.width / 2 - 134,
          184 + i * 36,
          "satoshi-14",
          `${w.id.toUpperCase()}:\n${
            w.totalDamageDealt
          } total dmg | ${Math.round(
            w.totalDamageDealt / Math.round(w.timeEquipped / 1000)
          )} dps`
        )
        .setAlpha(0);

      this.dropIn(t);
    });

    const playAgainButton = this.add
      .image(dims.width / 2, body.displayHeight + 108, "button-green-base")
      .setOrigin(0.5, 0)
      .setScale(3)
      .setAlpha(0)
      .setInteractive();

    const buttonText = this.add
      .bitmapText(
        playAgainButton.x,
        playAgainButton.y + 10,
        "satoshi-14",
        "RESTART"
      )
      .setOrigin(0.5, 0)
      .setAlpha(0);
    this.dropIn(buttonText);

    playAgainButton.on("pointerover", () => {
      playAgainButton.setTexture("button-green-hover");
    });

    playAgainButton.on("pointerout", () => {
      playAgainButton.setTexture("button-green-base");
    });

    playAgainButton.on("pointerdown", () => {
      playAgainButton.setTexture("button-green-clicked");
      buttonText.setY(buttonText.y + 4);
    });

    playAgainButton.on("pointerup", () => {
      playAgainButton.setTexture("button-green-base");
      buttonText.setY(buttonText.y - 4);
      this.scene.start("Game");
    });

    this.dropIn(playAgainButton);
  }
}

