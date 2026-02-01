import { createInteractiveButton, createText } from "../../utils/Utils";
import { EventBus } from "../EventBus";
import { GameObjects, Scene } from "phaser";

export class GameOver extends Scene {
  restartButton: GameObjects.Sprite;
  settingsButton: GameObjects.Sprite;
  menuButton: GameObjects.Sprite;

  constructor() {
    super("GameOver");
  }

  preload() {
    this.load.audio("gameover", "audio/game_over.mp3");
  }

  create(data?: { winner?: "left" | "right" }) {
    // Use last frame to render over
    this.add.image(0, 0, "lastGameFrame").setOrigin(0);

    const winnerLabel =
      data?.winner === "left"
        ? "PLAYER 1 WINS!"
        : data?.winner === "right"
          ? "PLAYER 2 WINS!"
          : "";

    createText(
      this,
      "GAME OVER",
      this.scale.width / 2,
      this.scale.height * 0.2,
      64,
    );

    if (winnerLabel) {
      createText(
        this,
        winnerLabel,
        this.scale.width / 2,
        this.scale.height * 0.32,
        36,
      );
    }

    this.restartButton = createInteractiveButton(
      this,
      "RESTART",
      this.scale.width / 2,
      this.scale.height / 2,
      () => {
        this.scene.start("Game");
      },
    );
    // TODO: This needs a refactor on how the control render works.
    // this.settingsButton = createInteractiveButton(
    //   this,
    //   "SETTINGS",
    //   this.scale.width / 2,
    //   this.scale.height / 2 + this.restartButton.height,
    //   () => {
    //     this.scene.start("Controls");
    //   },
    // );
    this.menuButton = createInteractiveButton(
      this,
      "MAIN MENU",
      this.scale.width / 2,
      // NOTE: If the above TODO is fixed, the following line should replace the height.
      // this.scale.height / 2 + 2 * this.restartButton.height,
      this.scale.height / 2 + this.restartButton.height,
      () => {
        this.scene.start("MainMenu");
      },
    );

    this.sound.play("gameover", { rate: 0.85 });
    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
