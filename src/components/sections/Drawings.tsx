import { drawingSlots } from '../../content/project';
import { Section } from '../layout/Section';

export function Drawings() {
  return (
    <Section id="drawings" eyebrow="Documentation" title="Drawings">
      <p className="section__lead">
        Drawings as published by UNStudio and ArchDaily. Select a drawing to open it at full size.
        Empty slots are drawings that have not been sourced yet.
      </p>
      <ul className="card-grid">
        {drawingSlots.map((d) => (
          <li key={d.id} className="card">
            {d.image ? (
              <a
                className="card__media card__media--image"
                href={d.image.src}
                target="_blank"
                rel="noreferrer"
              >
                <img src={d.image.src} alt={d.image.alt} loading="lazy" />
                <span className="visually-hidden"> (opens full-size image in a new tab)</span>
              </a>
            ) : (
              <div className="card__media card__media--empty" aria-hidden="true">
                <span>Drawing not yet available</span>
              </div>
            )}
            <div className="card__body">
              <h3 className="card__title">{d.title}</h3>
              <p className="card__text">{d.description}</p>
              {d.image && <p className="card__credit">{d.image.credit}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
