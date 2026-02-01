import { Scene } from "phaser";

export function createInteractiveButton(
  context: Scene,
  label: string,
  x: number,
  y: number,
  fontSize: number = 38,
  fn: Function,
): Phaser.GameObjects.Sprite {
  const btn = context.add.sprite(x, y, "button").setInteractive().setFrame(1);
  createText(context, label, x, y, fontSize);

  btn.on("pointerover", () => {
    btn.setFrame(0);
  });

  btn.on("pointerout", () => {
    btn.setFrame(1);
  });

  btn.on("pointerup", fn);

  return btn;
}

export function createText(
  context: Scene,
  label: string,
  x: number,
  y: number,
  fontSize: number,
) {
  context.add
    .text(x, y, label, {
      fontFamily: "Arial Black",
      fontSize: fontSize,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center",
    })
    .setOrigin(0.5, 0.7);
}

