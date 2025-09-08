import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the 3D component to avoid WebGL in tests
vi.mock('../../components/Cabin3D', () => ({ default: () => <div data-testid="cabin-3d" /> }));
// Mock settings to avoid IndexedDB in tests
import { defaultSettings } from '../../storage/settings';
vi.mock('../../hooks/useSettings', () => ({ useSettings: () => ({ settings: defaultSettings, setSettings: () => {} }) }));

import Cabin from '../Cabin';


describe('Cabin layout', () => {
  it('renders form groups and results table', () => {
    render(<Cabin />);

    // Form fields
    expect(screen.getByText(/length \(mm\)/i)).toBeInTheDocument();
    expect(screen.getByText(/roof type/i)).toBeInTheDocument();

    // 3D placeholder
    expect(screen.getByTestId('cabin-3d')).toBeInTheDocument();

    // Results header
    expect(screen.getByText(/materials & costs/i)).toBeInTheDocument();

    // Email PDF control under pricing breakdown
    expect(screen.getByText(/email pdf/i)).toBeInTheDocument();
  });
});
