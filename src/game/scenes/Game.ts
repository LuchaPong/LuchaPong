import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Ball } from "../gameObjects/Ball";
import { Bound } from "../gameObjects/Bound";
import { Paddle } from "../gameObjects/Paddle";
import { GameManager } from "../systems/GameManager";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  gameManager: GameManager;
  effectsText: Phaser.GameObjects.Text;

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

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  update(time: number, delta: number): void {
    this.gameManager.update(time, delta);

    this.effectsText.setText(
      `Active Effects:\n${this.gameManager.activeEffects
        .map((e) => `- ${e} (${(e.durationMs / 1000).toFixed(0)}s left)`)
        .join("\n")}`,
    );
  }
}
