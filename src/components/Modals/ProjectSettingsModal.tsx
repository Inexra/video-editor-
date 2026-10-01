import React, { useState } from 'react';
import { X, Film, Check } from 'lucide-react';
import { ProjectResolution } from '../../types/editor';
import { RESOLUTION_PRESETS, FRAME_RATE_OPTIONS } from '../../constants/presets';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  currentResolution: ProjectResolution;
  currentFps: number;
  onSave: (name: string, resolution: ProjectResolution, fps: number) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  projectName,
  currentResolution,
  currentFps,
  onSave,
}) => {
  const [name, setName] = useState(projectName);
  const [selectedRes, setSelectedRes] = useState<ProjectResolution>(currentResolution);
  const [fps, setFps] = useState<number>(currentFps);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(name, selectedRes, fps);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/80">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-white text-sm">Project Settings</h2>
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
          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 text-xs focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1.5">
              Project Resolution & Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {RESOLUTION_PRESETS.map((res) => {
                const isSelected = res.width === selectedRes.width && res.height === selectedRes.height;
                return (
                  <button
                    key={`${res.width}x${res.height}`}
                    onClick={() => setSelectedRes(res)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-neutral-800 border-cyan-500 text-white'
                        : 'bg-neutral-850 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-[11px]">{res.label}</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {res.width} × {res.height} ({res.aspectRatio})
                      </p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Timeline Frame Rate
            </label>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
            >
              {FRAME_RATE_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f} FPS {f === 30 ? '(Recommended for 4GB PC)' : f === 60 ? '(High Framerate)' : ''}
                </option>
              ))}
            </select>
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
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-xs transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
