import { Scene } from "phaser";
import { setupBackground } from "../utils/setupBackground";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    setupBackground(this);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(centerX, centerY, 600, 48).setStrokeStyle(2, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(centerX - 300 + 5, centerY, 6, 40, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      bar.width = 600 * progress - 4;
    });
  }

  preload() {
    // Set base path to empty - all assets loaded with their directory prefix
    this.load.setPath("");

    // Load image assets
    this.load.image("logo", "assets/logo.png");
    this.load.image("star", "assets/star.png");
    this.load.image("ball", "assets/ball.png");
    this.load.image("ball/blowfish", "assets/masks/blowfish.png");
    this.load.image("ball/corvo", "assets/masks/corvo.png");
    this.load.image("ball/covidMask", "assets/masks/covid-mask.png");
    this.load.image("ball/gasMask", "assets/masks/gas-mask.png");
    this.load.image("ball/knightHelmet", "assets/masks/knight-helmet.png");
    this.load.image("ball/portalWheatley", "assets/masks/portal-wheatley.png");
    this.load.image("ball/racoon", "assets/masks/racoon.png");
    this.load.image("ball/vikingHelmet", "assets/masks/viking-helmet.png");
    this.load.image("gasCloud", "assets/gas_cloud.png");
    this.load.image("virus", "assets/virus.png");
    this.load.spritesheet("paddles", "assets/paddles.png", {
      frameWidth: 1024 / 6,
      frameHeight: 1024 / 3,
      endFrame: 17,
    });
    this.load.spritesheet("button", "assets/button.png", {
      frameWidth: 511,
      frameHeight: 135,
    });
    this.load.image("player_red", "assets/player/player_red.png");
    this.load.image("player_blue", "assets/player/player_blue.png");
    this.load.spritesheet("icons", "assets/player/icons.png", {
      frameWidth: 1024 / 5,
      frameHeight: 1024 / 5,
      endFrame: 24,
    });
    this.load.svg("heart", "assets/heart.svg", { width: 64, height: 64 });
    this.load.svg("heart_broken", "assets/heart_broken.svg", {
      width: 64,
      height: 64,
    });
    this.load.image("explosion", "assets/animations/explosion.gif");

    const effectSprites = [
      "paddle-enlarge",
      "paddle-shrink",
      "ball-speed-up",
      "ball-slow-down",
      "spawn-projectile",
      "ball-invisible",
    ];

    effectSprites.forEach((spriteName) => {
      this.load.image(
        `effect/${spriteName}`,
        `assets/effects/${spriteName}.png`,
      );
    });

    // Load sound effects
    this.load.audio("speedBoost", "audio/speed_boost.mp3");
    this.load.audio("ballReflect", "audio/ball_reflect.mp3");
    this.load.audio("gameOver", "audio/game_over.mp3");
    this.load.audio("buttonSnap", "audio/button_snap.mp3");
    this.load.audio("buttonSelect", "audio/button_select.mp3");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}

