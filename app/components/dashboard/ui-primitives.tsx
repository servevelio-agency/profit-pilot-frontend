export function Alert({
  children,
  tone,
  className = '',
}: {
  children: React.ReactNode;
  tone: 'error' | 'success';
  className?: string;
}) {
  const classes =
    tone === 'error'
      ? 'border-destructive/40 bg-destructive/10 text-destructive-foreground'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';

  return (
    <div
      role='alert'
      className={`rounded-lg border px-4 py-3 text-sm ${classes} ${className}`}
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  children,
  actions,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card/80 shadow-sm ${className}`}
    >
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4'>
        <h2 className='text-base font-semibold tracking-tight text-foreground'>
          {title}
        </h2>
        {actions}
      </div>
      <div className='px-5 py-4'>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className='rounded-xl border border-border bg-card/60 px-4 py-3'>
      <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
        {label}
      </p>
      <p className='mt-1 text-2xl font-semibold tabular-nums text-foreground'>
        {value}
      </p>
      <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-background/50 px-3 py-2.5'>
      <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='mt-0.5 text-sm font-medium text-foreground'>{value}</p>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className='block text-sm'>
      <span className='mb-1.5 block text-muted-foreground'>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className='w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring'
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className='block text-sm'>
      <span className='mb-1.5 block text-muted-foreground'>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className='block text-sm'>
      <span className='mb-1.5 block text-muted-foreground'>{label}</span>
      <input
        type='number'
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className='w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground'
      />
    </label>
  );
}

export function NavItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
      }`}
    >
      {children}
    </button>
  );
}

export function ButtonPrimary({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonGhost({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonDangerOutline({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/15 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
