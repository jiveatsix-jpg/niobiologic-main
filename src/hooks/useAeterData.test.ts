import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAeterData } from './useAeterData';

beforeEach(() => {
  localStorage.clear();
});

describe('useAeterData', () => {
  it('keeps every route\'s data array in sync with the section count when adding a section', () => {
    const { result } = renderHook(() => useAeterData());
    const initialSectionCount = result.current.sections.length;

    act(() => {
      result.current.addSection();
    });

    expect(result.current.sections).toHaveLength(initialSectionCount + 1);
    result.current.routes.forEach(route => {
      expect(route.data).toHaveLength(initialSectionCount + 1);
    });
  });

  it('keeps every route\'s data array in sync with the section count when removing a section', () => {
    const { result } = renderHook(() => useAeterData());

    act(() => {
      result.current.removeSection(0);
    });

    const remaining = result.current.sections.length;
    result.current.routes.forEach(route => {
      expect(route.data).toHaveLength(remaining);
    });
  });

  it('refuses to remove the last remaining section', () => {
    const { result } = renderHook(() => useAeterData());
    const initialCount = result.current.sections.length;

    for (let i = 0; i < initialCount - 1; i++) {
      act(() => {
        result.current.removeSection(0);
      });
    }
    expect(result.current.sections).toHaveLength(1);

    act(() => {
      result.current.removeSection(0);
    });

    expect(result.current.sections).toHaveLength(1);
  });

  it('gives a newly added route a data point for every existing section', () => {
    const { result } = renderHook(() => useAeterData());
    const sectionCount = result.current.sections.length;

    act(() => {
      result.current.addRoute();
    });

    const newRoute = result.current.routes[result.current.routes.length - 1];
    expect(newRoute.data).toHaveLength(sectionCount);
  });

  it('resets activeTab to GLOBAL when the active route is removed', () => {
    const { result } = renderHook(() => useAeterData());
    const routeId = result.current.routes[0].id;

    act(() => {
      result.current.setActiveTab(routeId);
    });
    expect(result.current.activeTab).toBe(routeId);

    act(() => {
      result.current.removeRoute(routeId);
    });
    expect(result.current.activeTab).toBe('GLOBAL');
  });

  it('mirrors color onto shadowColor for anchored sections', () => {
    const { result } = renderHook(() => useAeterData());

    act(() => {
      result.current.updateSection(0, { isAnchored: true });
    });
    act(() => {
      result.current.updateSection(0, { color: '#123456' });
    });

    expect(result.current.sections[0].color).toBe('#123456');
    expect(result.current.sections[0].shadowColor).toBe('#123456');
  });

  it('persists routes to localStorage and restores them on next mount', () => {
    const { result, unmount } = renderHook(() => useAeterData());

    act(() => {
      result.current.updateRoute(result.current.routes[0].id, { name: 'PERSISTED' });
    });
    unmount();

    const { result: second } = renderHook(() => useAeterData());
    expect(second.current.routes[0].name).toBe('PERSISTED');
  });
});
