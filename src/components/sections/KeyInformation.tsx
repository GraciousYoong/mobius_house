import { keyFacts } from '../../content/project';
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
              {f.value ?? 'To be confirmed'}
              {f.value && !f.verified && (
                <sup className="facts__flag" aria-label="awaiting verification">
                  *
                </sup>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {anyUnverified && (
        <p className="note">
          * Awaiting verification against primary sources. Values marked “To be confirmed” are
          intentionally left blank rather than estimated.
        </p>
      )}
    </Section>
  );
}
