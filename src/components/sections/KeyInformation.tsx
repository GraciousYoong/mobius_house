import { keyFacts, keyFactsSources } from '../../content/project';
import { Section } from '../layout/Section';

export function KeyInformation() {
  const anyUnverified = keyFacts.some((f) => !f.verified);
  return (
    <Section id="key-information" eyebrow="Project" title="Key Information">
      <dl className="facts">
        {keyFacts.map((f) => (
          <div key={f.label} className="facts__item">
            <dt>{f.label}</dt>
            <dd className={f.value ? undefined : 'facts__missing'}>
              {f.value
                ? f.value.map((line, i) => (
                    <span key={line} className="facts__line">
                      {line}
                      {!f.verified && i === f.value!.length - 1 && (
                        <sup className="facts__flag" aria-label="awaiting verification">
                          *
                        </sup>
                      )}
                    </span>
                  ))
                : 'To be confirmed'}
            </dd>
          </div>
        ))}
      </dl>
      <p className="note">
        Sources:{' '}
        {keyFactsSources.map((src, i) => (
          <span key={src.url}>
            {i > 0 && ' · '}
            <a href={src.url} target="_blank" rel="noreferrer">
              {src.label}
            </a>
          </span>
        ))}
        .{anyUnverified && ' * Awaiting verification against a primary source.'}
      </p>
    </Section>
  );
}
