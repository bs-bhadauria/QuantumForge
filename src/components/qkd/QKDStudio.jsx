import React, { useState, useMemo } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import {
  simulateBB84Transmission,
  generateBB84Circuit,
  generateQkdAuditLog,
  BASES,
} from '../../services/qkdService';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Cpu,
  Download,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Terminal,
  Crosshair,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function QKDStudio() {
  const { loadAlgorithm, setActiveView } = useQuantum();

  const [numPhotons, setNumPhotons] = useState(32);
  const [eveRate, setEveRate] = useState(0); // 0 to 100%
  const [secretMessage, setSecretMessage] = useState('CONFIDENTIAL_LAUNCH_ALPHA_2026');
  const [selectedPhotonIdx, setSelectedPhotonIdx] = useState(0);
  const [showScienceExplainer, setShowScienceExplainer] = useState(false);
  const [runNonce, setRunNonce] = useState(0);

  // Run BB84 Simulation
  const qkdResult = useMemo(() => {
    return simulateBB84Transmission(numPhotons, eveRate, secretMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPhotons, eveRate, secretMessage, runNonce]);

  const selectedPhoton = qkdResult.photons[selectedPhotonIdx] || qkdResult.photons[0];

  const handleTransmit = () => {
    setRunNonce((n) => n + 1);
  };

  const handleDownloadAudit = () => {
    const jsonString = generateQkdAuditLog(qkdResult);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qkd_bb84_audit_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInspectCircuit = () => {
    if (!selectedPhoton) return;
    const circuit = generateBB84Circuit(selectedPhoton);
    loadAlgorithm({
      title: circuit.name,
      n_qubits: circuit.n_qubits,
      recommendedShots: 2048,
      operations: circuit.operations,
    }, 'qkd');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 animate-fadeIn">
      
      {/* 1. Sleek Compact Header Bar */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d1424] via-[#09101d] to-[#120d24] border border-cyan-900/40 p-4 sm:p-5 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold tracking-wide">
                <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
                <span>Quantum Cryptography &amp; Cyber-Defense</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                BB84 Protocol · Shor-Preskill Bound
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              QKD BB84 Cyber-Defense Simulator
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Transmit quantum key photons between <strong>Alice</strong> and <strong>Bob</strong>. Intercept the channel with 
              <strong> Eve (Hacker)</strong> to trigger Heisenberg measurement collapse, reveal the Quantum Bit Error Rate (QBER), 
              and verify unconditional physical security.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadAudit}
              className="px-3.5 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Download cryptographic transmission log (.JSON)"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit Log</span>
            </button>
            <button
              onClick={handleInspectCircuit}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-500/20"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-200" />
              <span>Inspect BB84 Circuit (Photon #{selectedPhoton.index})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cyber-Defense Security Alert Banner (Dynamic State) */}
      {qkdResult.isSecure ? (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-200 uppercase tracking-wide font-mono">
                  Quantum Channel Secure
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono">
                  QBER: {qkdResult.qber}% ≤ 11.0%
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                No eavesdropping detected. Mutual information $I(A:B) = {qkdResult.mutualInfo.aliceBob}$ bits/photon. Shared secret key established with 100% fidelity.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 self-start sm:self-auto">
            Sifted Key: {qkdResult.siftedLength} Bits
          </span>
        </div>
      ) : (
        <div className="bg-rose-950/40 border border-rose-500/60 rounded-xl p-3.5 sm:p-4 shadow-xl shadow-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300 animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/60 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-rose-200 uppercase tracking-wide font-mono flex items-center gap-1.5">
                  Eavesdropper (Eve) Detected!
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-700 text-rose-200 font-mono font-bold">
                  QBER: {qkdResult.qber}% &gt; 11.0%
                </span>
              </div>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                Wave function collapse detected on quantum photons! Eve intercepted {qkdResult.eveInterceptedCount} photons. 
                Shor-Preskill security bound violated — <strong>Aborting key exchange!</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-rose-500/30 text-rose-200 border border-rose-500/60 shrink-0 self-start sm:self-auto font-bold">
            KEY ABORTED
          </span>
        </div>
      )}

      {/* 3. Interactive Quantum Transmission Controls */}
      <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Eavesdropper Slider (Dominant Control) */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                {eveRate > 0 ? <Eye className="w-4 h-4 text-rose-400 animate-pulse" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span>Eve (Hacker) Interception Rate:</span>
                <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                  eveRate > 44 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : eveRate > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {eveRate}%
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {eveRate === 0 ? 'Pure Channel' : eveRate < 45 ? 'Partial Sniffing' : 'Full Wiretap Attack'}
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={eveRate}
                onChange={(e) => setEveRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-rose-500 transition-all"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span className="text-emerald-500">0% (Pure)</span>
                <span>25%</span>
                <span className="text-amber-500">45% (Cutoff)</span>
                <span>75%</span>
                <span className="text-rose-500">100% (Full Attack)</span>
              </div>
            </div>
          </div>

          {/* Photon Count & Secret Message Controls */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-1/3 space-y-1.5">
              <label className="text-[11px] text-slate-400 font-mono block">Photons:</label>
              <div className="flex items-center gap-1">
                {[16, 32, 64].map((count) => (
                  <button
                    key={count}
                    onClick={() => setNumPhotons(count)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      numPhotons === count
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full sm:w-2/3 flex items-center gap-2">
              <button
                onClick={handleTransmit}
                className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Transmit Quantum Photons</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Cryptographic Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: QBER */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Quantum Bit Error Rate (QBER)</p>
          <p className={`text-xl font-bold font-mono mt-1 ${
            qkdResult.qber > 11.0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {qkdResult.qber}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Threshold: ≤ 11.0%</p>
        </div>

        {/* Metric 2: Sifted Key Bits */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Sifted Key Length</p>
          <p className="text-xl font-bold font-mono mt-1 text-cyan-400">
            {qkdResult.siftedLength} bits
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {((qkdResult.siftedLength / qkdResult.numPhotons) * 100).toFixed(0)}% basis match
          </p>
        </div>

        {/* Metric 3: Intercepted Photons */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Eve Interceptions</p>
          <p className={`text-xl font-bold font-mono mt-1 ${
            qkdResult.eveInterceptedCount > 0 ? 'text-amber-400' : 'text-slate-300'
          }`}>
            {qkdResult.eveInterceptedCount} / {qkdResult.numPhotons}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Expected QBER: ~{qkdResult.theoreticalQber}%</p>
        </div>

        {/* Metric 4: Mutual Information */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Mutual Information I(A:B)</p>
          <p className="text-xl font-bold font-mono mt-1 text-purple-400">
            {qkdResult.mutualInfo.aliceBob}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">I(Alice:Eve) = {qkdResult.mutualInfo.aliceEve} b/ph</p>
        </div>

      </div>

      {/* 5. Live Photon Transmission Stream Table */}
      <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              Live Photon Measurement &amp; Sifting Stream
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any photon to inspect its quantum circuit state or analyze measurement collapse.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Selected: Photon #{selectedPhoton.index} ({selectedPhoton.stateLabel})
          </span>
        </div>

        {/* Scrollable Photon Stream Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-2.5">Photon</th>
                <th className="py-2 px-2.5">Alice Bit</th>
                <th className="py-2 px-2.5">Alice Basis</th>
                <th className="py-2 px-2.5">Prepared State</th>
                <th className="py-2 px-2.5">Eve Intercept?</th>
                <th className="py-2 px-2.5">Bob Basis</th>
                <th className="py-2 px-2.5">Bob Measured</th>
                <th className="py-2 px-2.5">Bases Match?</th>
                <th className="py-2 px-2.5">Sifted Bit</th>
                <th className="py-2 px-2.5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {qkdResult.photons.map((p, idx) => {
                const isSelected = selectedPhotonIdx === idx;
                return (
                  <tr
                    key={p.index}
                    onClick={() => setSelectedPhotonIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-2.5 font-bold">#{p.index}</td>
                    <td className="py-2 px-2.5 text-cyan-400 font-bold">{p.aliceBit}</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.aliceBasis === 'Z' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {p.aliceBasis === 'Z' ? '+ (Rect)' : '× (Diag)'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-200">{p.stateLabel}</td>
                    <td className="py-2 px-2.5">
                      {p.isIntercepted ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                          ⚡ Intercepted ({p.eveBasis})
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Clean</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.bobBasis === 'Z' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {p.bobBasis === 'Z' ? '+ (Rect)' : '× (Diag)'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-bold">{p.bobMeasuredBit}</td>
                    <td className="py-2 px-2.5">
                      {p.basesMatch ? (
                        <span className="text-emerald-400 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-500">NO (Discard)</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 font-bold">
                      {p.basesMatch ? p.aliceBit : '-'}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      {p.basesMatch ? (
                        p.isError ? (
                          <span className="text-rose-400 font-bold">ERROR ✕</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">MATCH ✓</span>
                        )
                      ) : (
                        <span className="text-slate-500 text-[10px]">Discarded</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. One-Time Pad Quantum Encryption Demo */}
      <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Quantum One-Time Pad (OTP) Cipher Demonstration
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Symmetric Bitwise Stream Cipher
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Station 1: Alice's Plaintext */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold">
              <span>Alice's Plaintext:</span>
              <Key className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              className="w-full bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 rounded p-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Type message to encrypt..."
            />
            <div className="text-[10px] text-slate-500 font-mono">
              Key Stream: {qkdResult.rawKeyString.slice(0, 16)}...
            </div>
          </div>

          {/* Station 2: Quantum Ciphertext (In Transit) */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 font-semibold">
              <span>Ciphertext (Hex):</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="p-1.5 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 rounded font-mono text-xs text-purple-300 break-all select-all min-h-[34px] flex items-center">
              {qkdResult.encryption.ciphertextHex || 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {qkdResult.eveRate > 0 ? 'Eve intercepts garbled noise' : 'Zero information leaked'}
            </div>
          </div>

          {/* Station 3: Bob's Decryption Terminal */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
              <span>Bob's Decrypted Output:</span>
              <Unlock className="w-3.5 h-3.5" />
            </div>
            <div className={`p-1.5 bg-white dark:bg-[#0c1017] border rounded font-mono text-xs break-all min-h-[34px] flex items-center ${
              qkdResult.encryption.success
                ? 'border-emerald-500/40 text-emerald-300'
                : 'border-rose-500/40 text-rose-300 font-bold'
            }`}>
              {qkdResult.encryption.decryptedText}
            </div>
            <div className="text-[10px] font-mono">
              {qkdResult.encryption.success ? (
                <span className="text-emerald-400">✓ Decryption Authenticated</span>
              ) : (
                <span className="text-rose-400">✕ Key Compromised / Aborted</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 7. Collapsible Quantum Cyber-Security Explainer */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-xs text-slate-400 space-y-2">
        <button
          onClick={() => setShowScienceExplainer(!showScienceExplainer)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200 cursor-pointer hover:text-cyan-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            The Science: Why Eavesdropping is Physically Impossible Without Detection
          </span>
          {showScienceExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showScienceExplainer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed pt-2 border-t border-slate-800/60">
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-300 text-[11px]">1. No-Cloning Theorem (Wootters &amp; Zurek, 1982)</h5>
              <p className="text-[11px]">
                In classical networks, a wiretapper can passively duplicate data bits without disturbance. In quantum mechanics, 
                an unknown quantum state $|\psi\rangle$ cannot be cloned. Eve MUST perform a physical measurement to read the photon, 
                which irrevocably collapses the wave function.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-300 text-[11px]">2. Shor-Preskill Security Bound (QBER 11%)</h5>
              <p className="text-[11px]">
                When Eve measures in the wrong basis (50% probability), she introduces a 25% error rate into Bob's sifted measurements. 
                If <span className="text-rose-400 font-mono">QBER &gt; 11.0%</span>, Eve's mutual information $I(A:E)$ exceeds the threshold 
                where Privacy Amplification can produce a secure key. The protocol automatically aborts!
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

