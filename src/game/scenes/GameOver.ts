import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  preload() {
    this.load.audio("gameover", "audio/game_over.mp3");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);
    this.add.image(0, 0, "lastGameFrame").setOrigin(0);

    this.gameOverText = this.add
      .text(512, 384, "Game Over", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.sound.play("gameover", { rate: 0.85 });
    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}

