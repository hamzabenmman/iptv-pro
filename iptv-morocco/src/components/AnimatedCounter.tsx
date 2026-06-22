'use client';

import { useEffect, useRef, useState } from 'react';

type AnimatedCounterProps = {
  /** Target number to count up to */
  target: number;
  /** Duration in milliseconds (default: 1500) */
  duration?: number;
  /** CSS classes for the number */
  className?: string;
  /** Prefix text before the number */
  prefix?: string;
  /** Suffix text after the number */
  suffix?: string;
  /** Format number with commas (default: true) */
  formatNumber?: boolean;
  /** Decimal places (default: 0) */
  decimals?: number;
};

export default function AnimatedCounter({
  target,
  duration = 1500,
  className = '',
  prefix = '',
  suffix = '',
  formatNumber = true,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const hasAnimated = useRef(false);

  // IntersectionObserver to detect visibility
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate count-up
  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease-out quad: progress * (2 - progress)
      const eased = progress * (2 - progress);
      const value = Math.round(eased * target);

      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  const formatted = formatNumber
    ? current.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : current.toFixed(decimals);

  return (
    <span ref={ref} className={`inline-block count-up ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
