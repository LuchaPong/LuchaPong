import { Scene } from "phaser";
import { storeTexture } from "../../utils/Utils";
import { EventBus } from "../EventBus";
import { ActiveEffectsUI } from "../gameObjects/ActiveEffectsUI";
import { Ball } from "../gameObjects/Ball";
import { Bound } from "../gameObjects/Bound";
import { Paddle } from "../gameObjects/Paddle";
import { GameManager } from "../systems/GameManager";
import { SoundManager } from "../systems/SoundManager";

export const fontStyle = {
  fontFamily: "Arial",
  fontSize: 48,
  color: "#ffffff",
  fontStyle: "bold",
  shadow: {
    color: "#000000",
    fill: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
} as const;
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  gameManager: GameManager;
  soundManager: SoundManager;
  effectsText: Phaser.GameObjects.Text;
  timer: Phaser.Time.TimerEvent;
  timerText: Phaser.GameObjects.Text;

  cardSize = { width: 450, height: 315 };
  playerCards: Record<
    "left" | "right",
    | {
        container: Phaser.GameObjects.Container;
        heartsRow: Phaser.GameObjects.Container;
      }
    | undefined
  > = { left: undefined, right: undefined };
  activeEffectsUI: ActiveEffectsUI;
  constructor() {
    super("Game");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    this.load.image("background", "assets/background.png");
  }

  create() {
    const bgPadX = 250;
    const bgPadY = 100;
    const { width, height } = this.scale;

    // magic numbers to align bg to game bounds
    const topPadding = height * 0.1;
    this.physics.world.setBounds(
      0,
      topPadding * 1.25,
      width,
      height - topPadding * 2,
    );
    const worldBounds = this.physics.world.bounds;

    this.background = this.add
      .image(width / 2, (height + topPadding) / 2, "background")
      .setDepth(-1000);

    this.background
      .setDisplaySize(worldBounds.width * 1.2, worldBounds.height * 1.21)
      .setY(worldBounds.centerY * 1.02);

    this.camera = this.cameras.main;
    this.camera.setZoom(0.85);
    this.camera.setScroll(0, this.scale.height * 0.1);
    this.camera.setViewport(0, 0, this.scale.width, this.scale.height);

    this.sound.unlock();

    const bounds = this.add.layer([
      new Bound(
        this,
        worldBounds.centerX,
        worldBounds.top - 10,
        worldBounds.width * 2,
        20,
      ).setName("bound-top"),
      new Bound(
        this,
        worldBounds.centerX,
        worldBounds.bottom + 10,
        worldBounds.width * 2,
        20,
      ).setName("bound-bottom"),
      new Bound(
        this,
        worldBounds.left - 50,
        worldBounds.centerY,
        20,
        worldBounds.height * 2,
      ).setName("bound-left"),
      new Bound(
        this,
        worldBounds.right + 50,
        worldBounds.centerY,
        20,
        worldBounds.height * 2,
      ).setName("bound-right"),
    ]);

    this.timerText = this.add
      .text(worldBounds.centerX, worldBounds.top + 8, "3", fontStyle)
      .setOrigin(0.5, 0);

    this.playerCards.left = this.createPlayerCard(
      worldBounds.left + 12,
      worldBounds.bottom - this.cardSize.height / 2,
      "Player 1",
      "player_red",
      "left",
      5,
    );
    this.playerCards.right = this.createPlayerCard(
      worldBounds.right - this.cardSize.width,
      worldBounds.bottom - this.cardSize.height / 2,
      "Player 2",
      "player_blue",
      "right",
      5,
    );

    this.gameManager = new GameManager({
      ball: new Ball(this),
      paddles: {
        left: new Paddle(this, "left", {
          up: this.input.keyboard!.addKey("W"),
          down: this.input.keyboard!.addKey("S"),
          skill1: this.input.keyboard!.addKey("Q"),
          skill2: this.input.keyboard!.addKey("E"),
        }),
        right: new Paddle(this, "right", {
          up: this.input.keyboard!.addKey("I"),
          down: this.input.keyboard!.addKey("K"),
          skill1: this.input.keyboard!.addKey("U"),
          skill2: this.input.keyboard!.addKey("O"),
        }),
      },
      projectileConfig: {
        "gas_cloud": {
          spriteName: "gasCloud",
          scale: 0.1
        }
      },
      bounds,
      scene: this,
      physics: this.physics,
    });

    this.activeEffectsUI = new ActiveEffectsUI(
      this.gameManager,
      this,
      worldBounds.centerX,
      worldBounds.bottom -
        this.cardSize.height / 2 +
        this.cardSize.height * 0.25,
    );

    // Initialize sound manager to react to game events
    this.soundManager = new SoundManager(this, this.gameManager);

    this.gameManager.on("ball-reflect-on-paddle", () => {
      this.camera.shake(150, 0.001);
    });

    this.gameManager.on("ball-reflect-on-scene-edge", () => {
      this.camera.shake(150, 0.0025);
    });

    this.gameManager.on("game-setup-round", () => {
      console.log("Received 'game-setup-round' event.");
      this.setupNewRound();
    });

    this.gameManager.on("game-start-round", () => {
      this.gameManager.startRound();
    });

    this.gameManager.on("player-lives-updated", (player, lives) => {
      this.updatePlayerCardLives(player, lives);
    });

    this.gameManager.on("game-over", (winner) => {
      this.changeScene(winner);
    });

    this.gameManager.intialSetupGame();

    EventBus.emit("current-scene-ready", this);
  }

  setupNewRound() {
    this.timer = this.time.addEvent({
      delay: 3000,
      callback: () => this.gameManager.emit("game-start-round"),
      callbackScope: this,
    });
  }

  changeScene(winner?: "left" | "right") {
    // TODO(dtbuday): Delay the scene render.
    this.game.renderer.snapshot(
      (image: HTMLImageElement | Phaser.Display.Color) => {
        storeTexture(this, "lastGameFrame", image as HTMLImageElement);
        this.scene.start("GameOver", { winner });
      },
    );
  }

  update(time: number, delta: number): void {
    if (this.timer) {
      if (this.timer.getProgress() === 1) {
        this.timerText.setText("");
      } else {
        const remaining = Math.ceil(3 - this.timer.getElapsedSeconds()).toFixed(
          0,
        );

        this.timerText.setText(remaining);
      }
    }

    this.gameManager.update(time, delta);
    this.activeEffectsUI.update(time, delta);
  }

  createPlayerCard(
    x: number,
    y: number,
    label: string,
    textureKey: string,
    player: "left" | "right",
    heartsLeft: number,
  ) {
    const totalHearts = 5;
    const clampedHearts = Phaser.Math.Clamp(heartsLeft, 0, totalHearts);

    const sourceImg = this.textures.get(textureKey).getSourceImage();
    const targetRatio = this.cardSize.width / this.cardSize.height;
    const sourceRatio = sourceImg.width / sourceImg.height;

    let cropX = 0;
    let cropY = 0;
    let cropW = sourceImg.width;
    let cropH = sourceImg.height;

    if (targetRatio > sourceRatio) {
      cropH = sourceImg.width / targetRatio;
      cropY = (sourceImg.height - cropH) / 2;
    } else if (targetRatio < sourceRatio) {
      cropW = sourceImg.height * targetRatio;
      cropX = (sourceImg.width - cropW) / 2;
    }

    const cardBg = this.add.image(0, 0, textureKey).setOrigin(0, 0);
    cardBg.setCrop(cropX, cropY, cropW, cropH);
    cardBg.setDisplaySize(this.cardSize.width, this.cardSize.height);

    const name = this.add
      .text(this.cardSize.width * 0.35, this.cardSize.height * 0.35, label, {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0, 0);

    const heartsRow = this.createHeartsRow(totalHearts, clampedHearts);
    const heartsRowWidth =
      heartsRow.width && heartsRow.width > 0
        ? heartsRow.width
        : heartsRow.getBounds().width;
    heartsRow.setPosition(
      (this.cardSize.width - heartsRowWidth) / 2,
      this.cardSize.height * 0.44,
    );

    const container = this.add
      .container(x, y, [cardBg, name, heartsRow])
      .setDepth(950)
      .setScrollFactor(0);

    this.playerCards[player] = { container, heartsRow };

    return this.playerCards[player]!;
  }

  protected createHeartsRow(total: number, heartsLeft: number) {
    const targetHeight = 48;
    const row = this.add.container(0, 0);

    let cursorX = 0;
    for (let i = 0; i < total; i++) {
      const key = i < heartsLeft ? "heart" : "heart_broken";
      const heart = this.add.image(0, 0, key).setOrigin(0, 0.5);

      const source = this.textures.get(key).getSourceImage();
      const scale = targetHeight / source.height;
      heart.setScale(scale);

      heart.setPosition(cursorX, 0);
      row.add(heart);

      cursorX += heart.displayWidth;
    }

    row.setSize(Math.max(cursorX, 0), targetHeight);

    return row;
  }

  protected updatePlayerCardLives(player: "left" | "right", lives: number) {
    const card = this.playerCards[player];
    if (!card) return;

    card.heartsRow.destroy();
    const newRow = this.createHeartsRow(5, lives);

    newRow.setPosition(this.cardSize.width * 0.34, this.cardSize.height * 0.52);
    card.container.add(newRow);
    this.playerCards[player] = { container: card.container, heartsRow: newRow };
  }
}

