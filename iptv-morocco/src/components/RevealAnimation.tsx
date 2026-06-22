'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number; // 0-5
  direction?: 'up' | 'left' | 'right' | 'scale' | 'none';
  threshold?: number;
  rootMargin?: string;
};

export default function RevealAnimation({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const dirClass = direction === 'up' ? 'reveal'
    : direction === 'left' ? 'reveal-left'
    : direction === 'right' ? 'reveal-right'
    : direction === 'scale' ? 'reveal-scale'
    : '';

  const delayClass = delay > 0 ? `reveal-delay-${Math.min(delay, 5)}` : '';

  return (
    <div
      ref={ref}
      className={`${dirClass} ${delayClass} ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
