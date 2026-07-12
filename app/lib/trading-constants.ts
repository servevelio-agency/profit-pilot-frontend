import type { InstrumentConfig } from '../api-client';

export const DEFAULT_NEW_INSTRUMENT: InstrumentConfig = {
  symbol: 'R_10',
  shortEmaPeriod: 5,
  longEmaPeriod: 20,
  timeFrame: '5m',
  historyDepth: 500,
  positionSize: 10,
  multiplier: 100,
  stopLossAmount: 4,
  takeProfitAmount: 3,
  tradeCooldownSeconds: 120,
  minEmaSeparationBps: 10,
  enabled: true,
};

export const CLIENT_DEFAULT_SYMBOLS = ['R_10', 'R_25'] as const;

export const SYMBOL_OPTIONS = [
  'R_10',
  'R_25',
  'R_50',
  'R_75',
  'R_100',
  'CRASH500',
  'BOOM500',
  'CRASH1000',
  'BOOM1000',
  'frxXAUUSD',
  'frxEURUSD',
  'frxGBPUSD',
  'frxUSDJPY',
] as const;
