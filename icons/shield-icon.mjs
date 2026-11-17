#!/usr/bin/env node
// Generates the shield icon with configurable rounded corners.
//
// Usage:
//   node icons/shield-icon.mjs [radius] [--glyph-radius n] [--color value] > icons/shield-icon.svg
//
//   radius          corner radius of the shield and the bar (viewBox units, icon is 24 × 32). Default 1.
//   --glyph-radius  corner radius of the cut-out "t", dash and "1". Default min(radius, 0.5).
//   --color         fill color. Default currentColor.
//
// Radii are clamped per corner so two neighbouring arcs never overlap.

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] || "").startsWith("--"));

const radius = Number(positional[0] ?? 1);
const glyphRadius = Number(option("--glyph-radius", Math.min(radius, 0.5)));
const color = option("--color", "currentColor");

const BEND = "bend";

const shield = [
  [5, 0],
  [19, 0],
  [24, 2.5],
  [24, 16],
  [19.5, 25, BEND],
  [12, 29.5],
  [4.5, 25, BEND],
  [0, 16],
  [0, 2.5],
];

const bar = [
  [5.5, 30],
  [18.5, 30],
  [18.5, 32],
  [5.5, 32],
];

const letterT = [
  [4, 2],
  [5, 2],
  [5, 7],
  [10, 7],
  [10, 8],
  [5, 8],
  [5, 15],
  [9, 15],
  [9, 16],
  [4, 16],
];

const dash = [
  [10.5, 10.793],
  [12.207, 12.5],
  [11.5, 13.207],
  [9.793, 11.5],
];

const letterOne = [
  [18, 7],
  [19, 7],
  [19, 21],
  [20, 21],
  [20, 22],
  [19, 22],
  [19, 23],
  [18, 23],
  [18, 8.414],
  [17.207, 9.207],
  [16.5, 8.5],
];

const fmt = (n) => String(Math.round(n * 1000) / 1000);

function roundedPolygon(points, cornerRadius, bendRadius = 10) {
  const n = points.length;
  const corners = points.map(([x, y, kind], i) => {
    const [px, py] = points[(i - 1 + n) % n];
    const [nx, ny] = points[(i + 1) % n];
    const lenPrev = Math.hypot(px - x, py - y);
    const lenNext = Math.hypot(nx - x, ny - y);
    const u1 = [(px - x) / lenPrev, (py - y) / lenPrev];
    const u2 = [(nx - x) / lenNext, (ny - y) / lenNext];
    const angle = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const tanHalf = Math.tan(angle / 2);
    const wanted = kind === BEND ? bendRadius : cornerRadius;
    const t = Math.min(wanted / tanHalf, lenPrev / 2, lenNext / 2);
    const r = t * tanHalf;
    const cross = (x - px) * (ny - y) - (y - py) * (nx - x);
    return {
      x,
      y,
      r,
      sweep: cross > 0 ? 1 : 0,
      start: [x + u1[0] * t, y + u1[1] * t],
      end: [x + u2[0] * t, y + u2[1] * t],
    };
  });

  const parts = [];
  corners.forEach((c, i) => {
    const cmd = i === 0 ? "M" : "L";
    if (c.r < 1e-6) {
      parts.push(`${cmd}${fmt(c.x)} ${fmt(c.y)}`);
    } else {
      parts.push(`${cmd}${fmt(c.start[0])} ${fmt(c.start[1])}`);
      parts.push(`A${fmt(c.r)} ${fmt(c.r)} 0 0 ${c.sweep} ${fmt(c.end[0])} ${fmt(c.end[1])}`);
    }
  });
  return parts.join("") + "Z";
}

const shieldPath = [
  roundedPolygon(shield, radius),
  roundedPolygon(letterT, glyphRadius),
  roundedPolygon(dash, glyphRadius),
  roundedPolygon(letterOne, glyphRadius),
].join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" fill="${color}" d="${shieldPath}"/>
  <path fill="${color}" d="${roundedPolygon(bar, radius)}"/>
</svg>
`;

process.stdout.write(svg);
