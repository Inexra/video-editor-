import React, { useState } from 'react';
import {
  Sliders,
  Move,
  Volume2,
  Sparkles,
  Type,
  Maximize,
  Clock,
  Gauge,
  RotateCw,
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
  Key,
  Flame,
} from 'lucide-react';
import { Clip, Transform, Effects, TextProperties, CaptionProperties } from '../types/editor';
import { FONT_OPTIONS } from '../constants/presets';

interface PropertiesPanelProps {
  selectedClip: Clip | null;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (clipId: string) => void;
  playheadPosition: number;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedClip,
  onUpdateClip,
  onDeleteClip,
  playheadPosition,
}) => {
  // Collapsible section states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    transform: true,
    video: true,
    effects: false,
    text: true,
    audio: true,
    caption: true,
    keyframes: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!selectedClip) {
    return (
      <div className="w-72 bg-neutral-900 border-l border-neutral-800 p-4 flex flex-col items-center justify-center text-center select-none text-neutral-500 text-xs">
        <Sliders className="w-8 h-8 mb-2 opacity-30 text-neutral-400" />
        <p className="font-medium text-neutral-400">No Clip Selected</p>
        <p className="text-[11px] text-neutral-600 mt-1 max-w-[180px]">
          Click any video, text, audio, or caption clip on the timeline to edit its properties.
        </p>
      </div>
    );
  }

  // Update nested transform
  const updateTransform = (partial: Partial<Transform>) => {
    onUpdateClip(selectedClip.id, {
      transform: { ...selectedClip.transform, ...partial },
    });
  };

  // Update nested effects
  const updateEffects = (partial: Partial<Effects>) => {
    onUpdateClip(selectedClip.id, {
      effects: { ...selectedClip.effects, ...partial },
    });
  };

  // Update nested text properties
  const updateTextProps = (partial: Partial<TextProperties>) => {
    if (!selectedClip.textProps) return;
    onUpdateClip(selectedClip.id, {
      textProps: { ...selectedClip.textProps, ...partial },
    });
  };

  // Update nested caption properties
  const updateCaptionProps = (partial: Partial<CaptionProperties>) => {
    if (!selectedClip.captionProps) return;
    onUpdateClip(selectedClip.id, {
      captionProps: { ...selectedClip.captionProps, ...partial },
    });
  };

  // Add keyframe at current playhead
  const handleAddKeyframe = () => {
    const relTime = Math.max(0, playheadPosition - selectedClip.startTime);
    const newKfs = [
      ...selectedClip.keyframes.filter((k) => Math.abs(k.time - relTime) > 0.1),
      {
        time: relTime,
        transform: { ...selectedClip.transform },
        opacity: selectedClip.opacity,
        volume: selectedClip.volume,
      },
    ].sort((a, b) => a.time - b.time);

    onUpdateClip(selectedClip.id, { keyframes: newKfs });
  };

  return (
    <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full select-none text-xs overflow-y-auto">
      {/* Clip Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/60 shrink-0">
        <div className="overflow-hidden">
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
            {selectedClip.type} Clip
          </span>
          <p className="font-semibold text-neutral-200 truncate max-w-[170px]" title={selectedClip.name}>
            {selectedClip.name}
          </p>
        </div>
        <button
          onClick={() => onDeleteClip(selectedClip.id)}
          className="p-1.5 rounded hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-colors"
          title="Delete Clip (Del)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* TEXT PROPERTIES (If Text Clip) */}
        {selectedClip.type === 'text' && selectedClip.textProps && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('text')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-pink-400" />
                <span>Text Content & Style</span>
              </div>
              {openSections.text ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.text && (
              <div className="p-2.5 flex flex-col gap-2.5">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Text String</label>
                  <textarea
                    rows={2}
                    value={selectedClip.textProps.text}
                    onChange={(e) => updateTextProps({ text: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-neutral-100 text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Font Family</label>
                    <select
                      value={selectedClip.textProps.fontFamily}
                      onChange={(e) => updateTextProps({ fontFamily: e.target.value })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-neutral-200 text-[11px]"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Font Size ({selectedClip.textProps.fontSize}px)</label>
                    <input
                      type="range"
                      min={12}
                      max={96}
                      value={selectedClip.textProps.fontSize}
                      onChange={(e) => updateTextProps({ fontSize: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedClip.textProps.color}
                        onChange={(e) => updateTextProps({ color: e.target.value })}
                        className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-neutral-300">{selectedClip.textProps.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Outline</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedClip.textProps.outlineColor || '#000000'}
                        onChange={(e) => updateTextProps({ outlineColor: e.target.value })}
                        className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={selectedClip.textProps.outlineWidth}
                        onChange={(e) => updateTextProps({ outlineWidth: Number(e.target.value) })}
                        className="w-10 bg-neutral-800 border border-neutral-700 rounded px-1 py-0.5 text-center text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Text Animation</label>
                  <select
                    value={selectedClip.textProps.animation}
                    onChange={(e) => updateTextProps({ animation: e.target.value as any })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-neutral-200 text-[11px]"
                  >
                    <option value="none">None (Static)</option>
                    <option value="fade-in">Fade In</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="pop">Pop Impact</option>
                    <option value="typewriter">Typewriter</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAPTION PROPERTIES (If Caption Clip) */}
        {selectedClip.type === 'caption' && selectedClip.captionProps && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('caption')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Caption Style</span>
              </div>
              {openSections.caption ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.caption && (
              <div className="p-2.5 flex flex-col gap-2.5">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Subtitle Text</label>
                  <textarea
                    rows={2}
                    value={selectedClip.captionProps.text}
                    onChange={(e) => updateCaptionProps({ text: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-neutral-100 text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Style Format</label>
                    <select
                      value={selectedClip.captionProps.style}
                      onChange={(e) => updateCaptionProps({ style: e.target.value as any })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-neutral-200 text-[11px]"
                    >
                      <option value="social">Social Punch</option>
                      <option value="highlight">Karaoke Highlight</option>
                      <option value="bold">Bold</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Active Word Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedClip.captionProps.highlightColor || '#facc15'}
                        onChange={(e) => updateCaptionProps({ highlightColor: e.target.value })}
                        className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-neutral-300">
                        {selectedClip.captionProps.highlightColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSFORM SECTION (Video, Image, Text, Caption) */}
        {selectedClip.type !== 'audio' && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('transform')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transform & Position</span>
              </div>
              {openSections.transform ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.transform && (
              <div className="p-2.5 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Position X ({selectedClip.transform.x}px)</label>
                    <input
                      type="range"
                      min={-400}
                      max={400}
                      value={selectedClip.transform.x}
                      onChange={(e) => updateTransform({ x: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Position Y ({selectedClip.transform.y}px)</label>
                    <input
                      type="range"
                      min={-400}
                      max={400}
                      value={selectedClip.transform.y}
                      onChange={(e) => updateTransform({ y: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Scale ({selectedClip.transform.scale.toFixed(2)}x)</label>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.05}
                      value={selectedClip.transform.scale}
                      onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Rotation ({selectedClip.transform.rotation}°)</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedClip.transform.rotation}
                      onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Opacity ({Math.round(selectedClip.opacity * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedClip.opacity}
                    onChange={(e) => onUpdateClip(selectedClip.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPEED & PLAYBACK */}
        {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('video')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Speed & Timing</span>
              </div>
              {openSections.video ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.video && (
              <div className="p-2.5 flex flex-col gap-2.5">
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Playback Speed</span>
                    <span className="font-mono text-cyan-400">{selectedClip.speed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {[0.5, 1.0, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => onUpdateClip(selectedClip.id, { speed: s })}
                        className={`py-1 rounded border text-center ${
                          selectedClip.speed === s
                            ? 'bg-neutral-800 border-cyan-500 text-white'
                            : 'bg-neutral-850 border-neutral-750 text-neutral-400'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>Duration: <strong className="font-mono text-neutral-200">{selectedClip.duration.toFixed(1)}s</strong></span>
                  <span>Offset: <strong className="font-mono text-neutral-200">{selectedClip.sourceOffset.toFixed(1)}s</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIO SECTION */}
        {(selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('audio')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Volume</span>
              </div>
              {openSections.audio ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.audio && (
              <div className="p-2.5 flex flex-col gap-2.5">
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Volume</span>
                    <span className="font-mono text-emerald-400">{Math.round(selectedClip.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.05}
                    value={selectedClip.volume}
                    onChange={(e) => onUpdateClip(selectedClip.id, { volume: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-300">Mute Audio</span>
                  <input
                    type="checkbox"
                    checked={selectedClip.muted}
                    onChange={(e) => onUpdateClip(selectedClip.id, { muted: e.target.checked })}
                    className="accent-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* EFFECTS & COLOR ADJUSTMENT */}
        {selectedClip.type === 'video' && (
          <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
            <button
              onClick={() => toggleSection('effects')}
              className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Color & Filter Adjustments</span>
              </div>
              {openSections.effects ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.effects && (
              <div className="p-2.5 flex flex-col gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Brightness</span>
                    <span className="font-mono">{selectedClip.effects.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={selectedClip.effects.brightness}
                    onChange={(e) => updateEffects({ brightness: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Contrast</span>
                    <span className="font-mono">{selectedClip.effects.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={selectedClip.effects.contrast}
                    onChange={(e) => updateEffects({ contrast: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Saturation</span>
                    <span className="font-mono">{selectedClip.effects.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={selectedClip.effects.saturation}
                    onChange={(e) => updateEffects({ saturation: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Vignette</span>
                    <span className="font-mono">{selectedClip.effects.vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedClip.effects.vignette}
                    onChange={(e) => updateEffects({ vignette: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* KEYFRAME CONTROLS */}
        <div className="border border-neutral-800 rounded-lg bg-neutral-850/40 overflow-hidden">
          <button
            onClick={() => toggleSection('keyframes')}
            className="w-full px-2.5 py-2 flex items-center justify-between bg-neutral-800/60 font-medium text-neutral-200 text-left"
          >
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keyframes ({selectedClip.keyframes.length})</span>
            </div>
            {openSections.keyframes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSections.keyframes && (
            <div className="p-2.5 flex flex-col gap-2">
              <p className="text-[10px] text-neutral-400">
                Animate Position, Scale, or Opacity between playhead marks.
              </p>
              <button
                onClick={handleAddKeyframe}
                className="py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Key className="w-3 h-3 text-cyan-400" />
                <span>Add Keyframe at Playhead</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
