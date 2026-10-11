export interface NavItem {
  id: string;
  label: string;
}

/** Order matches the page. Each id is the id of a section element. */
export const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'key-information', label: 'Key Information' },
  { id: 'drawings', label: 'Drawings' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'explore', label: 'Explore' },
];
