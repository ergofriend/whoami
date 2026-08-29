"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { drawablyButton, drawablyCard, drawablyUnderline } from "drawably";

export function SketchCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyCard(ref.current, { roughness: 0.9, boil: 0.2 });
    return () => sketch.destroy();
  }, []);

  return (
    <div ref={ref} className="information-card">
      {children}
    </div>
  );
}

export function SketchUnderline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyUnderline(ref.current, {
      roughness: 0.9,
      boil: 0.2,
      width: 1.5,
    });
    return () => sketch.destroy();
  }, []);

  return <span ref={ref}>{children}</span>;
}

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SketchButton({ children, className, ...props }: SketchButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyButton(ref.current, { variant: "outline" });
    return () => sketch.destroy();
  }, []);

  return (
    <button ref={ref} type="button" className={className} {...props}>
      {children}
    </button>
  );
}
