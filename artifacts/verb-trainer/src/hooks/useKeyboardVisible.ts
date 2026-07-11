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

    // Baseline: largest height seen (no keyboard).
    // This works with OR without `adjustResize` because both window.innerHeight
    // and visualViewport.height shrink together under adjustResize, so the
    // difference between them stays ~0. Comparing against the baseline
    // correctly detects the keyboard opening.
    let maxHeight = viewport.height;

    const check = () => {
      const h = viewport.height;
      if (h > maxHeight) maxHeight = h;
      const diff = maxHeight - h;
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
