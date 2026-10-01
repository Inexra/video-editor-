import React, { useRef } from 'react';

interface TimelineRulerProps {
  duration: number;
  zoom: number; // pixels per second
  currentTime: number;
  onSeek: (time: number) => void;
  headerWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  duration,
  zoom,
  currentTime,
  onSeek,
  headerWidth,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);

  const totalWidth = Math.max(1200, duration * zoom);

  // Generate tick markers
  const secondStep = zoom > 50 ? 1 : zoom > 25 ? 2 : 5;
  const tickCount = Math.ceil(duration / secondStep) + 2;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, clickX / zoom));
    onSeek(newTime);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const moveX = moveEvent.clientX - rect.left;
      const scrubTime = Math.max(0, Math.min(duration, moveX / zoom));
      onSeek(scrubTime);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="h-7 bg-neutral-900 border-b border-neutral-800 flex select-none text-[10px] font-mono shrink-0">
      {/* Track header spacer */}
      <div style={{ width: `${headerWidth}px` }} className="border-r border-neutral-800 shrink-0 bg-neutral-900 px-3 flex items-center text-neutral-500 font-sans">
        Tracks
      </div>

      {/* Interactive Ruler Bar */}
      <div
        ref={rulerRef}
        onPointerDown={handlePointerDown}
        style={{ width: `${totalWidth}px` }}
        className="h-full relative cursor-pointer bg-neutral-925 overflow-hidden"
      >
        {/* Second Marks */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const sec = i * secondStep;
          const leftPx = sec * zoom;
          const mins = Math.floor(sec / 60);
          const remSecs = sec % 60;
          const label = `${mins}:${String(remSecs).padStart(2, '0')}`;

          return (
            <div
              key={sec}
              style={{ left: `${leftPx}px` }}
              className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
            >
              <span className="text-neutral-500 pl-1 text-[9px]">{label}</span>
              <div className="w-px h-2 bg-neutral-700" />
            </div>
          );
        })}

        {/* Small sub-second tick marks */}
        {zoom >= 40 &&
          Array.from({ length: Math.ceil(duration) }).map((_, i) => (
            <div
              key={`sub-${i}`}
              style={{ left: `${(i + 0.5) * zoom}px` }}
              className="absolute bottom-0 w-px h-1 bg-neutral-800 pointer-events-none"
            />
          ))}

        {/* Playhead marker indicator on ruler */}
        <div
          style={{ left: `${currentTime * zoom}px` }}
          className="absolute top-0 bottom-0 w-0 z-30 pointer-events-none -translate-x-1/2"
        >
          {/* Triangular head */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mx-auto" />
        </div>
      </div>
    </div>
  );
};
