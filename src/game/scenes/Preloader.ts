import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    // Set base path to empty - all assets loaded with their directory prefix
    this.load.setPath("");

    // Load image assets
    this.load.image("logo", "assets/logo.png");
    this.load.image("star", "assets/star.png");
    this.load.image("ball", "assets/ball.png");
    this.load.image("paddle", "assets/paddle.png");
    this.load.image("gasCloud", "assets/gas_cloud.png");
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
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}

