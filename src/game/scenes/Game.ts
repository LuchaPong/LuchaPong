import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Ball } from "../gameObjects/Ball";
import { Bound } from "../gameObjects/Bound";
import { Paddle } from "../gameObjects/Paddle";
import { GameManager } from "../systems/GameManager";

const fontStyle = {
  fontFamily: "Arial",
  fontSize: 48,
  color: "#ffffff",
  fontStyle: "bold",
  shadow: {
    color: "#000000",
    fill: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
} as const;
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  gameManager: GameManager;
  effectsText: Phaser.GameObjects.Text;
  timer: Phaser.Time.TimerEvent;
  timerText: Phaser.GameObjects.Text;
  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x5d5d5d);
    this.camera.zoom = 1;

    const bounds = this.add.layer([
      new Bound(this, width / 2, -10, width * 2, 20).setName("bound-top"),
      new Bound(this, width / 2, height + 10, width * 2, 20).setName(
        "bound-bottom",
      ),
      new Bound(this, -50, height / 2, 20, height * 2).setName("bound-left"),
      new Bound(this, width + 50, height / 2, 20, height * 2).setName(
        "bound-right",
      ),
    ]);

    this.add
      .graphics()
      .lineStyle(2, 0xffffff, 1)
      .strokeCircle(width / 2, height / 2, 100)
      .strokeLineShape(new Phaser.Geom.Line(width / 2, 0, width / 2, height));

    this.effectsText = this.add
      .text(10, 10, "Active Effects:")
      .setDepth(1000)
      .setFontSize(16)
      .setFontFamily("Arial Black")
      .setColor("#ffffff")
      .setStroke("#000000", 4);

    this.timerText = this.add
      .text(this.scale.width / 2, 40, "3", fontStyle)
      .setOrigin(0.5, 0);

    this.gameManager = new GameManager({
      ball: new Ball(this),
      paddles: {
        left: new Paddle(this, "left", {
          up: this.input.keyboard!.addKey("W"),
          down: this.input.keyboard!.addKey("S"),
          skill1: this.input.keyboard!.addKey("Q"),
          skill2: this.input.keyboard!.addKey("E"),
        }),
        right: new Paddle(this, "right", {
          up: this.input.keyboard!.addKey("I"),
          down: this.input.keyboard!.addKey("K"),
          skill1: this.input.keyboard!.addKey("U"),
          skill2: this.input.keyboard!.addKey("O"),
        }),
      },
      bounds,
      scene: this,
      physics: this.physics,
    });

    this.gameManager.on("ball-reflect-on-paddle", () => {
      this.camera.shake(150, 0.001);
    });

    this.gameManager.on("ball-reflect-on-scene-edge", () => {
      this.camera.shake(150, 0.0025);
    });

    this.gameManager.on("game-setup-round", () => {
      console.log("Received 'game-setup-round' event.");
      this.setupNewRound();
      console.log("Setup for new round complete.");
    });

    this.gameManager.on("game-start-round", () => {
      this.gameManager.startRound();
    });

    this.gameManager.intialSetupGame();

    EventBus.emit("current-scene-ready", this);
  }

  setupNewRound() {
    this.timer = this.time.addEvent({
      delay: 3000,
      callback: () => this.gameManager.emit("game-start-round"),
      callbackScope: this,
    });
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  update(time: number, delta: number): void {
    if (this.timer) {
      if (this.timer.getProgress() === 1) {
        this.timerText.setText("");
      } else {
        const remaining = Math.ceil(3 - this.timer.getElapsedSeconds()).toFixed(
          0,
        );

        this.timerText.setText(remaining);
      }
    }

    this.gameManager.update(time, delta);

    this.effectsText.setText(
      `Active Effects:\n${this.gameManager.activeEffects
        .map((e) => `- ${e} (${(e.durationMs / 1000).toFixed(0)}s left)`)
        .join("\n")}`,
    );
  }
}

