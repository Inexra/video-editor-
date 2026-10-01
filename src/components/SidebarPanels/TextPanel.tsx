import React from 'react';
import { Type, Plus } from 'lucide-react';
import { Clip } from '../../types/editor';

interface TextPanelProps {
  onAddTextClip: (clip: Partial<Clip>) => void;
  playheadPosition: number;
}

export const TextPanel: React.FC<TextPanelProps> = ({ onAddTextClip, playheadPosition }) => {
  const textTemplates = [
    {
      title: 'Main Title',
      text: 'CINEMATIC TITLE',
      font: 'Plus Jakarta Sans',
      size: 42,
      color: '#ffffff',
      bg: 'rgba(0, 0, 0, 0.4)',
      outline: '#0284c7',
      outlineW: 2,
      shadow: 8,
      anim: 'pop' as const,
    },
    {
      title: 'Modern Lower Third',
      text: 'ALEX RIVERS · DIRECTOR',
      font: 'Plus Jakarta Sans',
      size: 24,
      color: '#f8fafc',
      bg: 'rgba(15, 23, 42, 0.85)',
      outline: '',
      outlineW: 0,
      shadow: 4,
      anim: 'slide-up' as const,
    },
    {
      title: 'Impact Headline',
      text: 'WATCH THIS NOW!',
      font: 'Impact',
      size: 48,
      color: '#facc15',
      bg: '#000000',
      outline: '#000000',
      outlineW: 3,
      shadow: 12,
      anim: 'pop' as const,
    },
    {
      title: 'Minimalist Clean',
      text: 'Episode 01 - The Beginning',
      font: 'Georgia',
      size: 28,
      color: '#ffffff',
      bg: 'transparent',
      outline: '',
      outlineW: 0,
      shadow: 4,
      anim: 'fade-in' as const,
    },
    {
      title: 'Social Punch',
      text: '#Trending #Video',
      font: 'Plus Jakarta Sans',
      size: 32,
      color: '#38bdf8',
      bg: 'rgba(0,0,0,0.7)',
      outline: '#000000',
      outlineW: 2,
      shadow: 6,
      anim: 'typewriter' as const,
    },
  ];

  const handleAddTemplate = (tpl: typeof textTemplates[0]) => {
    onAddTextClip({
      name: `Text: ${tpl.title}`,
      type: 'text',
      trackId: 'v2',
      startTime: playheadPosition,
      duration: 4,
      sourceOffset: 0,
      sourceDuration: 4,
      src: '',
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: tpl.title === 'Modern Lower Third' ? 120 : 0, scale: 1, rotation: 0 },
      crop: { x: 0, y: 0, width: 1, height: 1 },
      effects: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        exposure: 0,
        temperature: 0,
        blur: 0,
        vignette: 0,
        grayscale: 0,
      },
      textProps: {
        text: tpl.text,
        fontFamily: tpl.font,
        fontSize: tpl.size,
        color: tpl.color,
        backgroundColor: tpl.bg,
        outlineColor: tpl.outline,
        outlineWidth: tpl.outlineW,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowBlur: tpl.shadow,
        textAlign: 'center',
        animation: tpl.anim,
      },
      colorTag: '#ec4899',
    });
  };

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <h2 className="font-semibold text-white uppercase tracking-wider">Titles & Text</h2>
        <span className="text-[10px] text-neutral-400">Canvas rendered · Zero webview lag</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-neutral-300">Text Presets</span>
        {textTemplates.map((tpl, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-2"
          >
            <div>
              <p className="font-medium text-neutral-200">{tpl.title}</p>
              <p className="text-[11px] text-neutral-400 truncate max-w-[150px] mt-0.5" style={{ fontFamily: tpl.font }}>
                "{tpl.text}"
              </p>
            </div>
            <button
              onClick={() => handleAddTemplate(tpl)}
              className="p-1.5 rounded bg-neutral-750 hover:bg-pink-600 hover:text-white text-neutral-300 transition-colors"
              title="Add text to timeline"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
