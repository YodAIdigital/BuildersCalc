import type { BOMItem } from './cabin';

export function bomToCSV(items: BOMItem[]): string {
  const headers = ['Category', 'Name', 'Unit', 'Quantity', 'Rate', 'Subtotal'];
  const lines = [headers.join(',')];
  for (const it of items) {
    const row = [it.category, it.name, it.unit, it.qty, it.rate, it.subtotal]
      .map(v => typeof v === 'string' ? escapeCsv(v) : String(v))
      .join(',');
    lines.push(row);
  }
  return lines.join('\n');
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
