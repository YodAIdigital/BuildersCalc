import React from 'react';

type Props = {
  halfSpan?: number;
  rise?: number;
  pitch?: number;
  common?: number;
  overhang?: number;
};

export default function CombinedRoofDiagram({ halfSpan, rise, pitch, common, overhang }: Props) {
  const width = 360;
  const height = 220;
  const C = { x: 40, y: height - 30 }; // eave corner (right angle)
  const A = { x: width - 60, y: height - 30 }; // half-span
  const B = { x: 40, y: 40 }; // rise

  // small overhang extension along the rafter
  const overhangDx = 36;
  const slope = (B.y - A.y) / (B.x - A.x);
  const ux = overhangDx;
  const uy = slope * ux;
  const A2 = { x: A.x + ux, y: A.y + uy };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Roof & rafter triangle showing half-span, rise, common, and overhang"
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

      {/* Overhang */}
      <line x1={A.x} y1={A.y} x2={A2.x} y2={A2.y} stroke="#0f4c81" strokeWidth="2" />

      {/* Labels */}
      <text x={(C.x + A.x) / 2} y={C.y - 8} textAnchor="middle" fill="#0f4c81" fontWeight={600}>
        half-span{halfSpan ? ` ${halfSpan.toFixed(0)}mm` : ''}
      </text>
      <text x={C.x + 10} y={(C.y + B.y) / 2} textAnchor="start" fill="#0f4c81" fontWeight={600}>
        rise{rise ? ` ${rise.toFixed(0)}mm` : ''}
      </text>
      <text
        x={(A.x + B.x) / 2 + 6}
        y={(A.y + B.y) / 2 - 6}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={600}
      >
        common{common ? ` ${common.toFixed(0)}mm` : ''}
      </text>
      <text
        x={(A.x + A2.x) / 2}
        y={(A.y + A2.y) / 2 - 6}
        textAnchor="middle"
        fill="#0f4c81"
        fontWeight={600}
      >
        overhang{overhang ? ` ${overhang.toFixed(0)}mm` : ''}
      </text>
      <text x={A.x - 10} y={A.y - 10} textAnchor="end" fill="#0f4c81" fontWeight={700}>
        pitch{pitch ? ` ${pitch.toFixed(1)}°` : ''}
      </text>
    </svg>
  );
}
