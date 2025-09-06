export function mmToM(mm: number) {
  return (mm || 0) / 1000;
}
export function mToMm(m: number) {
  return (m || 0) * 1000;
}
export function mmToIn(mm: number) {
  return (mm || 0) / 25.4;
}
export function inToMm(i: number) {
  return (i || 0) * 25.4;
}
export function mmToFt(mm: number) {
  return (mm || 0) / 304.8;
}
export function ftToMm(ft: number) {
  return (ft || 0) * 304.8;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
export function decimalToFractionInches(decimalInches: number) {
  const decimal = decimalInches || 0;
  if (decimal === 0) return '0"';
  const denominator = 64;
  const whole = Math.floor(decimal);
  const fractional = decimal - whole;
  const numerator = Math.round(fractional * denominator);
  if (numerator === 0) return `${whole}"`;
  const divisor = gcd(numerator, denominator);
  const num = numerator / divisor;
  const den = denominator / divisor;
  return `${whole > 0 ? whole + ' ' : ''}${num}/${den}"`;
}
