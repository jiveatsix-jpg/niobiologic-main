import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AeterProvider } from '../context/AeterContext';
import { TutorialOverlay } from './TutorialOverlay';

const STEP_COUNT = 5;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('TutorialOverlay', () => {
  it('does not crash when "next" fires twice in the same tick on the second-to-last step', () => {
    render(<AeterProvider><TutorialOverlay /></AeterProvider>);

    // Advance to the second-to-last step one click at a time (each in its own
    // act so state commits between clicks, like a normal user would).
    for (let i = 0; i < STEP_COUNT - 2; i++) {
      act(() => {
        fireEvent.click(screen.getByText('SIGUIENTE'));
      });
    }

    // Now fire two "next" clicks back-to-back within a single act(), simulating
    // a rapid double-click where React hasn't committed the first update yet.
    // Regression test for a bug where this pushed currentStep past the last
    // valid TUTORIAL_STEPS index and crashed with "Cannot read properties of
    // undefined (reading 'icon')".
    expect(() => {
      act(() => {
        const btn = screen.getByText('SIGUIENTE');
        fireEvent.click(btn);
        fireEvent.click(btn);
      });
    }).not.toThrow();

    expect(screen.getByText('INICIAR SISTEMA')).toBeInTheDocument();
  });

  it('closes the tutorial and persists completion when "INICIAR SISTEMA" is clicked on the last step', () => {
    render(<AeterProvider><TutorialOverlay /></AeterProvider>);

    for (let i = 0; i < STEP_COUNT - 1; i++) {
      act(() => {
        fireEvent.click(screen.getByText('SIGUIENTE'));
      });
    }

    act(() => {
      fireEvent.click(screen.getByText('INICIAR SISTEMA'));
    });

    expect(screen.queryByText('INICIAR SISTEMA')).not.toBeInTheDocument();
    expect(localStorage.getItem('aeter_has_seen_tutorial')).toBe('true');
  });
});
