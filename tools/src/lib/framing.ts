import { round } from './trig';

export type Application = 'floor' | 'wall';
export type Opening = { type: 'Window' | 'Door'; width: number; height: number };
export type Wall = { length: number; openings: Opening[] };

export type CostInputs = {
  timberPerM: number;
  pilePerEach: number;
  sheetPerEach: number;
  paintPerM2: number;
  windowPerM2: number;
  doorPerUnit: number;
  sheetSizeM: { w: number; h: number };
};

export type FramingInputs = {
  application: Application;
  length: number;
  width: number;
  height: number; // for walls
  spacing: number; // mm
  walls: Wall[]; // only for walls
  includePaint: boolean;
  costs: CostInputs;
};

export function calcFraming(inputs: FramingInputs) {
  const { application, length, width, height, spacing, walls, includePaint, costs } = inputs;
  const sheetArea = costs.sheetSizeM.w * costs.sheetSizeM.h;

  let totalAreaM2 = 0;
  let openingsAreaM2 = 0;
  let totalMembers = 0;
  let totalTimberLengthM = 0;
  let openingFramingM = 0;
  let totalWindowCost = 0;
  let totalDoorCost = 0;

  if (application === 'wall') {
    totalAreaM2 = walls.reduce((acc, wall) => acc + (wall.length * height) / 1_000_000, 0);
    totalMembers = walls.reduce((acc, wall) => acc + (Math.ceil(wall.length / spacing) + 1), 0);
    totalTimberLengthM = walls.reduce(
      (acc, wall) => acc + (Math.ceil(wall.length / spacing) + 1) * (height / 1000),
      0
    );

    walls.forEach((wall) => {
      wall.openings.forEach((op) => {
        const opArea = (op.width * op.height) / 1_000_000;
        openingsAreaM2 += opArea;
        openingFramingM += ((op.width + op.height) * 2) / 1000;
        if (op.type === 'Window') totalWindowCost += opArea * costs.windowPerM2;
        else totalDoorCost += costs.doorPerUnit;
      });
    });
    totalTimberLengthM += openingFramingM;
  } else {
    // floor
    totalAreaM2 = (length * width) / 1_000_000;
    const numMembersX = Math.ceil(length / spacing) + 1;
    const numMembersY = Math.ceil(width / spacing) + 1;
    totalMembers = numMembersX + numMembersY;
    totalTimberLengthM = (numMembersX * width + numMembersY * length) / 1000;
  }

  const netSheetingAreaM2 = Math.max(0, totalAreaM2 - openingsAreaM2);
  const sheets = Math.ceil(netSheetingAreaM2 / sheetArea);

  const openingFramingCost = openingFramingM * costs.timberPerM;
  const timberCost = Math.max(0, totalTimberLengthM * costs.timberPerM - openingFramingCost);
  const sheetCost = sheets * costs.sheetPerEach;

  let paintCost = 0;
  if (includePaint && application === 'wall') paintCost = netSheetingAreaM2 * costs.paintPerM2;

  let pileCost = 0;
  let pileCount = 0;
  if (application === 'floor') {
    const bearerSpacing = 1800; // mm
    const pileSpacing = 1500; // mm
    const numBearerRows = Math.ceil(width / bearerSpacing) + 1;
    const numPilesPerRow = Math.ceil(length / pileSpacing) + 1;
    pileCount = numBearerRows * numPilesPerRow;
    pileCost = pileCount * costs.pilePerEach;
  }

  const grandTotal = timberCost + sheetCost + paintCost + pileCost + totalWindowCost + totalDoorCost + openingFramingCost;

  return {
    totalAreaM2: round(totalAreaM2, 2),
    openingsAreaM2: round(openingsAreaM2, 2),
    netSheetingAreaM2: round(netSheetingAreaM2, 2),
    sheets,
    totalMembers,
    pileCount,
    costs: {
      timberCost: round(timberCost, 2),
      openingFramingCost: round(openingFramingCost, 2),
      sheetCost: round(sheetCost, 2),
      paintCost: round(paintCost, 2),
      pileCost: round(pileCost, 2),
      windowCost: round(totalWindowCost, 2),
      doorCost: round(totalDoorCost, 2),
      grandTotal: round(grandTotal, 2)
    }
  };
}

