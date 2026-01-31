import { Events } from "phaser";
import type { TypedEventEmitter } from "../utils/TypedEventEmitter";

export type GlobalEvents = {
  "current-scene-ready": [scene_instance: Phaser.Scene];
};

// Used to emit events between components, HTML and Phaser scenes
export const EventBus =
  new Events.EventEmitter() as unknown as Events.EventEmitter &
    TypedEventEmitter<GlobalEvents>;
