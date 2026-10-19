import { useEffect, useState } from 'react';
import { navItems } from '../../content/navigation';
import { project } from '../../content/project';
import { useActiveSection } from '../../hooks/useActiveSection';

// The hero and the looping replica after the footer are tracked too, so no
// link is marked current while either fills the view (the two look the same).
const sectionIds = ['top', ...navItems.map((n) => n.id), 'page-loop'];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  // Close the mobile menu with Escape or when the viewport grows past it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const mql = window.matchMedia('(min-width: 900px)');
    const onResize = () => mql.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mql.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      mql.removeEventListener('change', onResize);
    };
  }, [open]);

  return (
    <header className="navbar">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="navbar__inner">
        <a className="navbar__brand" href="#top">
          {project.name}
          <span className="navbar__brand-sub">{project.architect}</span>
        </a>
        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="navbar__toggle-bar" aria-hidden="true" />
        </button>
        <nav
          id="primary-nav"
          aria-label="Primary"
          className={`navbar__nav ${open ? 'is-open' : ''}`}
        >
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'location' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
