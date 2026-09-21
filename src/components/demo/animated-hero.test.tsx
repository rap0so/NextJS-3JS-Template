import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AnimatedHero from './animated-hero';

// The real sheet would spin up a Theatre project per test; the component's
// contract with Theatre is just "subscribe, write to the DOM, unsubscribe".
const unsubscribe = vi.fn();
const play = vi.fn();

vi.mock('@/lib/theatre/project', () => ({
  getDemoSheet: () => ({
    object: () => ({ onValuesChange: () => unsubscribe }),
    project: { ready: Promise.resolve() },
    sequence: { play },
  }),
}));

describe('AnimatedHero', () => {
  it('exposes the headline as a single accessible name despite the word split', () => {
    render(<AnimatedHero />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Volvo Next.js');
  });

  it('unsubscribes from the Theatre sheet on unmount', () => {
    const { unmount } = render(<AnimatedHero />);

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('does not autoplay the sequence outside production', () => {
    render(<AnimatedHero />);

    expect(play).not.toHaveBeenCalled();
  });
});
