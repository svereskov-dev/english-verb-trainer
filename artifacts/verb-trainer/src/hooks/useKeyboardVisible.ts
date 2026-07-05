import { useState, useEffect } from "react";

/**
 * Detects when the on-screen virtual keyboard is open.
 * Uses the VisualViewport API for accurate measurements across
 * iOS Safari, Android Chrome, and installed PWAs.
 */
export function useKeyboardVisible(threshold = 100) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const check = () => {
      // Keyboard is visible if the viewport height shrinks significantly
      const diff = window.innerHeight - viewport.height;
      setVisible(diff > threshold);
    };

    check();
    viewport.addEventListener("resize", check);
    viewport.addEventListener("scroll", check);

    return () => {
      viewport.removeEventListener("resize", check);
      viewport.removeEventListener("scroll", check);
    };
  }, [threshold]);

  return visible;
}
