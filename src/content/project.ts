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
  { label: 'Architects', value: ['Ben van Berkel', 'Caroline Bos'], verified: true },
  { label: 'Design & construction', value: ['1993–1998'], verified: true },
  { label: 'Location', value: ['Hilversum, Netherlands'], verified: true },
  { label: 'Building surface', value: ['520 m²'], verified: true },
  { label: 'Principal materials', value: ['Concrete and glass'], verified: true },
  { label: 'Building type', value: ['Single-family house'], verified: true },
];

export const keyFactsSources = [sources.unstudio, sources.archdaily];

/** What the 3D view shows, and who made it. */
export const model = {
  label: 'Unofficial 3D reconstruction',
  caveat: 'SketchUp model by Brice C via 3D Warehouse, not verified against UNStudio’s drawings.',
  credit: 'Brice C',
  source: '3D Warehouse (SketchUp)',
};

/**
 * Photo slots in the Overview. Each tries the visitor-supplied file in
 * public/images/overview/ first and falls back to an existing photo, so the
 * page looks finished before the dedicated photos are uploaded.
 */
export interface PhotoSlot {
  /** Preferred file, uploaded to public/images/overview/. */
  src: string;
  /** Used until `src` exists. */
  fallback: string;
  alt: string;
  credit: string;
}

/** Overview: an editorial sequence from idea to numbers. Text is our own summary of the sources. */
export const overview = {
  intro: {
    eyebrow: '01 / Concept',
    title: 'A continuous surface for everyday life.',
    lead: 'The Möbius loop connects living, working and sleeping through one spatial sequence, in which inside and outside, house and landscape, seem to turn into one another.',
    /** UNStudio's Möbius band diagram, inverted to light-on-black for the dark page. */
    image: {
      src: '/images/overview/mobius-diagram.jpg',
      alt: 'UNStudio’s Möbius diagram: light, translucent tubes and ribbons twisting around each other in a figure-of-eight loop.',
      credit: 'Diagram courtesy of UNStudio',
    },
  },
  principle: {
    title: 'The Möbius principle',
    caption: 'A continuous surface with a single side and no boundary.',
    sketch: {
      src: '/images/overview/mobius-sketch.jpg',
      alt: 'A single continuous white line drawn on black, looping and folding back on itself like the plan of the house.',
      credit: 'Sketch courtesy of UNStudio',
    },
    text: 'Ben van Berkel and Caroline Bos used the Möbius loop as an organising principle rather than a literal shape. Its single, continuous surface ties together interior and exterior and the different moments of the day, so that spaces flow into one another instead of being divided by walls and doors.',
  },
  quote: {
    text: 'From one perspective the glass is a skin slipped over a concrete house; from another, the building is a glass house framed by concrete.',
    author: 'Terence Riley',
    role: 'Curator of “The Un-Private House”, MoMA',
    photo: {
      src: '/images/exterior.jpg',
      fallback: '/images/exterior.jpg',
      alt: 'The Möbius House among the trees: a low white concrete volume with bands of glazing.',
      credit: 'Photo via UNStudio / ArchDaily',
    } satisfies PhotoSlot,
  },
  cycle: {
    title: 'A 24-hour cycle',
    text: 'Two independent routes run side by side through a sequence of spaces, exchanging positions, so that working, sleeping, playing and socialising follow one another over the course of a day. Ceiling heights, not walls, set the spaces apart: higher volumes for life together, lower ones for solitary work and rest. Few rooms have right angles, and concrete folds out of the structure to become furniture.',
    diagram: {
      src: '/images/section-living-working-sleeping.jpg',
      alt: 'Unfolded section through the house with dashed, dotted and dash-dot routes labelled working, sleeping and living weaving along its length.',
      credit: 'Section courtesy of UNStudio (via ArchDaily)',
    },
  },
  figures: {
    title: 'Facts and figures',
    items: [
      {
        id: 'materials',
        value: '02',
        label: 'Materials',
        text: 'Concrete and glass, intertwining material and function.',
      },
      {
        id: 'quadrants',
        value: '04',
        label: 'Quadrants',
        text: 'A seamless, continuous spatial flow.',
      },
      {
        id: 'angles',
        value: '03',
        label: 'Angles',
        text: 'Angles of 7°, 9° and 11° along the whole path give the house a rhythm, like a piece of music.',
      },
    ],
    materialsPhoto: {
      src: '/images/overview/materials.jpg',
      fallback: '/images/interior-living.jpg',
      alt: 'Close-up of a glass balustrade standing on the edge of a concrete slab.',
      credit: 'Photo via UNStudio / ArchDaily',
    } satisfies PhotoSlot,
    quadrantsNote:
      'Diagram after Ben van Berkel’s description: four quadrants joined by a figure-of-eight path.',
  },
  background: {
    title: 'Background',
    text: 'In 1993 a young professional couple from Amsterdam set out to build a house that would renew the language of domestic architecture. They chose Ben van Berkel, who studied the wooded site in Het Gooi and related it to the way they lived and worked. The design went through several iterations over five years; the house was completed in 1998. It was among the first houses designed with 3D computer modelling, introduced into the process in 1995, and in 1999 it was shown at the Museum of Modern Art in New York in “The Un-Private House”.',
  },
  note: 'Summarised from',
  sources: [sources.archdaily, sources.unstudio],
};

export interface Image {
  src: string;
  alt: string;
  /** Who supplied or holds the image. */
  credit: string;
}

export interface DrawingSlot {
  id: string;
  title: string;
  description: string;
  image: Image | null;
  /** Very wide drawings (sections) span the full row. */
  wide?: boolean;
}

const IMAGE_CREDIT = 'Image via UNStudio / ArchDaily';
/** ArchDaily credits the plan and the Möbius band diagram to UNStudio. */
const DRAWING_CREDIT = 'Image courtesy of UNStudio (via ArchDaily)';

/** Drawings: the section first, then the plans from bottom to top. */
export const drawingSlots: DrawingSlot[] = [
  {
    id: 'section',
    wide: true,
    title: 'Section: working, living, sleeping',
    description:
      'An unfolded section through the house with the routes of the daily cycle: working, living and sleeping intertwine along its length.',
    image: {
      src: '/images/section-living-working-sleeping.jpg',
      alt: 'Long unfolded section through the house. Dashed, dotted and dash-dot lines weave above and below it, labelled working, sleeping and living in alternating order, showing how the activities of the day follow one another along the building.',
      credit: DRAWING_CREDIT,
    },
  },
  {
    id: 'basement',
    title: 'Basement plan',
    description: 'Storage, guest room, bathroom and circulation below the house.',
    image: {
      src: '/images/plan-basement.jpg',
      alt: 'Basement floor plan with a north arrow. Labelled rooms: storage, guest room, bathroom and circulation, set in an angular outline, with the outline of the floor above shown dashed and a long wall running off to the upper left.',
      credit: DRAWING_CREDIT,
    },
  },
  {
    id: 'ground',
    title: 'Ground floor plan',
    description:
      'From the bedroom and studio at the west end, past the garage and meeting room, to the kitchen, verandah and living room at the east end.',
    image: {
      src: '/images/plan-ground.jpg',
      alt: 'Ground floor plan with a north arrow. Labelled rooms from left to right: bedroom, studio 01, circulation, bathroom, toilet, ramp, garage, storage, meeting room, circulation, kitchen, verandah, living room and fire place. Dashed lines show the overlapping routes through the plan, and a long wall extends from the bottom left.',
      credit: DRAWING_CREDIT,
    },
  },
  {
    id: 'first',
    title: 'First floor plan',
    description: 'Open space, bedrooms, bathroom and studio 02 on the upper level.',
    image: {
      src: '/images/plan-first.jpg',
      alt: 'First floor plan with a north arrow. Labelled spaces from left to right: open space, storage, bedroom, circulation, bedroom, bathroom and studio 02. Hatched bands mark glazing and stairs, and the outline of the floor below is shown.',
      credit: DRAWING_CREDIT,
    },
  },
  {
    id: 'roof',
    title: 'Roof plan',
    description: 'The folded roof planes, with a roof garden.',
    image: {
      src: '/images/plan-roof.jpg',
      alt: 'Roof plan with a north arrow, showing angular roof planes with slope and drainage markings, a hatched glazed strip, and a labelled roof garden.',
      credit: DRAWING_CREDIT,
    },
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
