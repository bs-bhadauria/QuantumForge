import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Sun, Moon, Play, Timer, Sparkles, Activity, Compass, Menu, ArrowLeft } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButton';

export default function Header() {
  const {
    theme,
    toggleTheme,
    simulationResult,
    isSimulating,
    runSimulation,
    setActiveView,
    previousView,
    goBack,
    sidebarWidth,
    isSidebarCollapsed,
    toggleSidebar,
  } = useQuantum();

  const runtime = simulationResult?.resources?.runtimeMs
    ? (simulationResult.resources.runtimeMs / 1000).toFixed(3) + 's'
    : '0.012s';

  return (
    <header
      style={{ left: isSidebarCollapsed ? 0 : `${sidebarWidth}px` }}
      className="fixed top-0 right-0 h-16 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 z-40 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(15,23,42,0.03)] transition-[left] duration-200 ease-in-out"
    >
      {/* Left breadcrumb info & Sidebar Hamburger Trigger */}
      <div className="flex items-center gap-2.5 min-w-0">
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors text-xs font-semibold cursor-pointer shadow-xs shrink-0"
            title="Open navigation sidebar (click to expand)"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Sidebar</span>
          </button>
        )}

        <button
          onClick={goBack}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
          title="Return to Platform Landing Page"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Platform Showcase</span>
        </button>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 hidden md:inline">Workspace //</span>
        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">Aer-Matrix-Q32</span>
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          State: Pure
        </span>
      </div>

      {/* Right control buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Runtime Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
          <Timer className="w-3.5 h-3.5 text-sky-500" />
          <span>{runtime}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Simulate Action with Vengeance UI AnimatedButton */}
        <AnimatedButton
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-3 sm:px-4 py-1.5 text-xs font-semibold shadow-[0_0_14px_rgba(0,240,255,0.35)]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Simulating...' : 'Simulate'}</span>
        </AnimatedButton>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all shadow-sm"
          title="Researcher Profile"
        >
          <span className="font-mono text-xs font-semibold text-cyan-400">Ψ</span>
        </div>
      </div>
    </header>
  );
}

