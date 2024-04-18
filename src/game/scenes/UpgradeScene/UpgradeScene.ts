import { Player } from "../GameScene/sprites/Player";
import { Upgrade } from "../GameScene/weapons/Weapon";

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
      .rectangle(256 + 252 * i, 240, 240, 80, 0x333333)
      .setAlpha(0);
    const text = this.add
      .text(card.x - 120, card.y - 20, upgrade.name, {
        fontFamily: "Arial Black",
        fontSize: 12,
        color: "#ffffff",
      })
      .setAlpha(0);

    this.add.tween({
      targets: card,
      alpha: 1,
      y: 360,
      ease: "Sine.easeInOut",
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
        y: card.y - 32,
        alpha: 0,
        ease: "Sine.easeInOut",
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

