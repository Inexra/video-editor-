import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import { Effects } from '../../types/editor';

interface EffectsPanelProps {
  onApplyEffectPreset: (preset: Partial<Effects>) => void;
  selectedClipId: string | null;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  onApplyEffectPreset,
  selectedClipId,
}) => {
  const effectPresets = [
    {
      name: 'Normal / Clean',
      desc: 'Reset all filters',
      settings: { brightness: 0, contrast: 0, saturation: 0, hue: 0, exposure: 0, blur: 0, vignette: 0, grayscale: 0 },
    },
    {
      name: 'Cinematic Teal & Orange',
      desc: 'High contrast with warm midtones',
      settings: { brightness: 5, contrast: 20, saturation: 25, hue: -10, exposure: 5, blur: 0, vignette: 20, grayscale: 0 },
    },
    {
      name: 'Crisp & Punchy',
      desc: 'Sharper contrast and vivid tones',
      settings: { brightness: 0, contrast: 30, saturation: 20, hue: 0, exposure: 0, blur: 0, vignette: 0, grayscale: 0 },
    },
    {
      name: 'Warm Vintage',
      desc: 'Golden hour nostalgic wash',
      settings: { brightness: 5, contrast: 10, saturation: -10, hue: 15, exposure: 5, blur: 0, vignette: 25, grayscale: 0 },
    },
    {
      name: 'Monochrome Noir',
      desc: 'Classic black and white',
      settings: { brightness: 0, contrast: 25, saturation: -100, hue: 0, exposure: 0, blur: 0, vignette: 15, grayscale: 100 },
    },
    {
      name: 'Dreamy Soft Focus',
      desc: 'Subtle ambient glow',
      settings: { brightness: 10, contrast: -10, saturation: 10, hue: 0, exposure: 5, blur: 2, vignette: 15, grayscale: 0 },
    },
  ];

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <h2 className="font-semibold text-white uppercase tracking-wider">Visual Effects</h2>
        <span className="text-[10px] text-neutral-400">GPU-free CSS/Canvas filter pipeline</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-neutral-300">
          {selectedClipId ? 'Click preset to apply to selected clip' : 'Select a video clip to apply'}
        </span>
        {effectPresets.map((eff, idx) => (
          <button
            key={idx}
            onClick={() => onApplyEffectPreset(eff.settings)}
            disabled={!selectedClipId}
            className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
              selectedClipId
                ? 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 hover:border-cyan-500/50 cursor-pointer'
                : 'bg-neutral-900/50 border-neutral-850 opacity-50 cursor-not-allowed'
            }`}
          >
            <div>
              <p className="font-medium text-neutral-200">{eff.name}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{eff.desc}</p>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
