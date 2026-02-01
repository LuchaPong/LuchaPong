import { Paddle } from "../gameObjects/Paddle";
import { GameManager } from "../systems/GameManager";
import { AbstractEffect } from "./AbstractEffect";

export class SpawnProjectile extends AbstractEffect {
  override get spriteName(): string {
    return "effect/spawn-projectile";
  }

  constructor(
    gameManager: GameManager,
    protected paddle: Paddle,
  ) {
    super(gameManager);
  }

  override apply(): void {
    super.apply();
    const initialPosition = { x: this.paddle.x, y: this.paddle.y };
    const velocity =
      this.paddle.name == "left-paddle" ? { x: 450, y: 0 } : { x: -450, y: 0 };
    this.gameManager.emit(
      "spawn-projectile",
      "gas_cloud",
      initialPosition,
      velocity,
    );
  }

  override remove(): void {
    super.remove();
  }

  toString(): string {
    return `Projectile Spawned`;
  }
}

