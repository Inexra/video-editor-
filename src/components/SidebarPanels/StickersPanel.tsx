import React from 'react';
import { Shapes, Plus, ArrowRight, Heart, Star, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Clip } from '../../types/editor';

interface StickersPanelProps {
  onAddStickerClip: (clip: Partial<Clip>) => void;
  playheadPosition: number;
}

export const StickersPanel: React.FC<StickersPanelProps> = ({ onAddStickerClip, playheadPosition }) => {
  const stickers = [
    { name: 'Red Arrow Callout', text: '➔ LOOK HERE', color: '#ef4444', bg: 'rgba(0,0,0,0.7)', anim: 'pop' as const },
    { name: 'Subscribe Badge', text: 'SUBSCRIBE ★', color: '#ffffff', bg: '#dc2626', anim: 'pop' as const },
    { name: 'Like & Share', text: '👍 LIKE & SHARE', color: '#38bdf8', bg: 'rgba(15,23,42,0.85)', anim: 'slide-up' as const },
    { name: 'Warning Alert', text: '⚠️ IMPORTANT TIP', color: '#facc15', bg: '#000000', anim: 'pop' as const },
    { name: 'Verified Checkmark', text: 'VERIFIED ✔', color: '#10b981', bg: 'rgba(0,0,0,0.75)', anim: 'fade-in' as const },
  ];

  const handleAdd = (stk: typeof stickers[0]) => {
    onAddStickerClip({
      name: `Sticker: ${stk.name}`,
      type: 'text',
      trackId: 'v2',
      startTime: playheadPosition,
      duration: 3,
      sourceOffset: 0,
      sourceDuration: 3,
      src: '',
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 70, scale: 1, rotation: 0 },
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
        text: stk.text,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        color: stk.color,
        backgroundColor: stk.bg,
        outlineColor: '#000000',
        outlineWidth: 2,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 6,
        textAlign: 'center',
        animation: stk.anim,
      },
      colorTag: '#f59e0b',
    });
  };

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <h2 className="font-semibold text-white uppercase tracking-wider">Stickers & Callouts</h2>
        <span className="text-[10px] text-neutral-400">Lightweight vector shapes</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-neutral-300">Preset Graphics</span>
        {stickers.map((stk, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-2"
          >
            <div>
              <p className="font-medium text-neutral-200">{stk.name}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: stk.color }}>
                {stk.text}
              </p>
            </div>
            <button
              onClick={() => handleAdd(stk)}
              className="p-1.5 rounded bg-neutral-750 hover:bg-amber-600 hover:text-white text-neutral-300 transition-colors"
              title="Add sticker to timeline"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
