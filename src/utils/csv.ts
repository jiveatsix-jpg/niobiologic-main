import { RouteData, Section } from '../types';

export function parseCSV(text: string): { sections: Section[]; routes: RouteData[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row.');

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseRow(lines[0]);
  const routeNames = headers.slice(1).map(h => h.toUpperCase().replace(/[^A-Z0-9_]/g, '_') || `RT-UNKNOWN`);
  const routeColors = ['#ff0055', '#00ffcc', '#ffd700', '#ff8800', '#8800ff', '#0088ff', '#ffffff', '#ff4488', '#44ff88', '#4488ff'];
  const newRoutes: RouteData[] = routeNames.map((name, i) => ({
    id: `csv-${i}`,
    name,
    color: routeColors[i % routeColors.length],
    data: [] as number[],
    resourceValue: 50,
  }));

  const newSections: Section[] = [];
  const defaultColors = ['#00ffcc', '#ffd700', '#ff0055', '#0088ff', '#8800ff'];

  for (let ri = 1; ri < lines.length; ri++) {
    const cells = parseRow(lines[ri]);
    const secName = cells[0]?.toUpperCase() || `ROW-${ri}`;
    newSections.push({
      name: secName,
      color: defaultColors[(ri - 1) % defaultColors.length],
      shadowColor: defaultColors[(ri - 1) % defaultColors.length],
      glowIntensity: 4,
    });
    for (let ci = 0; ci < newRoutes.length; ci++) {
      const val = parseFloat(cells[ci + 1]);
      newRoutes[ci].data.push(isNaN(val) ? 0 : val);
    }
  }

  return { sections: newSections, routes: newRoutes };
}
