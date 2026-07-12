import type { TradingDashboard } from '../../hooks/use-trading-dashboard';
import { Alert, ButtonPrimary, TextField } from './ui-primitives';

export function LoadingSession() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background text-muted-foreground'>
      <div className='text-center'>
        <div className='mx-auto h-9 w-9 animate-spin rounded-full border-2 border-muted border-t-primary' />
        <p className='mt-4 text-sm'>Loading session…</p>
      </div>
    </div>
  );
}

export function LoginScreen({
  loginForm,
  setLoginForm,
  loginMutation,
  globalError,
  globalSuccess,
}: Pick<
  TradingDashboard,
  | 'loginForm'
  | 'setLoginForm'
  | 'loginMutation'
  | 'globalError'
  | 'globalSuccess'
>) {
  return (
    <div className='min-h-screen bg-background px-4 py-12 text-foreground md:px-8'>
      <div className='mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14'>
        <div className='flex flex-col justify-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>
            Trading workspace
          </p>
          <h1 className='mt-3 text-3xl font-semibold tracking-tight md:text-4xl'>
            Control automated EMA strategies with a clear, isolated setup.
          </h1>
          <p className='mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground'>
            Sign in with an account created by your admin. Deriv tokens are
            encrypted server-side; instruments and logs stay per user.
          </p>
          <ul className='mt-8 space-y-3 text-sm text-muted-foreground'>
            <li className='flex gap-2'>
              <span className='text-primary'>✓</span>
              Admin-managed users, no open registration
            </li>
            <li className='flex gap-2'>
              <span className='text-primary'>✓</span>
              Live state polling keeps positions visible
            </li>
            <li className='flex gap-2'>
              <span className='text-primary'>✓</span>
              Multipliers and stakes per symbol
            </li>
          </ul>
        </div>

        <div className='flex flex-col justify-center'>
          <div className='rounded-2xl border border-border bg-card/90 p-8 shadow-lg'>
            <h2 className='text-lg font-semibold'>Sign in</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Use your email and password.
            </p>

            {globalError && (
              <Alert tone='error' className='mt-5'>
                {globalError}
              </Alert>
            )}
            {globalSuccess && (
              <Alert tone='success' className='mt-5'>
                {globalSuccess}
              </Alert>
            )}

            <div className='mt-6 space-y-4'>
              <TextField
                label='Email'
                value={loginForm.email}
                placeholder='you@example.com'
                onChange={(value) =>
                  setLoginForm((prev) => ({ ...prev, email: value }))
                }
              />
              <TextField
                label='Password'
                type='password'
                value={loginForm.password}
                placeholder='Password'
                onChange={(value) =>
                  setLoginForm((prev) => ({ ...prev, password: value }))
                }
              />
              <ButtonPrimary
                className='w-full'
                disabled={loginMutation.isPending}
                onClick={() => loginMutation.mutate(loginForm)}
              >
                {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
