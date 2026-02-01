import Phaser from "phaser";
import type { AbstractEffect } from "../effects/AbstractEffect";
import { BallInvisibleEffect } from "../effects/BallInvisible";
import { BallSpeedEffect } from "../effects/BallSpeed";
import { PaddleEffect } from "../effects/PaddleSize";
import { SpawnProjectile } from "../effects/SpawnProjectile";
import type { GameManager } from "../systems/GameManager";

export type EffectLoadout = {
  iconIndex: number;
  name: string;
  buffFactory: (gm: GameManager, player: "left" | "right") => AbstractEffect;
  debuffFactory: (gm: GameManager, player: "left" | "right") => AbstractEffect;
};

// TODO: Change for correct effects...
const effectLoadouts: EffectLoadout[] = [
  {
    iconIndex: 0,
    name: "619 / Dizzyness",
    buffFactory: (gm) =>
      new BallSpeedEffect(gm, gm.ball, "both").withDisplayName("619"),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.75,
        0.8,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Dizzyness"),
  },
  {
    iconIndex: 1,
    name: "Inflate / Deflate",
    buffFactory: (gm, player) =>
      new PaddleEffect(gm, 1.4, 0.9, gm.paddles[player]).withDisplayName(
        "Inflate",
      ),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.7,
        1,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Deflate"),
  },
  {
    iconIndex: 2,
    name: "Virus Attack / Mask Mandate",
    buffFactory: (gm, player) =>
      new SpawnProjectile(gm, gm.paddles[player]).withDisplayName(
        "Virus Attack",
      ),
    debuffFactory: (gm) =>
      new BallInvisibleEffect(gm, gm.ball).withDisplayName("Mask Mandate"),
  },
  {
    iconIndex: 3,
    name: "Thief / Trash Cans",
    buffFactory: (gm) =>
      new BallSpeedEffect(gm, gm.ball, "both").withDisplayName("Thief"),
    debuffFactory: (gm, player) =>
      new SpawnProjectile(
        gm,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Trash Cans"),
  },
  {
    iconIndex: 4,
    name: "Tear Gas / Gas Cloud",
    buffFactory: (gm, player) =>
      new SpawnProjectile(gm, gm.paddles[player]).withDisplayName("Tear Gas"),
    debuffFactory: (gm) =>
      new BallInvisibleEffect(gm, gm.ball).withDisplayName("Gas Cloud"),
  },
  {
    iconIndex: 5,
    name: "Sword Slash / Shield Strike",
    buffFactory: (gm, player) =>
      new PaddleEffect(gm, 1.2, 1.1, gm.paddles[player]).withDisplayName(
        "Sword Slash",
      ),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.9,
        0.65,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Shield Strike"),
  },
  {
    iconIndex: 6,
    name: "Rat / Possession",
    buffFactory: (gm) =>
      new BallSpeedEffect(gm, gm.ball, "both").withDisplayName("Rat"),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.85,
        0.6,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Possession"),
  },
  {
    iconIndex: 7,
    name: "Portals / Fake Paddle",
    buffFactory: (gm) =>
      new BallInvisibleEffect(gm, gm.ball).withDisplayName("Portals"),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.8,
        0.8,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Fake Paddle"),
  },
  {
    iconIndex: 8,
    name: "Axe Throw / Battle Cry",
    buffFactory: (gm, player) =>
      new SpawnProjectile(gm, gm.paddles[player]).withDisplayName("Axe Throw"),
    debuffFactory: (gm, player) =>
      new PaddleEffect(
        gm,
        0.8,
        0.7,
        gm.paddles[gm.otherPlayer(player)],
      ).withDisplayName("Battle Cry"),
  },
];

export function getDefaultLoadouts(): {
  left: EffectLoadout;
  right: EffectLoadout;
} {
  const left = Phaser.Utils.Array.GetRandom(effectLoadouts);
  let right = Phaser.Utils.Array.GetRandom(effectLoadouts);

  if (effectLoadouts.length > 1) {
    while (right.iconIndex === left.iconIndex) {
      right = Phaser.Utils.Array.GetRandom(effectLoadouts);
    }
  }

  return { left, right };
}

export function getDifferentLoadout(
  previous?: EffectLoadout | null,
): EffectLoadout {
  if (!previous) {
    return Phaser.Utils.Array.GetRandom(effectLoadouts);
  }

  const candidates = effectLoadouts.filter(
    (l) => l.iconIndex !== previous.iconIndex,
  );

  if (candidates.length === 0) {
    return previous;
  }

  return Phaser.Utils.Array.GetRandom(candidates);
}

export { effectLoadouts };

