import { round } from './trig';
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function calcRoof(pitchDeg: number, spanMm: number) {
  const pitch = pitchDeg || 0;
  const span = spanMm || 0;
  if (!(pitch > 0 && span > 0)) return { rise: 0, rafter: 0 };
  const halfSpan = span / 2;
  const rise = halfSpan * Math.tan(toRad(pitch));
  const rafter = Math.sqrt(rise * rise + halfSpan * halfSpan);
  return { rise: round(rise), rafter: round(rafter) };
}
