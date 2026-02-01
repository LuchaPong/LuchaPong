import type { Ball } from "../gameObjects/Ball";
import type { GameManager } from "../systems/GameManager";
import { AbstractEffect } from "./AbstractEffect";

export class BallSpeedEffect extends AbstractEffect {
  protected originalSpeed: number;
  protected speedMultiplier: number;

  constructor(
    gameManager: GameManager,
    speedMultiplier: number,
    protected ball: Ball,
  ) {
    super(gameManager);

    this.speedMultiplier = speedMultiplier;
    this.originalSpeed = ball.speed;
    this._durationMs = 700;
  }

  override apply(): void {
    super.apply();

    this.ball.speed = this.originalSpeed * this.speedMultiplier;
    
    // Update current velocity to match new speed while preserving direction
    const currentVelocity = this.ball.body.velocity.clone();
    const normalizedVelocity = currentVelocity.normalize();
    this.ball.body.setVelocity(
      normalizedVelocity.x * this.ball.speed,
      normalizedVelocity.y * this.ball.speed,
    );
  }

  override remove(): void {
    super.remove();

    this.ball.speed = this.originalSpeed;
    
    // Update current velocity to match original speed while preserving direction
    const currentVelocity = this.ball.body.velocity.clone();
    const normalizedVelocity = currentVelocity.normalize();
    this.ball.body.setVelocity(
      normalizedVelocity.x * this.ball.speed,
      normalizedVelocity.y * this.ball.speed,
    );
  }

  override isExclusiveWith(otherEffect: AbstractEffect): boolean {
    return otherEffect instanceof BallSpeedEffect;
  }

  toString(): string {
    if (this.speedMultiplier > 1) {
      return `Ball Speed Up (${(this.speedMultiplier * 100).toFixed(0)}%)`;
    } else if (this.speedMultiplier < 1) {
      return `Ball Speed Down (${(this.speedMultiplier * 100).toFixed(0)}%)`;
    }

    return `Ball Speed Effect`;
  }
}
