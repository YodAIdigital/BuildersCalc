import { round } from './trig';
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function calcRafter(widthMm: number, pitchDeg: number, overhangMm: number) {
  const width = widthMm || 0;
  const pitch = pitchDeg || 0;
  const overhang = overhangMm || 0;
  if (!(width > 0 && pitch > 0)) return { common: 0, total: 0, plumb: 0, birdsmouth: 0 };
  const half = width / 2;
  const rise = half * Math.tan(toRad(pitch));
  const common = Math.sqrt(rise * rise + half * half);
  const overhangRafter = overhang / Math.cos(toRad(pitch));
  const total = common + overhangRafter;
  return {
    common: round(common),
    total: round(total),
    plumb: round(pitch),
    birdsmouth: round(90 - pitch),
  };
}
