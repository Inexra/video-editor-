import React from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  RotateCcw,
  RotateCw,
  Magnet,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TimelineToolbarProps {
  onSplit: () => void;
  onDelete: () => void;
  onRippleDelete: () => void;
  onDuplicate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelectedClip: boolean;
  isSnapping: boolean;
  onToggleSnapping: () => void;
  zoom: number; // px per second
  onChangeZoom: (zoom: number) => void;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  onSplit,
  onDelete,
  onRippleDelete,
  onDuplicate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelectedClip,
  isSnapping,
  onToggleSnapping,
  zoom,
  onChangeZoom,
}) => {
  return (
    <div className="h-9 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between select-none text-xs">
      {/* Left: Editing Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSplit}
          className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
          title="Split Clip at Playhead (S)"
        >
          <Scissors className="w-3.5 h-3.5 text-cyan-400" />
          <span>Split</span>
        </button>

        <button
          disabled={!hasSelectedClip}
          onClick={onDelete}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            hasSelectedClip
              ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Delete Selected Clip (Del)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          disabled={!hasSelectedClip}
          onClick={onRippleDelete}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            hasSelectedClip
              ? 'hover:bg-neutral-800 text-neutral-300 hover:text-amber-400'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Ripple Delete: Deletes clip and closes gap (Shift+Del)"
        >
          <span>Ripple Delete</span>
        </button>

        <button
          disabled={!hasSelectedClip}
          onClick={onDuplicate}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            hasSelectedClip
              ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Duplicate Clip (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        <button
          disabled={!canUndo}
          onClick={onUndo}
          className={`p-1.5 rounded transition-colors ${
            canUndo ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          disabled={!canRedo}
          onClick={onRedo}
          className={`p-1.5 rounded transition-colors ${
            canRedo ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Snapping & Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSnapping}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
            isSnapping ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60' : 'text-neutral-400 hover:bg-neutral-800'
          }`}
          title="Magnet Snapping (N)"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="text-[10px]">Snap</span>
        </button>

        <div className="flex items-center gap-1.5 text-neutral-400 pl-2 border-l border-neutral-800">
          <ZoomOut
            className="w-3.5 h-3.5 cursor-pointer hover:text-white"
            onClick={() => onChangeZoom(Math.max(15, zoom - 10))}
          />
          <input
            type="range"
            min={15}
            max={120}
            value={zoom}
            onChange={(e) => onChangeZoom(Number(e.target.value))}
            className="w-20 accent-cyan-500 cursor-pointer"
            title="Timeline Zoom Level"
          />
          <ZoomIn
            className="w-3.5 h-3.5 cursor-pointer hover:text-white"
            onClick={() => onChangeZoom(Math.min(120, zoom + 10))}
          />
        </div>
      </div>
    </div>
  );
};
