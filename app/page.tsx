'use client';

import { DashboardApp } from './components/dashboard/dashboard-app';
import { LoadingSession, LoginScreen } from './components/dashboard/auth-views';
import { useTradingDashboard } from './hooks/use-trading-dashboard';

export default function Home() {
  const dash = useTradingDashboard();

  if (dash.meQuery.isPending) {
    return <LoadingSession />;
  }

  if (!dash.currentUser) {
    return <LoginScreen {...dash} />;
  }

  return <DashboardApp {...dash} />;
}
