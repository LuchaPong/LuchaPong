import { AUTO, Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { Controls } from "./scenes/Controls";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: "100%",
  height: "100%",
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [Boot, Preloader, MainMenu, MainGame, Controls, GameOver],
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: { y: 0, x: 0 },
    },
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;

