# Möbius House — interactive study

A responsive website about the Möbius House by UNStudio, with an interactive 3D viewer.

> **Status: milestone 3.** The 3D view shows an **unofficial SketchUp reconstruction** of the
> house by Brice C, from 3D Warehouse. It has not been verified against UNStudio's drawings, and the site
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
- **`public/plans/basement.svg`, `ground.svg`, `first.svg`**: one minimap plan per floor. Every wall face within a
  floor's height band is projected onto the ground, so the plans line up exactly with the 3D
  scene and include split levels. The other floor is drawn faintly underneath.
- **`src/content/generated/modelInfo.json`**: site and building bounds and plan extents, used by
  the camera framing, the scene and the minimap.

To use a different model, replace the `.dae` and run `npm run prepare-model`. The constants
`ASSEMBLED_MAX_Z`, `MAIN_FLOOR_Y` and `LEVELS` at the top of the script are specific to this
file and may need adjusting.

## Visual direction

Editorial architecture × architectural photography × minimal digital exhibition: a dark
gallery-like space where the pale building is the only lit subject.

- **Surface groups.** The SketchUp file has a single white material. `prepare-model` ray-tests
  every triangle against the model and sorts it into exterior concrete, interior wall, floor,
  ceiling, roof or ground, each with its own material in the `.glb`:
  - **Upward faces:** a floor if covered and enclosed; otherwise a roof (above 1.5 m) or ground.
  - **Walls:** interior if a slightly upward ray hits the building; otherwise exterior.

  These are inferred surface roles, not verified finishes. `HouseModel` gives each a restrained
  material: pale concrete outside, warm-white walls inside, grey floors with a faint sheen, and
  ground close to the surrounding plane.
- **Glass:** a light, clear tint with subtle reflections of a soft studio environment. Outlines
  keep only vertical and horizontal edges (pane borders), not SketchUp's triangulation diagonals.
- **Edge lines:** nearly invisible in Orbit and faint in Explore, where they help read corners.
- **Daylight:** one soft, slightly warm sun from the upper left of the opening view, with long
  shadows towards the viewer; a cool sky fill and a weak opposite bounce. The environment light is
  kept low (`ENVIRONMENT_INTENSITY`). A material's `envMapIntensity` doesn't affect
  `scene.environment`, and at full strength it washes everything out.
- **Environment:** a seamless dark charcoal infinity cove (`Backdrop.tsx`), glowing faintly at the
  horizon and near-black overhead. The ground's base colour is set so the lit ground meets the
  backdrop without a seam, and soft contact shadows sit under the site slab.
- **Interface on dark:** light type, a soft dark wash behind the title, and dark smoked-glass
  panels (toolbar, Controls). The minimap stays a light paper drawing sheet, since the plans are
  drawn in dark lines.
- **Post-processing** (`Effects.tsx`): N8AO ambient occlusion for contact shading, SMAA and neutral
  tone mapping, nothing else (no bloom). Multisampling must stay off: combined with N8AO it erases
  the edge lines. Touch devices get a half-resolution occlusion pass.

### Orbit and Explore

| | Orbit | Explore |
|---|---|---|
| Purpose | Present the whole building | Walk through it |
| Lens | 30° vertical field of view (long lens, little distortion) | 64° (natural eye) |
| Composition | Three-quarter view from the south-east, ~18° up, framed on the building's own bounds (not the site) and offset away from the title | Starts on the approach ~10 m south-west of the house, building at a three-quarter angle |
| Limits | Distance 1.3–5 × the building radius, 15° above the horizon at least: never inside the model or below ground | Capsule collision keeps the eye 0.3 m from walls and glass; 0.12 m near plane |
| Controls | Damped orbit, slow drift until first interaction, **Reset view** (or **R**) glides back | Unchanged movement; **Exit** returns to Orbit |

### Development helpers

Only active on the dev server (`npm run dev`). Production builds strip them out:

- `?debug`: ground grid, axes and the building bounds used for framing.
- `?debug=surfaces`: colour each surface group vividly to check the classification.
- `?at=x,eyeY,z,yaw`: start Explore at a given position, e.g. `?at=4,1.2,3,1.9` inside the living
  area.

## Explore mode physics

`src/scene/controls/characterPhysics.ts` is a capsule character controller: the visitor is a
capsule pushed out of the model's triangles, which are indexed with
[three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) so collision checks stay fast. It
includes gravity, eased acceleration, stair climbing, and an invisible fence where the site ends.
Walls and glazing block movement.

`tests/reachability.ts` flood-fills the model from the start point to check that the house can be
entered and that the first floor can be reached by the stairs:

```bash
npx tsx tests/reachability.ts
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
    ui/                      ModeToggle, KeyboardHelp, Minimap (per-floor), ModelNotice
  scene/                     everything 3D
    Viewer.tsx               public entry: WebGL check, error boundary, lazy load, input capture
    SceneCanvas.tsx          <Canvas> (lazy-loaded chunk containing three.js)
    Environment.tsx          lights and ground
    models/HouseModel        loads the .glb; concrete/glass, edge lines, tones by orientation
    models/PlaceholderModel  abstract Möbius band, shown only if the model fails to load
    controls/OrbitView       orbit with mouse/touch/keyboard
    controls/ExploreView     first-person view: mouse look, joystick, physics
    controls/characterPhysics capsule collision, gravity, stairs (three-mesh-bvh)
    TouchJoystick            on-screen joystick for touch devices
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
| | | click, then mouse | look around (pointer lock; Esc releases) |

Touch screens: in Explore mode, a joystick at the bottom left walks and dragging anywhere else
looks around. In Orbit mode, drag rotates and pinch zooms.

Everywhere: **M** switch mode · **X** show/hide controls · **Esc** leave the viewer.

Keys are only captured while the viewer has focus, so they never hijack page scrolling.

## Loading, fallback and accessibility

- Loading spinner while the 3D chunk downloads (`SceneLoading`).
- Static fallback if WebGL is unavailable, the scene throws, or the WebGL context is lost
  (`SceneFallback`); the rest of the page is unaffected.
- Skip link, labelled landmarks, `aria-current` in the nav, accessible mobile menu
  (Escape closes it), visible focus rings, keyboard instructions in the viewer and in the
  Explore section, `prefers-reduced-motion` disables auto-rotation and smooth scrolling.

## Content accuracy

`src/content/project.ts` holds all text and facts. Each fact is `verified: true` only when
confirmed by [UNStudio's project page](https://www.unstudio.com/projects/mobius-house/) or
ArchDaily's [AD Classics article](https://www.archdaily.com/1012111/ad-classics-mobius-house-unstudio).
Anything unconfirmed is flagged with an asterisk. The Concept text summarises those sources in our
own words, with one short, attributed quotation (Terence Riley). The "Facts and figures" strip
(2 · 4 · 3) is from UNStudio's project page.

Images in `public/images/`:

- **Floor plan and Möbius diagram:** credited by ArchDaily as courtesy of UNStudio.
- **Exterior and living-area photographs:** photographer still to be confirmed. ArchDaily credits
  its interior photography to Eva Bloem.

Copyright remains with the owners. Obtain permission and the exact credit line before publishing.

## Next milestones

1. Check the model against UNStudio's drawings, and confirm the 3D Warehouse licence terms.
2. Gallery lightbox.
