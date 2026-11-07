import React from 'react';
import { QuantumProvider, useQuantum } from './context/QuantumContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import CircuitComposer from './components/studio/CircuitComposer';
import AlgorithmMarketplace from './components/marketplace/AlgorithmMarketplace';
import SimulationBenchmarks from './components/benchmarks/SimulationBenchmarks';
import DocsHub from './components/docs/DocsHub';
import CircuitHistory from './components/history/CircuitHistory';
import LandingPage from './components/landing/LandingPage';
import QDNAStudio from './components/dna/QDNAStudio';
import QKDStudio from './components/qkd/QKDStudio';
import { RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("QuantumForge Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b13] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
            <span className="font-mono text-xl">⚠️</span>
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Studio Interface Encountered an Issue</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6 font-mono">
            {this.state.error?.message || "An unexpected error occurred during rendering."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-2 hover:bg-cyan-400 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Studio</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { activeView, sidebarWidth, isSidebarCollapsed } = useQuantum();

  // If on landing page, display full-bleed Stitch Landing Page
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  // Otherwise, display Studio IDE layout with Sidebar and Header
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D14] text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <Sidebar />
      <div 
        style={{ paddingLeft: isSidebarCollapsed ? 0 : `${sidebarWidth}px` }}
        className="min-h-screen transition-[padding] duration-200 ease-in-out"
      >
        <Header />
        <main className="pt-16 pb-12 min-h-[calc(100vh-4rem)]">
          {activeView === 'composer' && <CircuitComposer />}
          {activeView === 'marketplace' && <AlgorithmMarketplace />}
          {activeView === 'benchmarks' && <SimulationBenchmarks />}
          {activeView === 'docs' && <DocsHub />}
          {activeView === 'history' && <CircuitHistory />}
          {activeView === 'dna' && <QDNAStudio />}
          {activeView === 'qkd' && <QKDStudio />}
          {/* Fallback to CircuitComposer if activeView is not recognized */}
          {!['composer', 'marketplace', 'benchmarks', 'docs', 'history', 'dna', 'qkd'].includes(activeView) && (
            <CircuitComposer />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QuantumProvider>
        <AppContent />
      </QuantumProvider>
    </ErrorBoundary>
  );
}
