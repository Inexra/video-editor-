import React from 'react';
import { Music, Volume2, Plus, Play, Sparkles } from 'lucide-react';
import { generateSyntheticAudioBlob } from '../../services/sampleMedia';
import { Clip } from '../../types/editor';

interface AudioPanelProps {
  onAddAudioClip: (clip: Partial<Clip>) => void;
  playheadPosition: number;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({ onAddAudioClip, playheadPosition }) => {
  const sfxPresets = [
    { name: 'Ambient Synth Pad', duration: 10, category: 'Music', color: '#10b981' },
    { name: 'Sub Bass Impact', duration: 3, category: 'Transition', color: '#059669' },
    { name: 'Upbeat Acoustic Rhythm', duration: 15, category: 'BGM', color: '#34d399' },
    { name: 'Cinematic Whoosh', duration: 2, category: 'SFX', color: '#6ee7b7' },
  ];

  const handleAddSfx = async (preset: typeof sfxPresets[0]) => {
    const audioData = await generateSyntheticAudioBlob(preset.duration);
    onAddAudioClip({
      name: preset.name,
      type: 'audio',
      trackId: 'a2',
      startTime: playheadPosition,
      duration: preset.duration,
      sourceOffset: 0,
      sourceDuration: preset.duration,
      src: audioData.url,
      volume: 0.8,
      speed: 1,
      muted: false,
      opacity: 1,
      waveform: audioData.waveform,
      colorTag: preset.color,
    });
  };

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <h2 className="font-semibold text-white uppercase tracking-wider">Audio & SFX</h2>
        <span className="text-[10px] text-neutral-400">Subsampled waveforms · Low memory</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-neutral-300">Royalty-Free Audio Elements</span>
        {sfxPresets.map((preset, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-emerald-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-neutral-200">{preset.name}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                  <span>{preset.duration}s</span>
                  <span>·</span>
                  <span>{preset.category}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAddSfx(preset)}
              className="p-1.5 rounded bg-neutral-750 hover:bg-emerald-600 hover:text-white text-neutral-300 transition-colors"
              title="Add to timeline"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
