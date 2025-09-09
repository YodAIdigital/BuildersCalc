export type TextureKind = 'metal' | 'wood' | 'ply' | 'membrane' | 'pir';
export type WallOrientation = 'vertical-ribs' | 'horizontal-boards' | 'none';

export interface TextureSpec {
  type: TextureKind;
  maps: { albedo?: string; normal?: string; roughness?: string };
  repeats: { mmPerU: number; mmPerV: number };
  orientation: { walls: WallOrientation };
}

export function normalizeCladding(input: string): string {
  const s = (input || '').toLowerCase().trim();
  if (!s) return 'corrugate';
  if (s.includes('five') || s.includes('5 rib')) return 'five rib';
  if (s.includes('cedar') && s.includes('weather')) return 'cedar weatherboard';
  if (s.includes('standard') && s.includes('weather')) return 'standard weatherboard';
  if (s === 'pir' || s === 'p.i.r' || s.includes('pir')) return 'pir';
  if (s.includes('membrane')) return 'membrane';
  if (s.includes('tray')) return 'tray';
  if (s.includes('longrun')) return 'longrun';
  if (s.includes('corrug')) return 'corrugate';
  if (s.includes('weather')) return 'standard weatherboard';
  if (s.includes('ply')) return 'ply';
  return s;
}

// Blend hex color towards white by strength (0..1). 0 => white; 1 => full color
export function applyTint(hex: string, strength: number): string {
  const c = (hex || '#ffffff').replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const s = Math.max(0, Math.min(1, strength));
  const mix = (w: number, v: number) => Math.round(w * (1 - s) + v * s);
  const rr = mix(255, r);
  const gg = mix(255, g);
  const bb = mix(255, b);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
}

export function textureSpecForCladding(cladding: string): TextureSpec {
  const key = normalizeCladding(cladding);

  // Defaults
  const defaults = {
    repeats: { mmPerU: 1000, mmPerV: 1000 },
    maps: {} as TextureSpec['maps'],
  };

  switch (key) {
    case 'corrugate':
      return {
        type: 'metal',
        maps: { normal: 'textures/corrugate/normal.png' },
        orientation: { walls: 'vertical-ribs' },
        repeats: { mmPerU: 76, mmPerV: 1000 },
      };
    case 'five rib':
      return {
        type: 'metal',
        maps: { normal: 'textures/fiveRib/normal.png' },
        orientation: { walls: 'vertical-ribs' },
        repeats: { mmPerU: 250, mmPerV: 1000 },
      };
    case 'longrun':
      return {
        type: 'metal',
        maps: { normal: 'textures/longrun/normal.png' },
        orientation: { walls: 'vertical-ribs' },
        repeats: { mmPerU: 200, mmPerV: 1000 },
      };
    case 'tray':
      return {
        type: 'metal',
        maps: { normal: 'textures/tray/normal.png' },
        orientation: { walls: 'vertical-ribs' },
        repeats: { mmPerU: 300, mmPerV: 1000 },
      };
    case 'cedar weatherboard':
    case 'standard weatherboard':
    case 'weatherboard':
      return {
        type: 'wood',
        maps: { albedo: 'textures/weatherboard/albedo.jpg', normal: 'textures/weatherboard/normal.jpg' },
        orientation: { walls: 'horizontal-boards' },
        repeats: { mmPerU: 1000, mmPerV: 150 },
      };
    case 'ply':
      return {
        type: 'ply',
        maps: { albedo: 'textures/ply/albedo.jpg', normal: 'textures/ply/normal.jpg' },
        orientation: { walls: 'none' },
        repeats: { mmPerU: 1200, mmPerV: 2400 },
      };
    case 'membrane':
      return {
        type: 'membrane',
        maps: { albedo: 'textures/membrane/albedo.jpg' },
        orientation: { walls: 'none' },
        repeats: { mmPerU: 1000, mmPerV: 1000 },
      };
    case 'pir':
      return {
        type: 'pir',
        maps: { albedo: 'textures/pir/albedo.jpg' },
        orientation: { walls: 'none' },
        repeats: { mmPerU: 1000, mmPerV: 1000 },
      };
    default:
      // Fallback to corrugate-like behavior
      return {
        type: 'metal',
        maps: { normal: 'textures/corrugate/normal.png' },
        orientation: { walls: 'vertical-ribs' },
        repeats: { mmPerU: 76, mmPerV: 1000 },
      };
  }
}

