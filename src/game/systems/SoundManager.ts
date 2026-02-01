import type { TypedEventEmitter } from "../../utils/TypedEventEmitter";
import type { GameEvents } from "./GameEvents";
import { BallSpeedEffect } from "../effects/BallSpeed";
import { PaddleEffect } from "../effects/PaddleSize";
import type { AbstractEffect } from "../effects/AbstractEffect";

type SoundConfig = {
  key: string;
  volume?: number;
  rate?: number;
  detune?: number;
  seek?: number;
};

export class SoundManager {
  protected scene: Phaser.Scene;
  protected eventBus: TypedEventEmitter<GameEvents>;
  protected effectSoundConfig: Map<any, SoundConfig> = new Map();
  protected eventSoundConfig: Map<string, SoundConfig> = new Map();

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
      key: "ballReflect",
      volume: 0.6,
      rate: 1.0,
    });

    this.eventSoundConfig.set("ball-reflect-on-scene-edge", {
      key: "ballReflect",
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
   * Apply random variations to sound config for variance
   * Medium range variations for repeating sounds
   */
  protected applyRandomVariations(config: SoundConfig): SoundConfig {
    const baseRate = config.rate ?? 1.0;
    const baseVolume = config.volume ?? 1.0;
    const baseDetune = config.detune ?? 0;

    return {
      ...config,
      rate: baseRate + (Math.random() - 0.5) * 0.2, // ±0.1 variation (0.9 to 1.1)
      volume: Math.max(0, Math.min(1, baseVolume + (Math.random() - 0.5) * 0.2)), // ±0.1 variation, clamped 0-1
      detune: baseDetune + (Math.random() - 0.5) * 200, // ±100 cents variation
      seek: Math.random() * 0.1, // Random start position 0-0.1 seconds
    };
  }

  /**
   * Play a sound using a config object with random variations
   */
  protected playSoundByConfig(config: SoundConfig): void {
    try {
      // Always try to unlock audio (safe to call even if already unlocked)
      this.scene.sound.unlock();

      // Check if sound exists and is loaded in the cache
      if (!this.scene.cache.audio.exists(config.key)) {
        return;
      }

      // Apply random variations for variance
      const variedConfig = this.applyRandomVariations(config);

      this.scene.sound.play(config.key, {
        volume: variedConfig.volume ?? 1.0,
        rate: variedConfig.rate ?? 1.0,
        detune: variedConfig.detune ?? 0,
        seek: variedConfig.seek ?? 0,
      });
    } catch (error) {
      // Silently handle playback errors
    }
  }

  /**
   * Add or update an effect sound configuration
   */
  setEffectSoundConfig(EffectClass: typeof AbstractEffect, config: SoundConfig): void {
    this.effectSoundConfig.set(EffectClass, config);
  }

  /**
   * Add or update an event sound configuration
   */
  setEventSoundConfig(eventName: string, config: SoundConfig): void {
    this.eventSoundConfig.set(eventName, config);
  }
}
