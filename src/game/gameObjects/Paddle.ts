export class Paddle extends Phaser.Physics.Arcade.Sprite {
  physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "paddle");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(25 / 256, 150 / 256);
    this.setCollideWorldBounds(true);
    this.setBodySize(this.width, this.height);
    this.physicsBody = this.body as Phaser.Physics.Arcade.Body;
    this.physicsBody.setImmovable(true);
  }

  update(_time: number, _delta: number): void {}
}

