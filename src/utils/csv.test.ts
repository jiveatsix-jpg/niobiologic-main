import { describe, expect, it } from 'vitest';
import { parseCSV } from './csv';

describe('parseCSV', () => {
  it('parses a header row and data rows into sections and routes', () => {
    const csv = 'SECTOR,ALPHA,BETA\nCORTEX,20,40\nNUCLEUS,45,20';
    const { sections, routes } = parseCSV(csv);

    expect(sections.map(s => s.name)).toEqual(['CORTEX', 'NUCLEUS']);
    expect(routes).toHaveLength(2);
    expect(routes[0].name).toBe('ALPHA');
    expect(routes[0].data).toEqual([20, 45]);
    expect(routes[1].name).toBe('BETA');
    expect(routes[1].data).toEqual([40, 20]);
  });

  it('throws when there are fewer than 2 non-empty lines', () => {
    expect(() => parseCSV('SECTOR,ALPHA')).toThrow();
    expect(() => parseCSV('')).toThrow();
  });

  it('ignores blank lines', () => {
    const csv = 'SECTOR,ALPHA\n\nCORTEX,10\n\nNUCLEUS,20\n';
    const { sections, routes } = parseCSV(csv);
    expect(sections).toHaveLength(2);
    expect(routes[0].data).toEqual([10, 20]);
  });

  it('respects quoted values containing commas', () => {
    const csv = 'SECTOR,"ALPHA, PRIME"\nCORTEX,10';
    const { routes } = parseCSV(csv);
    expect(routes[0].name).toBe('ALPHA__PRIME');
  });

  it('defaults non-numeric cells to 0 instead of NaN', () => {
    const csv = 'SECTOR,ALPHA\nCORTEX,n/a\nNUCLEUS,15';
    const { routes } = parseCSV(csv);
    expect(routes[0].data).toEqual([0, 15]);
  });

  it('falls back to a generated sector name when the first cell is empty', () => {
    const csv = 'SECTOR,ALPHA\n,10';
    const { sections } = parseCSV(csv);
    expect(sections[0].name).toBe('ROW-1');
  });
});
