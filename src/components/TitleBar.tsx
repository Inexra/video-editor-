import React from 'react';
import { Minus, Square, X, Cpu, HardDrive, Zap, ShieldCheck } from 'lucide-react';
import { PerformanceMode, SystemPerformanceMetrics } from '../types/editor';

interface TitleBarProps {
  projectName: string;
  performanceMode: PerformanceMode;
  isProxyActive: boolean;
  metrics: SystemPerformanceMetrics;
  onOpenSettings: () => void;
  onOpenWindowsExeModal: () => void;
  onOpenPerformanceModal: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  projectName,
  performanceMode,
  isProxyActive,
  metrics,
  onOpenSettings,
  onOpenWindowsExeModal,
  onOpenPerformanceModal,
}) => {
  return (
    <div className="h-9 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-3 select-none text-xs text-neutral-300">
      {/* Left: Window Brand & Project */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-white tracking-wide">
          <div className="w-4 h-4 rounded bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            LV
          </div>
          <span>LightVideo Editor</span>
        </div>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-400 truncate max-w-[200px]">{projectName}</span>
        {isProxyActive && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-[10px] text-emerald-300 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Proxy Active (360p)
          </span>
        )}
      </div>

      {/* Center: System Performance HUD */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPerformanceModal}
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-700/50 text-[11px] text-neutral-300 transition-colors"
          title="Click to view full System Performance Monitor"
        >
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>RAM: <strong className="font-mono text-neutral-200">{metrics.ramUsageMB} MB</strong></span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Mode: <strong className="capitalize text-neutral-200">{performanceMode === 'low' ? 'Low-End PC (4GB)' : performanceMode}</strong></span>
          </div>
          {metrics.isMemoryWarningActive && (
            <span className="px-1 py-0.2 rounded bg-amber-900/60 border border-amber-600 text-amber-300 text-[10px] font-medium">
              High RAM
            </span>
          )}
        </button>

        <button
          onClick={onOpenWindowsExeModal}
          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[11px] text-neutral-200 font-medium transition-colors flex items-center gap-1.5"
          title="Windows 10 standalone .exe builder and installer"
        >
          <HardDrive className="w-3 h-3 text-sky-400" />
          <span>LightVideoEditor.exe</span>
        </button>
      </div>

      {/* Right: Windows 10 Window Control Buttons */}
      <div className="flex items-center -mr-3">
        <button
          className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Minimize"
          onClick={() => {}}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Maximize / Restore"
          onClick={() => {}}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-red-600 transition-colors"
          title="Close"
          onClick={() => {
            if (confirm('Close LightVideo Editor? Any unsaved edits will be kept in autosave.')) {
              window.close();
            }
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
