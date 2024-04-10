import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { Game as GameScene } from "./scenes/GameScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  pixelArt: true,
  roundPixels: true,
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
