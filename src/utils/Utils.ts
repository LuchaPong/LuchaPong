import { Scene } from "phaser";

export function createInteractiveButton(context: Scene, label: string, x: number, y: number, fn: Function): Phaser.GameObjects.Sprite {
	const btn = context.add.sprite(x, y, "button").setInteractive().setFrame(1);
	context.add
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

