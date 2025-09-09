import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
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
  doorWall?: 'front' | 'back' | 'left' | 'right';
  wallColor?: string;
  roofColor?: string;
  frameColor?: string;
  cladding?: string; // walls reflect chosen material
  panX?: number; // mm
  panY?: number; // mm
  zoom?: number; // 1 = 100%
  onReady?: (api: { snapshot: () => string | null }) => void;
};

function MmToM({ children }: { children?: React.ReactNode }) {
  return <group scale={[0.001, 0.001, 0.001]}>{children}</group>;
}

import { BufferGeometry, Float32BufferAttribute } from 'three';

function makeDualSideGeometry(length: number, width: number, height: number, over: number, rise: number, side: -1 | 1) {
  const lift = 2; // mm lift to avoid z-fighting with wall tops
  // side: -1 for negative Z eave, +1 for positive Z eave
  const L = length / 2 + over;
  const Z = side * (width / 2 + over);
  const ridgeY = height + rise + lift; // rise based on wall run (width/2)
  const eaveYOut = height - (over * (rise / (width / 2))) + lift; // decrease by slope over overhang
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
  // UVs: U across X (-L..+L) → 0..1; V ridge→eave → 0..1
  const uvs: number[] = [];
  const xSpan = 2 * L;
  const ySpan = Math.max(1e-6, ridgeY - eaveYOut);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i + 0];
    const y = positions[i + 1];
    const u = (x + L) / xSpan;
    const v = Math.max(0, Math.min(1, (ridgeY - y) / ySpan));
    uvs.push(u, v);
  }
  geo.setAttribute('uv', new Float32BufferAttribute(new Float32Array(uvs), 2));
  geo.computeVertexNormals();
  return geo;
}

function makeMonoGeometry(length: number, width: number, height: number, over: number, rise: number, highSide: -1 | 1) {
  const lift = 2;
  // highSide: +1 => high at +Z; -1 => high at -Z
  const L = length / 2 + over;
  const ZLow = -highSide * (width / 2 + over);
  const ZHigh = highSide * (width / 2 + over);
  // Adjust eave heights so that at wall lines (±width/2) y equals height/height+rise
  const slope = rise / width;
  const lowYOut = height - over * slope + lift;
  const highYOut = height + rise + over * slope + lift;
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
  // UVs: U across X (-L..+L) → 0..1; V along slope from high to low
  const uvs: number[] = [];
  const xSpan = 2 * L;
  const zSpan = Math.max(1e-6, ZHigh - ZLow);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i + 0];
    const z = positions[i + 2];
    const u = (x + L) / xSpan;
    const v = Math.max(0, Math.min(1, (ZHigh - z) / zSpan));
    uvs.push(u, v);
  }
  geo.setAttribute('uv', new Float32BufferAttribute(new Float32Array(uvs), 2));
  geo.computeVertexNormals();
  return geo;
}

type RoofExtras = { roofTex?: { map?: any; normalMap?: any; roughnessMap?: any } };
function RoofGeom({ length, width, height, roofType, pitchDeg, overhang, roofColor, roofTex }: Cabin3DProps & RoofExtras) {
  const pitch = roofType === 'flat' ? 0 : pitchDeg;
  const run = roofType === 'dual' ? width / 2 : width; // horizontal run per side
  const theta = (pitch * Math.PI) / 180; // rad
  const rise = run * Math.tan(theta);
  const over = overhang;

  if (roofType === 'dual') {
    const leftGeo = makeDualSideGeometry(length, width, height, over, rise, -1);
    const rightGeo = makeDualSideGeometry(length, width, height, over, rise, +1);
    const lift = 2;
    const ridgeY = height + rise + lift;
    const eaveYOut = height - (over * (rise / (width / 2))) + lift;
    const capThick = 6;
    const capWide = 26;
    const ridgeGap = 100; // end gap each side
    const ridgeLen = Math.max(0, length - ridgeGap * 2);
    const midY = ridgeY + capThick / 2;

    return (
      <group>
        {/* Roof planes */}
        <mesh geometry={leftGeo} renderOrder={1}>
          <meshStandardMaterial color={roofColor} normalMap={roofTex?.normalMap} normalScale={[2, 2]} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-1} side={DoubleSide} />
          <Edges color="#e5e5e5" threshold={25} />
        </mesh>
        <mesh geometry={rightGeo} renderOrder={1}>
          <meshStandardMaterial color={roofColor} normalMap={roofTex?.normalMap} normalScale={[2, 2]} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-1} side={DoubleSide} />
          <Edges color="#e5e5e5" threshold={25} />
        </mesh>

        {/* Ridge cap (shorter than full length) */}
        {ridgeLen > 0 && (
          <mesh position={[0, ridgeY + capThick / 2, 0]} renderOrder={2}>
            <boxGeometry args={[ridgeLen, capThick, capWide]} />
            <meshStandardMaterial color={roofColor} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-2} />
          </mesh>
        )}

        {/* Barge caps at both ends (x ±) on both slopes (±z) */}
        {([-1, 1] as const).map((xsgn) => (
          <group key={`barge-${xsgn}`} position={[xsgn * (length / 2), 0, 0]}>
            {([-1, 1] as const).map((zsgn) => {
              const centerZ = zsgn * (width / 4 + over / 2);
              const centerY = (ridgeY + eaveYOut) / 2;
              const barLen = width / 2 + over;
              const rotX = zsgn > 0 ? theta : -theta;
              return (
                <mesh key={`bar-${zsgn}`} position={[0, centerY, centerZ]} rotation={[rotX, 0, 0]} renderOrder={2}>
                  <boxGeometry args={[capThick, capWide, barLen]} />
                  <meshStandardMaterial color={roofColor} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-2} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    );
  }

  if (roofType === 'mono') {
    const monoHighSide: -1 | 1 = -1; // slope higher at -Z to match ends
    const monoGeo = makeMonoGeometry(length, width, height, over, rise, monoHighSide);
    const lift = 2;
    const ridgeY = height + rise + lift; // high eave y
    const lowYOut = height - over * (rise / width) + lift; // low eave y
    const capThick = 6;
    const capWide = 26;
    return (
      <group>
        <mesh geometry={monoGeo} renderOrder={1}>
          <meshStandardMaterial color={roofColor} normalMap={roofTex?.normalMap} normalScale={[2, 2]} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-1} side={DoubleSide} />
          <Edges color="#e5e5e5" threshold={25} />
        </mesh>
        {/* Barge caps at both ends */}
        {([-1, 1] as const).map((xsgn) => (
          <group key={`mono-barge-${xsgn}`} position={[xsgn * (length / 2), 0, 0]}>
            {([-1, 1] as const).map((zsgn) => {
              const centerZ = zsgn * (width / 2 + over) / 2;
              const centerY = (ridgeY + lowYOut) / 2;
              const barLen = width + over;
              const rotX = zsgn > 0 ? theta : -theta;
              return (
                <mesh key={`mbar-${zsgn}`} position={[0, centerY, centerZ]} rotation={[rotX, 0, 0]} renderOrder={2}>
                  <boxGeometry args={[capThick, capWide, barLen]} />
                  <meshStandardMaterial color={roofColor} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-2} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    );
  }

  // Flat roof: simple horizontal plane at eave height
  return (
    <mesh position={[0, height + 1, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[length + 2 * over, width + 2 * over]} />
      <meshStandardMaterial color={roofColor} normalMap={roofTex?.normalMap} normalScale={[2, 2]} metalness={0.7} roughness={0.35} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-1} side={DoubleSide} />
      <Edges color="#e5e5e5" threshold={25} />
    </mesh>
  );
}

import { RepeatWrapping, BufferAttribute, Color, DoubleSide } from 'three';
import { textureSpecForCladding, normalizeCladding, applyTint } from './textures/spec';
import { makeStripeNormalTexture, makeWoodAlbedoTexture } from './textures/procedural';

export function CabinModel(props: Cabin3DProps) {
  const { onReady } = props;
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

  return (
    <Canvas shadows ref={glRef as any} camera={{ position: [2.5, 2, 3], fov: 45 }}>
      <CabinScene {...props} />
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}

function CabinScene(props: Cabin3DProps) {
  const { length, width, height, roofType, pitchDeg, overhang, rotationDeg, windows = [], doors = [], doorWall = 'front', wallColor = '#757575', roofColor = '#7f7f7f', frameColor = '#262626', cladding = 'corrugate', panX = 0, panY = 0, zoom = 1 } = props;
  const wallThickness = 90; // mm visual only
  const wallGap = 10; // mm shorter to avoid intersection with roof
  const wallVisualHeight = Math.max(0, height - wallGap);

  // Textures
  const claddingKey = normalizeCladding(cladding);
  const spec = useMemo(() => textureSpecForCladding(claddingKey), [claddingKey]);

  // Procedural normal textures: one tile per material, repeated physically
  const metalNormalTile = useMemo(() => makeStripeNormalTexture(256, 0.4, 0.18, 3), []);
  const woodNormalTile = useMemo(() => makeStripeNormalTexture(256, 0.12, 0.06, 1.5), []); // thin board reveal
  const roofNormalTile = metalNormalTile; // corrugate style

  // Clone textures per side so we can set repeat/rotation independently
  function cloneTex(t: any) {
    return t?.clone ? t.clone() : t;
  }
  const wallFrontSet: any = useMemo(() => ({
    normalMap: cloneTex(spec.type === 'metal' ? metalNormalTile : spec.type === 'wood' ? woodNormalTile : undefined),
    map: spec.type === 'ply' ? makeWoodAlbedoTexture(256) : undefined,
  }), [spec.type, metalNormalTile, woodNormalTile]);
  const wallBackSet: any = useMemo(() => ({
    normalMap: cloneTex(spec.type === 'metal' ? metalNormalTile : spec.type === 'wood' ? woodNormalTile : undefined),
    map: spec.type === 'ply' ? makeWoodAlbedoTexture(256) : undefined,
  }), [spec.type, metalNormalTile, woodNormalTile]);
  const wallLeftSet: any = useMemo(() => ({
    normalMap: cloneTex(spec.type === 'metal' ? metalNormalTile : spec.type === 'wood' ? woodNormalTile : undefined),
    map: spec.type === 'ply' ? makeWoodAlbedoTexture(256) : undefined,
  }), [spec.type, metalNormalTile, woodNormalTile]);
  const wallRightSet: any = useMemo(() => ({
    normalMap: cloneTex(spec.type === 'metal' ? metalNormalTile : spec.type === 'wood' ? woodNormalTile : undefined),
    map: spec.type === 'ply' ? makeWoodAlbedoTexture(256) : undefined,
  }), [spec.type, metalNormalTile, woodNormalTile]);
  const roofSet: any = useMemo(() => ({ normalMap: cloneTex(roofNormalTile) }), [roofNormalTile]);

  // Configure repeats and rotations (swap repeats if rotated by 90°)
  function setup(set: any, repeatU: number, repeatV: number, rotationRad: number) {
    const swap = Math.abs((rotationRad % Math.PI) - Math.PI / 2) < 1e-3;
    for (const key of ['map', 'normalMap', 'roughnessMap', 'bumpMap'] as const) {
      const t = set[key];
      if (!t) continue;
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.center?.set(0.5, 0.5);
      const u = Math.max(1, repeatU);
      const v = Math.max(1, repeatV);
      t.repeat.set(swap ? v : u, swap ? u : v);
      t.rotation = rotationRad;
      t.needsUpdate = true;
    }
  }

  // Decide orientation rotation (ribs vertical => rotate 90deg if texture stripes are horizontal by default)
  const wallsRotation = useMemo(() => (spec.orientation.walls === 'horizontal-boards' ? Math.PI / 2 : 0), [spec.orientation.walls]);

  // Compute repeats from physical mm sizes
  const frontRepeatU = Math.max(1, length / spec.repeats.mmPerU);
  const backRepeatU = frontRepeatU;
  const sideRepeatU = Math.max(1, width / spec.repeats.mmPerU);
  const wallRepeatV = Math.max(1, height / spec.repeats.mmPerV);

  setup(wallFrontSet, frontRepeatU, wallRepeatV, wallsRotation);
  setup(wallBackSet, backRepeatU, wallRepeatV, wallsRotation);
  setup(wallLeftSet, sideRepeatU, wallRepeatV, wallsRotation);
  setup(wallRightSet, sideRepeatU, wallRepeatV, wallsRotation);

  // Roof texture configuration (corrugate always)
  // Orient ribs along slope → rotate 90° if stripes are horizontal by default
  const runForSlope = roofType === 'dual' ? width / 2 : width; // mm
  const thetaRad = (roofType === 'flat' ? 0 : pitchDeg) * Math.PI / 180;
  const slopeRise = roofType === 'flat' ? 0 : runForSlope * Math.tan(thetaRad);
  const slopeLen = Math.sqrt(runForSlope * runForSlope + slopeRise * slopeRise);
  const roofRepeatU = Math.max(1, (length + 2 * overhang) / 76);
  const roofRepeatV = Math.max(1, slopeLen / 1000);
  setup(roofSet, roofRepeatU, roofRepeatV, 0);

  // Derive wall material color with tinting rules
  const wallMatColor = useMemo(() => {
    if (spec.type === 'metal') return wallColor;
    if (spec.type === 'wood') {
      if (claddingKey === 'cedar weatherboard') return '#d9b275'; // lighter oiled cedar tone
      return applyTint(wallColor, 0.35);
    }
    if (spec.type === 'ply') return '#d6b98b'; // natural ply
    if (spec.type === 'membrane') return '#333333';
    if (spec.type === 'pir') return '#f4f4f4';
    return wallColor;
  }, [spec.type, wallColor, claddingKey]);

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
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight skyColor={'#ffffff'} groundColor={'#444444'} intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-6, 8, -6]} intensity={0.6} />
      <MmToM>
        <group scale={[zoom, zoom, zoom]}>
          {(() => {
            const yaw = ((rotationDeg || 0) * Math.PI) / 180;
            const sideX = panX * Math.cos(yaw);
            const sideZ = panX * Math.sin(yaw);
            return (
              <group rotation={[0, yaw, 0]} position={[sideX, panY, sideZ]}>
                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                  <planeGeometry args={[length * 2, width * 2]} />
                  <meshStandardMaterial color="#f2f2f2" />
                </mesh>
                {/* Walls as simple boxes around origin */}
                <mesh position={[0, wallVisualHeight / 2, -width / 2]} castShadow>
                  <boxGeometry args={[length, wallVisualHeight, wallThickness]} />
                  <meshStandardMaterial
                    color={wallMatColor}
                    map={wallFrontSet.map}
                    normalMap={wallFrontSet.normalMap}
                    roughnessMap={wallFrontSet.roughnessMap}
                    metalness={spec.type === 'metal' ? 0.7 : 0.0}
                    roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                  />
                </mesh>
                <mesh position={[0, wallVisualHeight / 2, width / 2]} castShadow>
                  <boxGeometry args={[length, wallVisualHeight, wallThickness]} />
                  <meshStandardMaterial
                    color={wallMatColor}
                    map={wallBackSet.map}
                    normalMap={wallBackSet.normalMap}
                    roughnessMap={wallBackSet.roughnessMap}
                    metalness={spec.type === 'metal' ? 0.7 : 0.0}
                    roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                  />
                </mesh>
                <mesh position={[-length / 2, wallVisualHeight / 2, 0]} castShadow>
                  <boxGeometry args={[wallThickness, wallVisualHeight, width]} />
                  <meshStandardMaterial
                    color={wallMatColor}
                    map={wallLeftSet.map}
                    normalMap={wallLeftSet.normalMap}
                    roughnessMap={wallLeftSet.roughnessMap}
                    metalness={spec.type === 'metal' ? 0.7 : 0.0}
                    roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                  />
                </mesh>
                <mesh position={[length / 2, wallVisualHeight / 2, 0]} castShadow>
                  <boxGeometry args={[wallThickness, wallVisualHeight, width]} />
                  <meshStandardMaterial
                    color={wallMatColor}
                    map={wallRightSet.map}
                    normalMap={wallRightSet.normalMap}
                    roughnessMap={wallRightSet.roughnessMap}
                    metalness={spec.type === 'metal' ? 0.7 : 0.0}
                    roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                  />
                </mesh>
                {/* Gable infill to roof peak */}
                {roofType === 'dual' && rise > 0 && (
                  <>
                    {/* Right end gable (x +) */}
                    <mesh geometry={makeDualEndPrism(width, wallVisualHeight, rise, wallThickness)} position={[length / 2, 0, 0]}>
                      <meshStandardMaterial
                        color={wallMatColor}
                        map={wallFrontSet.map}
                        normalMap={wallFrontSet.normalMap}
                        roughnessMap={wallFrontSet.roughnessMap}
                        metalness={spec.type === 'metal' ? 0.7 : 0.0}
                        roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                      />
                      <Edges color="#2a2a2a" threshold={10} />
                    </mesh>
                    {/* Left end gable (x -) */}
                    <mesh geometry={makeDualEndPrism(width, wallVisualHeight, rise, wallThickness)} position={[-length / 2, 0, 0]}>
                      <meshStandardMaterial
                        color={wallMatColor}
                        map={wallBackSet.map}
                        normalMap={wallBackSet.normalMap}
                        roughnessMap={wallBackSet.roughnessMap}
                        metalness={spec.type === 'metal' ? 0.7 : 0.0}
                        roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                      />
                      <Edges color="#2a2a2a" threshold={10} />
                    </mesh>
                  </>
                )}
                {roofType === 'mono' && rise > 0 && (
                  <>
                    {/* Right end (+X) high at -Z */}
                    <mesh geometry={makeMonoEndPrism(width, wallVisualHeight, rise, wallThickness, true)} position={[length / 2, 0, 0]}>
                      <meshStandardMaterial
                        color={wallMatColor}
                        map={wallLeftSet.map}
                        normalMap={wallLeftSet.normalMap}
                        roughnessMap={wallLeftSet.roughnessMap}
                        metalness={spec.type === 'metal' ? 0.7 : 0.0}
                        roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                      />
                      <Edges color="#2a2a2a" threshold={10} />
                    </mesh>
                    {/* Left end (−X) high at -Z */}
                    <mesh geometry={makeMonoEndPrism(width, wallVisualHeight, rise, wallThickness, true)} position={[-length / 2, 0, 0]}>
                      <meshStandardMaterial
                        color={wallMatColor}
                        map={wallRightSet.map}
                        normalMap={wallRightSet.normalMap}
                        roughnessMap={wallRightSet.roughnessMap}
                        metalness={spec.type === 'metal' ? 0.7 : 0.0}
                        roughness={spec.type === 'metal' ? 0.35 : spec.type === 'wood' ? 0.7 : spec.type === 'membrane' ? 0.85 : 0.5}
                      />
                      <Edges color="#2a2a2a" threshold={10} />
                    </mesh>
                  </>
                )}

                {/* Doors */}
                {(() => {
                  const count = doors.reduce((a, x) => a + x.count, 0);
                  const door = doors[0] || { width: 860, height: 1980 } as any;
                  const sill = 0;
                  const positions: JSX.Element[] = [];
                  const ft = 60; // door frame thickness (mm)
                  if (count > 0) {
                    if (doorWall === 'front' || doorWall === 'back') {
                      const xs = spread(count, length - 300); // margins
                      const depth = Math.max(10, wallThickness - 10);
                      const faceZ = (doorWall === 'front' ? 1 : -1) * (width / 2 + wallThickness / 2);
                      const zCenter = faceZ - (doorWall === 'front' ? 1 : -1) * (depth / 2 - 0.5);
                      xs.forEach((x, i) => {
                        positions.push(
                          <mesh key={`door-${doorWall}-${i}`} position={[x, sill + door.height / 2, zCenter]}>
                            <boxGeometry args={[door.width, door.height, depth]} />
                            <meshStandardMaterial color="#9ec5ff" />
                          </mesh>
                        );
                        // Frame (4 sides)
                        const yCenter = sill + door.height / 2;
                        const frameDepth = depth + 2;
                        positions.push(
                          <mesh key={`doorfL-${doorWall}-${i}`} position={[x - (door.width / 2 + ft / 2), yCenter, zCenter]}>
                            <boxGeometry args={[ft, door.height + ft * 2, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfR-${doorWall}-${i}`} position={[x + (door.width / 2 + ft / 2), yCenter, zCenter]}>
                            <boxGeometry args={[ft, door.height + ft * 2, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfT-${doorWall}-${i}`} position={[x, yCenter + (door.height / 2 + ft / 2), zCenter]}>
                            <boxGeometry args={[door.width + ft * 2, ft, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfB-${doorWall}-${i}`} position={[x, yCenter - (door.height / 2 + ft / 2), zCenter]}>
                            <boxGeometry args={[door.width + ft * 2, ft, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                      });
                    } else {
                      const zs = spread(count, width - 300);
                      const depth = Math.max(10, wallThickness - 10);
                      const faceX = (doorWall === 'right' ? 1 : -1) * (length / 2 + wallThickness / 2);
                      const xCenter = faceX - (doorWall === 'right' ? 1 : -1) * (depth / 2 - 0.5);
                      zs.forEach((z, i) => {
                        positions.push(
                          <mesh key={`door-${doorWall}-${i}`} position={[xCenter, sill + door.height / 2, z]}>
                            <boxGeometry args={[depth, door.height, door.width]} />
                            <meshStandardMaterial color="#9ec5ff" />
                          </mesh>
                        );
                        // Frame (4 sides) for side wall door
                        const yCenter = sill + door.height / 2;
                        const frameDepth = depth + 2;
                        positions.push(
                          <mesh key={`doorfL-${doorWall}-${i}`} position={[xCenter, yCenter, z - (door.width / 2 + ft / 2)]}>
                            <boxGeometry args={[frameDepth, door.height + ft * 2, ft]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfR-${doorWall}-${i}`} position={[xCenter, yCenter, z + (door.width / 2 + ft / 2)]}>
                            <boxGeometry args={[frameDepth, door.height + ft * 2, ft]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfT-${doorWall}-${i}`} position={[xCenter, yCenter + (door.height / 2 + ft / 2), z]}>
                            <boxGeometry args={[frameDepth, ft, door.width + ft * 2]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`doorfB-${doorWall}-${i}`} position={[xCenter, yCenter - (door.height / 2 + ft / 2), z]}>
                            <boxGeometry args={[frameDepth, ft, door.width + ft * 2]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                      });
                    }
                  }
                  return positions;
                })()}

                {/* Windows */}
                {(() => {
                  const positions: JSX.Element[] = [];
                  const sill = 1000; // mm sill height
                  const ft = 40; // window frame thickness
                  windows.forEach((w, wi) => {
                    const count = w.count;
                    if (count <= 0) return;
                    const win = { width: w.width || 1200, height: w.height || 900 };
                    const wall = (w as any).wall || 'right';
                    if (wall === 'front' || wall === 'back') {
                      const xs = spread(count, length - 300);
                      const depth = Math.max(10, wallThickness - 10);
                      const faceZ = (wall === 'front' ? 1 : -1) * (width / 2 + wallThickness / 2);
                      const zCenter = faceZ - (wall === 'front' ? 1 : -1) * (depth / 2 - 0.5);
                      xs.forEach((x, i) => {
                        positions.push(
                          <mesh key={`win-${wall}-${wi}-${i}`} position={[x, sill + win.height / 2, zCenter]}>
                            <boxGeometry args={[win.width, win.height, depth]} />
                            <meshStandardMaterial color="#cfe7ff" />
                          </mesh>
                        );
                        const yCenter = sill + win.height / 2;
                        const frameDepth = depth + 2;
                        positions.push(
                          <mesh key={`winfL-${wall}-${wi}-${i}`} position={[x - (win.width / 2 + ft / 2), yCenter, zCenter]}>
                            <boxGeometry args={[ft, win.height + ft * 2, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfR-${wall}-${wi}-${i}`} position={[x + (win.width / 2 + ft / 2), yCenter, zCenter]}>
                            <boxGeometry args={[ft, win.height + ft * 2, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfT-${wall}-${wi}-${i}`} position={[x, yCenter + (win.height / 2 + ft / 2), zCenter]}>
                            <boxGeometry args={[win.width + ft * 2, ft, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfB-${wall}-${wi}-${i}`} position={[x, yCenter - (win.height / 2 + ft / 2), zCenter]}>
                            <boxGeometry args={[win.width + ft * 2, ft, frameDepth]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                      });
                    } else {
                      const zs = spread(count, width - 300);
                      const depth = Math.max(10, wallThickness - 10);
                      const faceX = (wall === 'right' ? 1 : -1) * (length / 2 + wallThickness / 2);
                      const xCenter = faceX - (wall === 'right' ? 1 : -1) * (depth / 2 - 0.5);
                      zs.forEach((z, i) => {
                        positions.push(
                          <mesh key={`win-${wall}-${wi}-${i}`} position={[xCenter, sill + win.height / 2, z]}>
                            <boxGeometry args={[depth, win.height, win.width]} />
                            <meshStandardMaterial color="#cfe7ff" />
                          </mesh>
                        );
                        const yCenter = sill + win.height / 2;
                        const frameDepth = depth + 2;
                        positions.push(
                          <mesh key={`winfL-${wall}-${wi}-${i}`} position={[xCenter, yCenter, z - (win.width / 2 + ft / 2)]}>
                            <boxGeometry args={[frameDepth, win.height + ft * 2, ft]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfR-${wall}-${wi}-${i}`} position={[xCenter, yCenter, z + (win.width / 2 + ft / 2)]}>
                            <boxGeometry args={[frameDepth, win.height + ft * 2, ft]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfT-${wall}-${wi}-${i}`} position={[xCenter, yCenter + (win.height / 2 + ft / 2), z]}>
                            <boxGeometry args={[frameDepth, ft, win.width + ft * 2]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                        positions.push(
                          <mesh key={`winfB-${wall}-${wi}-${i}`} position={[xCenter, yCenter - (win.height / 2 + ft / 2), z]}>
                            <boxGeometry args={[frameDepth, ft, win.width + ft * 2]} />
                            <meshStandardMaterial color={frameColor} roughness={0.6} />
                          </mesh>
                        );
                      });
                    }
                  });
                  return positions;
                })()}

                {/* Roof */}
                <RoofGeom {...props} roofTex={roofSet as any} />
              </group>
            );
          })()}
        </group>
      </MmToM>
    </>
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
