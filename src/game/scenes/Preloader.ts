import { Scene } from "phaser";

const CREATURES = {
  castle: [
    "angel",
    "archer",
    "cavalier",
    "griffin",
    "monk",
    "paladin",
    "peasant",
    "pikeman",
    "swordsman",
  ],
  "dark bastion": [
    "demon",
    "devil",
    "efreet",
    "gog",
    "hell hound",
    "imp",
    "pit fiend",
  ],
  elementals: [
    "diamond elemental",
    "fire elemental",
    "ice elemental",
    "magic elemental",
    "magma elemental",
    "mind elemental",
    "stone elemental",
    "storm elemental",
    "water elemental",
    "wind elemental",
  ],
  "great elf": ["deer", "druid", "dwarf", "hunter", "pixie", "satyr", "treant"],
  necropolis: [
    "death knight",
    "ghost",
    "lich",
    "skeleton",
    "spider",
    "vampire",
    "zombie",
  ],
  stronghold: [
    "centaur",
    "cyclop",
    "goblin",
    "harpy",
    "shaman",
    "troll",
    "wolf rider",
  ],
  wizards: [
    "djinn",
    "gargoyle",
    "golem",
    "gremlin",
    "lion",
    "mage",
    "naga",
    "titan",
  ],
};

const ANIMATIONS = ["idle", "walk", "attack", "damage-taken", "death"];

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

    for (const [category, names] of Object.entries(CREATURES)) {
      for (const name of names) {
        const pathName = `creatures/${category}/${name}/sprite_sheet_${name.replace(
          / /g,
          "_"
        )}_0_16x16.png`;

        this.load.spritesheet(name, pathName, {
          frameWidth: 16,
          frameHeight: 16,
        });
      }
    }

    this.load.image("ground", "tiles/ground.png");
    this.load.tilemapTiledJSON("world", "tiles/world.tmj");

    this.load.image("knife", "projectiles/knife.png");
    this.load.image("arrow", "projectiles/arrow.png");
    this.load.image("axe", "weapons/axe.png");
    this.load.image("bow", "weapons/bow.png");
    this.load.image("hatchet", "weapons/hatchet.png");
    this.load.image("sickle", "weapons/sickle.png");
    this.load.image("experience-orb", "orb.png");

    this.load.bitmapFont(
      "satoshi",
      "satoshi/satoshi.png",
      "satoshi/satoshi.xml"
    );

    this.load.bitmapFont(
      "satoshi-8",
      "satoshi-8/satoshi-8.png",
      "satoshi-8/satoshi-8.xml"
    );

    this.load.bitmapFont(
      "satoshi-14",
      "satoshi-14/satoshi-14.png",
      "satoshi-14/satoshi-14.xml"
    );
  }

  create() {
    for (const [, names] of Object.entries(CREATURES)) {
      for (const name of names) {
        for (let i = 0; i < ANIMATIONS.length; i++) {
          const animName = ANIMATIONS[i];
          this.anims.create({
            key: `${name}-${animName}`,
            frames: this.anims.generateFrameNames(name, {
              start: 4 * i,
              end: 4 * i + 3,
            }),
            frameRate: 7,
            repeat: animName === "death" ? 0 : -1,
          });
        }
      }
    }

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
