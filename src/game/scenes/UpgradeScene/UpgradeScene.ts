import { Player } from "../GameScene/sprites/Player";
import { Upgrade } from "../GameScene/weapons/Weapon";

/**
 * TODO instead of passing upgrade choices, process level ups one by one
 * need to do this because currently all the level ups are calculated
 * before any choices are made, and the canAppear function is using the
 * incorrect state
 * i.e. you can get the option to gain the same weapon twice in a row
 */
export class UpgradeScene extends Phaser.Scene {
  player: Player;
  upgradeChoices: Upgrade[];
  onFinishCallback: () => void;

  constructor() {
    super("UpgradeScene");
  }

  init(data: {
    player: Player;
    upgradeChoices: Upgrade[];
    onFinish: () => void;
  }) {
    this.player = data.player;
    this.upgradeChoices = data.upgradeChoices;
    this.onFinishCallback = data.onFinish;

    for (let i = 0; i < this.upgradeChoices.length; i++) {
      this.createUpgradeCard(this.upgradeChoices[i], i);
    }
  }

  createUpgradeCard(upgrade: Upgrade, i: number) {
    const card = this.add
      .rectangle(
        parseInt(this.game.config.width.toString()) / 2 - 80,
        parseInt(this.game.config.height.toString()) / 2 + (i - 1) * 120,
        240,
        80,
        0x333333
      )
      .setAlpha(0);
    const text = this.add
      .dynamicBitmapText(card.x - 120, card.y - 20, "satoshi-14", upgrade.name)
      .setAlpha(0);

    this.add.tween({
      targets: card,
      alpha: 1,
      x: "+=80",
      ease: "Power1",
      duration: 500,
      delay: 200 * i,
      onComplete: () => {
        text.setPosition(card.x - text.width / 2, card.y - text.height / 2);

        this.add.tween({
          targets: text,
          alpha: 1,
          duration: 200,
        });
      },
    });

    card.setInteractive();
    card.on("pointerdown", () => {
      this.tweens.add({
        targets: [card, text],
        x: "+=32",
        alpha: 0,
        ease: "Power1",
        duration: 500,
        onComplete: () => {
          upgrade.execute();
          this.scene.stop();
          this.onFinishCallback();
        },
      });
    });

    card.on("pointerover", () => {
      card.setFillStyle(0x444444);
      this.add.tween({
        targets: card,
        scaleX: 1.03,
        scaleY: 1.03,
        ease: Phaser.Math.Easing.Cubic.InOut,
        duration: 100,
      });
    });

    card.on("pointerout", () => {
      card.setFillStyle(0x333333);
      this.add.tween({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });
  }
}

