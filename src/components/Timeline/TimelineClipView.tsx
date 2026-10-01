import React, { useRef } from 'react';
import { Clip } from '../../types/editor';
import { Film, Music, Type, Flame } from 'lucide-react';

interface TimelineClipViewProps {
  clip: Clip;
  zoom: number; // px per second
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onTrimLeft: (clipId: string, deltaSeconds: number) => void;
  onTrimRight: (clipId: string, deltaSeconds: number) => void;
  onMoveClip: (clipId: string, newStartTime: number) => void;
}

export const TimelineClipView: React.FC<TimelineClipViewProps> = ({
  clip,
  zoom,
  isSelected,
  onSelect,
  onTrimLeft,
  onTrimRight,
  onMoveClip,
}) => {
  const leftPx = clip.startTime * zoom;
  const widthPx = Math.max(16, clip.duration * zoom);

  // Dragging logic for clip repositioning
  const handleDragStart = (e: React.PointerEvent) => {
    // Prevent dragging when clicking trim handles
    if ((e.target as HTMLElement).dataset.handle) return;

    e.preventDefault();
    const startX = e.clientX;
    const initialStartTime = clip.startTime;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaSec = deltaX / zoom;
      const newStart = Math.max(0, initialStartTime + deltaSec);
      onMoveClip(clip.id, newStart);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Left trim handle drag
  const handleTrimLeftPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaSec = (moveEv.clientX - startX) / zoom;
      onTrimLeft(clip.id, deltaSec);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Right trim handle drag
  const handleTrimRightPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaSec = (moveEv.clientX - startX) / zoom;
      onTrimRight(clip.id, deltaSec);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Default colors per clip type
  const defaultBg =
    clip.type === 'video'
      ? 'bg-sky-900/80 border-sky-600'
      : clip.type === 'audio'
      ? 'bg-emerald-950/90 border-emerald-600'
      : clip.type === 'text'
      ? 'bg-purple-950/90 border-purple-600'
      : 'bg-amber-950/90 border-amber-600';

  return (
    <div
      onClick={onSelect}
      onPointerDown={handleDragStart}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      className={`absolute top-1 bottom-1 rounded border select-none cursor-move flex items-center overflow-hidden z-10 transition-shadow ${defaultBg} ${
        isSelected
          ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-md z-20'
          : 'hover:brightness-110'
      }`}
    >
      {/* Left Trim Handle */}
      <div
        data-handle="left"
        onPointerDown={handleTrimLeftPointerDown}
        className="absolute left-0 top-0 bottom-0 w-2.5 bg-neutral-900/60 hover:bg-cyan-500/80 cursor-ew-resize z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100"
        title="Trim Start"
      >
        <div className="w-0.5 h-3 bg-white/70 rounded-full" />
      </div>

      {/* Clip Content Body */}
      <div className="flex-1 h-full px-2 flex items-center justify-between text-xs overflow-hidden pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {clip.type === 'video' ? (
            <Film className="w-3 h-3 text-cyan-300 shrink-0" />
          ) : clip.type === 'audio' ? (
            <Music className="w-3 h-3 text-emerald-300 shrink-0" />
          ) : clip.type === 'caption' ? (
            <Flame className="w-3 h-3 text-amber-300 shrink-0" />
          ) : (
            <Type className="w-3 h-3 text-purple-300 shrink-0" />
          )}
          <span className="text-[11px] font-medium text-neutral-100 truncate">
            {clip.name}
          </span>
        </div>

        <span className="text-[9px] font-mono text-neutral-300 shrink-0 ml-1">
          {clip.duration.toFixed(1)}s
        </span>
      </div>

      {/* Lightweight Audio Waveform Visualizer (SVG) */}
      {clip.type === 'audio' && clip.waveform && (
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-40 px-3">
          {clip.waveform.slice(0, Math.floor(widthPx / 6)).map((val, idx) => (
            <div
              key={idx}
              style={{ height: `${Math.max(15, val * 85)}%` }}
              className="w-1 bg-emerald-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Right Trim Handle */}
      <div
        data-handle="right"
        onPointerDown={handleTrimRightPointerDown}
        className="absolute right-0 top-0 bottom-0 w-2.5 bg-neutral-900/60 hover:bg-cyan-500/80 cursor-ew-resize z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100"
        title="Trim End"
      >
        <div className="w-0.5 h-3 bg-white/70 rounded-full" />
      </div>
    </div>
  );
};
