import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { Clip, ProjectResolution, PreviewQuality } from '../types/editor';
import { mediaEngine } from '../services/mediaEngine';

interface PreviewPlayerProps {
  clips: Clip[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  projectResolution: ProjectResolution;
  fps: number;
  previewQuality: PreviewQuality;
  onChangePreviewQuality: (q: PreviewQuality) => void;
  isLowEndMode: boolean;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  clips,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onStop,
  onSeek,
  projectResolution,
  fps,
  previewQuality,
  onChangePreviewQuality,
  isLowEndMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render current frame whenever time or clips change
  useEffect(() => {
    if (canvasRef.current) {
      mediaEngine.renderFrame({
        canvas: canvasRef.current,
        clips,
        currentTime,
        projectResolution,
        quality: previewQuality,
        isLowEndMode,
      });
    }
  }, [clips, currentTime, projectResolution, previewQuality, isLowEndMode]);

  // Audio synchronization
  useEffect(() => {
    mediaEngine.syncAudio({
      clips,
      currentTime,
      isPlaying,
    });
  }, [clips, currentTime, isPlaying]);

  // Frame stepping helpers
  const frameDuration = 1 / fps;
  const handlePrevFrame = () => onSeek(Math.max(0, currentTime - frameDuration));
  const handleNextFrame = () => onSeek(Math.min(totalDuration, currentTime + frameDuration));
  const handleJumpStart = () => onSeek(0);
  const handleJumpEnd = () => onSeek(totalDuration);

  // Format timecode: 00:00:00:00 (hh:mm:ss:ff)
  const formatTimecode = (seconds: number) => {
    const s = Math.max(0, seconds);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const f = Math.floor((s % 1) * fps);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Determine aspect ratio styling
  const aspectClass =
    projectResolution.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[85%]'
      : projectResolution.aspectRatio === '1:1'
      ? 'aspect-square max-h-[85%]'
      : 'aspect-[16/9] max-w-[95%] max-h-[85%]';

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-neutral-950 border-r border-neutral-800 select-none overflow-hidden relative"
    >
      {/* Top Preview Status Bar */}
      <div className="h-7 px-3 bg-neutral-900/40 border-b border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-300">
            {projectResolution.width} × {projectResolution.height}
          </span>
          <span className="text-neutral-600">·</span>
          <span>{fps} FPS</span>
          {isLowEndMode && (
            <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[10px]">
              Low-End PC Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quality dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Quality:</span>
            <select
              value={previewQuality}
              onChange={(e) => onChangePreviewQuality(e.target.value as PreviewQuality)}
              className="bg-neutral-800 border border-neutral-700/80 rounded px-1.5 py-0.5 text-neutral-200 text-[10px] focus:outline-hidden"
              title="Preview resolution downscaling (reduces RAM & GPU load)"
            >
              <option value="quarter">1/4 (Low RAM)</option>
              <option value="half">1/2 (Balanced)</option>
              <option value="full">Full (Original)</option>
              <option value="auto">Auto (Adaptive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-3 relative bg-radial from-neutral-900/60 to-neutral-950">
        <div className={`relative shadow-2xl bg-black rounded overflow-hidden flex items-center justify-center ${aspectClass}`}>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="h-11 bg-neutral-900 border-t border-neutral-800 px-4 flex items-center justify-between">
        {/* Left: Timecode Display */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-cyan-400 font-semibold">{formatTimecode(currentTime)}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleJumpStart}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Jump to Start"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrevFrame}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Previous Frame (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-md transition-colors mx-1"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <button
            onClick={onStop}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Stop Playback"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextFrame}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Next Frame (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleJumpEnd}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Jump to End"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
