import React from 'react';

export default function RightTriangleDiagram() {
  const width = 360;
  const height = 220;
  const C = { x: 40, y: height - 30 };
  const A = { x: width - 20, y: height - 30 };
  const B = { x: 40, y: 20 };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Right triangle with legs a and b, hypotenuse c, angles 1 and 2"
      style={{ maxWidth: 480, display: 'block' }}
    >
      <polygon
        points={`${C.x},${C.y} ${A.x},${A.y} ${B.x},${B.y}`}
        fill="#eaf3ff"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      <path
        d={`M ${C.x} ${C.y - 28} L ${C.x + 28} ${C.y - 28} L ${C.x + 28} ${C.y}`}
        fill="none"
        stroke="#0f4c81"
        strokeWidth="2"
      />
      <text x={(C.x + A.x) / 2} y={C.y - 8} textAnchor="middle" fill="#0f4c81" fontWeight={600}>a</text>
      <text x={C.x + 10} y={(C.y + B.y) / 2} textAnchor="start" fill="#0f4c81" fontWeight={600}>b</text>
      <text
        x={(A.x + B.x) / 2 + 8}
        y={(A.y + B.y) / 2 - 8}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={600}
      >
        c
      </text>
      <text x={A.x - 8} y={A.y - 8} textAnchor="end" fill="#0f4c81" fontWeight={700}>1</text>
      <text x={B.x + 12} y={B.y + 12} textAnchor="start" fill="#0f4c81" fontWeight={700}>2</text>
    </svg>
  );
}

