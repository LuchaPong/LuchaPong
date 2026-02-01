import type { Ball } from "../gameObjects/Ball";
import type { GameManager } from "../systems/GameManager";
import { AbstractEffect } from "./AbstractEffect";

export class BallSpeedEffect extends AbstractEffect {
  protected originalSpeed: number;
  protected totalDurationMs: number;
  protected elapsedMs: number = 0;
  protected readonly MAX_MULTIPLIER = 3.0; // 600%

  // Phase durations
  protected readonly RAMP_UP_DURATION_MS = 1000;
  protected readonly HOLD_DURATION_MS = 700;
  protected readonly RAMP_DOWN_DURATION_MS = 500;

  override get spriteName(): string {
    return this.getCurrentSpeedMultiplier() > 1
      ? "effect/ball-speed-up"
      : "effect/ball-slow-down";
  }

  constructor(
    gameManager: GameManager,
    protected ball: Ball,
  ) {
    super(gameManager);

    this.originalSpeed = ball.speed;
    // Total duration: ramp up + hold + ramp down
    this.totalDurationMs =
      this.RAMP_UP_DURATION_MS +
      this.HOLD_DURATION_MS +
      this.RAMP_DOWN_DURATION_MS;
    this._durationMs = this.totalDurationMs;
  }

  /**
   * Calculate speed multiplier with three phases:
   * 1. Ramp up from 1.0 to MAX_MULTIPLIER (700ms)
   * 2. Hold at MAX_MULTIPLIER (1000ms)
   * 3. Ramp down from MAX_MULTIPLIER to 1.0 (2000ms)
   */
  protected getCurrentSpeedMultiplier(): number {
    const elapsed = this.elapsedMs;

    // Phase 1: Ramp up (0ms to 700ms)
    if (elapsed < this.RAMP_UP_DURATION_MS) {
      const progress = elapsed / this.RAMP_UP_DURATION_MS;
      const easedProgress = Phaser.Math.Easing.Cubic.Out(progress);
      return Phaser.Math.Linear(1.0, this.MAX_MULTIPLIER, easedProgress);
    }

    // Phase 2: Hold at max (700ms to 1700ms)
    const holdStartTime = this.RAMP_UP_DURATION_MS;
    const holdEndTime = holdStartTime + this.HOLD_DURATION_MS;
    if (elapsed < holdEndTime) {
      return this.MAX_MULTIPLIER;
    }

    // Phase 3: Ramp down (1700ms to 3700ms)
    const rampDownStartTime = holdEndTime;
    const rampDownProgress =
      (elapsed - rampDownStartTime) / this.RAMP_DOWN_DURATION_MS;
    const easedProgress = Phaser.Math.Easing.Cubic.In(rampDownProgress);
    return Phaser.Math.Linear(this.MAX_MULTIPLIER, 1.0, easedProgress);
  }

  override apply(): void {
    super.apply();
    this.elapsedMs = 0;
    this.updateBallSpeed();
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    this.elapsedMs += delta;
    this.updateBallSpeed();
  }

  protected updateBallSpeed(): void {
    const multiplier = this.getCurrentSpeedMultiplier();
    this.ball.speed = this.originalSpeed * multiplier;

    // Update current velocity to match new speed while preserving direction
    const currentVelocity = this.ball.body.velocity.clone();
    if (currentVelocity.length() > 0) {
      const normalizedVelocity = currentVelocity.normalize();
      this.ball.body.setVelocity(
        normalizedVelocity.x * this.ball.speed,
        normalizedVelocity.y * this.ball.speed,
      );
    }
  }

  override remove(): void {
    super.remove();

    this.ball.speed = this.originalSpeed;

    // Update current velocity to match original speed while preserving direction
    const currentVelocity = this.ball.body.velocity.clone();
    if (currentVelocity.length() > 0) {
      const normalizedVelocity = currentVelocity.normalize();
      this.ball.body.setVelocity(
        normalizedVelocity.x * this.ball.speed,
        normalizedVelocity.y * this.ball.speed,
      );
    }
  }

  override isExclusiveWith(otherEffect: AbstractEffect): boolean {
    return otherEffect instanceof BallSpeedEffect;
  }

  toString(): string {
    const currentMultiplier = this.getCurrentSpeedMultiplier();
    return `Ball Speed Up (${(currentMultiplier * 100).toFixed(0)}%)`;
  }
}

