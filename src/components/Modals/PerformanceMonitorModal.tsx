import React from 'react';
import { X, Cpu, HardDrive, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { SystemPerformanceMetrics, PerformanceMode } from '../../types/editor';

interface PerformanceMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SystemPerformanceMetrics;
  performanceMode: PerformanceMode;
  onEnableLowEndMode: () => void;
  onOptimizeMemory: () => void;
}

export const PerformanceMonitorModal: React.FC<PerformanceMonitorModalProps> = ({
  isOpen,
  onClose,
  metrics,
  performanceMode,
  onEnableLowEndMode,
  onOptimizeMemory,
}) => {
  if (!isOpen) return null;

  const ramPercent = Math.round((metrics.ramUsageMB / metrics.ramLimitMB) * 100);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/80">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-white text-sm">System Resource Monitor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          {/* Target Computer Specs */}
          <div className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-750 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-neutral-400">Target System:</span>
              <strong className="text-neutral-200 ml-1">Windows 10 64-bit (4 GB RAM · HDD)</strong>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-800/60">
              Low-End PC Profile
            </span>
          </div>

          {/* High memory warning banner if active */}
          {metrics.isMemoryWarningActive && (
            <div className="p-3 rounded-lg bg-amber-950/70 border border-amber-600/70 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200 text-xs">High memory usage detected.</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Available free RAM on this 4GB PC is running low. Enable Low-End PC Mode to safeguard system stability.
                </p>
                {performanceMode !== 'low' && (
                  <button
                    onClick={onEnableLowEndMode}
                    className="mt-2 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px]"
                  >
                    Enable Low-End PC Mode Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Metric Meters */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* RAM Meter */}
            <div className="p-3 rounded-lg bg-neutral-850/60 border border-neutral-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> RAM Usage
                </span>
                <span className="font-mono font-semibold text-neutral-200">{metrics.ramUsageMB} MB</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-750 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    ramPercent > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${ramPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 text-right font-mono">
                {ramPercent}% of 4096 MB
              </span>
            </div>

            {/* CPU Meter */}
            <div className="p-3 rounded-lg bg-neutral-850/60 border border-neutral-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" /> CPU Load
                </span>
                <span className="font-mono font-semibold text-neutral-200">{metrics.cpuUsage}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-750 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 text-right">Dual/Quad-Core Cap</span>
            </div>

            {/* HDD Disk I/O */}
            <div className="p-3 rounded-lg bg-neutral-850/60 border border-neutral-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Disk I/O
                </span>
                <span className="font-mono font-semibold text-neutral-200">{metrics.diskIoMBs} MB/s</span>
              </div>
              <span className="text-[10px] text-neutral-500">HDD Safe Chunking: Active</span>
            </div>

            {/* Preview FPS */}
            <div className="p-3 rounded-lg bg-neutral-850/60 border border-neutral-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Preview FPS
                </span>
                <span className="font-mono font-semibold text-emerald-400">{metrics.previewFps} FPS</span>
              </div>
              <span className="text-[10px] text-neutral-500">Zero dropped frames</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onOptimizeMemory}
            className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-cyan-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Flush Inactive Video Buffers & Free Memory</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-neutral-800 bg-neutral-850/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
