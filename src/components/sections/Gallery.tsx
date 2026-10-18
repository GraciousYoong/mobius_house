import { galleryItems } from '../../content/project';
import { Section } from '../layout/Section';

export function Gallery() {
  return (
    <Section id="gallery" eyebrow="Images" title="Gallery" className="section--editorial">
      <ul className="gallery">
        {galleryItems.map((item) => (
          <li key={item.id}>
            <figure className="gallery__item">
              <a href={item.src} target="_blank" rel="noreferrer" className="gallery__link">
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                />
                <span className="visually-hidden"> (opens full-size image in a new tab)</span>
              </a>
              <figcaption className="gallery__caption">
                <span className="gallery__title">{item.caption}</span>
                <span className="gallery__credit meta">{item.credit}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
