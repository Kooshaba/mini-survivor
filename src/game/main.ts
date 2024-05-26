import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { Game as GameScene } from "./scenes/GameScene";
import { UpgradeScene } from "./scenes/UpgradeScene";
import { SummaryScene } from "./scenes/SummaryScene/";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: Math.min(window.innerWidth, 1200),
  height: Math.min(
    isMobile ? window.innerHeight - 120 : window.innerHeight,
    800
  ),
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, GameScene, UpgradeScene, SummaryScene],
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
