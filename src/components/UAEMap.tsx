import { Link } from "@tanstack/react-router";
import type { listLocationsPublic } from "@/lib/locations.functions";

/**
 * Interactive map of the UAE.
 * The coastline and borders are a simplified trace of real lat/long points,
 * projected into an 800x500 SVG. Each known emirate is placed at its real
 * coordinates; locations added later via admin fall back to their stored
 * map_x / map_y percentages. An animated van drives the coverage route.
 */

const W = 800;
const H = 500;
const LON0 = 51.3;
const LAT1 = 26.45;
const KX = 112; // px per degree longitude (≈ KY · cos 24.5°)
const KY = 123; // px per degree latitude
const OX = 95;
const OY = 18;

function project(lon: number, lat: number): [number, number] {
  return [OX + (lon - LON0) * KX, OY + (LAT1 - lat) * KY];
}

function toPath(points: [number, number][]): string {
  return (
    points
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

// Simplified UAE outline (lon, lat), clockwise from the Saudi border on the west coast.
const UAE_OUTLINE: [number, number][] = [
  [51.58, 24.25],
  [51.76, 24.08],
  [52.05, 24.02],
  [52.35, 24.12],
  [52.62, 24.2],
  [52.95, 24.15],
  [53.3, 24.1],
  [53.62, 24.08],
  [53.95, 24.15],
  [54.15, 24.28],
  [54.38, 24.5],
  [54.6, 24.7],
  [54.85, 24.86],
  [55.05, 25.02],
  [55.22, 25.18],
  [55.35, 25.3],
  [55.48, 25.43],
  [55.6, 25.55],
  [55.75, 25.66],
  [55.92, 25.78],
  [56.02, 25.9],
  [56.08, 26.04],
  [56.16, 25.92],
  [56.2, 25.75],
  [56.27, 25.62],
  [56.36, 25.55],
  [56.34, 25.3],
  [56.36, 25.1],
  [56.37, 24.95],
  [56.2, 24.86],
  [56.02, 24.8],
  [55.98, 24.6],
  [55.83, 24.42],
  [55.78, 24.24],
  [55.97, 24.05],
  [55.65, 23.92],
  [55.48, 23.6],
  [55.58, 23.25],
  [55.24, 22.72],
  [54.4, 22.78],
  [53.5, 22.85],
  [52.58, 22.94],
  [52.05, 23.5],
  [51.6, 24.05],
];

// Neighbouring land (Saudi Arabia / Oman) drawn underneath the UAE.
const NEIGHBOUR_LAND: [number, number][] = [
  [51.0, 24.35],
  [51.58, 24.25],
  [52.5, 24.0],
  [54.0, 24.1],
  [55.3, 24.5],
  [56.0, 24.85],
  [56.37, 24.95],
  [56.5, 24.75],
  [56.75, 24.4],
  [57.1, 24.1],
  [57.6, 23.75],
  [58.2, 23.6],
  [58.2, 22.0],
  [51.0, 22.0],
];
const MUSANDAM: [number, number][] = [
  [56.08, 26.04],
  [56.1, 26.22],
  [56.22, 26.4],
  [56.4, 26.38],
  [56.48, 26.2],
  [56.42, 25.95],
  [56.36, 25.55],
  [56.27, 25.62],
  [56.2, 25.75],
  [56.16, 25.92],
];
const QATAR: [number, number][] = [
  [50.75, 24.75],
  [51.1, 24.55],
  [51.45, 24.9],
  [51.6, 25.3],
  [51.55, 25.9],
  [51.25, 26.15],
  [50.95, 26.0],
  [50.8, 25.5],
];

// Real coordinates + label placement for the seven emirates.
const KNOWN: Record<
  string,
  { lon: number; lat: number; dx: number; dy: number; anchor: "start" | "middle" | "end" }
> = {
  "abu-dhabi": { lon: 54.37, lat: 24.45, dx: 0, dy: 26, anchor: "middle" },
  dubai: { lon: 55.27, lat: 25.2, dx: -14, dy: 14, anchor: "end" },
  sharjah: { lon: 55.42, lat: 25.33, dx: 14, dy: 14, anchor: "start" },
  ajman: { lon: 55.49, lat: 25.42, dx: -14, dy: -6, anchor: "end" },
  "umm-al-quwain": { lon: 55.6, lat: 25.55, dx: -14, dy: -4, anchor: "end" },
  "ras-al-khaimah": { lon: 55.95, lat: 25.78, dx: -14, dy: -6, anchor: "end" },
  fujairah: { lon: 56.33, lat: 25.12, dx: 14, dy: 4, anchor: "start" },
};

const ROUTE_ORDER = Object.keys(KNOWN);

type City = Awaited<ReturnType<typeof listLocationsPublic>>[number];
type Placed = City & {
  x: number;
  y: number;
  label: { dx: number; dy: number; anchor: "start" | "middle" | "end" };
};

function place(c: City): Placed {
  const k = KNOWN[c.slug];
  if (k) {
    const [x, y] = project(k.lon, k.lat);
    return { ...c, x, y, label: { dx: k.dx, dy: k.dy, anchor: k.anchor } };
  }
  return {
    ...c,
    x: (c.map_x / 100) * W,
    y: (c.map_y / 100) * H,
    label: { dx: 0, dy: 24, anchor: "middle" },
  };
}

function orderCities(cities: City[]): Placed[] {
  const bySlug = new Map(cities.map((c) => [c.slug, c] as const));
  const ordered = ROUTE_ORDER.map((s) => bySlug.get(s)).filter((c): c is City => Boolean(c));
  const remaining = cities.filter((c) => !ROUTE_ORDER.includes(c.slug));
  return [...ordered, ...remaining].map(place);
}

function buildRoutePath(cities: Placed[]): string {
  if (cities.length < 2) return "";
  return cities
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
}

export function UAEMap({ cities }: { cities: City[] }) {
  const ordered = orderCities(cities);
  const routePath = buildRoutePath(ordered);
  const [gulfX, gulfY] = project(53.4, 25.55);
  const [omanSeaX, omanSeaY] = project(57.15, 24.75);
  const [saudiX, saudiY] = project(51.42, 23.25);
  const [omanX, omanY] = project(56.9, 23.4);
  const [uaeX, uaeY] = project(53.75, 23.45);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border shadow-card bg-[#EAF5FD]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        role="img"
        aria-label="Map of the United Arab Emirates showing service coverage, with a route connecting the emirates we serve"
      >
        <defs>
          <linearGradient id="uaeSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D6ECFB" />
            <stop offset="100%" stopColor="#EAF5FD" />
          </linearGradient>
          <linearGradient id="uaeLand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F7FD" />
          </linearGradient>
          <pattern id="uaeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="#0057D9"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          </pattern>
          <filter id="uaeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0B2545" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Sea */}
        <rect width={W} height={H} fill="url(#uaeSea)" />
        <rect width={W} height={H} fill="url(#uaeGrid)" />

        {/* Neighbouring countries */}
        <g fill="#E3ECF4" stroke="#C9D8E6" strokeWidth="1" strokeLinejoin="round">
          <path d={toPath(NEIGHBOUR_LAND)} />
          <path d={toPath(MUSANDAM)} />
          <path d={toPath(QATAR)} />
        </g>

        {/* UAE */}
        <path
          d={toPath(UAE_OUTLINE)}
          fill="url(#uaeLand)"
          stroke="#0057D9"
          strokeWidth="1.6"
          strokeOpacity="0.55"
          strokeLinejoin="round"
          filter="url(#uaeShadow)"
        />

        {/* Geography labels */}
        <g
          fontFamily="inherit"
          fontWeight="600"
          letterSpacing="3"
          fontSize="11"
          textAnchor="middle"
        >
          <text x={gulfX} y={gulfY} fill="#0057D9" fillOpacity="0.45" fontStyle="italic">
            ARABIAN GULF
          </text>
          <text x={omanSeaX} y={omanSeaY} fill="#0057D9" fillOpacity="0.45" fontStyle="italic">
            <tspan x={omanSeaX}>GULF OF</tspan>
            <tspan x={omanSeaX} dy="15">
              OMAN
            </tspan>
          </text>
          <text x={saudiX} y={saudiY} fill="#7A8CA3" fillOpacity="0.7">
            <tspan x={saudiX}>SAUDI</tspan>
            <tspan x={saudiX} dy="15">
              ARABIA
            </tspan>
          </text>
          <text x={omanX} y={omanY} fill="#7A8CA3" fillOpacity="0.7">
            OMAN
          </text>
          <text
            x={uaeX}
            y={uaeY}
            fill="#0B2545"
            fillOpacity="0.18"
            fontSize="20"
            letterSpacing="8"
            fontWeight="700"
          >
            UNITED ARAB EMIRATES
          </text>
        </g>

        {/* Compass */}
        <g transform={`translate(${W - 48},${H - 52})`} opacity="0.55">
          <circle r="18" fill="#fff" stroke="#0057D9" strokeOpacity="0.3" />
          <path d="M0,-13 L5,2 L0,-1 L-5,2 Z" fill="#0057D9" />
          <text y="-21" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0057D9">
            N
          </text>
        </g>

        {/* Road connecting the emirates we serve */}
        {routePath && (
          <>
            <path
              id="coverage-route"
              d={routePath}
              fill="none"
              stroke="#0B2545"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.08"
            />
            <path
              d={routePath}
              fill="none"
              stroke="#0057D9"
              strokeWidth="2"
              strokeDasharray="7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="28"
                to="0"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </path>
          </>
        )}

        {/* City pins */}
        {ordered.map((c, i) => (
          <g key={c.slug}>
            <circle cx={c.x} cy={c.y} r="8" fill="#0057D9" opacity="0.2">
              <animate
                attributeName="r"
                values="6;16;6"
                dur="2.6s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0;0.3"
                dur="2.6s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={c.x} cy={c.y} r="5.5" fill="#0057D9" stroke="#fff" strokeWidth="2.5" />
          </g>
        ))}

        {/* Van driving along the coverage route, looping continuously */}
        {routePath && (
          <g>
            <g transform="translate(-13,-9)">
              <rect
                x="0"
                y="0"
                width="26"
                height="16"
                rx="2"
                fill="#0B2545"
                opacity="0.18"
                transform="translate(1,3)"
              />
              <rect
                x="0"
                y="3"
                width="26"
                height="12"
                rx="3"
                fill="#FFFFFF"
                stroke="#0057D9"
                strokeWidth="1.5"
              />
              <rect
                x="16"
                y="0"
                width="9"
                height="8"
                rx="1.5"
                fill="#FFFFFF"
                stroke="#0057D9"
                strokeWidth="1.5"
              />
              <rect x="18.5" y="1.5" width="4.5" height="4" rx="0.5" fill="#BDE3F8" />
              <circle cx="6" cy="16" r="2.4" fill="#0B2545" />
              <circle cx="20" cy="16" r="2.4" fill="#0B2545" />
            </g>
            <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
              <mpath href="#coverage-route" />
            </animateMotion>
          </g>
        )}

        {/* City labels */}
        <g fontFamily="inherit" fontSize="12.5" fontWeight="700">
          {ordered.map((c) => (
            <text
              key={c.slug}
              x={c.x + c.label.dx}
              y={c.y + c.label.dy}
              textAnchor={c.label.anchor}
              fill="#0B2545"
              stroke="#fff"
              strokeWidth="4"
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {c.name}
            </text>
          ))}
        </g>
      </svg>

      {/* Clickable hotspots overlaid on each pin */}
      <div className="absolute inset-0">
        {ordered.map((c) => (
          <Link
            key={c.slug}
            to="/locations/$city"
            params={{ city: c.slug }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(c.x / W) * 100}%`, top: `${(c.y / H) * 100}%` }}
            aria-label={`View chiller van service in ${c.name}`}
          >
            <span className="block h-7 w-7 rounded-full" aria-hidden />
            <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy text-white text-[11px] font-semibold px-3 py-1.5 shadow-elegant opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none">
              View {c.name} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
