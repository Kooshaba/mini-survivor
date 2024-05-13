import { Game } from "phaser";

export function getGameDimensions(game: Game) {
  return {
    width: parseInt(game.config.width.toString()),
    height: parseInt(game.config.height.toString()),
  };
}

