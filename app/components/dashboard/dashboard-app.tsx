'use client';

import { useState } from 'react';
import type {
  AdminUser,
  AnalyticsSummary,
  LogEntry,
  LogSummary,
} from '../../api-client';
import type { TradingDashboard } from '../../hooks/use-trading-dashboard';
import { formatDate, formatMoney } from '../../lib/format';
import { SYMBOL_OPTIONS } from '../../lib/trading-constants';
import { InstrumentBoard } from './instrument-board';
import {
  Alert,
  ButtonGhost,
  ButtonPrimary,
  Kpi,
  MiniStat,
  NavItem,
  NumberField,
  Panel,
  SelectField,
  TextField,
  Tooltip,
} from './ui-primitives';

type MainSection = 'overview' | 'token' | 'performance' | 'activity' | 'admin';

export function DashboardApp(d: TradingDashboard) {
  const [section, setSection] = useState<MainSection>('overview');
  const {
    currentUser,
    isAdmin,
    refreshAll,
    logoutMutation,
    globalError,
    globalSuccess,
    health,
    tokenStatus,
    tokenInput,
    setTokenInput,
    saveTokenMutation,
    deleteTokenMutation,
    instrumentStates,
    instrumentStateMeta,
    anyInstrumentFetching,
    showAddInstrument,
    setShowAddInstrument,
    newInstrument,
    setNewInstrument,
    addInstrumentMutation,
    addDefaultsMutation,
    updateInstrumentMutation,
    toggleInstrumentMutation,
    closePositionMutation,
    removeInstrumentMutation,
    analytics,
    logSummary,
    logs,
    activeInstrumentCount,
    openPositionCount,
    userCount,
    createUserForm,
    setCreateUserForm,
    createUserMutation,
    adminUsers,
  } = d;

  const busyInstrument =
    toggleInstrumentMutation.isPending ||
    closePositionMutation.isPending ||
    removeInstrumentMutation.isPending;

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <aside className='hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar py-6 pl-4 pr-3 md:flex'>
        <p className='px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Menu
        </p>
        <nav className='mt-4 flex flex-col gap-1'>
          <NavItem
            active={section === 'overview'}
            onClick={() => setSection('overview')}
          >
            Overview
          </NavItem>
          <NavItem
            active={section === 'token'}
            onClick={() => setSection('token')}
          >
            Deriv token
          </NavItem>
          <NavItem
            active={section === 'performance'}
            onClick={() => setSection('performance')}
          >
            Performance
          </NavItem>
          <NavItem
            active={section === 'activity'}
            onClick={() => setSection('activity')}
          >
            Activity
          </NavItem>
          {isAdmin ? (
            <NavItem
              active={section === 'admin'}
              onClick={() => setSection('admin')}
            >
              Admin
            </NavItem>
          ) : null}
        </nav>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur'>
          <div className='flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8'>
            <div>
              <p className='text-xs font-medium text-muted-foreground'>
                {isAdmin ? 'Administrator' : 'Trader'}
              </p>
              <h1 className='text-xl font-semibold tracking-tight'>
                {currentUser?.email}
              </h1>
              <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                <span className='rounded-md bg-muted px-2 py-0.5 font-medium text-foreground/80'>
                  {currentUser?.role}
                </span>
                {anyInstrumentFetching ? (
                  <span className='flex items-center gap-1'>
                    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
                    Updating live quotes…
                  </span>
                ) : null}
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <ButtonGhost onClick={() => refreshAll()} className='text-sm'>
                Refresh all
              </ButtonGhost>

              <Tooltip
                content={
                  <span>Toggle live updates: 1s (Live ON) / 8s (Live OFF)</span>
                }
              >
                <ButtonGhost
                  onClick={() =>
                    // toggle between 1s live updates and 8s low-frequency
                    d.setInstrumentPollMs?.(
                      d.instrumentPollMs === 1000 ? 8000 : 1000
                    )
                  }
                  className='text-sm'
                >
                  {d.instrumentPollMs === 1000 ? 'Live: ON' : 'Live: OFF'}
                </ButtonGhost>
              </Tooltip>
              <ButtonGhost
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                className='text-sm'
              >
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </ButtonGhost>
            </div>
          </div>

          <div className='flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden'>
            {(
              [
                ['overview', 'Overview'],
                ['token', 'Token'],
                ['performance', 'Stats'],
                ['activity', 'Logs'],
                ...(isAdmin ? [['admin', 'Admin']] : []),
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type='button'
                onClick={() => setSection(id as MainSection)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                  section === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <main className='flex-1 space-y-6 px-4 py-6 md:px-8'>
          {globalError && <Alert tone='error'>{globalError}</Alert>}
          {globalSuccess && <Alert tone='success'>{globalSuccess}</Alert>}

          {section === 'overview' && (
            <>
              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                <Kpi
                  label={isAdmin ? 'Users' : 'Instruments'}
                  value={isAdmin ? userCount : instrumentStates.length}
                  hint={isAdmin ? 'In this deployment' : 'Configured symbols'}
                />
                <Kpi
                  label='Active'
                  value={activeInstrumentCount}
                  hint='Automation enabled'
                />
                <Kpi
                  label='Open positions'
                  value={openPositionCount}
                  hint='From Deriv portfolio'
                />
                <Kpi
                  label='Net P/L'
                  value={analytics ? formatMoney(analytics.netProfit) : '—'}
                  hint='Closed trades'
                />
              </div>

              <Panel title='Connection & account'>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  <MiniStat
                    label='MongoDB'
                    value={health?.mongo.connected ? 'OK' : 'Down'}
                  />
                  <MiniStat
                    label='Deriv token'
                    value={
                      tokenStatus?.configured
                        ? `••••${tokenStatus.tokenLast4}`
                        : 'Not set'
                    }
                  />
                  <MiniStat
                    label='Trades (log)'
                    value={String(logSummary?.totalTrades ?? 0)}
                  />
                  <MiniStat
                    label='Win rate'
                    value={
                      analytics
                        ? `${(analytics.winRate * 100).toFixed(1)}%`
                        : '—'
                    }
                  />
                  <MiniStat
                    label='Open (log)'
                    value={String(logSummary?.openTrades ?? 0)}
                  />
                </div>
              </Panel>

              <Panel
                title='Instruments'
                actions={
                  <div className='flex flex-wrap gap-2'>
                    <ButtonPrimary
                      className='px-3 py-2 text-xs'
                      onClick={() => setShowAddInstrument((prev) => !prev)}
                    >
                      {showAddInstrument ? 'Hide form' : 'Add instrument'}
                    </ButtonPrimary>
                    <ButtonGhost
                      className='px-3 py-2 text-xs'
                      disabled={addDefaultsMutation.isPending}
                      onClick={() => addDefaultsMutation.mutate()}
                    >
                      {addDefaultsMutation.isPending
                        ? 'Adding…'
                        : 'Add defaults'}
                    </ButtonGhost>
                  </div>
                }
              >
                {showAddInstrument && (
                  <div className='mb-6 grid gap-3 rounded-xl border border-border bg-background/50 p-4 md:grid-cols-2 xl:grid-cols-4'>
                    <SelectField
                      label='Symbol'
                      value={newInstrument.symbol}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({ ...prev, symbol: value }))
                      }
                      options={SYMBOL_OPTIONS.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    />
                    <NumberField
                      label='Short EMA'
                      value={newInstrument.shortEmaPeriod}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          shortEmaPeriod: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Long EMA'
                      value={newInstrument.longEmaPeriod}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          longEmaPeriod: value,
                        }))
                      }
                    />
                    <SelectField
                      label='Timeframe'
                      value={newInstrument.timeFrame}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          timeFrame: value,
                        }))
                      }
                      options={[
                        { value: '1m', label: '1m' },
                        { value: '5m', label: '5m' },
                        { value: '15m', label: '15m' },
                      ]}
                    />
                    <NumberField
                      label='History depth'
                      value={newInstrument.historyDepth}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          historyDepth: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Stake'
                      value={newInstrument.positionSize}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          positionSize: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Multiplier'
                      value={newInstrument.multiplier}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          multiplier: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Stop loss (USD, 0=off)'
                      value={newInstrument.stopLossAmount ?? 0}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          stopLossAmount: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Take profit (USD, 0=off)'
                      value={newInstrument.takeProfitAmount ?? 0}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          takeProfitAmount: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Cooldown (sec, 0=off)'
                      value={newInstrument.tradeCooldownSeconds ?? 0}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          tradeCooldownSeconds: value,
                        }))
                      }
                    />
                    <NumberField
                      label='Min EMA gap (bps, 0=off)'
                      value={newInstrument.minEmaSeparationBps ?? 0}
                      onChange={(value) =>
                        setNewInstrument((prev) => ({
                          ...prev,
                          minEmaSeparationBps: value,
                        }))
                      }
                    />
                    <div className='flex items-end md:col-span-2 xl:col-span-4'>
                      <ButtonPrimary
                        className='w-full'
                        disabled={addInstrumentMutation.isPending}
                        onClick={() =>
                          addInstrumentMutation.mutate(newInstrument)
                        }
                      >
                        {addInstrumentMutation.isPending ? 'Saving…' : 'Create'}
                      </ButtonPrimary>
                    </div>
                  </div>
                )}

                <InstrumentBoard
                  rows={instrumentStates}
                  meta={instrumentStateMeta}
                  busy={busyInstrument}
                  onToggle={(symbol) => toggleInstrumentMutation.mutate(symbol)}
                  onClose={(symbol) => closePositionMutation.mutate(symbol)}
                  onRemove={(symbol) => removeInstrumentMutation.mutate(symbol)}
                  onUpdateInstrument={async (
                    symbol,
                    updates
                  ): Promise<void> => {
                    await updateInstrumentMutation.mutateAsync({
                      symbol,
                      updates,
                    });
                  }}
                  updatePendingSymbol={
                    updateInstrumentMutation.isPending
                      ? (updateInstrumentMutation.variables?.symbol ?? null)
                      : null
                  }
                />
              </Panel>
            </>
          )}

          {section === 'token' && (
            <Panel
              title='Deriv API token'
              actions={
                tokenStatus?.configured ? (
                  <span className='text-xs text-muted-foreground'>
                    Updated {formatDate(tokenStatus.updatedAt)}
                  </span>
                ) : null
              }
            >
              <p className='text-sm text-muted-foreground'>
                Paste a token with trading permissions. It is encrypted and
                stored per account.
              </p>
              <div className='mt-4 flex flex-col gap-3 lg:flex-row'>
                <input
                  type='password'
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder='Deriv API token'
                  className='flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring'
                />
                <div className='flex flex-wrap gap-2'>
                  <ButtonPrimary
                    disabled={!tokenInput || saveTokenMutation.isPending}
                    onClick={() => saveTokenMutation.mutate(tokenInput)}
                  >
                    {saveTokenMutation.isPending ? 'Saving…' : 'Save'}
                  </ButtonPrimary>
                  <ButtonGhost
                    disabled={
                      !tokenStatus?.configured || deleteTokenMutation.isPending
                    }
                    onClick={() => deleteTokenMutation.mutate()}
                  >
                    Remove
                  </ButtonGhost>
                </div>
              </div>
            </Panel>
          )}

          {section === 'performance' && (
            <>
              <Panel title='Analytics snapshot'>
                <AnalyticsPanel analytics={analytics} logSummary={logSummary} />
              </Panel>
              <Panel title='Latest closed trades'>
                <LatestTradesTable rows={analytics?.latest || []} />
              </Panel>
            </>
          )}

          {section === 'activity' && (
            <Panel title='Recent events'>
              <RecentActivityTable rows={logs} />
            </Panel>
          )}

          {section === 'admin' && isAdmin && (
            <div className='grid gap-6 xl:grid-cols-2'>
              <Panel title='System'>
                <div className='grid gap-2 sm:grid-cols-2'>
                  <MiniStat
                    label='Database'
                    value={health?.mongo.connected ? 'Connected' : 'Offline'}
                  />
                  <MiniStat
                    label='Bootstrap admin'
                    value={
                      health?.auth.bootstrapAdminConfigured ? 'OK' : 'Missing'
                    }
                  />
                  <MiniStat
                    label='JWT secret'
                    value={
                      health?.auth.usingFallbackJwtSecret
                        ? 'Fallback'
                        : 'Custom'
                    }
                  />
                  <MiniStat
                    label='Token encryption'
                    value={
                      health?.auth.usingFallbackEncryptionKey
                        ? 'Fallback'
                        : 'Custom'
                    }
                  />
                  <MiniStat
                    label='Instruments (all users)'
                    value={String(health?.trading.totalInstruments ?? 0)}
                  />
                  <MiniStat
                    label='Active (all users)'
                    value={String(health?.trading.activeInstruments ?? 0)}
                  />
                </div>
              </Panel>

              <Panel title='Create user'>
                <div className='space-y-3'>
                  <TextField
                    label='Email'
                    value={createUserForm.email}
                    placeholder='new@example.com'
                    onChange={(value) =>
                      setCreateUserForm((prev) => ({ ...prev, email: value }))
                    }
                  />
                  <TextField
                    label='Password'
                    type='password'
                    value={createUserForm.password}
                    placeholder='Temporary password'
                    onChange={(value) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        password: value,
                      }))
                    }
                  />
                  <SelectField
                    label='Role'
                    value={createUserForm.role}
                    onChange={(value) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        role: value as 'user' | 'admin',
                      }))
                    }
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                  />
                  <ButtonPrimary
                    className='w-full'
                    disabled={createUserMutation.isPending}
                    onClick={() => createUserMutation.mutate(createUserForm)}
                  >
                    {createUserMutation.isPending ? 'Creating…' : 'Create user'}
                  </ButtonPrimary>
                </div>
              </Panel>

              <Panel
                title='Accounts'
                className='xl:col-span-2'
                actions={
                  <span className='text-xs text-muted-foreground'>
                    {adminUsers.length} users
                  </span>
                }
              >
                <div className='space-y-2'>
                  {adminUsers.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>No users.</p>
                  ) : (
                    adminUsers.map((user) => (
                      <AdminUserRow key={user.id} user={user} />
                    ))
                  )}
                </div>
              </Panel>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AnalyticsPanel({
  analytics,
  logSummary,
}: {
  analytics?: AnalyticsSummary;
  logSummary?: LogSummary;
}) {
  const ls = logSummary;
  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      <MiniStat label='Total trades' value={String(ls?.totalTrades ?? 0)} />
      <MiniStat label='Open trades' value={String(ls?.openTrades ?? 0)} />
      <MiniStat
        label='Profit factor'
        value={
          analytics?.profitFactor == null
            ? '—'
            : analytics.profitFactor.toFixed(2)
        }
      />
      <MiniStat
        label='Win rate'
        value={analytics ? `${(analytics.winRate * 100).toFixed(1)}%` : '—'}
      />
      <MiniStat
        label='Gross profit'
        value={analytics ? formatMoney(analytics.grossProfit) : '—'}
      />
      <MiniStat
        label='Gross loss'
        value={analytics ? formatMoney(analytics.grossLoss) : '—'}
      />
    </div>
  );
}

function LatestTradesTable({ rows }: { rows: AnalyticsSummary['latest'] }) {
  if (rows.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>No closed trades yet.</p>
    );
  }
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-sm'>
        <thead className='text-xs text-muted-foreground'>
          <tr>
            <th className='pb-2 font-medium'>Symbol</th>
            <th className='pb-2 font-medium'>Contract</th>
            <th className='pb-2 text-right font-medium'>Buy</th>
            <th className='pb-2 text-right font-medium'>Sold</th>
            <th className='pb-2 text-right font-medium'>P/L</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {rows.slice(0, 14).map((row) => (
            <tr key={`${row.contract_id ?? 'na'}-${row.createdAt}`}>
              <td className='py-2.5'>{row.symbol ?? '—'}</td>
              <td className='py-2.5 font-mono text-xs text-muted-foreground'>
                {row.contract_id ?? '—'}
              </td>
              <td className='py-2.5 text-right tabular-nums'>
                {formatMoney(row.buy_price)}
              </td>
              <td className='py-2.5 text-right tabular-nums'>
                {formatMoney(row.sold_for)}
              </td>
              <td
                className={`py-2.5 text-right font-medium tabular-nums ${
                  (row.profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatMoney(row.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentActivityTable({ rows }: { rows: LogEntry[] }) {
  if (rows.length === 0) {
    return <p className='text-sm text-muted-foreground'>No recent activity.</p>;
  }
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-sm'>
        <thead className='text-xs text-muted-foreground'>
          <tr>
            <th className='pb-2 font-medium'>Type</th>
            <th className='pb-2 font-medium'>Time</th>
            <th className='pb-2 font-medium'>Details</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {rows.slice(0, 16).map((row) => (
            <tr key={row._id}>
              <td className='py-2.5'>{row.type}</td>
              <td className='py-2.5 text-muted-foreground'>
                {formatDate(row.createdAt)}
              </td>
              <td className='max-w-md py-2.5'>
                <code className='break-all text-xs text-muted-foreground'>
                  {JSON.stringify(row).slice(0, 160)}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserRow({ user }: { user: AdminUser }) {
  return (
    <div className='flex flex-col gap-2 rounded-lg border border-border bg-background/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <p className='font-medium'>{user.email}</p>
        <p className='text-xs text-muted-foreground'>
          {user.role} · joined {formatDate(user.createdAt)}
        </p>
      </div>
      <div className='text-right text-xs text-muted-foreground'>
        <p>
          Token: {user.token.tokenLast4 ? `••••${user.token.tokenLast4}` : '—'}
        </p>
        <p>{formatDate(user.token.tokenUpdatedAt)}</p>
      </div>
    </div>
  );
}
