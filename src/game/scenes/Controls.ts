import { GameObjects, Scene } from "phaser";

import { createInteractiveButton } from "../../utils/Utils";
import { EventBus } from "../EventBus";
import { setupBackground } from "../utils/setupBackground";

export class Controls extends Scene {
  background: GameObjects.Image;
  title: GameObjects.Text;
  backBtn: GameObjects.Sprite;

  constructor() {
    super("Controls");
  }

  create() {
    setupBackground(this);

    const width = this.scale.width;
    const height = this.scale.height;

    this.title = this.add
      .text(width / 2, height * 0.15, "CONTROLS", {
        fontFamily: "Arial Black",
        fontSize: 76,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 16,
        align: "center",
      })
      .setOrigin(0.5);

    this.createControls(width * 0.3, height * 0.3, "PLAYER 1", "#b42121", [
      { key: "W", action: "Move Up" },
      { key: "S", action: "Move Down" },
      { key: "Q", action: "Apply Buff" },
      { key: "E", action: "Apply Debuff" },
    ]);
    this.createControls(width * 0.7, height * 0.3, "PLAYER 2", "#2148b4", [
      { key: "I", action: "Move Up" },
      { key: "K", action: "Move Down" },
      { key: "U", action: "Apply Buff" },
      { key: "O", action: "Apply Debuff" },
    ]);

    this.backBtn = createInteractiveButton(
      this,
      "BACK",
      width / 2,
      height * 1.05,
      () => {
        this.scene.start("MainMenu");
      },
    );

    EventBus.emit("current-scene-ready", this);
  }

  createControls(
    x: number,
    y: number,
    playerLabel: string,
    playerColor: string,
    controls: Array<{ key: string; action: string }>,
  ) {
    this.add
      .text(x, y, playerLabel, {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: playerColor,
        stroke: "#ffffff",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);
    controls.forEach((value, index) => {
      const playerColorHex = parseInt(playerColor.replace("#", "0x"), 16);
      this.add
        .rectangle(x - 140, y + (index + 1) * 100, 60, 60, playerColorHex)
        .setRounded(5);
      this.add
        .text(x - 140, y + (index + 1) * 100, value.key, {
          fontFamily: "Arial Black",
          fontSize: 30,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
          align: "center",
        })
        .setOrigin(0.5);
      this.add.text(x - 100, y - 20 + (index + 1) * 100, value.action, {
        fontFamily: "Arial Black",
        fontSize: 30,
        color: playerColor,
        stroke: "#ffffff",
        strokeThickness: 8,
        align: "left",
      });
    });
  }
}

