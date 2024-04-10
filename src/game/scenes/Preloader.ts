import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");
    this.load.spritesheet("wizard-idle", "wizard/idle.png", {
      frameWidth: 32, // Width of each frame in pixels
      frameHeight: 32, // Height of each frame in pixels
    });
    this.load.spritesheet("skeleton-idle", "skeleton/idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image("knife", "projectiles/knife.png");
    this.load.image("axe", "weapons/axe.png");
    this.load.image("experience-orb", "orb.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.

    // Create the animation from the "wizard-idle" spritesheet
    this.anims.create({
      key: "wizard-idle",
      frames: this.anims.generateFrameNumbers("wizard-idle"),
      frameRate: 10,
      repeat: -1, // Set to -1 for infinite looping
    });

    // Create the animation from the "skeleton-idle" spritesheet
    this.anims.create({
      key: "skeleton-idle",
      frames: this.anims.generateFrameNumbers("skeleton-idle"),
      frameRate: 10,
      repeat: -1,
    });

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
