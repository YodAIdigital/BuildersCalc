import { describe, it, expect } from 'vitest';
import { applyTint, normalizeCladding, textureSpecForCladding } from '../../components/textures/spec';

describe('textures spec', () => {
  it('normalizes cladding strings', () => {
    expect(normalizeCladding('  FIVE RIB ')).toBe('five rib');
    expect(normalizeCladding('PIR')).toBe('pir');
    expect(normalizeCladding('  cedar  weatherboard  ')).toBe('cedar weatherboard');
  });

  it('returns metal spec for corrugate', () => {
    const s = textureSpecForCladding('corrugate');
    expect(s.type).toBe('metal');
    expect(s.orientation.walls).toBe('vertical-ribs');
    expect(s.repeats.mmPerU).toBeGreaterThan(0);
    expect(s.maps.normal).toBeTruthy();
  });

  it('returns wood spec for weatherboard', () => {
    const s = textureSpecForCladding('cedar weatherboard');
    expect(s.type).toBe('wood');
    expect(s.orientation.walls).toBe('horizontal-boards');
    expect(s.maps.albedo).toBeTruthy();
    expect(s.maps.normal).toBeTruthy();
  });

  it('ply spec dimensions look correct', () => {
    const s = textureSpecForCladding('ply');
    expect(s.repeats.mmPerU).toBe(1200);
    expect(s.repeats.mmPerV).toBe(2400);
  });

  it('applyTint blends towards white as strength decreases', () => {
    const full = applyTint('#000000', 1);
    const half = applyTint('#000000', 0.5);
    const none = applyTint('#000000', 0);
    expect(full.toLowerCase()).toBe('#000000');
    expect(none.toLowerCase()).toBe('#ffffff');
    // half should be mid gray
    expect(half.toLowerCase()).toBe('#808080');
  });
});

