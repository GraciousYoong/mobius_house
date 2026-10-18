import { DRAWING_CREDIT, drawingSlots } from '../../content/project';
import { Section } from '../layout/Section';

export function Drawings() {
  return (
    <Section id="drawings" eyebrow="Documentation" title="Drawings" className="section--editorial">
      <p className="section__intro meta">
        Drawings courtesy of UNStudio, as published by ArchDaily. Select a drawing to open it at
        full size.
      </p>
      <ul className="plates">
        {drawingSlots.map((d) => (
          <li key={d.id} className={`plate${d.wide ? ' plate--wide' : ''}`}>
            <figure className="plate__figure">
              {d.image ? (
                <a className="plate__paper" href={d.image.src} target="_blank" rel="noreferrer">
                  <img
                    src={d.image.src}
                    alt={d.image.alt}
                    width={d.image.width}
                    height={d.image.height}
                    loading="lazy"
                  />
                  <span className="visually-hidden"> (opens full-size image in a new tab)</span>
                </a>
              ) : (
                <div className="plate__paper plate__paper--empty" aria-hidden="true">
                  <span>Drawing not yet available</span>
                </div>
              )}
              <figcaption className="plate__caption">
                <h3 className="plate__title">{d.title}</h3>
                <p className="plate__text">{d.description}</p>
                {/* The shared credit is given once above; only a different one is repeated. */}
                {d.image && d.image.credit !== DRAWING_CREDIT && (
                  <p className="plate__credit meta">{d.image.credit}</p>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
