import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { RotateCw, X } from 'lucide-react';

export default function ParamPopover() {
  const { activeParamGate, updateGateParam, popoverVisible, setPopoverVisible } = useQuantum();

  if (!popoverVisible || !activeParamGate) return null;

  const currentVal = activeParamGate.param ?? 0.785;

  const presets = [
    { label: 'π/4', val: 0.785 },
    { label: 'π/2', val: 1.571 },
    { label: 'π', val: 3.142 },
    { label: '2π', val: 6.283 },
  ];

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    updateGateParam(activeParamGate.qubit, activeParamGate.step, val);
  };

  const handlePreset = (val) => {
    updateGateParam(activeParamGate.qubit, activeParamGate.step, val);
  };

  return (
    <div className="absolute -top-[146px] left-[320px] w-72 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-3.5 flex flex-col gap-2.5 z-40 transition-all origin-bottom">
      <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
        <span className="font-mono text-xs uppercase text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5" /> Parameter θ ({activeParamGate.gate})
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            {currentVal.toFixed(3)} rad
          </span>
          <button
            onClick={() => setPopoverVisible(false)}
            className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min="0"
        max="6.283"
        step="0.05"
        value={currentVal}
        onChange={handleSliderChange}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none"
      />

      {/* Radian Presets */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        {presets.map((preset) => {
          const isActive = Math.abs(preset.val - currentVal) < 0.08;
          return (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.val)}
              className={`flex-1 py-1 rounded text-xs font-mono transition-all border ${
                isActive
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 border-violet-400 dark:border-violet-600 font-bold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

