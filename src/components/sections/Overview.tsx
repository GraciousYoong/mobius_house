import { overview } from '../../content/project';
import { Section } from '../layout/Section';
import { AnglesDiagram, QuadrantsDiagram, SlotPhoto } from '../ui/OverviewArt';

/**
 * Overview as an editorial sequence:
 * concept → principle → quotation → 24-hour cycle → facts and figures → background.
 */
export function Overview() {
  const { intro, principle, quote, cycle, figures, background } = overview;
  return (
    <Section id="overview" eyebrow={intro.eyebrow} title={intro.title} className="ov">
      {/* Concept: lead text beside UNStudio's Möbius diagram. */}
      <div className="ov-intro">
        <p className="ov-lead">{intro.lead}</p>
        <figure className="ov-intro__figure">
          <img src={intro.image.src} alt={intro.image.alt} loading="lazy" className="ov-blend" />
          <figcaption>{intro.image.credit}</figcaption>
        </figure>
      </div>

      {/* The Möbius principle: drawing with caption, text in a ruled column. */}
      <div className="ov-principle">
        <figure className="ov-principle__figure">
          <img
            src={principle.sketch.src}
            alt={principle.sketch.alt}
            loading="lazy"
            className="ov-principle__art ov-blend"
          />
          <figcaption>
            {principle.caption}
            <span>{principle.sketch.credit}</span>
          </figcaption>
        </figure>
        <div className="ov-principle__text">
          <h3>{principle.title}</h3>
          <p>{principle.text}</p>
        </div>
      </div>

      {/* Quotation on a light band, with a photograph. */}
      <figure className="ov-quote">
        <div className="ov-quote__body">
          <blockquote>
            <p>{quote.text}</p>
          </blockquote>
          <figcaption>
            <span className="ov-rule" aria-hidden="true" />
            <span>
              <strong>{quote.author}</strong>
              {quote.role}
            </span>
          </figcaption>
        </div>
        <SlotPhoto slot={quote.photo} className="ov-quote__photo" />
      </figure>

      {/* 24-hour cycle: UNStudio's section across the full width, text below. */}
      <div className="ov-cycle">
        <h3 className="ov-heading">
          <span className="ov-rule" aria-hidden="true" />
          {cycle.title}
        </h3>
        <figure className="ov-cycle__figure">
          <img src={cycle.diagram.src} alt={cycle.diagram.alt} loading="lazy" />
          <figcaption>{cycle.diagram.credit}</figcaption>
        </figure>
        <div className="ov-cycle__text">
          <p>{cycle.text}</p>
        </div>
      </div>

      {/* Facts and figures: number, label, text and a visual each. */}
      <h3 className="ov-heading">
        <span className="ov-rule" aria-hidden="true" />
        {figures.title}
      </h3>
      <ul className="ov-figures">
        {figures.items.map((f) => (
          <li key={f.id} className="ov-figure">
            <div className="ov-figure__copy">
              <span className="ov-figure__value" aria-hidden="true">
                {f.value}
              </span>
              <h4>
                <span className="visually-hidden">{Number(f.value)} </span>
                {f.label}
              </h4>
              <p>{f.text}</p>
            </div>
            <div className="ov-figure__visual">
              {f.id === 'materials' && (
                <SlotPhoto slot={figures.materialsPhoto} className="ov-figure__photo" />
              )}
              {f.id === 'quadrants' && <QuadrantsDiagram className="ov-figure__art" />}
              {f.id === 'angles' && <AnglesDiagram className="ov-figure__art" />}
            </div>
          </li>
        ))}
      </ul>
      <p className="note">{figures.quadrantsNote}</p>

      {/* Background: the commission and the design process. */}
      <div className="ov-background">
        <h3 className="ov-heading">
          <span className="ov-rule" aria-hidden="true" />
          {background.title}
        </h3>
        <div className="ov-background__text">
          <p>{background.text}</p>
        </div>
      </div>

      <p className="note">
        {overview.note}{' '}
        {overview.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </span>
        ))}
        . Photographs: photographer and usage rights to be confirmed.
      </p>
    </Section>
  );
}
