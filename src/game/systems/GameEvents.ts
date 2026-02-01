import type { AbstractEffect } from "../effects/AbstractEffect";

export type GameEvents = {
  "game-setup-round": [];
  "game-start-round": [];
  "ball-scored": [scoringPlayer: "left" | "right"];
  "ball-left-play-area": [side: "left" | "right"];
  "ball-reflect-on-paddle": [side: "left" | "right", newAngle: number];
  "ball-reflect-on-scene-edge": [edge: "top" | "bottom", newAngle: number];

  "paddle-skill-used": [player: "left" | "right", skillNumber: 1 | 2];

  "effect-applied": [effect: AbstractEffect];
  "effect-removed": [effect: AbstractEffect];
};

