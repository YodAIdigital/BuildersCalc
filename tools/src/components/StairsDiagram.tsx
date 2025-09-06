import React from 'react';

type Props = {
  risers: number;
  riserHeight: number;
  going: number;
  totalRise: number;
  totalRun: number;
  angle: number;
};

export default function StairsDiagram({
  risers,
  riserHeight,
  going,
  totalRise,
  totalRun,
  angle,
}: Props) {
  const width = 360;
  const height = 220;

  // base position
  const baseX = 40;
  const baseY = height - 30;

  // draw a fixed count of steps for readability; overlay values in legend
  const step = 36; // px tread
  const risePx = 24; // px riser
  const stepsToDraw = 5;

  // Build polyline for steps and stringer anchor
  const topX = baseX + step * (stepsToDraw - 1);
  const topY = baseY - risePx * stepsToDraw;

  const pathParts: string[] = [];
  for (let i = 0; i < stepsToDraw; i++) {
    const x0 = baseX + step * i;
    const y0 = baseY - risePx * i;
    pathParts.push(`M ${x0} ${y0} L ${x0} ${y0 - risePx}`);
    if (i < stepsToDraw - 1) pathParts.push(`M ${x0} ${y0 - risePx} L ${x0 + step} ${y0 - risePx}`);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Stair diagram with labels for riser height, going, total rise/run, and angle"
      style={{ maxWidth: 480, display: 'block' }}
    >
      {/* Steps */}
      <path d={pathParts.join(' ')} stroke="#0f4c81" strokeWidth="2" fill="none" />
      {/* Stringer line */}
      <line x1={baseX} y1={baseY} x2={topX} y2={topY} stroke="#0f4c81" strokeWidth="2" />

      {/* Angle arc at base */}
      <path
        d={`M ${baseX + 26} ${baseY} A 26 26 0 0 0 ${baseX} ${baseY - 26}`}
        fill="none"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      <text x={baseX + 16} y={baseY - 8} textAnchor="middle" fill="#0f4c81" fontWeight={700}>
        θ
      </text>

      {/* Dimension lines */}
      {/* total rise */}
      <line x1={baseX - 10} y1={baseY} x2={baseX - 10} y2={topY} stroke="#0f4c81" strokeWidth="2" />
      <polygon
        points={`${baseX - 14},${baseY} ${baseX - 6},${baseY} ${baseX - 10},${baseY - 6}`}
        fill="#0f4c81"
      />
      <polygon
        points={`${baseX - 14},${topY} ${baseX - 6},${topY} ${baseX - 10},${topY + 6}`}
        fill="#0f4c81"
      />
      <text x={baseX - 16} y={(baseY + topY) / 2} textAnchor="end" fill="#0f4c81" fontSize={12}>
        rise
      </text>

      {/* total run */}
      <line x1={baseX} y1={baseY + 10} x2={topX} y2={baseY + 10} stroke="#0f4c81" strokeWidth="2" />
      <polygon
        points={`${baseX},${baseY + 14} ${baseX},${baseY + 6} ${baseX + 6},${baseY + 10}`}
        fill="#0f4c81"
      />
      <polygon
        points={`${topX},${baseY + 14} ${topX},${baseY + 6} ${topX - 6},${baseY + 10}`}
        fill="#0f4c81"
      />
      <text x={(baseX + topX) / 2} y={baseY + 22} textAnchor="middle" fill="#0f4c81" fontSize={12}>
        run
      </text>
    </svg>
  );
}
