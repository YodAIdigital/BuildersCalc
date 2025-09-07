import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import UnitConverter from '../UnitConverter';

describe('UnitConverter layout', () => {
  it('renders a responsive two-pane layout with fields left and screw conversions right', () => {
    render(<UnitConverter />);

    // Grid wrapper should exist with appropriate classes
    const grid = screen.getByTestId('unit-converter-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid', 'grid-cols-1');
    expect(grid.className).toMatch(/\blg:grid-cols-2\b/);

    // Panels should render
    const left = screen.getByTestId('unit-fields-panel');
    const right = screen.getByTestId('screw-conversions-panel');
    expect(left).toBeInTheDocument();
    expect(right).toBeInTheDocument();
  });
});

