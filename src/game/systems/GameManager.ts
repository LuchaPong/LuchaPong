import { Events } from "phaser";
import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { AbstractEffect } from "../effects/AbstractEffect";
import { BallSpeedEffect } from "../effects/BallSpeed";
import { PaddleEffect } from "../effects/PaddleSize";
import { SpawnProjectile } from "../effects/SpawnProjectile";
import type { Ball } from "../gameObjects/Ball";
import { Paddle } from "../gameObjects/Paddle";
import type { GameEvents } from "./GameEvents";
import { Projectile } from "../gameObjects/Projectile";

export class GameManager implements TypedEventEmitter<GameEvents> {
	protected eventBus = new Events.EventEmitter();

	ball: Ball;
	paddles: {
		left: Paddle;
		right: Paddle;
	};
	projectileConfig: {
		[key: string]: {
			scale: number;
			spriteName: string;
		};
	};
	protected scene: Phaser.Scene;
	protected world: Phaser.Physics.Arcade.World;
	protected physics: Phaser.Physics.Arcade.ArcadePhysics;

	protected _activeEffects: AbstractEffect[] = [];
	protected projectiles: Projectile[] = [];
	protected lives: Record<"left" | "right", number> = { left: 5, right: 5 };
	protected explosionDurationMs = 1400;

	get activeEffects() {
		return this._activeEffects;
	}

	constructor(params: {
		ball: Ball;
		paddles: { left: Paddle; right: Paddle };
		bounds: Phaser.GameObjects.Layer;
		scene: Phaser.Scene;
		physics: Phaser.Physics.Arcade.ArcadePhysics;
		projectileConfig: {
			[key: string]: {
				scale: number;
				spriteName: string;
			};
		};
	}) {
		this.ball = params.ball;
		this.paddles = params.paddles;
		this.projectileConfig = params.projectileConfig;

		this.world = params.physics.world;
		this.scene = params.scene;
		this.physics = params.physics;

		this.ball.eventBus = this;
		this.paddles.left.eventBus = this;
		this.paddles.right.eventBus = this;

		this.physics.add.overlap(this.ball, this.paddles.left, undefined, () => this.paddles.left.onCollisionWithBall(this.ball), true);
		this.physics.add.overlap(this.ball, this.paddles.right, undefined, () => this.paddles.right.onCollisionWithBall(this.ball), true);

		params.bounds.list.forEach(bound => {
			this.physics.add.collider(this.ball, bound, () => {
				this.onBallCollidedWithBound(bound.name);
			});
		});

		this.on("ball-left-play-area", side => {
			this.ballLeftPlayArea(side === "left" ? "right" : "left");
		});

		this.on("paddle-skill-used", (player, skillNumber) => {
			const selfPaddle = player === "left" ? this.paddles.left : this.paddles.right;

			// const newEffect = skillNumber === 1 ? new PaddleEffect(this, 1.5, 0.75, selfPaddle) : new BallSpeedEffect(this, this.ball);
			const newEffect = skillNumber === 1 ? new SpawnProjectile(this, selfPaddle) : new BallSpeedEffect(this, this.ball);

			if (this._activeEffects.some(e => e.isExclusiveWith(newEffect))) {
				return;
			}

			this._activeEffects.push(newEffect);

			newEffect.apply();
		});

		this.on("spawn-projectile", (key: string, initialPosition: { x: number; y: number }, velocity: { x: number; y: number }) => {
			this.projectiles.push(new Projectile(this.scene, this.projectileConfig[key].spriteName, this.projectileConfig[key].scale, initialPosition, velocity));
		});
	}

	on<K extends keyof GameEvents>(event: K, listener: (...args: GameEvents[K]) => void): this {
		this.eventBus.on(event, listener);

		return this;
	}

	emit<K extends keyof GameEvents>(event: K, ...args: GameEvents[K]): this {
		this.eventBus.emit(event, ...args);

		console.log(`Event emitted: ${event}`, ...args);

		return this;
	}

	update(time: number, delta: number): void {
		this.ball.update(time, delta);
		this.paddles.left.update(time, delta);
		this.paddles.right.update(time, delta);

		let effectsToRemove: number[] = [];

		this._activeEffects.forEach((effect, i) => {
			effect.update(time, delta);

			if (effect.durationMs <= 0) {
				effectsToRemove.push(i);
			}
		});
		this.projectiles.forEach(projectile => {
			projectile.update(time, delta);
		});

		effectsToRemove.forEach(index => {
			const effect = this._activeEffects.splice(index, 1);

			effect[0].remove();
		});
	}

	intialSetupGame() {
		this._activeEffects.forEach(effect => {
			effect.remove();
		});
		this._activeEffects = [];

		this.resetLives();

		this.ball.speed = 0;
		this.ball.setPosition(this.world.bounds.centerX, this.world.bounds.centerY);
		this.ball.setAlpha(1); // Ensure ball is visible
		this.paddles.left.setPosition(50, this.world.bounds.centerY);
		this.paddles.right.setPosition(this.world.bounds.centerX + this.world.bounds.centerX - this.paddles.left.x, this.world.bounds.centerY);

		console.log("Initial game setup done.");
		console.log("Emitting 'game-setup-round' event.");

		this.emit("game-setup-round");
	}

	startRound() {
		this.resetBallVisual();
		this.ball.body.checkCollision.none = false;

		this.ball.setPosition(this.world.bounds.centerX, this.world.bounds.centerY);
		this.ball.setInitialVelocity();
	}

	ballLeftPlayArea(scoringPlayer: "left" | "right") {
		this.ball.body.checkCollision.none = true;

		this.freezeBall();

		const losingPlayer = scoringPlayer === "left" ? "right" : "left";

		this.lives[losingPlayer] = Math.max(0, this.lives[losingPlayer] - 1);
		this.emit("player-lives-updated", losingPlayer, this.lives[losingPlayer]);

		this.playScoreExplosion(() => {
			if (this.lives[losingPlayer] <= 0) {
				this.emit("game-over", scoringPlayer);
				return;
			}
			this.emit("ball-scored", scoringPlayer);
			this.emit("game-setup-round");
		});
	}

	onBallCollidedWithBound(boundName: string) {
		if (boundName === "bound-left") {
			this.ballLeftPlayArea("right");
		} else if (boundName === "bound-right") {
			this.ballLeftPlayArea("left");
		} else if (boundName === "bound-top" || boundName === "bound-bottom") {
			const edge = boundName === "bound-top" ? "top" : "bottom";

			const normal = new Phaser.Math.Vector2(0, edge === "top" ? 1 : -1);
			const newDirection = this.ball.body.velocity.normalize().reflect(normal);

			const newAngle = Math.atan2(newDirection.y, newDirection.x);

			this.ball.setNewVelocityByAngle(newAngle);

			this.emit("ball-reflect-on-scene-edge", edge, newAngle);
		}
	}

	protected resetLives() {
		this.lives.left = 5;
		this.lives.right = 5;
		this.emit("player-lives-updated", "left", this.lives.left);
		this.emit("player-lives-updated", "right", this.lives.right);
	}

	protected freezeBall() {
		this.ball.body.setVelocity(0, 0);
		this.ball.setAlpha(0.35);
	}

	protected resetBallVisual() {
		this.ball.setAlpha(1);
	}

	protected playScoreExplosion(onComplete: () => void) {
		const scene = this.scene;
		const cam = scene.cameras.main;
		const { x, y } = this.ball.body.center;
		const duration = this.explosionDurationMs;

		// ease out of the shake
		cam.flash(200, 255, 255, 255);
		cam.shake(this.explosionDurationMs / 3, 0.15);
		this.scene.time.delayedCall(this.explosionDurationMs / 3, () => cam.shake(this.explosionDurationMs / 3, 0.09));
		this.scene.time.delayedCall((this.explosionDurationMs / 3) * 2, () => cam.shake(this.explosionDurationMs / 3, 0.04));

		const boom = scene.add.image(x, y, "explosion").setDepth(2000).setBlendMode(Phaser.BlendModes.ADD).setScale(2.4).setAlpha(1).setOrigin(0.5, 0.75);

		scene.tweens.add({
			targets: boom,
			scale: 1,
			alpha: 0,
			duration,
			onComplete: () => boom.destroy()
		});

		scene.time.delayedCall(duration, () => {
			onComplete();
		});
	}
}


