import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { Player } from "./Player";

export class ExperienceOrb extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  goTowardsPlayerSpeed: number = 0;
  canPickUp: boolean = false;
  value: number = 1;

  constructor(scene: Game, x: number, y: number, value?: number) {
    super(scene, x, y, "experience-orb");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(10);

    this.setScale(0.6);
    this.setDepth(RenderDepth.BACKGROUND);

    this.scene.experienceOrbs.add(this);

    this.goTowardsPlayerSpeed = 0;
    this.canPickUp = false;
    if (value) this.value = value;

    if (this.value > 10) {
      this.setTint(0xff0000);
      this.setScale(0.8);
    } else if (this.value > 5) {
      this.setTint(0x00ff00);
    }

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
        this.goTowardsPlayerSpeed = Phaser.Math.RND.realInRange(320, 380);
      },
    });
  }
}

