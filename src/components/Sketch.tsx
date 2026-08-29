"use client";

import {
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { drawablyBadge, drawablyButton, drawablyCard, drawablyUnderline } from "drawably";

const sketchClasses = {
  card: "drawably-host drawably-card",
  underline: "drawably-host drawably-underline",
  button: "drawably-host drawably-button drawably-button--outline",
  badge: "drawably-host drawably-badge drawably-badge--outline",
} as const;

function classNames(...names: Array<string | undefined>): string {
  return names.filter(Boolean).join(" ");
}

export function SketchCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyCard(ref.current, { roughness: 0.9, boil: 0.2 });
    return () => sketch.destroy();
  }, []);

  return (
    <div ref={ref} className={classNames("information-card", sketchClasses.card)}>
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

  return (
    <span ref={ref} className={sketchClasses.underline}>
      {children}
    </span>
  );
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
    <button
      ref={ref}
      type="button"
      className={classNames(sketchClasses.button, className)}
      {...props}
    >
      {children}
    </button>
  );
}

type SketchBadgeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function SketchBadgeLink({ children, className, ...props }: SketchBadgeLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyBadge(ref.current, {
      variant: "outline",
      roughness: 0.9,
      boil: 0,
    });
    return () => sketch.destroy();
  }, []);

  return (
    <a ref={ref} className={classNames(sketchClasses.badge, className)} {...props}>
      {children}
    </a>
  );
}
