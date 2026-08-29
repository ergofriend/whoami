import type { ReactNode } from 'react';

export type KeyValueItem = {
  label: string;
  value: string | number | null;
};

type KeyValueSectionProps = {
  title: string;
  description?: string;
  items: KeyValueItem[];
  children?: ReactNode;
};

export function KeyValueSection({
  title,
  description,
  items,
  children,
}: KeyValueSectionProps) {
  const headingId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      {description !== undefined ? <p>{description}</p> : null}
      <dl>
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value ?? 'Not available'}</dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}
