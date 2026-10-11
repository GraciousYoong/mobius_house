import { concept, figures, figuresSource } from '../../content/project';
import { Section } from '../layout/Section';

export function Overview() {
  return (
    <Section id="overview" eyebrow="Overview" title={concept.heading}>
      <div className="overview">
        <div className="prose">
          {concept.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <figure className="pull-quote">
          <blockquote>
            <p>{concept.quote.text}</p>
          </blockquote>
          <figcaption>
            {concept.quote.author}
            <span>{concept.quote.role}</span>
          </figcaption>
        </figure>
      </div>

      <h3 className="section__subtitle">Facts and figures</h3>
      <ul className="figures">
        {figures.map((f) => (
          <li key={f.value} className="figures__item">
            <span className="figures__value" aria-hidden="true">
              {f.value}
            </span>
            <p>
              <span className="visually-hidden">{f.value} </span>
              {f.text}
            </p>
          </li>
        ))}
      </ul>

      <p className="note">
        {concept.note}{' '}
        {[...concept.sources, figuresSource]
          .filter((s, i, all) => all.findIndex((x) => x.url === s.url) === i)
          .map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </span>
          ))}
        .
      </p>
    </Section>
  );
}
