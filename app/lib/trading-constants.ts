import type {
  AssetClassType,
  BrokerType,
  InstrumentConfig,
} from '../api-client';

export const BROKER_OPTIONS = [
  { value: 'deriv_ws', label: 'Deriv Synthetic Engine' },
  { value: 'mt5_prime', label: 'MetaTrader 5 Direct Bridge' },
] as const;

export const ASSET_CLASS_OPTIONS = [
  { value: 'Synthetic Indices', label: 'Synthetic Indices' },
  { value: 'Forex', label: 'Forex' },
  { value: 'Stocks', label: 'Stocks' },
  { value: 'Commodities', label: 'Commodities' },
  { value: 'Indices', label: 'Indices' },
] as const;

export type SymbolCatalog = Record<
  BrokerType,
  Partial<Record<AssetClassType, readonly string[]>>
>;

export const SYMBOL_OPTIONS_BY_BROKER_AND_CLASS: SymbolCatalog = {
  deriv_ws: {
    'Synthetic Indices': [
      'R_10',
      'R_25',
      'R_50',
      'R_75',
      'R_100',
      'CRASH500',
      'BOOM500',
      'CRASH1000',
      'BOOM1000',
    ],
  },
  mt5_prime: {
    Forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
    Commodities: ['XAUUSD'],
    Indices: ['US500'],
    Stocks: ['AAPL'],
  },
};

export const DEFAULT_NEW_INSTRUMENT: InstrumentConfig = {
  symbol: 'R_10',
  brokerType: 'deriv_ws',
  assetClass: 'Synthetic Indices',
  shortEmaPeriod: 5,
  longEmaPeriod: 20,
  timeFrame: '5m',
  historyDepth: 500,
  positionSize: 10,
  strategy: 'fixed_isolated_stake',
  multiplier: 100,
  stopLossAmount: 0,
  takeProfitAmount: 0,
  tradeCooldownSeconds: 120,
  minEmaSeparationBps: 10,
  enabled: true,
};

export const CLIENT_DEFAULT_SYMBOLS = ['R_10', 'R_25'] as const;

const DERIV_SYNTHETIC_SYMBOLS =
  SYMBOL_OPTIONS_BY_BROKER_AND_CLASS.deriv_ws['Synthetic Indices'] ?? [];
const MT5_FOREX_SYMBOLS =
  SYMBOL_OPTIONS_BY_BROKER_AND_CLASS.mt5_prime.Forex ?? [];
const MT5_COMMODITY_SYMBOLS =
  SYMBOL_OPTIONS_BY_BROKER_AND_CLASS.mt5_prime.Commodities ?? [];
const MT5_INDEX_SYMBOLS =
  SYMBOL_OPTIONS_BY_BROKER_AND_CLASS.mt5_prime.Indices ?? [];
const MT5_STOCK_SYMBOLS =
  SYMBOL_OPTIONS_BY_BROKER_AND_CLASS.mt5_prime.Stocks ?? [];

export const SYMBOL_OPTIONS = [
  ...DERIV_SYNTHETIC_SYMBOLS,
  ...MT5_FOREX_SYMBOLS,
  ...MT5_COMMODITY_SYMBOLS,
  ...MT5_INDEX_SYMBOLS,
  ...MT5_STOCK_SYMBOLS,
] as const;
