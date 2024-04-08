import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { Player } from "./Player";

export class ExperienceOrb extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  currentTween: Phaser.Tweens.Tween;
  goTowardsPlayer: number = 0;
  canPickUp: boolean = false;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "experience-orb");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(10);

    this.currentTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 4,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.setScale(0.6);
    this.setDepth(RenderDepth.BACKGROUND);

    this.scene.experienceOrbs.add(this);

    this.goTowardsPlayer = 0;
    this.canPickUp = false;

    this.scene.time.delayedCall(500, () => {
      this.canPickUp = true;
    });
  }

  checkPickup(player: Player) {
    if (!this.canPickUp) return;

    const collisionCircle = new Phaser.Geom.Circle(
      player.x,
      player.y,
      player.pickupRadius
    );
    if (Phaser.Geom.Circle.Contains(collisionCircle, this.x, this.y)) {
      this.onPickup(this.scene.player);
    }
  }

  onPickup(player: Phaser.Physics.Arcade.Sprite) {
    this.currentTween.stop();
    this.canPickUp = false;

    const playerPosition = player.getCenter();
    const angle =
      Phaser.Math.Angle.BetweenPoints(this, playerPosition) + Math.PI;
    const goToPosition = {
      x: this.x + Math.cos(angle) * 40,
      y: this.y + Math.sin(angle) * 40,
    };

    this.scene.tweens.add({
      targets: this,
      x: goToPosition.x,
      y: goToPosition.y,
      duration: 150,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.goTowardsPlayer = Phaser.Math.RND.realInRange(190, 220);
      },
    });
  }
}

