import type { AbstractEffect } from "../effects/AbstractEffect";

export type GameEvents = {
	"game-setup-round": [];
	"game-start-round": [];
	"ball-scored": [scoringPlayer: "left" | "right"];
	"ball-left-play-area": [side: "left" | "right"];
	"ball-reflect-on-paddle": [side: "left" | "right", newAngle: number];
	"ball-reflect-on-scene-edge": [edge: "top" | "bottom", newAngle: number];

	"paddle-skill-used": [player: "left" | "right", skillNumber: 1 | 2];

	"spawn-projectile": [key: string, initialPosition: { x: number; y: number }, velocity: { x: number; y: number }];
  "effect-applied": [effect: AbstractEffect];
  "effect-removed": [effect: AbstractEffect];

  "player-lives-updated": [player: "left" | "right", lives: number];
  "player-icon-updated": [player: "left" | "right", iconIndex: number];
  "game-over": [winner: "left" | "right"];
};
