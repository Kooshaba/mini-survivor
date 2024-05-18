import { Game } from "../GameScene";
import { RenderDepth } from "../types";
import { Player } from "./Player";

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Game;

  goTowardsPlayerSpeed: number = 0;
  canPickUp: boolean = false;
  trigger: (player: Player) => void;

  constructor(scene: Game, x: number, y: number, spriteKey: string, configureSprite: (sprite: Phaser.Physics.Arcade.Sprite) => void, trigger: (player: Player) => void ) {
    super(scene, x, y, spriteKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(10);

    this.setScale(0.6);
    this.setDepth(RenderDepth.BACKGROUND);

    configureSprite(this);
    this.trigger = trigger;
    this.scene.pickups.add(this);

    this.goTowardsPlayerSpeed = 0;
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

export function createExperienceOrb(scene: Game, x: number, y: number, xp: number) {
  return new Pickup(scene, x, y, "experience-orb", (sprite) => {
    sprite.setScale(0.6);

    if (xp > 10) {
      sprite.setTint(0xff0000);
      sprite.setScale(0.8);
    } else if (xp > 5) {
      sprite.setTint(0x00ff00);
    }
  }, (player) => {
    player.onReceiveXp(xp);
  });
}

export function createHealthPotion(scene: Game, x: number, y: number, health: number) {
  return new Pickup(scene, x, y, "heart", (sprite) => {
    sprite.setScale(2);
  }, (player) => {
    player.heal(health);
  });
}

