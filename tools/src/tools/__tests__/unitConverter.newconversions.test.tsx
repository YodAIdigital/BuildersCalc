import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitConverter from '../UnitConverter';

// Minimal smoke tests for new conversions

describe('UnitConverter new conversions', () => {
  it('converts drainage fall mm/m <-> % <-> deg', () => {
    render(<UnitConverter />);
    const mmPerM = screen.getByLabelText(/mm per m/i) as HTMLInputElement;
    fireEvent.change(mmPerM, { target: { value: '10' } });
    const percent = screen.getByLabelText(/percent/i) as HTMLInputElement;
    const deg = screen.getByLabelText(/degrees/i) as HTMLInputElement;
    expect(percent.value).toMatch(/^1(\.0{0,3})?$/); // 10 mm/m ≈ 1%
    expect(parseFloat(deg.value)).toBeGreaterThan(0.57 - 0.01);
    expect(parseFloat(deg.value)).toBeLessThan(0.57 + 0.05);
  });

  it('converts area m² <-> squares', () => {
    render(<UnitConverter />);
    const m2 = screen.getByLabelText('m²') as HTMLInputElement;
    fireEvent.change(m2, { target: { value: '10' } });
    const squares = screen.getByLabelText(/squares/i) as HTMLInputElement;
    const sq = parseFloat(squares.value);
    expect(sq).toBeGreaterThan(1.07 - 0.005);
    expect(sq).toBeLessThan(1.08 + 0.01);
  });

  it('scale 1:100 plan 10 mm -> actual 1000 mm', () => {
    render(<UnitConverter />);
    const numer = screen.getByLabelText(/scale numer/i) as HTMLInputElement;
    const denom = screen.getByLabelText(/scale denom/i) as HTMLInputElement;
    fireEvent.change(numer, { target: { value: '1' } });
    fireEvent.change(denom, { target: { value: '100' } });
    const plan = screen.getByLabelText(/plan length/i) as HTMLInputElement;
    fireEvent.change(plan, { target: { value: '10' } });
    const actual = screen.getByLabelText(/actual length/i) as HTMLInputElement;
    expect(parseFloat(actual.value)).toBeCloseTo(1000, 2);
  });

  it('screw gauge mapping shows #8 ~ 4.2 mm', () => {
    render(<UnitConverter />);
    const gaugeSelect = screen.getByLabelText(/gauge/i) as HTMLSelectElement;
    fireEvent.change(gaugeSelect, { target: { value: '8' } });
    expect(screen.getByText(/4\.2\d? mm/)).toBeInTheDocument();
  });
});

