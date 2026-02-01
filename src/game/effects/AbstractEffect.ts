import type { GameManager } from "../systems/GameManager";

export abstract class AbstractEffect {
  protected gameManager: GameManager;
  protected _durationMs: number = 5000;

  abstract get spriteName(): string;

  get targetPlayer() {
    return this._targetPlayer;
  }

  get durationMs(): number {
    return this._durationMs;
  }

  constructor(
    gameManager: GameManager,
    protected _targetPlayer: "left" | "right" | "both",
  ) {
    this.gameManager = gameManager;
  }

  apply(): void {
    this.gameManager.emit("effect-applied", this);
  }
  remove(): void {
    this.gameManager.emit("effect-removed", this);
  }

  update(_time: number, delta: number) {
    if (this._durationMs !== Infinity) {
      this._durationMs -= delta;
    }
  }

  isExclusiveWith(otherEffect: AbstractEffect): boolean {
    return this === otherEffect;
  }
}
