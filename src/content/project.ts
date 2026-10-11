/**
 * Written content for the site.
 *
 * Facts marked `verified: true` come from UNStudio's own project page (key
 * information panel). Anything else is from widely published descriptions and
 * stays `verified: false` until checked against a primary source. Unknown
 * values are left as `null` rather than guessed.
 */

export interface Source {
  label: string;
  url: string;
}

export const sources = {
  unstudio: {
    label: 'UNStudio — Möbius House',
    url: 'https://www.unstudio.com/projects/mobius-house/',
  },
  archdaily: {
    label: 'ArchDaily — AD Classics: Möbius House / UNStudio',
    url: 'https://www.archdaily.com/1012111/ad-classics-mobius-house-unstudio',
  },
} satisfies Record<string, Source>;

export interface Fact {
  label: string;
  /** One entry per line; null when not yet known. */
  value: string[] | null;
  verified: boolean;
}

export const project = {
  name: 'Möbius House',
  architect: 'UNStudio',
  location: 'Hilversum, Netherlands',
  tagline:
    'A single-family house in Hilversum organised around a continuous loop of living and working.',
};

export const keyFacts: Fact[] = [
  { label: 'Architect', value: ['UNStudio'], verified: true },
  { label: 'Client', value: ['Anonymous'], verified: true },
  { label: 'Location', value: ['Hilversum, Netherlands'], verified: true },
  { label: 'Status', value: ['Completed'], verified: true },
  { label: 'Sectors', value: ['Residential'], verified: true },
  { label: 'Services', value: ['Architecture', 'Interior'], verified: true },
  { label: 'Programmes', value: ['Single Family House'], verified: true },
  { label: 'Building surface', value: ['520 m²'], verified: true },
  { label: 'Design & construction', value: ['1993–1998'], verified: false },
  { label: 'Principal materials', value: ['Concrete and glass'], verified: false },
];

export const keyFactsSource = sources.unstudio;

/** What the 3D view shows, and who made it. */
export const model = {
  label: 'Unofficial 3D reconstruction',
  caveat: 'SketchUp model by Brice C via 3D Warehouse, not verified against UNStudio’s drawings.',
  credit: 'Brice C',
  source: '3D Warehouse (SketchUp)',
};

export const concept = {
  heading: 'Concept',
  paragraphs: [
    'The house takes its name from the Möbius strip, a surface with a single continuous side. UNStudio used the figure as an organising diagram rather than as a literal shape: two routes through the house interlock and exchange positions, so that working, social life and rest follow one another in a continuous loop over the course of a day.',
    'Published descriptions also note that the two main materials, concrete and glass, trade roles along that loop, with concrete appearing in places as furniture and glass forming internal partitions.',
  ],
  note: 'This summary is drawn from widely published descriptions and is awaiting verification against the sources below.',
  sources: [sources.unstudio, sources.archdaily],
};

export interface Image {
  src: string;
  alt: string;
  /** Who supplied or holds the image. Photographer still to be confirmed. */
  credit: string;
}

export interface DrawingSlot {
  id: string;
  title: string;
  description: string;
  image: Image | null;
}

const IMAGE_CREDIT =
  'Image via UNStudio / ArchDaily; photographer and usage rights to be confirmed';

/** Drawing types we intend to show. `image` stays null until one is sourced. */
export const drawingSlots: DrawingSlot[] = [
  {
    id: 'plan',
    title: 'Floor plan',
    description:
      'Labelled rooms run from the bedroom and studio on the left of the plan, past the garage and meeting room, to the kitchen, verandah and living room on the right.',
    image: {
      src: '/images/plan.jpg',
      alt: 'Floor plan of the Möbius House with a north arrow. Labelled rooms from left to right: bedroom, studio 01, circulation, bathroom, toilet, ramp, garage, storage, meeting room, circulation, kitchen, verandah, living room and fire place. Dashed lines show the overlapping routes through the plan.',
      credit: IMAGE_CREDIT,
    },
  },
  {
    id: 'diagram',
    title: 'Möbius diagram',
    description: 'The organising diagram of intertwining loops.',
    image: {
      src: '/images/mobius-diagram.jpg',
      alt: 'Grey rendered diagram of looping tubes and translucent ribbon surfaces twisting around each other in a figure-of-eight, Möbius-like form.',
      credit: IMAGE_CREDIT,
    },
  },
  {
    id: 'site',
    title: 'Site plan',
    description: 'Placement of the house in its landscape.',
    image: null,
  },
  {
    id: 'sections',
    title: 'Sections',
    description: 'Cuts showing how the loop changes level.',
    image: null,
  },
  {
    id: 'elevations',
    title: 'Elevations',
    description: 'Exterior faces of concrete and glass.',
    image: null,
  },
];

export interface GalleryItem extends Image {
  id: string;
  caption: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'exterior',
    caption: 'Exterior among the trees',
    src: '/images/exterior.jpg',
    alt: 'The Möbius House seen through bare trees: a long, low white concrete volume with bands of horizontal glazing, its upper part projecting over a recessed, darker base, set on a sandy slope.',
    credit: IMAGE_CREDIT,
  },
  {
    id: 'interior',
    caption: 'Living area',
    src: '/images/interior-living.jpg',
    alt: 'Living area with exposed concrete walls and a built-in concrete shelf along the window, a slatted timber ceiling and glazed openings to a stair beyond. A blue rug, black leather sofa and lounge chair surround a glass coffee table while a person walks past.',
    credit: IMAGE_CREDIT,
  },
];
