import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Ball } from "../gameObjects/Ball";
import { Paddle } from "../gameObjects/Paddle";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x5d5d5d);

    this.physics.world.setBounds(-128, 0, width + 128 * 2, height);

    this.ball = new Ball(this, width / 2, height / 2);
    this.ball.setInitialVelocity();

    this.leftPaddle = new Paddle(this, 50, height / 2);
    this.rightPaddle = new Paddle(this, width - 50, height / 2);

    this.physics.add.collider(
      this.ball,
      this.leftPaddle,
      () => this.ball.onCollisionWithPaddle(this.leftPaddle),
    );
    this.physics.add.collider(
      this.ball,
      this.rightPaddle,
      () => this.ball.onCollisionWithPaddle(this.rightPaddle),
    );

    EventBus.emit("current-scene-ready", this);
    EventBus.on("ball-scored", (scoringPlayer: "left" | "right") => {
      console.log(`Player scored: ${scoringPlayer}`);
      this.ball.setPosition(width / 2, height / 2);
      this.ball.setInitialVelocity();
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  update(time: number, delta: number): void {
    this.ball.update(time, delta);

    // Left paddle (W/S keys)
    if (this.input.keyboard!.addKey("W").isDown) {
      this.leftPaddle.physicsBody.setVelocityY(-300);
    } else if (this.input.keyboard!.addKey("S").isDown) {
      this.leftPaddle.physicsBody.setVelocityY(300);
    } else {
      this.leftPaddle.physicsBody.setVelocityY(0);
    }

    // Right paddle (Up/Down arrow keys)
    if (this.cursors.up!.isDown) {
      this.rightPaddle.physicsBody.setVelocityY(-300);
    } else if (this.cursors.down!.isDown) {
      this.rightPaddle.physicsBody.setVelocityY(300);
    } else {
      this.rightPaddle.physicsBody.setVelocityY(0);
    }
  }
}
