export type GameEvents = {
  "ball-scored": [scoringPlayer: "left" | "right"];
  "ball-left-play-area": [side: "left" | "right"];
  "ball-reflect-on-paddle": [side: "left" | "right", newAngle: number];
  "ball-reflect-on-scene-edge": [edge: "top" | "bottom", newAngle: number];
};

