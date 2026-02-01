import { Scene } from "phaser";

export function createInteractiveButton(
  context: Scene,
  label: string,
  x: number,
  y: number,
  fn: Function,
  fontSize: number = 38,
): Phaser.GameObjects.Sprite {
  const btn = context.add.sprite(x, y, "button").setInteractive().setFrame(1);
  createText(context, label, x, y, fontSize);

  btn.on("pointerover", () => {
    btn.setFrame(0);
    context.sound.play("buttonSnap", { volume: 0.5, seek: 0.05 });
  });

  btn.on("pointerout", () => {
    btn.setFrame(1);
  });

  btn.on("pointerup", () => {
    fn();
    context.sound.play("buttonSelect", {
      volume: 0.5,
      detune: -1200,
      rate: 1.5,
    });
  });

  return btn;
}

export function createText(
  context: Scene,
  label: string,
  x: number,
  y: number,
  fontSize: number,
  fontFamily: string = "Rubik Black",
  strokeThickness = 7,
): Phaser.GameObjects.Text {
  return context.add
    .text(x, y, label, {
      fontFamily: fontFamily,
      fontSize: fontSize,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: strokeThickness,
      align: "center",
    })
    .setOrigin(0.5, 0.7);
}

export function storeTexture(
  context: Scene,
  label: string,
  image: HTMLImageElement,
) {
  // Check if the texture already exists and remove it to allow the update
  if (context.textures.exists(label)) {
    context.textures.remove(label);
  }
  context.textures.addImage(label, image);
}

