import type { Ball } from "../gameObjects/Ball";
import type { GameManager } from "../systems/GameManager";
import { AbstractEffect } from "./AbstractEffect";

export class BallInvisibleEffect extends AbstractEffect {
  override get spriteName(): string {
    return "effect/ball-invisible";
  }

  constructor(
    gameManager: GameManager,
    protected ball: Ball,
  ) {
    super(gameManager);
    this._durationMs = 500; // 0.5 seconds of invisibility
  }

  override apply(): void {
    super.apply();
    // Make ball invisible by setting alpha to 0
    this.ball.setAlpha(0);
  }

  override remove(): void {
    super.remove();
    // Restore ball visibility
    this.ball.setAlpha(1);
  }

  override isExclusiveWith(otherEffect: AbstractEffect): boolean {
    return otherEffect instanceof BallInvisibleEffect;
  }

  toString(): string {
    return "Ball Invisible";
  }
}
