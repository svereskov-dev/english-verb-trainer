import { useRef, useCallback } from "react";

/**
 * Audio feedback utilities built on Web Audio API.
 *
 * All sounds are created programmatically — no asset files needed.
 * AudioContext is lazily created and reused. Errors are always swallowed
 * so that audio issues never affect the exercise flow.
 *
 * Silent-mode behaviour: Web Audio routes through the device's media stream,
 * which is muted on iOS/Android when the hardware silent switch / ring-mute
 * is active. This means our sounds do respect silent mode in practice.
 */
export function useAudioFeedback() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** Schedule a callback after optionally resuming a suspended context. */
  const withCtx = useCallback(
    (fn: (ctx: AudioContext) => void) => {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().then(() => fn(ctx)).catch(() => {});
      } else {
        fn(ctx);
      }
    },
    [getCtx]
  );

  // ── Per-letter typing click (Letter Builder correct taps) ──────────────────

  /**
   * Short decaying white-noise burst filtered to a crisp keyboard click.
   * Play only on correct letter taps — not on wrong ones.
   */
  const playClick = useCallback(() => {
    withCtx(ctx => {
      try {
        const durationSec = 0.04;
        const bufferSize = Math.ceil(ctx.sampleRate * durationSec);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1200;
        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      } catch { /* non-critical */ }
    });
  }, [withCtx]);

  // ── Success sound (correct exercise completion) ────────────────────────────

  /**
   * A light three-note ascending chord (C5 → E5 → G5), staggered 55 ms apart,
   * each with a fast attack and gentle decay. Sounds rewarding without being
   * intrusive — similar in spirit to Duolingo / Drops.
   */
  const playSuccess = useCallback(() => {
    withCtx(ctx => {
      try {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const now = ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          const t0 = now + i * 0.055;
          gain.gain.setValueAtTime(0, t0);
          gain.gain.linearRampToValueAtTime(0.14, t0 + 0.018);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.35);
        });
      } catch { /* non-critical */ }
    });
  }, [withCtx]);

  // ── Toggle sound (Context / Letter Builder switch) ─────────────────────────

  /**
   * A soft descending sine sweep (600 Hz → 200 Hz over 90 ms).
   * Neutral and brief — signals a UI state change without conveying
   * positive or negative emotion.
   */
  const playToggle = useCallback(() => {
    withCtx(ctx => {
      try {
        const now  = ctx.currentTime;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } catch { /* non-critical */ }
    });
  }, [withCtx]);

  return { playClick, playSuccess, playToggle };
}
