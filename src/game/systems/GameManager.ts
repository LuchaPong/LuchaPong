import { Events } from "phaser";
import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { AbstractEffect } from "../effects/AbstractEffect";
import { BallSpeedEffect } from "../effects/BallSpeed";
import { PaddleEffect } from "../effects/PaddleSize";
import type { Ball } from "../gameObjects/Ball";
import { Paddle } from "../gameObjects/Paddle";
import type { GameEvents } from "./GameEvents";

export class GameManager implements TypedEventEmitter<GameEvents> {
  protected eventBus = new Events.EventEmitter();

  ball: Ball;
  paddles: {
    left: Paddle;
    right: Paddle;
  };
  protected scene: Phaser.Scene;
  protected world: Phaser.Physics.Arcade.World;
  protected physics: Phaser.Physics.Arcade.ArcadePhysics;

  protected _activeEffects: AbstractEffect[] = [];

  get activeEffects() {
    return this._activeEffects;
  }

  constructor(params: {
    ball: Ball;
    paddles: { left: Paddle; right: Paddle };
    bounds: Phaser.GameObjects.Layer;
    scene: Phaser.Scene;
    physics: Phaser.Physics.Arcade.ArcadePhysics;
  }) {
    this.ball = params.ball;
    this.paddles = params.paddles;
    this.world = params.physics.world;
    this.scene = params.scene;
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

    this.on("paddle-skill-used", (player, skillNumber) => {
      const selfPaddle =
        player === "left" ? this.paddles.left : this.paddles.right;

      const newEffect =
        skillNumber === 1
          ? new PaddleEffect(this, 1.5, 0.75, selfPaddle)
          : new BallSpeedEffect(this, this.ball);

      if (this._activeEffects.some((e) => e.isExclusiveWith(newEffect))) {
        return;
      }

      this._activeEffects.push(newEffect);

      newEffect.apply();
    });
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

    console.log(`Event emitted: ${event}`, ...args);

    return this;
  }

  update(time: number, delta: number): void {
    this.ball.update(time, delta);
    this.paddles.left.update(time, delta);
    this.paddles.right.update(time, delta);

    let effectsToRemove: number[] = [];

    this._activeEffects.forEach((effect, i) => {
      effect.update(time, delta);

      if (effect.durationMs <= 0) {
        effectsToRemove.push(i);
      }
    });

    effectsToRemove.forEach((index) => {
      const effect = this._activeEffects.splice(index, 1);

      effect[0].remove();
    });
  }

  intialSetupGame() {
    this._activeEffects.forEach((effect) => {
      effect.remove();
    });
    this._activeEffects = [];

    this.ball.speed = 0;
    this.ball.setPosition(this.world.bounds.centerX, this.world.bounds.centerY);
    this.paddles.left.setPosition(50, this.world.bounds.centerY);
    this.paddles.right.setPosition(
      this.world.bounds.centerX +
        this.world.bounds.centerX -
        this.paddles.left.x,
      this.world.bounds.centerY,
    );

    console.log("Initial game setup done.");
    console.log("Emitting 'game-setup-round' event.");

    this.emit("game-setup-round");
  }

  startRound() {
    this.ball.setPosition(this.world.bounds.centerX, this.world.bounds.centerY);
    this.ball.setInitialVelocity();
  }

  ballLeftPlayArea(scoringPlayer: "left" | "right") {
    this.eventBus.emit("ball-scored", scoringPlayer);
    this.eventBus.emit("game-setup-round");
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

