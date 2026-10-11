/**
 * Written content for the site.
 *
 * Only widely published, high-level facts are included here. Anything that
 * still needs checking against a primary source (UNStudio's own project page,
 * published monographs) is marked `verified: false`, and the UI says so.
 * Unknown values are left as `null` rather than guessed.
 */

export interface Fact {
  label: string;
  value: string | null;
  verified: boolean;
}

export const project = {
  name: 'Möbius House',
  architect: 'UNStudio',
  tagline: 'A private house organised around a continuous loop of living and working.',
};

export const keyFacts: Fact[] = [
  { label: 'Architect', value: 'UNStudio (Ben van Berkel & Caroline Bos)', verified: false },
  { label: 'Location', value: 'Het Gooi, the Netherlands', verified: false },
  { label: 'Design & construction', value: '1993–1998', verified: false },
  { label: 'Programme', value: 'Private residence with workspaces', verified: false },
  { label: 'Principal materials', value: 'Concrete and glass', verified: false },
  { label: 'Floor area', value: null, verified: false },
  { label: 'Client', value: null, verified: false },
];

export const concept = {
  heading: 'Concept',
  paragraphs: [
    'The house takes its name from the Möbius strip, a surface with a single continuous side. UNStudio used the figure as an organising diagram rather than as a literal shape: two routes through the house interlock and exchange positions, so that working, social life and rest follow one another in a continuous loop over the course of a day.',
    'Published descriptions also note that the two main materials, concrete and glass, trade roles along that loop, with concrete appearing in places as furniture and glass forming internal partitions.',
  ],
  note: 'This summary is drawn from widely published descriptions and is awaiting verification against primary sources.',
};

export interface DrawingSlot {
  id: string;
  title: string;
  description: string;
}

/** Drawing types we intend to show. No drawings have been sourced yet. */
export const drawingSlots: DrawingSlot[] = [
  { id: 'site', title: 'Site plan', description: 'Placement of the house in its landscape.' },
  { id: 'ground', title: 'Ground floor plan', description: 'Principal living level.' },
  { id: 'upper', title: 'Upper level plan', description: 'Upper rooms and terraces.' },
  { id: 'sections', title: 'Sections', description: 'Cuts showing how the loop changes level.' },
  { id: 'elevations', title: 'Elevations', description: 'Exterior faces of concrete and glass.' },
  {
    id: 'diagram',
    title: 'Möbius diagram',
    description: 'The organising diagram of the two routes.',
  },
];

export interface GalleryItem {
  id: string;
  caption: string;
  /** Path under /public once a licensed image is available. */
  src: string | null;
  alt: string;
  credit: string | null;
}

/** Gallery slots. `src` stays null until images with known rights are added. */
export const galleryItems: GalleryItem[] = [
  { id: 'g1', caption: 'Exterior view', src: null, alt: '', credit: null },
  { id: 'g2', caption: 'Approach', src: null, alt: '', credit: null },
  { id: 'g3', caption: 'Living area', src: null, alt: '', credit: null },
  { id: 'g4', caption: 'Workspace', src: null, alt: '', credit: null },
  { id: 'g5', caption: 'Glazing detail', src: null, alt: '', credit: null },
  { id: 'g6', caption: 'Concrete detail', src: null, alt: '', credit: null },
];
