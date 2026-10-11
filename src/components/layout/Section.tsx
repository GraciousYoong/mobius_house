import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

/** A page section with a consistent heading and landmark labelling. */
export function Section({ id, title, eyebrow, children, className = '' }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`section ${className}`}>
      <div className="section__inner">
        {eyebrow && <p className="section__eyebrow">{eyebrow}</p>}
        <h2 id={headingId} className="section__title">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
