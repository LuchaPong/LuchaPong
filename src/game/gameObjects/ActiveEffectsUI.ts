import type { GameManager } from "../systems/GameManager";
import { ACTIVE_EFFECT_SIZE, ActiveEffect } from "./ActiveEffect";

export class ActiveEffectsUI extends Phaser.GameObjects.Container {
  effectsText: Phaser.GameObjects.Text;

  activeEffects: ActiveEffect[] = [];

  constructor(
    protected gameManager: GameManager,
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y);

    this.name = "active-effects-container";

    scene.add.existing(this);

    gameManager.on("effect-applied", (effect) => {
      console.log("Effect applied:", effect, effect.spriteName);

      if (effect.spriteName === "") {
        return;
      }

      const activeEffect = new ActiveEffect(
        scene,
        this.activeEffects.length * (ACTIVE_EFFECT_SIZE * 1.5),
        ACTIVE_EFFECT_SIZE,
        effect,
      );
      activeEffect.alpha = 0;

      this.add(activeEffect);
      this.activeEffects.push(activeEffect);

      scene.tweens.add({
        targets: activeEffect,
        alpha: { from: 0, to: 1 },
        y: { from: 0, to: activeEffect.y },
        duration: 300,
        ease: "Power2",
      });
    });

    gameManager.on("effect-removed", (effect) => {
      const index = this.activeEffects.findIndex((ae) => ae.effect === effect);
      if (index === -1) {
        return;
      }

      const [removed] = this.activeEffects.splice(index, 1);

      removed.setData("is-being-removed", true);

      // Rearrange remaining effects
      this.activeEffects.forEach((ae, i) => {
        if (ae.getData("is-being-removed")) return;

        scene.tweens.add({
          targets: ae,
          x: i * (ACTIVE_EFFECT_SIZE * 1.5),
          duration: 300,
          ease: "Power2",
        });
      });

      scene.tweens.add({
        targets: removed,
        alpha: { from: 1, to: 0 },
        y: { from: removed.y, to: removed.y + ACTIVE_EFFECT_SIZE },
        duration: 300,
        ease: "Power2",
        onComplete: () => {
          this.remove(removed, true);
        },
      });
    });
  }

  updateActiveEffects() {}

  update(time: number, delta: number): void {
    this.activeEffects.forEach((ae) => {
      ae.update(time, delta);
    });
  }
}

