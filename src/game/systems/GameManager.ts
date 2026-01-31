import { Events } from "phaser";
import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { Ball } from "../gameObjects/Ball";
import type { Paddle } from "../gameObjects/Paddle";
import type { GameEvents } from "./GameEvents";

export class GameManager implements TypedEventEmitter<GameEvents> {
  protected eventBus = new Events.EventEmitter();

  ball: Ball;
  paddles: {
    left: Paddle;
    right: Paddle;
  };
  protected world: Phaser.Physics.Arcade.World;
  protected physics: Phaser.Physics.Arcade.ArcadePhysics;

  constructor(params: {
    ball: Ball;
    paddles: { left: Paddle; right: Paddle };
    bounds: Phaser.GameObjects.Layer;
    physics: Phaser.Physics.Arcade.ArcadePhysics;
  }) {
    this.ball = params.ball;
    this.paddles = params.paddles;
    this.world = params.physics.world;
    this.physics = params.physics;

    this.ball.eventBus = this;
    this.paddles.left.eventBus = this;
    this.paddles.right.eventBus = this;

    this.physics.add.overlap(
      this.ball,
      this.paddles.left,
      undefined,
      () => this.paddles.left.onCollisionWithBall(this.ball),
      true,
    );
    this.physics.add.overlap(
      this.ball,
      this.paddles.right,
      undefined,
      () => this.paddles.right.onCollisionWithBall(this.ball),
      true,
    );

    params.bounds.list.forEach((bound) => {
      this.physics.add.collider(this.ball, bound, () => {
        this.onBallCollidedWithBound(bound.name);
      });
    });

    this.on("ball-left-play-area", (side) => {
      this.ballLeftPlayArea(side === "left" ? "right" : "left");
    });

    this.setupNewRound();
  }

  on<K extends keyof GameEvents>(
    event: K,
    listener: (...args: GameEvents[K]) => void,
  ): this {
    this.eventBus.on(event, listener);

    return this;
  }

  emit<K extends keyof GameEvents>(event: K, ...args: GameEvents[K]): this {
    this.eventBus.emit(event, ...args);

    return this;
  }

  update(time: number, delta: number): void {
    this.ball.update(time, delta);
    this.paddles.left.update(time, delta);
    this.paddles.right.update(time, delta);
  }

  setupNewRound() {
    this.ball.setPosition(this.world.bounds.centerX, this.world.bounds.centerY);
    this.ball.setInitialVelocity();

    this.paddles.left.setPosition(50, this.world.bounds.centerY);
    this.paddles.right.setPosition(
      this.world.bounds.centerX +
        this.world.bounds.centerX -
        this.paddles.left.x,
      this.world.bounds.centerY,
    );
  }

  ballLeftPlayArea(scoringPlayer: "left" | "right") {
    this.eventBus.emit("ball-scored", scoringPlayer);

    this.setupNewRound();
  }

  onBallCollidedWithBound(boundName: string) {
    if (boundName === "bound-left") {
      this.ballLeftPlayArea("right");
    } else if (boundName === "bound-right") {
      this.ballLeftPlayArea("left");
    } else if (boundName === "bound-top" || boundName === "bound-bottom") {
      const edge = boundName === "bound-top" ? "top" : "bottom";

      const normal = new Phaser.Math.Vector2(0, edge === "top" ? 1 : -1);
      const newDirection = this.ball.body.velocity.normalize().reflect(normal);

      const newAngle = Math.atan2(newDirection.y, newDirection.x);

      this.ball.setNewVelocityByAngle(newAngle);

      this.emit("ball-reflect-on-scene-edge", edge, newAngle);
    }
  }
}

