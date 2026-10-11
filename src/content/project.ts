/**
 * Written content for the site.
 *
 * Facts marked `verified: true` are confirmed by UNStudio's project page or
 * ArchDaily's "AD Classics" article (see `sources`). Anything not confirmed
 * stays `verified: false` and is flagged in the UI. Unknown values are left as
 * `null` rather than guessed. Text is summarised in our own words; quotations
 * are short and attributed.
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
  { label: 'Architects', value: ['Ben van Berkel', 'Caroline Bos'], verified: true },
  { label: 'Design & construction', value: ['1993–1998'], verified: true },
  { label: 'Principal materials', value: ['Concrete and glass'], verified: true },
  {
    label: 'Exhibited',
    value: ['“The Un-Private House”', 'MoMA, New York, 1999'],
    verified: true,
  },
];

export const keyFactsSources = [sources.unstudio, sources.archdaily];

/** UNStudio's "Facts and figures" for the house. */
export const figures = [
  { value: '2', text: 'Materials, concrete and glass, intertwining material and function.' },
  { value: '4', text: 'Quadrants that set out a seamless, continuous spatial flow.' },
  {
    value: '3',
    text: 'Angles, of 7, 9 and 11 degrees, used along the whole path through the house to give it a rhythm, like a piece of music.',
  },
];
export const figuresSource = sources.unstudio;

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
    'In 1993 a young professional couple from Amsterdam set out to build a house that would renew the language of domestic architecture. After approaching several architects, they chose Ben van Berkel, who studied the wooded site in Het Gooi and related it to the way the couple lived and worked. The design went through several iterations over five years, and the house was completed in 1998.',
    'The organising idea is the Möbius loop, a surface with a single side and no boundary. Van Berkel and Caroline Bos used it to tie the house to a 24-hour cycle of working, sleeping, playing and socialising: two independent routes run side by side through a sequence of spaces, exchanging positions, so that inside and outside, house and landscape, seem to turn into one another.',
    'Instead of walls and doors, spaces are set apart by changing ceiling heights: higher volumes for life together, lower ones for solitary work and rest. Few rooms have right angles, and concrete elements fold out of the structure to become furniture.',
    'The palette is almost only concrete and glass, with heaviness and transparency playing off one another along the loop. The project was among the first houses designed with 3D computer modelling, introduced into the process in 1995, and in 1999 it was shown at the Museum of Modern Art in New York in “The Un-Private House”.',
  ],
  quote: {
    text: 'From one perspective the glass is a skin slipped over a concrete house; from another, the building is a glass house framed by concrete.',
    author: 'Terence Riley',
    role: 'Curator of “The Un-Private House”, MoMA',
  },
  note: 'Summarised from',
  sources: [sources.archdaily, sources.unstudio],
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
/** ArchDaily credits the plan and the Möbius band diagram to UNStudio. */
const DRAWING_CREDIT =
  'Image courtesy of UNStudio (via ArchDaily); permission to reproduce to be confirmed';

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
      credit: DRAWING_CREDIT,
    },
  },
  {
    id: 'diagram',
    title: 'Möbius diagram',
    description: 'The organising diagram of intertwining loops.',
    image: {
      src: '/images/mobius-diagram.jpg',
      alt: 'Grey rendered diagram of looping tubes and translucent ribbon surfaces twisting around each other in a figure-of-eight, Möbius-like form.',
      credit: DRAWING_CREDIT,
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
