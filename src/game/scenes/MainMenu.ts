import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

import { createInteractiveButton } from "../../utils/Utils";

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
		
    this.startBtn = createInteractiveButton(this, "START", width / 2, height / 2, () => {
			this.scene.start("Game");
		});
		this.settingsBtn = createInteractiveButton(this, "CONTROLS", width / 2, height / 2 + this.startBtn.frame.height, () => {
			this.scene.start("Controls");
		});
		this.quitBtn = createInteractiveButton(this, "QUIT", width / 2, height / 2 + 2 * this.startBtn.frame.height, () => {
		// this.scene.start("Quit");
		});

		EventBus.emit("current-scene-ready", this);
	}
	
}