import type { ReactNode } from "react";

import { DoodleIcon, type DoodleIconKind } from "./DoodleIcon";
import { SketchUnderline } from "./Sketch";

export type KeyValueItem = {
  label: string;
  value: string | number | null;
  action?: ReactNode;
};

type KeyValueSectionProps = {
  title: string;
  description?: string;
  items: KeyValueItem[];
  children?: ReactNode;
  className?: string;
  headingVariant?: "display" | "technical";
  icon?: DoodleIconKind | undefined;
};

export function KeyValueSection({
  title,
  description,
  items,
  children,
  className,
  headingVariant = "display",
  icon,
}: KeyValueSectionProps) {
  const headingId = title.toLowerCase().replace(/\s+/g, "-");
  const classes = [
    "key-value-section",
    headingVariant === "technical" ? "key-value-section--technical" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={
          headingVariant === "technical"
            ? "sketch-heading technical-section-heading"
            : `sketch-heading${icon ? " section-heading-with-doodle" : ""}`
        }
      >
        {headingVariant === "technical" ? title : <SketchUnderline>{title}</SketchUnderline>}
        {icon ? <DoodleIcon kind={icon} /> : null}
      </h2>
      {description !== undefined ? <p className="section-description">{description}</p> : null}
      <dl>
        {items.map(({ label, value, action }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={action === undefined ? undefined : "value-with-action"}>
              <span>{value ?? "Not available"}</span>
              {action}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}
