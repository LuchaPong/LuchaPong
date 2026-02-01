import type { AbstractEffect } from "../effects/AbstractEffect";

export class ActiveEffect extends Phaser.GameObjects.Container {
  durationRect: Phaser.GameObjects.Graphics;
  rectMask: Phaser.GameObjects.Graphics;

  totalDurationMs: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public effect: AbstractEffect,
  ) {
    super(scene, x, y);
    this.setScrollFactor(0);

    this.totalDurationMs = effect.durationMs;

    this.name = `active-effect:${effect.spriteName}`;

    this.rectMask = new Phaser.GameObjects.Graphics(scene);

    this.rectMask.fillStyle(0, 1);
    this.rectMask.setScrollFactor(0, 0);

    const overShootSize = ACTIVE_EFFECT_SIZE * 0.125;
    const outerEdge = (ACTIVE_EFFECT_SIZE * 1.25) / 2;
    const innerEdge = outerEdge - overShootSize;

    this.durationRect = new Phaser.GameObjects.Graphics(scene)
      .fillStyle(0xffffff, 1)
      .beginPath()
      .moveTo(-outerEdge, -outerEdge) // top-left
      .lineTo(outerEdge, -outerEdge) // top-right
      .lineTo(outerEdge, outerEdge) // bottom-right
      .lineTo(-outerEdge, outerEdge) // bottom-left
      .lineTo(-outerEdge, -outerEdge) // back to top-left

      .lineTo(-innerEdge, -innerEdge) // move to inner top-left
      .lineTo(-innerEdge, innerEdge) // inner bottom-left
      .lineTo(innerEdge, innerEdge) // inner bottom-right
      .lineTo(innerEdge, -innerEdge) // inner top-right
      .lineTo(-innerEdge, -innerEdge) // back to inner top-left
      .fillPath()

      .setScale(1, 1)
      .setScrollFactor(0)
      .setDepth(-10);

    this.add(this.durationRect);
    this.durationRect.setMask(this.rectMask.createGeometryMask());

    const effectSprite = new Phaser.GameObjects.Sprite(
      scene,
      0,
      0,
      effect.spriteName,
    );
    effectSprite.name = `active-effect-sprite:${effect.spriteName}`;
    effectSprite
      .setDisplaySize(ACTIVE_EFFECT_SIZE, ACTIVE_EFFECT_SIZE)
      .setScrollFactor(0)
      .setDepth(1);
    this.add(effectSprite);

    const blinkOut = scene.tweens.add({
      targets: effectSprite,
      delay: effect.durationMs - 1000,
      alpha: { from: 1, to: 0.3 },
      duration: 250,
      yoyo: true,
      repeat: 4,
      ease: "Sine.easeInOut",
      onComplete: () => {
        blinkOut.stop();
        blinkOut.destroy();
      },
    });

    if (effect.displayName) {
      const effectText = new Phaser.GameObjects.Text(
        scene,
        0,
        0,
        effect.displayName,
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#ffffff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 3,
        },
      )
        .setOrigin(0.5, 0)
        .setY(ACTIVE_EFFECT_SIZE / 2 + ACTIVE_EFFECT_SIZE * 0.25)
        .setScrollFactor(0)
        .setDepth(1);
      this.add(effectText);
    }
  }

  update(_time: number, _delta: number): void {
    const { x, y } = this.getWorldPoint();

    this.rectMask.clear();
    this.rectMask.fillStyle(0, 1);
    this.rectMask.moveTo(x, y);
    this.rectMask.arc(
      x,
      y,
      ACTIVE_EFFECT_SIZE,
      Phaser.Math.DegToRad(270),
      Phaser.Math.DegToRad(
        360 * (1 - this.effect.durationMs / this.totalDurationMs) - 90,
      ),
      true,
    );
    this.rectMask.fillPath();
  }
}
export const ACTIVE_EFFECT_SIZE = 64;

