import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "../systems/GameEvents";

export class Projectile extends Phaser.GameObjects.Container {
	declare body: Phaser.Physics.Arcade.Body;
	protected projectileSprite: Phaser.GameObjects.Sprite;

	speed = 450;

	constructor(scene: Phaser.Scene, spriteName: string, scale: number, initialPosition: { x: number; y: number }, velocity: { x: number; y: number }) {
		super(scene, 0, 0);
		scene.physics.add.existing(this);
		scene.add.existing(this);

		this.projectileSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, spriteName);
		this.add(this.projectileSprite);
		this.setScale(scale);
		this.setPosition(initialPosition.x, initialPosition.y);
		this.body.setVelocity(velocity.x, velocity.y);
		this.body.position.add(new Phaser.Math.Vector2(this.body.velocity).normalize().scale(4));
	}
}

