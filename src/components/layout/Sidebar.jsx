import React, { useRef, useCallback } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import {
  Cpu,
  ShoppingBag,
  Activity,
  BookOpen,
  FlaskConical,
  Database,
  Radio,
  Compass,
  ChevronLeft,
  Dna,
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeView,
    setActiveView,
    simulationResult,
    sidebarWidth,
    isSidebarCollapsed,
    toggleSidebar,
    updateSidebarWidth,
  } = useQuantum();

  const isResizingRef = useRef(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = moveEvent.clientX;
      updateSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [updateSidebarWidth]);

  const coherence = simulationResult?.resources?.fidelity || '99.82%';

  const navItems = [
    { id: 'landing', label: 'Platform Showcase', icon: Compass, badge: 'Home' },
    { id: 'composer', label: 'Circuit Composer', icon: Cpu, badge: 'Live' },
    { id: 'marketplace', label: 'Algorithm Marketplace', icon: ShoppingBag, count: '18' },
    { id: 'dna', label: 'Q-DNA Storage Studio', icon: Dna, badge: 'New' },
    { id: 'benchmarks', label: 'Simulation Benchmarks', icon: Activity },
    { id: 'docs', label: 'Docs & Architecture Specs', icon: BookOpen },
    { id: 'history', label: 'Database & Saved Runs', icon: Database },
  ];

  return (
    <aside
      style={{
        width: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
        transform: isSidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
      }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-[#0B0E15] border-r border-slate-200 dark:border-slate-800/80 z-50 flex flex-col py-6 shadow-[2px_0_16px_rgba(15,23,42,0.03)] transition-[transform,width] duration-200 ease-in-out select-none overflow-hidden"
    >
      {/* Draggable resize handle on right border */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-2.5 h-full cursor-col-resize hover:bg-cyan-500/40 active:bg-cyan-500 transition-colors z-50 group flex items-center justify-center"
        title="Drag to resize sidebar (drag far left to collapse)"
      >
        <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-cyan-400 group-hover:h-12 transition-all" />
      </div>

      {/* Brand Header & Collapse Toggle */}
      <div className="px-5 mb-5 flex items-center justify-between gap-2">
        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2.5 text-left group cursor-pointer min-w-0"
          title="Go to Platform Showcase"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform shrink-0">
            <span className="font-mono text-lg font-bold text-slate-950">Ψ</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-500 transition-colors truncate">
              QuantumForge
            </span>
            <span className="font-mono text-[9px] tracking-wider uppercase text-cyan-600 dark:text-cyan-400 font-semibold truncate">
              STUDIO PLATFORM IDE
            </span>
          </div>
        </button>

        {/* Dedicated Sidebar Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          title="Collapse sidebar to maximize workspace"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Aer Engine Status Chip */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/40 font-mono text-xs text-emerald-800 dark:text-emerald-300 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 truncate">Qiskit Aer Engine</span>
          <span className="ml-auto text-[10px] bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium shrink-0">
            v0.12.2
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-wider uppercase text-slate-400 dark:text-slate-500 font-semibold truncate">
          WORKSPACE
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs transition-all text-left group ${
                isActive
                  ? 'bg-sky-50 dark:bg-cyan-500/10 text-sky-700 dark:text-cyan-300 font-semibold border border-sky-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform shrink-0 ${
                  isActive
                    ? 'text-sky-600 dark:text-cyan-400 scale-105'
                    : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              )}
              {item.count && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-5 pb-1 font-mono text-[10px] tracking-wider uppercase text-slate-400 dark:text-slate-500 font-semibold truncate">
          SPECS &amp; PLATFORM
        </div>

        <button
          onClick={() => setActiveView('docs')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <FlaskConical className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">Physical Specs / Clifford+T</span>
        </button>

        <a
          href="https://qiskit.org"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Radio className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">IBM Quantum Cloud Sync</span>
        </a>
      </nav>

      {/* Coherence Telemetry Footer */}
      <div className="px-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-500 dark:text-slate-400 shrink-0">
        <div className="flex justify-between items-center">
          <span className="truncate">Coherence Q32</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold font-mono flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{coherence}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
