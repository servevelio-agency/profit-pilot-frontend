'use client';

import { useState } from 'react';
import type { InstrumentConfig, InstrumentState } from '../../api-client';
import {
  ButtonDangerOutline,
  ButtonGhost,
  ButtonPrimary,
  MiniStat,
  NumberField,
  SelectField,
} from './ui-primitives';

const TF_OPTIONS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
] as const;

export function InstrumentBoard({
  rows,
  meta,
  busy,
  onToggle,
  onClose,
  onRemove,
  onUpdateInstrument,
  updatePendingSymbol,
}: {
  rows: InstrumentState[];
  meta: Array<{ isFetching: boolean; isError: boolean }>;
  busy: boolean;
  onToggle: (symbol: string) => void;
  onClose: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onUpdateInstrument: (
    symbol: string,
    updates: Partial<InstrumentConfig>
  ) => Promise<void>;
  updatePendingSymbol: string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No instruments yet. Add one from the form above.
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {rows.map((instrument, index) => (
        <InstrumentRow
          key={instrument.symbol}
          instrument={instrument}
          syncing={meta[index]?.isFetching ?? false}
          failed={meta[index]?.isError ?? false}
          busy={busy}
          updatePending={updatePendingSymbol === instrument.symbol}
          onToggle={() => onToggle(instrument.symbol)}
          onClose={() => onClose(instrument.symbol)}
          onRemove={() => onRemove(instrument.symbol)}
          onSaveEdit={(updates) =>
            onUpdateInstrument(instrument.symbol, updates)
          }
        />
      ))}
    </div>
  );
}

function InstrumentRow({
  instrument,
  syncing,
  failed,
  busy,
  updatePending,
  onToggle,
  onClose,
  onRemove,
  onSaveEdit,
}: {
  instrument: InstrumentState;
  syncing: boolean;
  failed: boolean;
  busy: boolean;
  updatePending: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRemove: () => void;
  onSaveEdit: (updates: Partial<InstrumentConfig>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<InstrumentConfig>>({});

  const openEdit = () => {
    const c = instrument.config;
    setDraft({
      shortEmaPeriod: c.shortEmaPeriod,
      longEmaPeriod: c.longEmaPeriod,
      timeFrame: c.timeFrame,
      historyDepth: c.historyDepth,
      positionSize: c.positionSize,
      multiplier: c.multiplier,
      stopLossAmount: c.stopLossAmount ?? 0,
      takeProfitAmount: c.takeProfitAmount ?? 0,
      tradeCooldownSeconds: c.tradeCooldownSeconds ?? 0,
      minEmaSeparationBps: c.minEmaSeparationBps ?? 0,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft({});
  };

  const submitEdit = async () => {
    try {
      await onSaveEdit({
        shortEmaPeriod: draft.shortEmaPeriod,
        longEmaPeriod: draft.longEmaPeriod,
        timeFrame: draft.timeFrame,
        historyDepth: draft.historyDepth,
        positionSize: draft.positionSize,
        multiplier: draft.multiplier,
        stopLossAmount: draft.stopLossAmount,
        takeProfitAmount: draft.takeProfitAmount,
        tradeCooldownSeconds: draft.tradeCooldownSeconds,
        minEmaSeparationBps: draft.minEmaSeparationBps,
      });
      setEditing(false);
      setDraft({});
    } catch {
      /* mutation error: global alert + keep form open */
    }
  };

  const open = instrument.openPosition;
  const trend = instrument.signal?.state ?? '—';
  const signal = instrument.signal?.signal ?? '—';

  return (
    <div
      className={`rounded-xl border bg-card/60 p-4 transition ${
        open
          ? 'border-primary/40 ring-1 ring-primary/20'
          : 'border-border hover:border-border/80'
      }`}
    >
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-lg font-semibold tracking-tight'>
              {instrument.symbol}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                instrument.config.enabled
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {instrument.config.enabled ? 'Active' : 'Paused'}
            </span>
            {syncing && (
              <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
                Syncing
              </span>
            )}
            {failed && !syncing && (
              <span className='text-[11px] text-destructive'>
                Live data error
              </span>
            )}
          </div>
          <p className='mt-1 font-mono text-xs text-muted-foreground'>
            EMA {instrument.config.shortEmaPeriod}/
            {instrument.config.longEmaPeriod} • {instrument.config.timeFrame}
          </p>

          <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'>
            <MiniStat label='Trend' value={trend} />
            <MiniStat label='Signal' value={signal} />
            <MiniStat
              label='Stake'
              value={`$${instrument.config.positionSize}`}
            />
            <MiniStat
              label='Lev.'
              value={`${instrument.config.multiplier}x`}
            />
            <MiniStat
              label='SL / TP'
              value={`${instrument.config.stopLossAmount ?? '—'} / ${instrument.config.takeProfitAmount ?? '—'}`}
            />
            <MiniStat
              label='Cooldown'
              value={`${instrument.config.tradeCooldownSeconds ?? '—'}s`}
            />
          </div>

          <div className='mt-4 rounded-lg border border-border/80 bg-background/40 px-3 py-2.5 text-sm'>
            {open ? (
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                    <span className='font-medium text-foreground'>
                      Open: {open.signal} @ ${open.buy_price}
                    </span>
                    <span className='font-mono text-xs text-muted-foreground'>
                      #{open.contract_id}
                    </span>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    TP{' '}
                    {open.takeProfitAmount
                      ? `$${open.takeProfitAmount}`
                      : 'off'}{' '}
                    · SL{' '}
                    {open.stopLossAmount ? `$${open.stopLossAmount}` : 'off'}
                    {open.profit != null
                      ? ` · P/L ${open.profit >= 0 ? '+' : ''}${Number(open.profit).toFixed(2)}`
                      : ''}
                    {open.bid_price != null
                      ? ` · value $${Number(open.bid_price).toFixed(2)}`
                      : ''}
                  </p>
                </div>
                <ButtonPrimary
                  className='bg-destructive text-destructive-foreground hover:opacity-90 sm:shrink-0'
                  disabled={busy || updatePending}
                  onClick={onClose}
                >
                  Sell / close
                </ButtonPrimary>
              </div>
            ) : (
              <span className='text-muted-foreground'>No open position</span>
            )}
          </div>
        </div>

        <div className='flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch'>
          <ButtonGhost
            className='lg:min-w-[7rem]'
            disabled={busy || updatePending}
            onClick={onToggle}
          >
            {instrument.config.enabled ? 'Pause' : 'Resume'}
          </ButtonGhost>
          <ButtonGhost
            className='lg:min-w-[7rem]'
            disabled={busy || updatePending || editing}
            onClick={openEdit}
          >
            Edit
          </ButtonGhost>
          <ButtonPrimary
            className='bg-destructive text-destructive-foreground hover:opacity-90 lg:min-w-[7rem]'
            disabled={busy || updatePending || !open}
            onClick={onClose}
          >
            {open ? 'Sell / close' : 'No position'}
          </ButtonPrimary>
          <ButtonDangerOutline
            className='lg:min-w-[7rem]'
            disabled={busy || updatePending}
            onClick={onRemove}
          >
            Remove
          </ButtonDangerOutline>
        </div>
      </div>

      {editing && (
        <div className='mt-4 border-t border-border pt-4'>
          <p className='mb-3 text-sm font-medium text-foreground'>
            Edit settings — saved to the server on apply
          </p>
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <NumberField
              label='Short EMA'
              value={draft.shortEmaPeriod ?? 1}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, shortEmaPeriod: value }))
              }
            />
            <NumberField
              label='Long EMA'
              value={draft.longEmaPeriod ?? 10}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, longEmaPeriod: value }))
              }
            />
            <SelectField
              label='Timeframe'
              value={draft.timeFrame ?? '1m'}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, timeFrame: value }))
              }
              options={[...TF_OPTIONS]}
            />
            <NumberField
              label='History depth'
              value={draft.historyDepth ?? 300}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, historyDepth: value }))
              }
            />
            <NumberField
              label='Stake'
              value={draft.positionSize ?? 10}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, positionSize: value }))
              }
            />
            <NumberField
              label='Multiplier'
              value={draft.multiplier ?? 100}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, multiplier: value }))
              }
            />
            <NumberField
              label='Stop loss USD (0=off)'
              value={draft.stopLossAmount ?? 0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, stopLossAmount: value }))
              }
            />
            <NumberField
              label='Take profit USD (0=off)'
              value={draft.takeProfitAmount ?? 0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, takeProfitAmount: value }))
              }
            />
            <NumberField
              label='Cooldown sec (0=off)'
              value={draft.tradeCooldownSeconds ?? 0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, tradeCooldownSeconds: value }))
              }
            />
            <NumberField
              label='Min EMA gap bps (0=off)'
              value={draft.minEmaSeparationBps ?? 0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, minEmaSeparationBps: value }))
              }
            />
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            <ButtonPrimary
              disabled={updatePending}
              onClick={submitEdit}
            >
              {updatePending ? 'Saving…' : 'Save changes'}
            </ButtonPrimary>
            <ButtonGhost disabled={updatePending} onClick={cancelEdit}>
              Cancel
            </ButtonGhost>
          </div>
        </div>
      )}
    </div>
  );
}
