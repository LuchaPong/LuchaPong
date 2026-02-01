import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";
import { createInteractiveButton } from "../../utils/Utils";
import { setupBackground } from "../utils/setupBackground";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  startBtn: GameObjects.Sprite;
  settingsBtn: GameObjects.Sprite;
  quitBtn: GameObjects.Sprite;
  timer: Phaser.Time.TimerEvent;

  constructor() {
    super("MainMenu");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    setupBackground(this);

    this.logo = this.add.image(width / 2, height * 0.2, "logo").setDepth(100);
    this.logo.setDisplaySize(width * 0.4, height * 0.4);
    this.logo.postFX.addShine(1, 0.2, 5);

    this.startBtn = createInteractiveButton(
      this,
      "START",
      width / 2,
      height / 2,
      () => {
        this.scene.start("Game");
      },
    );
    this.settingsBtn = createInteractiveButton(
      this,
      "CONTROLS",
      width / 2,
      height / 2 + this.startBtn.frame.height,
      () => {
        this.scene.start("Controls");
      },
    );
    this.quitBtn = createInteractiveButton(
      this,
      "QUIT",
      width / 2,
      height / 2 + 2 * this.startBtn.frame.height,
      () => {
        // this.scene.start("Quit");
      },
    );

    EventBus.emit("current-scene-ready", this);
  }
}

