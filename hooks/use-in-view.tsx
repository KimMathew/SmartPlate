"use client";
import { useEffect, useRef, useState } from "react";

// useInView: triggers when the element enters the viewport (only once)
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (!ref.current || triggered.current) return;
    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        setInView(true);
        triggered.current = true;
        observer.disconnect();
      }
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
