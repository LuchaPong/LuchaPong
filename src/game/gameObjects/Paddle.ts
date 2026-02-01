import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";
import type { Ball } from "./Ball";
import { Projectile } from "./Projectile";

export class Paddle extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  protected paddleSprite: Phaser.GameObjects.Sprite;

  eventBus?: TypedEventEmitter<GameEvents>;

  protected controlTexts: Record<string, Phaser.GameObjects.Text> = {};

  centerSize = 0.4;
  protected DEFAULT_SPEED = 500;
  protected speed: number = this.DEFAULT_SPEED;

  protected _debug = false;

  get player() {
    return this._player;
  }

  constructor(
    scene: Phaser.Scene,
    protected _player: "left" | "right",
    protected controls: {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      skill1: Phaser.Input.Keyboard.Key;
      skill2: Phaser.Input.Keyboard.Key;
    },
  ) {
    super(scene, 0, 0);

    this.name = `${_player}-paddle`;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.width = 50;
    this.height = 150;

    this.body.setSize(this.width, this.height);
    this.body.setImmovable(true);
    this.body.setCollideWorldBounds(true);

    this.paddleSprite = new Phaser.GameObjects.Sprite(
      scene,
      0,
      0,
      "paddles",
      0,
    );
    this.paddleSprite.setAlpha(1);
    this.add(this.paddleSprite);
    this.rescaleSprite();

    const offsetSides = (this.centerSize + 1) / 4;

    this.addTextForControl(0, this.height * offsetSides, this.controls.down)
      .addTextForControl(0, -(this.height * offsetSides), this.controls.up)
      .addTextForControl(
        0,
        (this.height / 2) * (this.centerSize / 2),
        this.controls.skill1,
      )
      .addTextForControl(
        0,
        -((this.height / 2) * (this.centerSize / 2)),
        this.controls.skill2,
      );
  }

  addTextForControl(x: number, y: number, key: Phaser.Input.Keyboard.Key) {
    const fontSize = 16;

    const text = new Phaser.GameObjects.Text(
      this.scene,
      x,
      y,
      String.fromCharCode(key.keyCode),
      {
        fontSize: `${fontSize}px`,
        fontFamily: "Arial Black",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      },
    ).setOrigin(0.5, 0.5);

    this.add(text);

    this.controlTexts[String.fromCharCode(key.keyCode)] = text;

    return this;
  }

  update(_time: number, _delta: number): void {
    if (this.controls.up.isDown) {
      this.body.setVelocityY(-this.speed);
    } else if (this.controls.down.isDown) {
      this.body.setVelocityY(this.speed);
    } else {
      this.body.setVelocityY(0);
    }

    Object.values(this.controls).forEach((control) => {
      const text = this.controlTexts[String.fromCharCode(control.keyCode)];

      if (this.scene.physics.config.debug) {
        text.setVisible(true);
      } else {
        text.setVisible(false);
      }
      if (control.isDown) {
        text.setScale(0.9);
        text.setAlpha(0.3);
      } else {
        text.setScale(1);
        text.setAlpha(0.5);
      }
    });

    if (Phaser.Input.Keyboard.JustDown(this.controls.skill1)) {
      this.eventBus?.emit("paddle-skill-used", this.player, 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.controls.skill2)) {
      this.eventBus?.emit("paddle-skill-used", this.player, 2);
    }
  }

  setLength(factor: number) {
    this.scene.tweens.add({
      targets: this,
      duration: 150,
      ease: "Sine.easeInOut",
      props: {
        height: 150 * factor,
      },
      onUpdate: () => {
        this.body.setSize(this.width, this.height);
      },
    });
    this.scene.tweens.add({
      targets: this.paddleSprite,
      duration: 150,
      ease: "Sine.easeInOut",
      props: {
        scaleY: (150 * factor) / this.paddleSprite.height,
      },
    });
  }

  setSpeed(factor: number) {
    this.speed = this.DEFAULT_SPEED * factor;
  }

  onCollisionWithBall(ball: Ball): void {
    if (this.player === "left" && ball.x < this.x + this.width / 2) return;
    if (this.player === "right" && ball.x > this.x - this.width / 2) return;

    const currentAngle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);

    const maxSharpReflectionAngle = Phaser.Math.DegToRad(45);
    const normalAreaHeight = this.height * this.centerSize;
    const edgeAreaHeight = (this.height - normalAreaHeight) / 2;

    const relativeY = ball.y - this.y;

    // adjust the reflection angle based on where the ball hits the paddle
    // central part of the paddle reflects normally, edges reflect at sharper angles

    let fraction = Phaser.Math.Clamp(
      (Math.abs(relativeY) - normalAreaHeight / 2) / edgeAreaHeight,
      0,
      1,
    );

    const normal = new Phaser.Math.Vector2(this.player === "left" ? 1 : -1, 0);

    if (relativeY < 0) {
      if (this.player === "left") {
        normal.rotate(fraction * -maxSharpReflectionAngle);
      } else {
        normal.rotate(fraction * maxSharpReflectionAngle);
      }
    } else {
      if (this.player === "left") {
        normal.rotate(fraction * maxSharpReflectionAngle);
      } else {
        normal.rotate(fraction * -maxSharpReflectionAngle);
      }
    }
    let newDirection = ball.body.velocity.normalize().reflect(normal);

    const newAngle = Math.atan2(newDirection.y, newDirection.x);

    if (this._debug) {
      const debugLine = this.scene.add
        .graphics({
          x: ball.x,
          y: ball.y,
          lineStyle: { width: 2, color: 0xff0000 },
        })
        .strokeLineShape(
          new Phaser.Geom.Line(
            0,
            0,
            Math.cos(currentAngle) * -100,
            Math.sin(currentAngle) * -100,
          ),
        )
        .lineStyle(2, 0x00ff00, 1)
        .strokeLineShape(
          new Phaser.Geom.Line(
            0,
            0,
            Math.cos(newAngle) * 100,
            Math.sin(newAngle) * 100,
          ),
        )
        .lineStyle(2, 0x0000ff, 1)
        .strokeLineShape(
          new Phaser.Geom.Line(0, 0, normal.x * 50, normal.y * 50),
        )
        .setDepth(1000)
        .setScrollFactor(0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.8)
        .setDepth(-10);

      this.scene.time.addEvent({
        delay: 3000,
        callback: () => {
          debugLine.destroy();
        },
      });
    }

    this.body.checkCollision.none = true;
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.body.checkCollision.none = false;
      },
    });

    ball.setNewVelocityByAngle(newAngle);

    this.eventBus?.emit("ball-reflect-on-paddle", this.player, newAngle);
  }

  setSkinFrame(frameIndex: number) {
    this.paddleSprite.setFrame(frameIndex);
    this.rescaleSprite();
  }

  protected rescaleSprite() {
    this.paddleSprite.setScale(
      (this.width / this.paddleSprite.width) * 1.4,
      (this.height / this.paddleSprite.height) * 1.2,
    );
  }
}

