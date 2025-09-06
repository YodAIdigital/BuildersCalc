import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('Header logo', () => {
  it('renders a brand logo linking to the marketing homepage', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Link should navigate to the marketing homepage "/"
    const homeLink = screen.getByRole('link', { name: /builder's tools|roots & echo/i });
    expect(homeLink.getAttribute('href')).toBe('/');

    // Image should be present with a base-aware src ending in /logo.png
    const logo = screen.getByRole('img', { name: /roots & echo|builder's tools/i });
    expect(logo).toBeInTheDocument();

    const src = logo.getAttribute('src') || '';
    expect(src.endsWith('/logo.png')).toBe(true);
  });
});
