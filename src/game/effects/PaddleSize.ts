import type { Paddle } from "../gameObjects/Paddle";
import type { GameManager } from "../systems/GameManager";
import { AbstractEffect } from "./AbstractEffect";

export class PaddleEffect extends AbstractEffect {
  constructor(
    gameManager: GameManager,
    protected sizeMultiplier: number,
    protected speedMultiplier: number,
    protected paddle: Paddle,
  ) {
    super(gameManager);

    this._durationMs = 8000;
  }

  override apply(): void {
    super.apply();

    this.paddle.setLength(this.sizeMultiplier);
    this.paddle.setSpeed(this.speedMultiplier);
  }

  override remove(): void {
    super.remove();

    this.paddle.setLength(1);
    this.paddle.setSpeed(1);
  }

  override isExclusiveWith(otherEffect: AbstractEffect): boolean {
    if (otherEffect instanceof PaddleEffect) {
      return this.paddle === otherEffect.paddle;
    }

    return false;
  }

  toString(): string {
    if (this.sizeMultiplier > 1) {
      return `Paddle Size Up (${this.paddle.player})`;
    } else if (this.sizeMultiplier < 1) {
      return `Paddle Size Down (${this.paddle.player})`;
    }

    return `Paddle Effect (${this.paddle.player})`;
  }
}

