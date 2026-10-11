import { drawingSlots } from '../../content/project';
import { Section } from '../layout/Section';

export function Drawings() {
  return (
    <Section id="drawings" eyebrow="Documentation" title="Drawings">
      <p className="section__lead">
        Architectural drawings will appear here once sourced with permission. The slots below show
        the planned set; none of them contain drawings yet.
      </p>
      <ul className="card-grid">
        {drawingSlots.map((d) => (
          <li key={d.id} className="card">
            <div className="card__media card__media--empty" aria-hidden="true">
              <span>Drawing not yet available</span>
            </div>
            <div className="card__body">
              <h3 className="card__title">{d.title}</h3>
              <p className="card__text">{d.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
