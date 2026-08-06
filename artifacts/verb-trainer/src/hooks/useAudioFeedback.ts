import { useRef, useCallback } from "react";

/**
 * Provides a `playClick()` function that emits a short keyboard-like click
 * using the Web Audio API.
 *
 * Behaviour:
 * - AudioContext is created lazily on first call and reused thereafter.
 * - If the browser/OS has blocked audio (suspended context), we attempt
 *   to resume before playing.
 * - On devices in silent mode the OS-level audio routing typically silences
 *   media audio; Web Audio output follows that same routing on most platforms.
 * - Errors are silently swallowed — audio feedback is non-critical.
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

  const playClick = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const fire = () => {
      try {
        // 40 ms of decaying white noise, high-pass filtered → crisp click
        const durationSec = 0.04;
        const bufferSize = Math.ceil(ctx.sampleRate * durationSec);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const envelope = Math.pow(1 - i / bufferSize, 4); // fast decay
          data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // High-pass filter removes low-frequency rumble
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1200;

        const gain = ctx.createGain();
        gain.gain.value = 0.8;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      } catch {
        // Non-critical — swallow all audio errors
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(fire).catch(() => {});
    } else {
      fire();
    }
  }, [getCtx]);

  return { playClick };
}
