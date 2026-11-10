import { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value = 0, duration = 850, format = (v) => String(v) }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const startVal = prevRef.current;
    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (target - startVal) * eased;
      setDisplay(current);

      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return <>{format(display)}</>;
}

