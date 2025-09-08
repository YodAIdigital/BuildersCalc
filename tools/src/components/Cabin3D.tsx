import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Shape } from 'three';

export type Cabin3DProps = {
  length: number; // mm
  width: number; // mm
  height: number; // mm
  roofType: 'flat' | 'mono' | 'dual';
  pitchDeg: number;
  overhang: number; // mm
  rotationDeg?: number; // yaw rotate the whole model for easier viewing
  windows?: { count: number; width: number; height: number }[];
  doors?: { count: number; width: number; height: number }[];
  windowWall?: 'front' | 'back' | 'left' | 'right';
  doorWall?: 'front' | 'back' | 'left' | 'right';
  wallColor?: string;
  roofColor?: string;
  onReady?: (api: { snapshot: () => string | null }) => void;
};

function MmToM({ children }: { children?: React.ReactNode }) {
  return <group scale={[0.001, 0.001, 0.001]}>{children}</group>;
}

import { BufferGeometry, Float32BufferAttribute } from 'three';

function makeDualSideGeometry(length: number, width: number, height: number, over: number, rise: number, side: -1 | 1) {
  // side: -1 for negative Z eave, +1 for positive Z eave
  const L = length / 2 + over;
  const Z = side * (width / 2 + over);
  const ridgeY = height + rise; // rise based on wall run (width/2)
  const eaveYOut = height - (over * (rise / (width / 2))); // decrease by slope over overhang
  const positions = new Float32Array([
    -L, ridgeY, 0, // A ridge
     L, ridgeY, 0, // B ridge
     L, eaveYOut, Z,  // C outer eave
    -L, ridgeY, 0, // A ridge
     L, eaveYOut, Z,  // C
    -L, eaveYOut, Z,  // D
  ]);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

function makeMonoGeometry(length: number, width: number, height: number, over: number, rise: number, highSide: -1 | 1) {
  // highSide: +1 => high at +Z; -1 => high at -Z
  const L = length / 2 + over;
  const ZLow = -highSide * (width / 2 + over);
  const ZHigh = highSide * (width / 2 + over);
  // Adjust eave heights so that at wall lines (±width/2) y equals height/height+rise
  const slope = rise / width;
  const lowYOut = height - over * slope;
  const highYOut = height + rise + over * slope;
  const positions = new Float32Array([
    -L, highYOut, ZHigh, // A high eave outboard
     L, highYOut, ZHigh, // B
     L, lowYOut, ZLow,   // C low eave outboard
    -L, highYOut, ZHigh, // A
     L, lowYOut, ZLow,   // C
    -L, lowYOut, ZLow,   // D
  ]);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

function RoofGeom({ length, width, height, roofType, pitchDeg, overhang, roofColor }: Cabin3DProps) {
  const pitch = roofType === 'flat' ? 0 : pitchDeg;
  const run = roofType === 'dual' ? width / 2 : width; // horizontal run per side
  const theta = (pitch * Math.PI) / 180; // rad
  const rise = run * Math.tan(theta);
  const over = overhang;

  if (roofType === 'dual') {
    const leftGeo = makeDualSideGeometry(length, width, height, over, rise, -1);
    const rightGeo = makeDualSideGeometry(length, width, height, over, rise, +1);
    return (
      <group>
        <mesh geometry={leftGeo}>
          <meshStandardMaterial color={roofColor} />
        </mesh>
        <mesh geometry={rightGeo}>
          <meshStandardMaterial color={roofColor} />
        </mesh>
      </group>
    );
  }

  if (roofType === 'mono') {
    const monoHighSide: -1 | 1 = -1; // slope higher at -Z to match ends
    const monoGeo = makeMonoGeometry(length, width, height, over, rise, monoHighSide);
    return (
      <mesh geometry={monoGeo}>
        <meshStandardMaterial color={roofColor} />
      </mesh>
    );
  }

  // Flat roof: simple horizontal plane at eave height
  return (
    <mesh position={[0, height + 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[length + 2 * over, width + 2 * over]} />
      <meshStandardMaterial color={roofColor} />
    </mesh>
  );
}

export function CabinModel(props: Cabin3DProps) {
  const { length, width, height, roofType, pitchDeg, overhang, rotationDeg, windows = [], doors = [], windowWall = 'right', doorWall = 'front', wallColor = '#757575', roofColor = '#7f7f7f', onReady } = props;
  const glRef = useRef<any>(null);

  React.useEffect(() => {
    if (!onReady) return;
    const api = {
      snapshot: () => {
        const gl: any = (glRef.current as any)?.gl;
        try {
          return gl?.domElement?.toDataURL('image/png') || null;
        } catch {
          return null;
        }
      },
    };
    onReady(api);
  }, [onReady]);

  const wallThickness = 90; // mm visual only

  // Derived geometry values for gables
  const runDual = roofType === 'dual' ? width / 2 : width;
  const theta = (roofType === 'flat' ? 0 : pitchDeg) * Math.PI / 180;
  const rise = roofType === 'flat' ? 0 : runDual * Math.tan(theta);

  // Simple helpers to distribute openings along the front wall
  function spread(n: number, span: number) {
    const a: number[] = [];
    if (n <= 0) return a;
    const gap = span / (n + 1);
    for (let i = 1; i <= n; i++) a.push(-span / 2 + gap * i);
    return a;
  }

  return (
    <Canvas shadows ref={glRef as any} camera={{ position: [2.5, 2, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <MmToM>
        <group rotation={[0, (rotationDeg || 0) * Math.PI / 180, 0]}>
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[length * 2, width * 2]} />
            <meshStandardMaterial color="#f2f2f2" />
          </mesh>
          {/* Walls as simple boxes around origin */}
          <mesh position={[0, height / 2, -width / 2]} castShadow>
            <boxGeometry args={[length, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[0, height / 2, width / 2]} castShadow>
            <boxGeometry args={[length, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[-length / 2, height / 2, 0]} castShadow>
            <boxGeometry args={[wallThickness, height, width]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[length / 2, height / 2, 0]} castShadow>
            <boxGeometry args={[wallThickness, height, width]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>

          {/* Gable infill to roof peak */}
          {roofType === 'dual' && rise > 0 && (
            <>
              {/* Right end gable (x +) */}
              <mesh geometry={makeDualEndPrism(width, height, rise, wallThickness)} position={[length / 2, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
              </mesh>
              {/* Left end gable (x -) */}
              <mesh geometry={makeDualEndPrism(width, height, rise, wallThickness)} position={[-length / 2, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
              </mesh>
            </>
          )}
          {roofType === 'mono' && rise > 0 && (
            <>
              {/* Right end (+X) high at -Z */}
              <mesh geometry={makeMonoEndPrism(width, height, rise, wallThickness, true)} position={[length / 2, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
              </mesh>
              {/* Left end (−X) high at -Z */}
              <mesh geometry={makeMonoEndPrism(width, height, rise, wallThickness, true)} position={[-length / 2, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
              </mesh>
            </>
          )}

          {/* Doors */}
          {(() => {
            const count = doors.reduce((a, x) => a + x.count, 0);
            const door = doors[0] || { width: 860, height: 1980 } as any;
            const sill = 0;
            const positions: JSX.Element[] = [];
            if (count > 0) {
              if (doorWall === 'front' || doorWall === 'back') {
                const xs = spread(count, length - 300); // margins
                const z = (doorWall === 'front' ? 1 : -1) * (width / 2 + wallThickness / 2 + 1);
                xs.forEach((x, i) => {
                  positions.push(
                    <mesh key={`door-${doorWall}-${i}`} position={[x, sill + door.height / 2, z]}>
                      <boxGeometry args={[door.width, door.height, Math.max(10, wallThickness - 10)]} />
                      <meshStandardMaterial color="#9ec5ff" />
                    </mesh>
                  );
                });
              } else {
                const zs = spread(count, width - 300);
                const x = (doorWall === 'right' ? 1 : -1) * (length / 2 + wallThickness / 2 + 1);
                zs.forEach((z, i) => {
                  positions.push(
                    <mesh key={`door-${doorWall}-${i}`} position={[x, sill + door.height / 2, z]}>
                      <boxGeometry args={[Math.max(10, wallThickness - 10), door.height, door.width]} />
                      <meshStandardMaterial color="#9ec5ff" />
                    </mesh>
                  );
                });
              }
            }
            return positions;
          })()}

          {/* Windows */}
          {(() => {
            const count = windows.reduce((a, x) => a + x.count, 0);
            const win = windows[0] || { width: 1200, height: 900 } as any;
            const sill = 1000; // mm sill height
            const positions: JSX.Element[] = [];
            if (count > 0) {
              if (windowWall === 'front' || windowWall === 'back') {
                const xs = spread(count, length - 300);
                const z = (windowWall === 'front' ? 1 : -1) * (width / 2 + wallThickness / 2 + 1);
                xs.forEach((x, i) => {
                  positions.push(
                    <mesh key={`win-${windowWall}-${i}`} position={[x, sill + win.height / 2, z]}>
                      <boxGeometry args={[win.width, win.height, Math.max(10, wallThickness - 10)]} />
                      <meshStandardMaterial color="#cfe7ff" />
                    </mesh>
                  );
                });
              } else {
                const zs = spread(count, width - 300);
                const x = (windowWall === 'right' ? 1 : -1) * (length / 2 + wallThickness / 2 + 1);
                zs.forEach((z, i) => {
                  positions.push(
                    <mesh key={`win-${windowWall}-${i}`} position={[x, sill + win.height / 2, z]}>
                      <boxGeometry args={[Math.max(10, wallThickness - 10), win.height, win.width]} />
                      <meshStandardMaterial color="#cfe7ff" />
                    </mesh>
                  );
                });
              }
            }
            return positions;
          })()}

          {/* Roof */}
          <RoofGeom {...props} />
        </group>
      </MmToM>
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}

function yAtWallDual(width: number, over: number, height: number, rise: number) {
  // y at wall line for dual pitch when there is overhang
  // y = height + rise * (2*over / (width + 2*over))
  return height + rise * ((2 * over) / (width + 2 * over));
}

function makeDualEndPrism(width: number, height: number, rise: number, thickness: number) {
  const t = thickness / 2;
  const zNeg = -width / 2;
  const zPos = width / 2;
  // Triangular prism: points at x = ±t
  const A = [-t, height, zNeg];
  const B = [-t, height, zPos];
  const C = [-t, height + rise, 0];
  const A2 = [t, height, zNeg];
  const B2 = [t, height, zPos];
  const C2 = [t, height + rise, 0];

  const positions = [
    // Front face (x = -t)
    ...A, ...B, ...C,
    // Back face (x = +t)
    ...A2, ...C2, ...B2,
    // Side AB rectangle
    ...A, ...A2, ...B2,   ...A, ...B2, ...B,
    // Side BC rectangle
    ...B, ...B2, ...C2,   ...B, ...C2, ...C,
    // Side CA rectangle
    ...C, ...C2, ...A2,   ...C, ...A2, ...A,
  ];
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(positions), 3));
  geo.computeVertexNormals();
  return geo;
}

function makeMonoEndPrism(width: number, height: number, rise: number, thickness: number, highAtNegZ: boolean) {
  const t = thickness / 2;
  const zNeg = -width / 2;
  const zPos = width / 2;
  const yNeg = highAtNegZ ? height + rise : height;
  const yPos = highAtNegZ ? height : height + rise;

  // Quad prism: top edge sloped from (zNeg,yNeg) to (zPos,yPos); bottom edge at height
  const A = [-t, yNeg, zNeg];
  const B = [-t, yPos, zPos];
  const C = [-t, height, zPos];
  const D = [-t, height, zNeg];
  const A2 = [t, yNeg, zNeg];
  const B2 = [t, yPos, zPos];
  const C2 = [t, height, zPos];
  const D2 = [t, height, zNeg];

  const positions = [
    // Front face (x=-t)
    ...A, ...B, ...C,   ...A, ...C, ...D,
    // Back face (x=+t)
    ...A2, ...C2, ...B2,  ...A2, ...D2, ...C2,
    // Sides
    // AB side
    ...A, ...A2, ...B2,   ...A, ...B2, ...B,
    // BC side
    ...B, ...B2, ...C2,   ...B, ...C2, ...C,
    // CD side
    ...C, ...C2, ...D2,   ...C, ...D2, ...D,
    // DA side
    ...D, ...D2, ...A2,   ...D, ...A2, ...A,
  ];
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(positions), 3));
  geo.computeVertexNormals();
  return geo;
}

export default function Cabin3D(props: Cabin3DProps) {
  return <CabinModel {...props} />;
}
