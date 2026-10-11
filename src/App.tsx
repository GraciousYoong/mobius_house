import { useCallback, useRef } from 'react';
import { NavBar } from './components/layout/NavBar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Overview } from './components/sections/Overview';
import { KeyInformation } from './components/sections/KeyInformation';
import { Drawings } from './components/sections/Drawings';
import { Gallery } from './components/sections/Gallery';
import { ExploreSection } from './components/sections/ExploreSection';

export default function App() {
  const viewerRef = useRef<HTMLDivElement>(null);

  const enterViewer = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('top')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    viewerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <NavBar />
      <Hero ref={viewerRef} />
      <main id="main" tabIndex={-1}>
        <Overview />
        <KeyInformation />
        <Drawings />
        <Gallery />
        <ExploreSection onEnter={enterViewer} />
      </main>
      <Footer />
    </>
  );
}
