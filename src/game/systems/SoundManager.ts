import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "./GameEvents";
import { BallSpeedEffect } from "../effects/BallSpeed";
import { PaddleEffect } from "../effects/PaddleSize";
import type { AbstractEffect } from "../effects/AbstractEffect";

export class SoundManager {
  protected scene: Phaser.Scene;
  protected eventBus: TypedEventEmitter<GameEvents>;
  protected effectSoundConfig: Map<typeof AbstractEffect, { key: string; volume?: number; rate?: number }> = new Map();
  protected eventSoundConfig: Map<string, { key: string; volume?: number; rate?: number }> = new Map();

  constructor(scene: Phaser.Scene, eventBus: TypedEventEmitter<GameEvents>) {
    this.scene = scene;
    this.eventBus = eventBus;

    this.setupEventListeners();
    this.initializeSoundMapping();
  }

  /**
   * Initialize the mapping of effects and events to sound effects
   * Easy to extend by adding new entries here
   */
  protected initializeSoundMapping(): void {
    // Map effect types to sound keys
    this.effectSoundConfig.set(BallSpeedEffect, {
      key: "speedBoost",
      volume: 0.7,
      rate: 1.0,
    });

    this.effectSoundConfig.set(PaddleEffect, {
      key: "paddleSize",
      volume: 0.5,
      rate: 1.0,
    });

    // Map game events to sound keys
    this.eventSoundConfig.set("ball-reflect-on-paddle", {
      key: "paddleHit",
      volume: 0.6,
      rate: 1.0,
    });

    this.eventSoundConfig.set("ball-reflect-on-scene-edge", {
      key: "ballBounce",
      volume: 0.4,
      rate: 1.0,
    });

    this.eventSoundConfig.set("ball-scored", {
      key: "score",
      volume: 0.8,
      rate: 1.0,
    });
  }

  /**
   * Setup listeners for all game events that should trigger sounds
   */
  protected setupEventListeners(): void {
    // Listen to generic effect events
    this.eventBus.on("effect-applied", (effect) => {
      this.playEffectSound(effect);
    });

    // Listen to other game events
    this.eventBus.on("ball-reflect-on-paddle", () => {
      this.playSound("ball-reflect-on-paddle");
    });

    this.eventBus.on("ball-reflect-on-scene-edge", () => {
      this.playSound("ball-reflect-on-scene-edge");
    });

    this.eventBus.on("ball-scored", () => {
      this.playSound("ball-scored");
    });
  }

  /**
   * Play sound for an effect based on its type
   */
  protected playEffectSound(effect: AbstractEffect): void {
    // Find the sound config for this effect type
    for (const [EffectClass, config] of this.effectSoundConfig.entries()) {
      if (effect instanceof EffectClass) {
        this.playSoundByConfig(config);
        return;
      }
    }
  }

  /**
   * Play a sound effect based on the event name
   */
  protected playSound(eventName: string): void {
    const config = this.eventSoundConfig.get(eventName);
    
    if (!config) {
      return;
    }

    this.playSoundByConfig(config);
  }

  /**
   * Play a sound using a config object
   */
  protected playSoundByConfig(config: { key: string; volume?: number; rate?: number }): void {
    try {
      // Always try to unlock audio (safe to call even if already unlocked)
      this.scene.sound.unlock();

      // Check if sound exists and is loaded in the cache
      if (!this.scene.cache.audio.exists(config.key)) {
        return;
      }

      this.scene.sound.play(config.key, {
        volume: config.volume ?? 1.0,
        rate: config.rate ?? 1.0,
      });
    } catch (error) {
      // Silently handle playback errors
    }
  }

  /**
   * Add or update an effect sound configuration
   */
  setEffectSoundConfig(EffectClass: typeof AbstractEffect, config: { key: string; volume?: number; rate?: number }): void {
    this.effectSoundConfig.set(EffectClass, config);
  }

  /**
   * Add or update an event sound configuration
   */
  setEventSoundConfig(eventName: string, config: { key: string; volume?: number; rate?: number }): void {
    this.eventSoundConfig.set(eventName, config);
  }
}
