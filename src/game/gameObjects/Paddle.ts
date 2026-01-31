import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";
import type { Ball } from "./Ball";

export class Paddle extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  protected paddleSprite: Phaser.GameObjects.Sprite;

  eventBus?: TypedEventEmitter<GameEvents>;

  centerSize = 0.40;

  get player() {
    return this._player;
  }

  constructor(
    scene: Phaser.Scene,
    protected _player: "left" | "right",
    protected controls: {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
    },
  ) {
    super(scene, 0, 0);

    this.name = `${_player}-paddle`;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.width = 25;
    this.height = 150;

    this.body.setSize(this.width, this.height);
    this.body.setImmovable(true);

    this.paddleSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, "paddle");
    this.paddleSprite.setScale(
      25 / this.paddleSprite.width,
      150 / this.paddleSprite.height,
    );

    this.add(this.paddleSprite);

    const paddleCenterSprite = new Phaser.GameObjects.Sprite(
      scene,
      0,
      0,
      "paddle",
    );
    paddleCenterSprite.setScale(
      25 / paddleCenterSprite.width,
      (150 / paddleCenterSprite.height) * this.centerSize,
    );
    paddleCenterSprite.setTint(_player === "left" ? 0x3498db : 0xe74c3c);
    this.add(paddleCenterSprite);

    this.add(
      new Phaser.GameObjects.Text(
        scene,
        0,
        this.height / 2 - 16,
        String.fromCharCode(this.controls.down.keyCode),
        {
          fontSize: "16px",
          color: "#000000",
        },
      ).setOrigin(0.5, 0.5),
    ).add(
      new Phaser.GameObjects.Text(
        scene,
        0,
        -this.height / 2 + 16,
        String.fromCharCode(this.controls.up.keyCode),
        {
          fontSize: "16px",
          color: "#000000",
        },
      ).setOrigin(0.5, 0.5),
    );
  }

  update(_time: number, _delta: number): void {
    if (this.controls.up.isDown) {
      this.body.setVelocityY(-500);
    } else if (this.controls.down.isDown) {
      this.body.setVelocityY(500);
    } else {
      this.body.setVelocityY(0);
    }
  }

  onCollisionWithBall(ball: Ball): void {
    const currentAngle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);

    const maxSharpReflectionAngle = Phaser.Math.DegToRad(60);
    const normalAreaHeight = this.height * this.centerSize;
    const edgeAreaHeight = (this.height - normalAreaHeight) / 2;

    const relativeY = ball.y - this.y;

    // adjust the reflection angle based on where the ball hits the paddle
    // central part of the paddle reflects normally, edges reflect at sharper angles

    let newAngle = Math.PI - currentAngle;
    if (Math.abs(relativeY) >= normalAreaHeight / 2) {
      const fraction = Phaser.Math.Clamp(
        (Math.abs(relativeY) - normalAreaHeight / 2) / edgeAreaHeight,
        0,
        1,
      );

      let maxAngleAdjustment: number;

      if (relativeY < 0) {
        if (this.player === "left") {
          maxAngleAdjustment = -maxSharpReflectionAngle;
        } else {
          maxAngleAdjustment = Math.PI - -maxSharpReflectionAngle;
        }
      } else {
        if (this.player === "left") {
          maxAngleAdjustment = maxSharpReflectionAngle;
        } else {
          maxAngleAdjustment = Math.PI - maxSharpReflectionAngle;
        }
      }

      newAngle = Phaser.Math.Linear(newAngle, maxAngleAdjustment, fraction);
    }

    ball.setNewVelocityByAngle(newAngle);

    this.eventBus?.emit("ball-reflect-on-paddle", this.player, newAngle);
  }
}

