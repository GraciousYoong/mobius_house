# Möbius House — interactive study

A responsive website about the Möbius House by UNStudio, with an interactive 3D viewer.

> **Status: milestone 1.** The 3D model is an **abstract placeholder** (a mathematical Möbius
> band). It is *not* a model of the real building, and the site labels it that way. Drawings
> and photographs are empty slots until sourced material with known rights is available.

## Run locally

Requires Node.js 18+ (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check, then production build into dist/
npm run preview    # serve the production build at http://localhost:4173
npm run typecheck  # TypeScript only
```

## Stack

React 18 · Vite 5 · TypeScript · three.js · React Three Fiber · drei · plain CSS · SVG minimap.

## Project structure

```
src/
  App.tsx                    page composition
  content/                   all text and data (no JSX)
    project.ts               facts, concept, drawing and gallery slots (with verification flags)
    navigation.ts            nav items ↔ section ids
    controls.ts              keyboard bindings, shared by the help panel and Explore section
  state/
    createStore.ts           tiny external store (useSyncExternalStore)
    viewerStore.ts           view mode, camera pose, help visibility
  hooks/                     useWebGLSupport, usePrefersReducedMotion, useActiveSection
  components/                DOM only — never imports three.js
    layout/                  NavBar, Section, Footer
    sections/                Hero, Overview, KeyInformation, Drawings, Gallery, ExploreSection
    ui/                      ModeToggle, KeyboardHelp, Minimap, PlaceholderNotice
  scene/                     everything 3D
    Viewer.tsx               public entry: WebGL check, error boundary, lazy load, input capture
    SceneCanvas.tsx          <Canvas> (lazy-loaded chunk containing three.js)
    Environment.tsx          lights, ground, grid
    models/PlaceholderModel  abstract Möbius band — swap for a GLTF later
    controls/OrbitView       orbit with mouse/touch/keyboard
    controls/ExploreView     first-person prototype (no collision yet)
    controls/usePoseReporter publishes camera position + heading to viewerStore
  styles/global.css          tokens, layout, responsive breakpoints (900px, 600px)
```

The 3D scene and the website talk only through `viewerStore`: the scene writes the camera pose,
and DOM overlays (e.g. the minimap) read it. `components/` never imports from `three`, so the
three.js bundle (~225 kB gzipped) loads lazily and the page content renders first.

## Controls

Click or Tab into the 3D view, then:

| Orbit mode | | Explore mode | |
|---|---|---|---|
| ← → | rotate | W / ↑, S / ↓ | walk forward / back |
| ↑ ↓ | tilt | A / D | step left / right |
| + − | zoom | ← → (or Q / E) | turn |
| drag, scroll/pinch | rotate, zoom | Shift | faster |
| | | drag | look around |

Everywhere: **M** switch mode · **?** show/hide controls · **Esc** leave the viewer.

Keys are only captured while the viewer has focus, so they never hijack page scrolling.

## Loading, fallback and accessibility

- Loading spinner while the 3D chunk downloads (`SceneLoading`).
- Static fallback if WebGL is unavailable, the scene throws, or the WebGL context is lost
  (`SceneFallback`); the rest of the page is unaffected.
- Skip link, labelled landmarks, `aria-current` in the nav, accessible mobile menu
  (Escape closes it), visible focus rings, keyboard instructions in the viewer and in the
  Explore section, `prefers-reduced-motion` disables auto-rotation and smooth scrolling.

## Content accuracy

`src/content/project.ts` contains only high-level, widely published facts, each flagged
`verified: false` until checked against primary sources (UNStudio's project page, published
monographs). Unknown values (floor area, client) are `null` and shown as "To be confirmed".
Please do not fill these in without a source.

## Next milestones

1. Source a verified model (GLTF) and drawings; replace `PlaceholderModel`.
2. Real floor-plan minimap (SVG from sourced plans, with model ↔ plan alignment).
3. Collision and floor-level handling for Explore mode; on-screen touch movement controls.
4. Gallery lightbox once images are available.
