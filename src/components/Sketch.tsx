"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import {
  drawablyArrow,
  drawablyBadge,
  drawablyButton,
  drawablyCard,
  drawablyCircle,
  drawablyDivider,
  drawablyHighlight,
  drawablyList,
  drawablyUnderline,
} from "drawably";

const sketchClasses = {
  card: "drawably-host drawably-card",
  highlight: "drawably-host drawably-highlight",
  underline: "drawably-host drawably-underline",
  badge: "drawably-host drawably-badge drawably-badge--outline",
} as const;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function readReducedMotionPreference(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(reducedMotionQuery).matches
  );
}

function subscribeToReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};

  const mediaQueryList = window.matchMedia(reducedMotionQuery);
  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }
  if (typeof mediaQueryList.addListener === "function") {
    mediaQueryList.addListener(onChange);
    return () => mediaQueryList.removeListener(onChange);
  }
  return () => {};
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeToReducedMotion, readReducedMotionPreference, () => false);
}

function classNames(...names: Array<string | undefined>): string {
  return names.filter(Boolean).join(" ");
}

type SketchCardProps = HTMLAttributes<HTMLDivElement>;

export function SketchCard({ children, className, ...props }: SketchCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyCard(ref.current, { roughness: 0.9, boil: 0.2 });
    return () => sketch.destroy();
  }, []);

  return (
    <div ref={ref} className={classNames(sketchClasses.card, className)} {...props}>
      {children}
    </div>
  );
}

export function SketchUnderline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyUnderline(ref.current, {
      roughness: 0.9,
      boil: 0.2,
      width: 1.5,
    });
    return () => sketch.destroy();
  }, [prefersReducedMotion]);

  return (
    <span ref={ref} className={sketchClasses.underline}>
      {children}
    </span>
  );
}

export function SketchHighlight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyHighlight(ref.current, {
      roughness: 0.8,
      boil: 0.15,
    });
    return () => sketch.destroy();
  }, []);

  return (
    <span ref={ref} className={sketchClasses.highlight}>
      {children}
    </span>
  );
}

type SketchBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "outline" | "scribble";
};

export function SketchBadge({
  children,
  className,
  variant = "outline",
  ...props
}: SketchBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyBadge(ref.current, { variant, roughness: 0.9, boil: 0 });
    return () => sketch.destroy();
  }, [variant]);

  return (
    <span
      ref={ref}
      className={classNames(
        "drawably-host",
        "drawably-badge",
        `drawably-badge--${variant}`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SketchDivider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  const ref = useRef<HTMLHRElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyDivider(ref.current, { roughness: 0.8, boil: 0.15 });
    return () => sketch.destroy();
  }, []);

  return (
    <hr
      ref={ref}
      className={classNames("drawably-host", "drawably-divider", className)}
      {...props}
    />
  );
}

type SketchListProps = HTMLAttributes<HTMLUListElement> & { marker?: "dash" | "check" };

export function SketchList({ children, className, marker = "dash", ...props }: SketchListProps) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyList(ref.current, { marker, roughness: 0.8, boil: 0.1 });
    return () => sketch.destroy();
  }, [marker]);

  return (
    <ul ref={ref} className={classNames("drawably-host", "drawably-list", className)} {...props}>
      {children}
    </ul>
  );
}

export function SketchCircle({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyCircle(ref.current, { roughness: 0.9, boil: 0.15, width: 1.5 });
    return () => sketch.destroy();
  }, [prefersReducedMotion]);

  return (
    <span
      ref={ref}
      className={classNames("drawably-host", "drawably-circle", className)}
      {...props}
    >
      {children}
    </span>
  );
}

type SketchArrowProps = {
  from: RefObject<HTMLElement | null>;
  to: RefObject<HTMLElement | null>;
};

export function SketchArrow({ from, to }: SketchArrowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (from.current === null || to.current === null) return;
    const sketch = drawablyArrow(from.current, to.current, {
      roughness: 0.8,
      boil: prefersReducedMotion ? 0 : 0.1,
      width: 1.5,
    });
    return () => sketch.destroy();
  }, [from, to, prefersReducedMotion]);

  return null;
}

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "outline" | "solid";
};

export function SketchButton({
  children,
  className,
  variant = "outline",
  ...props
}: SketchButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (ref.current === null) return;
    const sketch = drawablyButton(ref.current, { variant });
    return () => sketch.destroy();
  }, [variant, prefersReducedMotion]);

  return (
    <button
      ref={ref}
      type="button"
      className={classNames(
        "drawably-host",
        "drawably-button",
        `drawably-button--${variant}`,
        className,
      )}
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
