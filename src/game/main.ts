import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { Game as GameScene } from "./scenes/GameScene";
import { UpgradeScene } from "./scenes/UpgradeScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth,
  height: isMobile ? window.innerHeight - 120 : window.innerHeight,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, GameScene, UpgradeScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  pixelArt: true,
  roundPixels: true,
  fps: {
    min: 30,
    target: 60,
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
