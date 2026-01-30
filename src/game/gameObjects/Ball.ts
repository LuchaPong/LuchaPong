import { EventBus } from "../EventBus";
import { Paddle } from "./Paddle";

export class Ball extends Phaser.Physics.Arcade.Sprite {
  physicsBody: Phaser.Physics.Arcade.Body;

  speed = 400;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ball");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.25);
    this.setCircle(this.width / 2);
    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.physicsBody = this.body as Phaser.Physics.Arcade.Body;
    this.physicsBody.onWorldBounds = true;

    scene.physics.world.on(
      "worldbounds",
      (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === this) {
          if (body.blocked.left || body.blocked.right) {
            EventBus.emit("ball-scored", body.blocked.left ? "right" : "left");
          }
        }
      },
    );
  }

  setInitialVelocity() {
    const leftOrRight = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    const randomAngle = Phaser.Math.Between(-3, 3) * (Math.PI / 180);

    this.physicsBody.setVelocity(
      leftOrRight * this.speed,
      this.speed * Math.sin(randomAngle),
    );
  }

  update(_time: number, _delta: number): void {
    const angle = Math.atan2(
      this.physicsBody.velocity.y,
      this.physicsBody.velocity.x,
    );
    this.setRotation(angle + Math.PI / 2);
  }

  onCollisionWithPaddle(paddle: Paddle) {
    const speedIncreaseFactor = 1.05;

    // adjust the reflection angle based on where the ball hits the paddle
    const relativeIntersectY = this.y - paddle.y;
    const normalizedRelativeIntersectionY =
      relativeIntersectY / (paddle.displayHeight / 2);

    const bounceAngle =
      normalizedRelativeIntersectionY * Phaser.Math.DEG_TO_RAD * 45; // max 10 degrees

    const speed =
      Math.sqrt(
        this.physicsBody.velocity.x ** 2 + this.physicsBody.velocity.y ** 2,
      ) +
      this.speed * (speedIncreaseFactor - 1);

    const direction = this.physicsBody.velocity.x > 0 ? 1 : -1; // determine direction based on current velocity

    this.physicsBody.setVelocity(
      direction * speed * Math.cos(bounceAngle),
      speed * Math.sin(bounceAngle),
    );
  }
}

