import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";

export class Ball extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  speed = 600;

  eventBus?: TypedEventEmitter<GameEvents>;

  protected ballSprite: Phaser.GameObjects.Sprite;
  ___debugDirection: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.physics.add.existing(this);
    scene.add.existing(this);

    this.width = 40;
    this.height = 40;
    this.body.setCircle(this.width / 2);
    this.body.setImmovable(true);

    this.ballSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, "ball");
    this.ballSprite.setScale(
      40 / this.ballSprite.width,
      40 / this.ballSprite.height,
    );

    this.add(this.ballSprite);

    this.___debugDirection = new Phaser.GameObjects.Graphics(scene);
    this.___debugDirection.lineStyle(2, 0x0000ff, 1);
    this.___debugDirection.strokeLineShape(new Phaser.Geom.Line(0, 0, 4000, 0));
    this.add(this.___debugDirection);
  }

  setInitialVelocity() {
    const leftOrRight = Phaser.Math.Between(0, 1) === 0 ? 0 : Math.PI;
    const randomAngle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);

    this.setNewVelocityByAngle(randomAngle + leftOrRight);
  }

  update(_time: number, _delta: number): void {}

  setNewVelocityByAngle(newAngle: number) {
    this.body.setVelocity(
      this.speed * Math.cos(newAngle),
      this.speed * Math.sin(newAngle),
    );
    this.body.position.add(
      new Phaser.Math.Vector2(this.body.velocity).normalize().scale(4),
    );

    this.ballSprite.setRotation(newAngle + Math.PI / 2);
    this.___debugDirection.setRotation(newAngle);
  }
}

