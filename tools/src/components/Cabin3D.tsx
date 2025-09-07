import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export type Cabin3DProps = {
  length: number; // mm
  width: number; // mm
  height: number; // mm
  roofType: 'flat' | 'mono' | 'dual';
  pitchDeg: number;
  overhang: number; // mm
  onReady?: (api: { snapshot: () => string | null }) => void;
};

function MmToM({ children }: { children?: React.ReactNode }) {
  return <group scale={[0.001, 0.001, 0.001]}>{children}</group>;
}

function RoofGeom({ length, width, height, roofType, pitchDeg, overhang }: Cabin3DProps) {
  // Simplified planes for roof decks
  const run = roofType === 'dual' ? width / 2 : width;
  const pitch = roofType === 'flat' ? 0 : pitchDeg;
  const rise = roofType === 'flat' ? 0 : run * Math.tan((pitch * Math.PI) / 180);
  const slopeLen = Math.sqrt(run * run + rise * rise);
  const over = overhang;

  // Center model on origin; y-up
  const eaveY = height;

  if (roofType === 'dual') {
    // Two planes
    return (
      <group position={[0, eaveY, 0]}>
        <mesh rotation={[-Math.atan2(rise, run), 0, 0]} position={[0, rise / 2, 0]}>
          <planeGeometry args={[length + 2 * over, slopeLen + over]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        <mesh rotation={[Math.atan2(rise, run), 0, Math.PI]} position={[0, rise / 2, 0]}>
          <planeGeometry args={[length + 2 * over, slopeLen + over]} />
          <meshStandardMaterial color="#bbbbbb" />
        </mesh>
      </group>
    );
  }

  // mono or flat
  const rot = roofType === 'flat' ? 0 : -Math.atan2(rise, run);
  return (
    <group position={[0, eaveY, 0]}>
      <mesh rotation={[rot, 0, 0]}> 
        <planeGeometry args={[length + 2 * over, slopeLen + over]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  );
}

export function CabinModel(props: Cabin3DProps) {
  const { length, width, height, roofType, pitchDeg, overhang, onReady } = props;
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

  return (
    <Canvas shadows ref={glRef as any} camera={{ position: [2.5, 2, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <MmToM>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[length * 2, width * 2]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        {/* Walls as simple boxes around origin */}
        <mesh position={[0, height / 2, -width / 2]} castShadow>
          <boxGeometry args={[length, height, wallThickness]} />
          <meshStandardMaterial color="#e6e6e6" />
        </mesh>
        <mesh position={[0, height / 2, width / 2]} castShadow>
          <boxGeometry args={[length, height, wallThickness]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh position={[-length / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[wallThickness, height, width]} />
          <meshStandardMaterial color="#e6e6e6" />
        </mesh>
        <mesh position={[length / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[wallThickness, height, width]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        {/* Roof */}
        <RoofGeom {...props} />
      </MmToM>
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}

export default function Cabin3D(props: Cabin3DProps) {
  return <CabinModel {...props} />;
}
