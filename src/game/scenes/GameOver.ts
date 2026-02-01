import { createInteractiveButton, createText } from "../../utils/Utils";
import { EventBus } from "../EventBus";
import { GameObjects, Scene } from "phaser";

export class GameOver extends Scene {
  restartButton: GameObjects.Sprite;
  settingsButton: GameObjects.Sprite;
  menuButton: GameObjects.Sprite;
  gameOverTitle: GameObjects.Text;
  winnerText: GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  preload() {
    this.load.audio("gameover", "audio/game_over.mp3");
  }

  create(data?: { winner?: "left" | "right" }) {
    // Use last frame to render over
    this.add.image(0, 0, "lastGameFrame").setOrigin(0);

    const boxHeight = 150;
    const startY = (this.scale.height - 5 * boxHeight) / 2;
    this.gameOverTitle = createText(
      this,
      "GAME OVER",
      this.scale.width / 2,
      startY,
      100,
      "Rubik Dirt",
      15,
    );

    const winnerLabel =
      data?.winner === "left" ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
    const winnerGlow = data?.winner === "left" ? 0xf54242 : 0x4287f5;
    this.winnerText = createText(
      this,
      winnerLabel,
      this.scale.width / 2,
      startY + boxHeight,
      62,
      "Rubik Black",
      9,
    );
    this.winnerText.postFX.addGlow(winnerGlow, 4, 0, false, 0.1, 24);

    this.restartButton = createInteractiveButton(
      this,
      "RESTART",
      this.scale.width / 2,
      startY + 2 * boxHeight,
      () => {
        this.scene.start("Game");
      },
    );
    this.settingsButton = createInteractiveButton(
      this,
      "CONTROLS",
      this.scale.width / 2,
      startY + 3 * boxHeight,
      () => {
        this.scene.start("Controls");
      },
    );
    this.menuButton = createInteractiveButton(
      this,
      "MAIN MENU",
      this.scale.width / 2,
      startY + 4 * boxHeight,
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

