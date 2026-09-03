import type { ReactNode } from "react";

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
};

export function KeyValueSection({
  title,
  description,
  items,
  children,
  className,
}: KeyValueSectionProps) {
  const headingId = title.toLowerCase().replace(/\s+/g, "-");
  const classes = ["key-value-section", className].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-labelledby={headingId}>
      <h2 id={headingId} className="sketch-heading">
        <SketchUnderline>{title}</SketchUnderline>
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
