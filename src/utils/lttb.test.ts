import { describe, expect, it } from 'vitest';
import { lttbIndices } from './lttb';

describe('lttbIndices', () => {
  it('returns identity indices when threshold >= data length', () => {
    const data = [1, 2, 3, 4, 5];
    expect(lttbIndices(data, 10)).toEqual([0, 1, 2, 3, 4]);
    expect(lttbIndices(data, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('returns identity indices when threshold < 2', () => {
    const data = [1, 2, 3, 4, 5];
    expect(lttbIndices(data, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(lttbIndices(data, 0)).toEqual([0, 1, 2, 3, 4]);
  });

  it('downsamples to exactly `threshold` points', () => {
    const data = Array.from({ length: 1000 }, (_, i) => Math.sin(i / 10) * 100);
    const idxs = lttbIndices(data, 150);
    expect(idxs).toHaveLength(150);
  });

  it('always keeps the first and last original index', () => {
    const data = Array.from({ length: 500 }, (_, i) => i * i);
    const idxs = lttbIndices(data, 50);
    expect(idxs[0]).toBe(0);
    expect(idxs[idxs.length - 1]).toBe(data.length - 1);
  });

  it('produces strictly increasing indices', () => {
    const data = Array.from({ length: 300 }, () => Math.random() * 100);
    const idxs = lttbIndices(data, 40);
    for (let i = 1; i < idxs.length; i++) {
      expect(idxs[i]).toBeGreaterThan(idxs[i - 1]);
    }
  });

  it('every returned index is within bounds of the original data', () => {
    const data = Array.from({ length: 217 }, (_, i) => i);
    const idxs = lttbIndices(data, 60);
    idxs.forEach(i => {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(data.length);
    });
  });
});
