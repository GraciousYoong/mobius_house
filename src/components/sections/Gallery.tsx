import { galleryItems } from '../../content/project';
import { Section } from '../layout/Section';

export function Gallery() {
  return (
    <Section id="gallery" eyebrow="Images" title="Gallery">
      <p className="section__lead">
        Photographs will be added once images with known credits and usage rights are available.
      </p>
      <ul className="gallery">
        {galleryItems.map((item) => (
          <li key={item.id}>
            <figure className="gallery__item">
              {item.src ? (
                <img src={item.src} alt={item.alt} loading="lazy" />
              ) : (
                <div className="gallery__empty" aria-hidden="true" />
              )}
              <figcaption>
                {item.caption}
                {item.credit ? (
                  <span className="gallery__credit"> — {item.credit}</span>
                ) : (
                  !item.src && <span className="gallery__credit"> (image pending)</span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
