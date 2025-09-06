export type TrigInputs = Partial<{ a: number; b: number; c: number; A: number; B: number }>;
export type TrigSolution = { a: number; b: number; c: number; A: number; B: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function solveRightTriangle(inputs: TrigInputs): TrigSolution | null {
  let { a, b, c, A, B } = inputs;
  const values = [a, b, c, A, B].filter((v) => typeof v === 'number');
  if (values.length === 0) return null;
  if (values.length !== 2) throw new Error('Enter exactly two values.');
  if (A && B) throw new Error('At least one input must be a side.');

  if (A != null) B = 90 - A;
  if (B != null) A = 90 - B;

  if (a != null && b != null) {
    c = Math.sqrt(a * a + b * b);
    A = toDeg(Math.atan(a / b));
    B = 90 - A;
  } else if (a != null && c != null) {
    if (c <= a) throw new Error('Hypotenuse must be longest side.');
    b = Math.sqrt(c * c - a * a);
    A = toDeg(Math.asin(a / c));
    B = 90 - A;
  } else if (b != null && c != null) {
    if (c <= b) throw new Error('Hypotenuse must be longest side.');
    a = Math.sqrt(c * c - b * b);
    B = toDeg(Math.acos(b / c));
    A = 90 - B;
  } else if (a != null && A != null) {
    b = a / Math.tan(toRad(A));
    c = a / Math.sin(toRad(A));
  } else if (a != null && B != null) {
    b = a * Math.tan(toRad(B));
    c = a / Math.cos(toRad(B));
  } else if (b != null && A != null) {
    a = b * Math.tan(toRad(A));
    c = b / Math.cos(toRad(A));
  } else if (b != null && B != null) {
    a = b / Math.tan(toRad(B));
    c = b / Math.sin(toRad(B));
  } else if (c != null && A != null) {
    a = c * Math.sin(toRad(A));
    b = c * Math.cos(toRad(A));
  } else if (c != null && B != null) {
    a = c * Math.cos(toRad(B));
    b = c * Math.sin(toRad(B));
  }

  return { a: round(a!), b: round(b!), c: round(c!), A: round(A!), B: round(B!) };
}

export const round = (n: number, d = 2) => Number.isFinite(n) ? parseFloat(n.toFixed(d)) : 0;

