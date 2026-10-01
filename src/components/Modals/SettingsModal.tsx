import React, { useState } from 'react';
import {
  Settings,
  X,
  Cpu,
  HardDrive,
  Film,
  Bot,
  Folder,
  Trash2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { AppSettings, PerformanceMode } from '../../types/editor';
import { ProjectManager } from '../../services/projectManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'performance' | 'export' | 'ai' | 'storage'>('performance');
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleClearCache = () => {
    ProjectManager.clearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs h-[520px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/80">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-white text-sm">LightVideo Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout: Left Tab List + Right Form Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs */}
          <div className="w-44 bg-neutral-925 border-r border-neutral-800 p-2 flex flex-col gap-1">
            {[
              { id: 'performance', label: 'Performance & RAM', icon: Zap },
              { id: 'general', label: 'General', icon: Settings },
              { id: 'export', label: 'Default Export', icon: Film },
              { id: 'ai', label: 'AI Models', icon: Bot },
              { id: 'storage', label: 'Storage & Cache', icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-3 py-2 rounded-lg text-left font-medium flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-neutral-800 text-cyan-400'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Pane */}
          <div className="flex-1 p-5 overflow-y-auto bg-neutral-900">
            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Performance Mode</h3>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Configures memory allocation, proxy behavior, and render thread caps.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'low',
                        name: 'Low-End PC',
                        specs: '4 GB RAM target',
                        desc: 'Auto proxy, 1/4 preview, minimal waveforms, throttled background tasks.',
                      },
                      {
                        id: 'balanced',
                        name: 'Balanced',
                        specs: '8 GB RAM target',
                        desc: '1/2 preview, standard proxy generation, standard waveform cache.',
                      },
                      {
                        id: 'quality',
                        name: 'Quality',
                        specs: '16+ GB RAM target',
                        desc: 'Full preview resolution, high-precision filters, real-time effects.',
                      },
                    ].map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => setFormData({ ...formData, performanceMode: mode.id as PerformanceMode })}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.performanceMode === mode.id
                            ? 'bg-neutral-800 border-cyan-500 text-white'
                            : 'bg-neutral-850 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <strong className="text-xs text-neutral-100 block">{mode.name}</strong>
                        <span className="text-[10px] text-cyan-400 font-mono block mb-1">{mode.specs}</span>
                        <p className="text-[10px] text-neutral-400 leading-relaxed">{mode.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-200">Automatically enable Low-End PC Mode</p>
                      <p className="text-[10px] text-neutral-400">Activates throttled memory mode on 4GB systems</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.autoEnableLowEndMode}
                      onChange={(e) => setFormData({ ...formData, autoEnableLowEndMode: e.target.checked })}
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-200">Always generate proxy for 1080p+ footage</p>
                      <p className="text-[10px] text-neutral-400">Generates lightweight 360p copy for zero timeline lag</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableProxyByDefault}
                      onChange={(e) => setFormData({ ...formData, enableProxyByDefault: e.target.checked })}
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">General Preferences</h3>
                  <p className="text-[11px] text-neutral-400 mb-3">Autosave and workspace defaults.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Theme
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, theme: 'dark' })}
                        className={`px-3 py-1.5 rounded border ${
                          formData.theme === 'dark' ? 'bg-neutral-800 border-cyan-500 text-white' : 'border-neutral-750 text-neutral-400'
                        }`}
                      >
                        Dark Theme (Default)
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, theme: 'light' })}
                        className={`px-3 py-1.5 rounded border ${
                          formData.theme === 'light' ? 'bg-neutral-800 border-cyan-500 text-white' : 'border-neutral-750 text-neutral-400'
                        }`}
                      >
                        Light Theme
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Autosave Frequency ({formData.autosaveIntervalSec} seconds)
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={300}
                      step={30}
                      value={formData.autosaveIntervalSec}
                      onChange={(e) => setFormData({ ...formData, autosaveIntervalSec: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                    <span className="text-[10px] text-neutral-500">
                      Saves state locally to protect against Windows crash or power loss.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Export Defaults</h3>
                  <p className="text-[11px] text-neutral-400 mb-3">Pre-selected container and frame rate options.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Default Format
                    </label>
                    <select
                      value={formData.defaultExportFormat}
                      onChange={(e) => setFormData({ ...formData, defaultExportFormat: e.target.value as any })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                    >
                      <option value="mp4">MP4 (.mp4)</option>
                      <option value="webm">WebM (.webm)</option>
                      <option value="mov">QuickTime MOV (.mov)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Default Framerate
                    </label>
                    <select
                      value={formData.defaultExportFps}
                      onChange={(e) => setFormData({ ...formData, defaultExportFps: Number(e.target.value) })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                    >
                      <option value={24}>24 FPS (Cinematic)</option>
                      <option value={30}>30 FPS (Standard)</option>
                      <option value={60}>60 FPS (Smooth)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* AI TAB */}
            {activeTab === 'ai' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">AI Speech & Clipper Engine</h3>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Configures local speech detection and transcription models.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-200">Enforce Offline-Only Processing</p>
                      <p className="text-[10px] text-neutral-400">Zero cloud calls; 100% private local processing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.aiLocalOnly}
                      onChange={(e) => setFormData({ ...formData, aiLocalOnly: e.target.checked })}
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Default Caption Model
                    </label>
                    <select
                      value={formData.aiCaptionModel}
                      onChange={(e) => setFormData({ ...formData, aiCaptionModel: e.target.value as any })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                    >
                      <option value="fast">Fast (Lowest RAM ~150MB, recommended for 4GB PC)</option>
                      <option value="balanced">Balanced (Standard cadence analysis)</option>
                      <option value="accurate">Accurate (Deep speech acoustic modeling)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STORAGE & CACHE TAB */}
            {activeTab === 'storage' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">HDD Cache Management</h3>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Ensures video cache never fills up the computer hard drive.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Cache Size Limit
                    </label>
                    <select
                      value={formData.maxCacheSizeMB}
                      onChange={(e) => setFormData({ ...formData, maxCacheSizeMB: Number(e.target.value) })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                    >
                      <option value={1024}>1 GB (Recommended for small HDDs)</option>
                      <option value={2048}>2 GB (Standard)</option>
                      <option value={5120}>5 GB (Large)</option>
                      <option value={10240}>10 GB (Unlimited)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Windows Cache Directory
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.cacheLocation}
                      className="w-full bg-neutral-800 border border-neutral-750 rounded px-2 py-1 text-neutral-400 font-mono text-[10px]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleClearCache}
                      className="py-1.5 px-3 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{cacheCleared ? 'Cache Cleaned!' : 'Clear Cache Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-850/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-xs transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
