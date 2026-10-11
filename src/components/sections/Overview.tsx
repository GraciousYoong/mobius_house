import { concept } from '../../content/project';
import { Section } from '../layout/Section';

export function Overview() {
  return (
    <Section id="overview" eyebrow="Overview" title={concept.heading}>
      <div className="prose">
        {concept.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <p className="note">
          {concept.note}{' '}
          {concept.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </Section>
  );
}
