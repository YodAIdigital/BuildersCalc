import { round } from './trig';
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function calcStairs(totalRiseMm: number) {
  const totalRise = totalRiseMm || 0;
  if (totalRise < 200)
    return { risers: 0, riserHeight: 0, treads: 0, going: 0, totalRun: 0, angle: 0, compliant: true, notes: '' };

  const idealRiser = 180;
  const risers = Math.round(totalRise / idealRiser);
  const riserHeight = totalRise / risers;
  const treads = risers - 1;
  const idealGoing = 625 - 2 * riserHeight;
  const going = Math.max(250, idealGoing);
  const totalRun = treads * going;
  const angle = toDeg(Math.atan(totalRise / totalRun));

  const twoRPlusG = 2 * riserHeight + going;
  let compliant = true;
  let notes = 'NZBC D1/AS1 (Private Stairs): ';
  if (riserHeight < 115 || riserHeight > 190) {
    compliant = false;
    notes += 'Riser height outside 115-190mm. ';
  }
  if (going < 250) {
    compliant = false;
    notes += 'Tread going less than 250mm. ';
  }
  if (twoRPlusG < 550 || twoRPlusG > 700) {
    compliant = false;
    notes += `2R+G (${round(twoRPlusG, 0)}) outside 550-700mm. `;
  }
  if (angle > 41) {
    compliant = false;
    notes += 'Angle exceeds 41°. ';
  }

  return {
    risers,
    riserHeight: round(riserHeight),
    treads,
    going: round(going),
    totalRun: round(totalRun),
    angle: round(angle),
    compliant,
    notes
  };
}

