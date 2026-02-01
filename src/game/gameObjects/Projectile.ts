import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";

export class Projectile extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;
  protected projectileSprite: Phaser.GameObjects.Sprite;

  speed = 450;

  constructor(
    scene: Phaser.Scene,
    spriteName: string,
    scale: number,
    public initialPosition: { x: number; y: number },
    public velocity: { x: number; y: number },
  ) {
    super(scene, 0, 0);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.projectileSprite = new Phaser.GameObjects.Sprite(
      scene,
      0,
      0,
      spriteName,
    );
    this.add(this.projectileSprite);
    this.setScale(scale);
    this.setPosition(this.initialPosition.x, this.initialPosition.y);
    this.body.setVelocity(this.velocity.x, this.velocity.y);
    this.body.position.add(
      new Phaser.Math.Vector2(this.body.velocity).normalize().scale(4),
    );
  }
}

