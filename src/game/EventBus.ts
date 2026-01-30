import { Events } from "phaser";

interface TypedEventEmitter<E extends { [eventName in keyof E]: any[] }>
  extends Events.EventEmitter {
  on<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this;
  on(event: string & {}, listener: (...args: any[]) => void): this;
  emit<K extends keyof E>(eventName: K, ...args: E[K]): boolean;
  emit(event: string & {}, ...args: any[]): boolean;
}

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter() as TypedEventEmitter<{
  "current-scene-ready": [scene_instance: Phaser.Scene];
  "ball-scored": [scoringPlayer: "left" | "right"];
}>;
