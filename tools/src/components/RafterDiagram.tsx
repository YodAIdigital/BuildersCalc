import React from 'react';

export default function RafterDiagram() {
  const width = 360;
  const height = 220;
  const C = { x: 40, y: height - 30 }; // eave corner (right angle)
  const A = { x: width - 90, y: height - 30 }; // wall plate to beneath ridge (half width)
  const B = { x: 40, y: 40 }; // rise

  // small overhang extension along the rafter
  const overhangDx = 40;
  const slope = (B.y - A.y) / (B.x - A.x);
  const ux = overhangDx; // approximate along x for extension
  const uy = slope * ux;
  const A2 = { x: A.x + ux, y: A.y + uy };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Rafter geometry showing common rafter and overhang"
      style={{ maxWidth: 480, display: 'block' }}
    >
      {/* Triangle for common rafter */}
      <polygon
        points={`${C.x},${C.y} ${A.x},${A.y} ${B.x},${B.y}`}
        fill="#eaf3ff"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      {/* Right angle at eave */}
      <path
        d={`M ${C.x} ${C.y - 28} L ${C.x + 28} ${C.y - 28} L ${C.x + 28} ${C.y}`}
        fill="none"
        stroke="#0f4c81"
        strokeWidth="2"
      />

      {/* Overhang segment */}
      <line x1={A.x} y1={A.y} x2={A2.x} y2={A2.y} stroke="#0f4c81" strokeWidth="2" />

      {/* Labels */}
      <text x={(C.x + A.x) / 2} y={C.y - 8} textAnchor="middle" fill="#0f4c81" fontWeight={600}>
        width/2
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
        common
      </text>
      <text
        x={(A.x + A2.x) / 2}
        y={(A.y + A2.y) / 2 - 6}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={600}
      >
        overhang
      </text>
      <text
        x={(B.x + A2.x) / 2 + 10}
        y={(B.y + A2.y) / 2 - 10}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={700}
      >
        total
      </text>
    </svg>
  );
}
