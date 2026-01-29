import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Landmark } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WalletConnect } from './WalletConnect';
import { NetworkStatus } from './NetworkStatus';
import { useToast } from './ToastProvider';

const navItems = [
  { to: '/', label: 'Overview', Icon: LayoutDashboard },
  { to: '/position', label: 'Position', Icon: TrendingUp },
  { to: '/lending', label: 'Lending', Icon: Landmark },
] as const;

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const wallet = useWallet();
  const { showToast } = useToast();

  useEffect(() => {
    if (wallet.error) {
      showToast(wallet.error, 'error');
    }
  }, [wallet.error, showToast]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar backdrop (mobile) */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-900/95 shadow-xl backdrop-blur-xl
          transition-transform duration-300 ease-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4 lg:justify-center">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-lg font-bold text-transparent">
              DeFi Lending
            </span>
          </NavLink>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-200 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 p-3">
          <div className="rounded-xl bg-slate-800/50 p-2 text-xs text-slate-500">
            SimpleLending pool · USD8 / WETH
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2 md:gap-3">
            <NetworkStatus
              chainId={wallet.chainId}
              isCorrectNetwork={wallet.isCorrectNetwork}
              onSwitchNetwork={wallet.switchToHardhat}
            />
            <WalletConnect
              isConnected={wallet.isConnected}
              address={wallet.address}
              isConnecting={wallet.isConnecting}
              error={wallet.error}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          {!wallet.isConnected ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center shadow-xl backdrop-blur">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-white">Welcome to DeFi Lending</h2>
              <p className="mb-8 max-w-md text-slate-400">
                Connect your wallet to start supplying, borrowing, and earning on the SimpleLending pool.
              </p>
              <button
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400 disabled:opacity-60"
              >
                {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : !wallet.isCorrectNetwork ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/30 px-6 py-16 text-center backdrop-blur">
              <h2 className="mb-3 text-2xl font-semibold text-amber-100">Wrong Network</h2>
              <p className="mb-6 max-w-md text-amber-200/80">
                Please switch to the correct network to continue.
              </p>
              <button
                onClick={wallet.switchToHardhat}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400"
              >
                Switch Network
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
