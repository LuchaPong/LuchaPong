import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";

const START_SPEED = 450;
export class Ball extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  speed = START_SPEED;

  eventBus?: TypedEventEmitter<GameEvents>;

  protected ballSprite: Phaser.GameObjects.Sprite;
  ___debugDirection: Phaser.GameObjects.Graphics;

  protected readonly targetSize = 40;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.physics.add.existing(this);
    scene.add.existing(this);

    this.width = this.targetSize;
    this.height = this.targetSize;
    this.body.setCircle(this.width / 2);
    this.body.setImmovable(true);

    this.ballSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, "ball");
    this.applyBallSpriteScale();
    this.add(this.ballSprite);

    this.___debugDirection = new Phaser.GameObjects.Graphics(scene);
    this.___debugDirection.lineStyle(2, 0x0000ff, 1);
    this.___debugDirection.strokeLineShape(new Phaser.Geom.Line(0, 0, 4000, 0));
    if (!scene.physics.config.debug) {
      this.___debugDirection.setAlpha(0);
    }
    this.add(this.___debugDirection);
  }

  setInitialVelocity() {
    this.speed = START_SPEED;
    const leftOrRight = Phaser.Math.Between(0, 1) === 0 ? 0 : Math.PI;
    const randomAngle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);

    this.setNewVelocityByAngle(randomAngle + leftOrRight);
  }

  protected SPAWN_STEP_INTERVAL = 30;
  protected timeSinceLastStepSpawn = 0;
  protected lastStepWasLeft = false;

  update(_time: number, delta: number): void {
    this.timeSinceLastStepSpawn += delta;

    if (this.timeSinceLastStepSpawn >= this.SPAWN_STEP_INTERVAL) {
      this.timeSinceLastStepSpawn = 0;

      const offset = this.lastStepWasLeft ? -1 : 1;

      const normalizedVelocity = this.body.velocity.clone().normalize();
      const direction = normalizedVelocity
        .clone()
        .rotate(Math.PI / 2)
        .scale(offset * 4);

      const position = new Phaser.Math.Vector2(this.x, this.y)
        .subtract(normalizedVelocity.clone().scale(8))
        .add(direction);

      const step = this.scene.add
        .graphics()
        .fillStyle(0xffff00, 1)
        .fillCircle(position.x, position.y, 3)
        .fillCircle(
          position.x - normalizedVelocity.x * 4,
          position.y - normalizedVelocity.y * 4,
          2,
        )
        .setAlpha(0.5)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-10);

      this.scene.tweens.add({
        targets: step,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          step.destroy();
        },
      });

      this.lastStepWasLeft = !this.lastStepWasLeft;
    }
  }

  setNewVelocityByAngle(newAngle: number) {
    this.speed += 10;
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

  protected applyBallSpriteScale() {
    this.ballSprite.setScale(
      this.targetSize / this.ballSprite.width,
      this.targetSize / this.ballSprite.height,
    );
  }

  setSkin(textureKey: string) {
    this.ballSprite.setTexture(textureKey);
    this.applyBallSpriteScale();
  }
}
