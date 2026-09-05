"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { drawablyBadge } from "drawably";
import {
  DrawablyArrow,
  DrawablyBadge,
  DrawablyButton,
  DrawablyCard,
  DrawablyCircle,
  DrawablyDivider,
  DrawablyHighlight,
  DrawablyList,
  DrawablyUnderline,
} from "drawably/react";

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

export function SketchCard({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <DrawablyCard
      roughness={0.9}
      boil={0.2}
      className={classNames(sketchClasses.card, className)}
      {...props}
    >
      {children}
    </DrawablyCard>
  );
}

export function SketchUnderline({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <DrawablyUnderline
      roughness={0.9}
      boil={prefersReducedMotion ? 0 : 0.2}
      width={1.5}
      className={sketchClasses.underline}
    >
      {children}
    </DrawablyUnderline>
  );
}

export function SketchHighlight({ children }: { children: ReactNode }) {
  return (
    <DrawablyHighlight roughness={0.8} boil={0.15} className={sketchClasses.highlight}>
      {children}
    </DrawablyHighlight>
  );
}

type SketchBadgeProps = HTMLAttributes<HTMLSpanElement> &
  Pick<ComponentProps<typeof DrawablyBadge>, "variant">;

export function SketchBadge({
  children,
  className,
  variant = "outline",
  ...props
}: SketchBadgeProps) {
  return (
    <DrawablyBadge
      variant={variant}
      roughness={0.9}
      boil={0}
      className={classNames(
        "drawably-host",
        "drawably-badge",
        `drawably-badge--${variant}`,
        className,
      )}
      {...props}
    >
      {children}
    </DrawablyBadge>
  );
}

export function SketchDivider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return (
    <DrawablyDivider
      roughness={0.8}
      boil={0.15}
      className={classNames("drawably-host", "drawably-divider", className)}
      {...props}
    />
  );
}

type SketchListProps = HTMLAttributes<HTMLUListElement> &
  Pick<ComponentProps<typeof DrawablyList>, "marker">;

export function SketchList({ children, className, marker = "dash", ...props }: SketchListProps) {
  return (
    <DrawablyList
      marker={marker}
      roughness={0.8}
      boil={0.1}
      className={classNames("drawably-host", "drawably-list", className)}
      {...props}
    >
      {children}
    </DrawablyList>
  );
}

export function SketchCircle({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <DrawablyCircle
      roughness={0.9}
      boil={prefersReducedMotion ? 0 : 0.15}
      width={1.5}
      className={classNames("drawably-host", "drawably-circle", className)}
      {...props}
    >
      {children}
    </DrawablyCircle>
  );
}

type SketchArrowProps = Pick<ComponentProps<typeof DrawablyArrow>, "from" | "to">;

export function SketchArrow({ from, to }: SketchArrowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <DrawablyArrow
      from={from}
      to={to}
      roughness={0.8}
      boil={prefersReducedMotion ? 0 : 0.1}
      width={1.5}
    />
  );
}

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Pick<ComponentProps<typeof DrawablyButton>, "variant">;

export function SketchButton({
  children,
  className,
  variant = "outline",
  ...props
}: SketchButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <DrawablyButton
      variant={variant}
      boil={prefersReducedMotion ? 0 : 0.3}
      className={classNames(
        "drawably-host",
        "drawably-button",
        `drawably-button--${variant}`,
        className,
      )}
      {...props}
    >
      {children}
    </DrawablyButton>
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
