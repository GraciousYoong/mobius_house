/**
 * A Möbius strip drawn on a 2D canvas, with a marker travelling along its
 * centre line. The surface is projected with a slight perspective and painted
 * back to front, so the marker and its trail disappear behind the band when
 * they pass round the back. No WebGL: the page's 3D viewer keeps the GPU.
 *
 * Travel `t` is in radians along the centre line: one lap is 2π, and after
 * one lap the marker is on the other face, so it repeats every 4π.
 */

type Vec = [number, number, number];

const R = 1; // centre-line radius
const W = 0.34; // half width of the band
const SEGMENTS = 120;
const TILT = 1.08; // radians the ring is tipped towards the viewer
const TURN = -0.35; // radians the ring is turned, so the twist sits off-centre
const CAMERA = 4.2; // perspective distance (in ring radii)
const LIGHT: Vec = normalize([-0.35, 0.55, 0.76]);
const TRAIL = 1.9; // radians of trail behind the marker

const COLOURS = {
  dark: [74, 72, 68],
  light: [236, 234, 229],
  edge: 'rgba(20, 20, 20, 0.45)',
  start: 'rgba(255, 255, 255, 0.85)',
  marker: '#ed7d27',
  trail: [237, 125, 39],
};

function normalize([x, y, z]: Vec): Vec {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

/** Point on the strip: u along the centre line (0…4π), v across it (−W…W). */
function surface(u: number, v: number): Vec {
  const r = R + v * Math.cos(u / 2);
  return [r * Math.cos(u), r * Math.sin(u), v * Math.sin(u / 2)];
}

/** Unit normal on the centre line; it flips sign after one lap (u + 2π). */
function normal(u: number): Vec {
  const du: Vec = [-R * Math.sin(u), R * Math.cos(u), 0];
  const dv: Vec = [Math.cos(u / 2) * Math.cos(u), Math.cos(u / 2) * Math.sin(u), Math.sin(u / 2)];
  return normalize([
    du[1] * dv[2] - du[2] * dv[1],
    du[2] * dv[0] - du[0] * dv[2],
    du[0] * dv[1] - du[1] * dv[0],
  ]);
}

/** Into view space: turn about the vertical, then tip towards the viewer (+z). */
function view([x, y, z]: Vec): Vec {
  const x1 = x * Math.cos(TURN) - y * Math.sin(TURN);
  const y1 = x * Math.sin(TURN) + y * Math.cos(TURN);
  return [x1, y1 * Math.cos(TILT) - z * Math.sin(TILT), y1 * Math.sin(TILT) + z * Math.cos(TILT)];
}

interface Item {
  depth: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export function drawMobius(canvas: HTMLCanvasElement, travel: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const { clientWidth: cw, clientHeight: ch } = canvas;
  if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  const scale = Math.min(cw / 2.9, ch / 2.1);
  const project = (p: Vec): [number, number, number] => {
    const [x, y, z] = view(p);
    const f = CAMERA / (CAMERA - z);
    return [cw / 2 + x * scale * f, ch / 2 - y * scale * f, z];
  };

  const items: Item[] = [];

  // The band, as quads between neighbouring steps along the centre line.
  for (let i = 0; i < SEGMENTS; i++) {
    const u0 = (i / SEGMENTS) * 2 * Math.PI;
    const u1 = ((i + 1) / SEGMENTS) * 2 * Math.PI;
    const corners = [surface(u0, -W), surface(u0, W), surface(u1, W), surface(u1, -W)].map(project);
    const n = view(normal((u0 + u1) / 2));
    const lit = 0.2 + 0.8 * Math.abs(n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const [r, g, b] = COLOURS.dark.map((d, k) => Math.round(d + (COLOURS.light[k] - d) * lit));
    items.push({
      depth: corners.reduce((s, c) => s + c[2], 0) / 4,
      draw: (c) => {
        c.beginPath();
        corners.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.closePath();
        c.fillStyle = `rgb(${r}, ${g}, ${b})`;
        c.strokeStyle = c.fillStyle; // hides hairline gaps between quads
        c.lineWidth = 0.6;
        c.fill();
        c.stroke();
        // The band's edge: the outer sides of the quad.
        c.beginPath();
        c.moveTo(corners[0][0], corners[0][1]);
        c.lineTo(corners[3][0], corners[3][1]);
        c.moveTo(corners[1][0], corners[1][1]);
        c.lineTo(corners[2][0], corners[2][1]);
        c.strokeStyle = COLOURS.edge;
        c.lineWidth = 1;
        c.stroke();
        if (i === 0) {
          // Start line: where the page loops back to the top.
          c.beginPath();
          c.moveTo(corners[0][0], corners[0][1]);
          c.lineTo(corners[1][0], corners[1][1]);
          c.strokeStyle = COLOURS.start;
          c.lineWidth = 1.5;
          c.stroke();
        }
      },
    });
  }

  // A point just off the surface, on the face the marker is travelling on.
  const onFace = (u: number) => {
    const n = normal(u);
    const p = surface(u, 0);
    const lift = 0.025;
    const q: Vec = [p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift];
    // Facing the viewer: drawn just after the band at that spot, else just before it.
    const facing = view(n)[2] > 0;
    const [x, y, z] = project(q);
    return { x, y, depth: z + (facing ? 0.02 : -0.02) };
  };

  // The trail fades out behind the marker.
  const t = ((travel % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
  const steps = 28;
  for (let k = 0; k < steps; k++) {
    const a = onFace(t - TRAIL * (k / steps));
    const b = onFace(t - TRAIL * ((k + 1) / steps));
    if (t - TRAIL * ((k + 1) / steps) < 0 && travel < TRAIL) break; // no trail before the start
    const alpha = (1 - k / steps) * 0.9;
    items.push({
      depth: (a.depth + b.depth) / 2,
      draw: (c) => {
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.strokeStyle = `rgba(${COLOURS.trail.join(', ')}, ${alpha})`;
        c.lineWidth = 2;
        c.lineCap = 'round';
        c.stroke();
      },
    });
  }

  const m = onFace(t);
  items.push({
    depth: m.depth,
    draw: (c) => {
      c.beginPath();
      c.arc(m.x, m.y, 4, 0, 2 * Math.PI);
      c.fillStyle = COLOURS.marker;
      c.fill();
      c.lineWidth = 1.5;
      c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      c.stroke();
    },
  });

  items.sort((a, b) => a.depth - b.depth).forEach((item) => item.draw(ctx));
}
