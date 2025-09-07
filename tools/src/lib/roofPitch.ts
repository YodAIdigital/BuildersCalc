export const CLADDING_MIN_DEG: Record<string, number> = {
  corrugate: 8,
  longrun: 3, // tray/standing seam longrun
  fiveRib: 3,
  membrane: 1.5,
  metalTile: 12,
  concreteTile: 20,
  clayTile: 25,
  asphaltShingle: 18,
  slate: 22,
};

export type PitchWarning = {
  code: 'MIN_PITCH' | 'RANGE' | 'FLAT_MEMBRANE';
  message: string;
};

export function pitchWarnings({ pitch, cladding }: { pitch: number; cladding: string }): PitchWarning[] {
  const warnings: PitchWarning[] = [];
  const minPitch = CLADDING_MIN_DEG[cladding] ?? 0;

  if (cladding === 'membrane' && pitch === 0) {
    warnings.push({
      code: 'FLAT_MEMBRANE',
      message: 'Flat 0° selected. Typical NZ E2/AS1 minimum for membrane roofs is ≥1.5°. Review manufacturer requirements.',
    });
  }

  if (minPitch && pitch < minPitch) {
    warnings.push({
      code: 'MIN_PITCH',
      message: `Pitch ${pitch.toFixed(1)}° is below ${minPitch}° for selected cladding (NZ E2/AS1 guidance; verify manufacturer requirements).`,
    });
  }

  if (pitch < 0 || pitch > 60) {
    warnings.push({ code: 'RANGE', message: 'Pitch is outside typical buildable range (0–60°).' });
  }

  return warnings;
}
