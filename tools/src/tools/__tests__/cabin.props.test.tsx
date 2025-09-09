import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Capture props passed to Cabin3D
let captured: any = null;
vi.mock('../../components/Cabin3D', () => ({
  __esModule: true,
  default: (props: any) => {
    captured = props;
    return <div data-testid="cabin-3d" />;
  },
}));

// Mock settings hook to avoid IndexedDB/network
import { defaultSettings } from '../../storage/settings';
vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({ settings: defaultSettings, setSettings: () => {} }),
}));

import Cabin from '../Cabin';

describe('Cabin -> Cabin3D prop wiring', () => {
  it('passes interiorColor from UI default to 3D component', () => {
    captured = null;
    render(<Cabin />);
    expect(captured).toBeTruthy();
    // Default UI value from Cabin.tsx
    expect(captured.interiorColor).toBe('#e9e7e2');
  });
});

