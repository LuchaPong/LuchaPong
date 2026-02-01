import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
	background: GameObjects.Image;
	logo: GameObjects.Image;
	startBtn: GameObjects.Sprite;
	settingsBtn: GameObjects.Sprite;
	quitBtn: GameObjects.Sprite;

	constructor() {
		super("MainMenu");
	}

	create() {
		const width = this.scale.width;
		const height = this.scale.height;

		this.background = this.add.image(width / 2, height / 2, "background");
		this.background.setDisplaySize(width, height);

		this.logo = this.add.image(width / 2, height * 0.1, "logo").setDepth(100);
		
    this.startBtn = this.createInteractiveButton("START", width / 2, height / 2, () => {
			this.scene.start("Game");
		});
		this.settingsBtn = this.createInteractiveButton("SETTINGS", width / 2, height / 2 + this.startBtn.frame.height, () => {
			// this.scene.start("Settings");
		});
		this.quitBtn = this.createInteractiveButton("QUIT", width / 2, height / 2 + 2 * this.startBtn.frame.height, () => {
		// this.scene.start("Quit");
		});

		EventBus.emit("current-scene-ready", this);
	}

	private createInteractiveButton(label: string, x: number, y: number, fn: Function): Phaser.GameObjects.Sprite {
		const btn = this.add.sprite(x, y, "button").setInteractive().setFrame(1);
		this.add
			.text(x, y, label, {
				fontFamily: "Arial Black",
				fontSize: 38,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center"
			})
			.setOrigin(0.5, 0.7);
		btn.on("pointerover", () => {
			btn.setFrame(0);
		});

		btn.on("pointerout", () => {
			btn.setFrame(1);
		});

		btn.on("pointerup", fn);

		return btn;
	}
	
}