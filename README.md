# Möbius House — interactive study

A responsive website about the Möbius House by UNStudio, with an interactive 3D viewer.

> **Status: milestone 2.** The 3D view shows an **unofficial SketchUp reconstruction** of the
> house by an unknown author. It has not been verified against UNStudio's drawings, and the site
> labels it that way. If the model fails to load, an abstract placeholder is shown instead.

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
npm run prepare-model  # rebuild the model, plan and modelInfo.json from models-src/
```

## 3D model pipeline

`models-src/mobius-house.dae` is the SketchUp COLLADA export (kept out of `public/` so it is not
published). `scripts/prepare-model.mjs` turns it into what the site loads:

- **`public/models/mobius-house.glb`** (~600 KB). The source file is a presentation layout: one
  assembled house plus exploded floors, wall strips and flat plans around it. Only the assembled
  house is kept. Units are metres and Y is up. The main floor is at y = 0 and the building is
  centred on the origin. −Z points north, which matches the published plan.
- **`public/plans/plan.svg`**: the minimap plan. Every wall face of the model is projected onto
  the ground, so it lines up exactly with the 3D scene and covers all split levels.
- **`src/content/generated/modelInfo.json`**: bounds and plan extents used by the scene and the
  minimap.

To use a different model, replace the `.dae` and run `npm run prepare-model`. The constants
`ASSEMBLED_MAX_Z` and `MAIN_FLOOR_Y` at the top of the script are specific to this file and may
need adjusting.

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
    models/HouseModel        loads the .glb, applies concrete and glass materials
    models/PlaceholderModel  abstract Möbius band, shown only if the model fails to load
    controls/OrbitView       orbit with mouse/touch/keyboard
    controls/ExploreView     first-person view; follows floors by raycast, no wall collision yet
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

`src/content/project.ts` holds all facts. Those from the key information panel on
[UNStudio's project page](https://www.unstudio.com/projects/mobius-house/) (client, location,
status, sectors, services, programme, 520 m² building surface) are `verified: true`. Dates and
materials are `verified: false` and marked with an asterisk until checked. Don't add values
without a source.

Images in `public/images/` (exterior, living area, floor plan, Möbius diagram) were supplied
from UNStudio / ArchDaily. Copyright remains with them; confirm photographer credits and usage
rights before publishing the site publicly.

## Next milestones

1. Confirm where the SketchUp model came from, and check it against UNStudio's drawings.
2. Wall collision in Explore mode, and on-screen movement controls for touch devices.
3. Gallery lightbox.
