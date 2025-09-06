import React from 'react';

export default function RoofDiagram() {
  const width = 360;
  const height = 220;
  const C = { x: 40, y: height - 30 }; // eave corner (right angle)
  const A = { x: width - 60, y: height - 30 }; // half-span on ground
  const B = { x: 40, y: 40 }; // rise

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Right triangle showing roof rise, half span, and rafter length"
      style={{ maxWidth: 480, display: 'block' }}
    >
      <polygon
        points={`${C.x},${C.y} ${A.x},${A.y} ${B.x},${B.y}`}
        fill="#eaf3ff"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      {/* Right angle marker at eave */}
      <path
        d={`M ${C.x} ${C.y - 28} L ${C.x + 28} ${C.y - 28} L ${C.x + 28} ${C.y}`}
        fill="none"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      {/* Labels */}
      <text x={(C.x + A.x) / 2} y={C.y - 8} textAnchor="middle" fill="#0f4c81" fontWeight={600}>
        span/2
      </text>
      <text x={C.x + 10} y={(C.y + B.y) / 2} textAnchor="start" fill="#0f4c81" fontWeight={600}>
        rise
      </text>
      <text
        x={(A.x + B.x) / 2 + 6}
        y={(A.y + B.y) / 2 - 6}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={600}
      >
        rafter
      </text>
    </svg>
  );
}
