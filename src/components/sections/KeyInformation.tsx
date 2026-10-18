import { keyFacts, keyFactsSources } from '../../content/project';
import { Section } from '../layout/Section';

/**
 * Key facts as a ruled specification sheet: field name (label) beside value,
 * one fact per row, with the sources set as metadata underneath. On wide
 * screens the section heading sits in its own column to the left.
 */
export function KeyInformation() {
  const anyUnverified = keyFacts.some((f) => !f.verified);
  return (
    <Section
      id="key-information"
      eyebrow="Project"
      title="Key Information"
      className="section--editorial section--split"
    >
      <div className="section__body">
        <dl className="spec">
          {keyFacts.map((f) => (
            <div key={f.label} className="spec__row">
              <dt className="label">{f.label}</dt>
              <dd className={f.value ? 'spec__value' : 'spec__value spec__value--missing'}>
                {f.value
                  ? f.value.map((line, i) => (
                      <span key={line} className="spec__line">
                        {line}
                        {!f.verified && i === f.value!.length - 1 && (
                          <sup className="spec__flag" aria-label="awaiting verification">
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

        <div className="spec__sources">
          <p className="label">Sources</p>
          <ul className="meta">
            {keyFactsSources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noreferrer">
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
          {anyUnverified && (
            <p className="meta spec__note">* Awaiting verification against a primary source.</p>
          )}
        </div>
      </div>
    </Section>
  );
}
