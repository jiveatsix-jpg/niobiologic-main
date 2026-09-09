import { RouteData } from '../types';

export function formatValue(val: number, route?: Pick<RouteData, 'unitSymbol' | 'unitPosition'>): string {
  const num = val.toFixed(2);
  const symbol = route?.unitSymbol;
  if (!symbol) return num;
  return route?.unitPosition === 'prefix' ? `${symbol}${num}` : `${num}${symbol}`;
}
