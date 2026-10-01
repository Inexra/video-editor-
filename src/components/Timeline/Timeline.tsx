import React, { useRef } from 'react';
import { Track, Clip } from '../../types/editor';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TimelineClipView } from './TimelineClipView';
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Film,
  Music,
  Type,
  Flame,
} from 'lucide-react';

interface TimelineProps {
  tracks: Track[];
  clips: Clip[];
  duration: number;
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onSeek: (time: number) => void;
  onSplitClip: () => void;
  onDeleteClip: () => void;
  onRippleDelete: () => void;
  onDuplicateClip: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onChangeZoom: (z: number) => void;
  isSnapping: boolean;
  onToggleSnapping: () => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onTrimClipLeft: (clipId: string, deltaSec: number) => void;
  onTrimClipRight: (clipId: string, deltaSec: number) => void;
  onMoveClip: (clipId: string, newStart: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  duration,
  currentTime,
  selectedClipId,
  onSelectClip,
  onSeek,
  onSplitClip,
  onDeleteClip,
  onRippleDelete,
  onDuplicateClip,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onChangeZoom,
  isSnapping,
  onToggleSnapping,
  onUpdateTrack,
  onTrimClipLeft,
  onTrimClipRight,
  onMoveClip,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const HEADER_WIDTH = 190;
  const totalWidth = Math.max(1200, duration * zoom);

  return (
    <div className="h-64 bg-neutral-925 border-t border-neutral-800 flex flex-col select-none overflow-hidden shrink-0">
      {/* 1. Timeline Top Toolbar */}
      <TimelineToolbar
        onSplit={onSplitClip}
        onDelete={onDeleteClip}
        onRippleDelete={onRippleDelete}
        onDuplicate={onDuplicateClip}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelectedClip={!!selectedClipId}
        isSnapping={isSnapping}
        onToggleSnapping={onToggleSnapping}
        zoom={zoom}
        onChangeZoom={onChangeZoom}
      />

      {/* 2. Timeline Tracks & Ruler Body */}
      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-auto" ref={scrollContainerRef}>
        {/* Ruler Row */}
        <TimelineRuler
          duration={duration}
          zoom={zoom}
          currentTime={currentTime}
          onSeek={onSeek}
          headerWidth={HEADER_WIDTH}
        />

        {/* Tracks Container */}
        <div className="flex-1 flex flex-col relative" style={{ minWidth: `${totalWidth + HEADER_WIDTH}px` }}>
          {/* Vertical Playhead Cursor Line spanning all tracks */}
          <div
            style={{ left: `${HEADER_WIDTH + currentTime * zoom}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none"
          />

          {tracks.map((track) => {
            const trackClips = clips.filter((c) => c.trackId === track.id);

            return (
              <div
                key={track.id}
                className="h-10 border-b border-neutral-800/80 flex items-center relative hover:bg-neutral-900/30 transition-colors"
              >
                {/* Track Left Header */}
                <div
                  style={{ width: `${HEADER_WIDTH}px` }}
                  className="h-full px-3 border-r border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0 z-20"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {track.type === 'video' ? (
                      <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : track.type === 'audio' ? (
                      <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-medium text-neutral-200 truncate">
                      {track.name}
                    </span>
                  </div>

                  {/* Track controls: Mute, Lock, Hide */}
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      onClick={() => onUpdateTrack(track.id, { muted: !track.muted })}
                      className={`p-1 rounded hover:bg-neutral-800 ${
                        track.muted ? 'text-red-400' : 'hover:text-neutral-200'
                      }`}
                      title={track.muted ? 'Unmute Track' : 'Mute Track'}
                    >
                      {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onUpdateTrack(track.id, { visible: !track.visible })}
                      className={`p-1 rounded hover:bg-neutral-800 ${
                        !track.visible ? 'text-neutral-600' : 'hover:text-neutral-200'
                      }`}
                      title={track.visible ? 'Hide Track' : 'Show Track'}
                    >
                      {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onUpdateTrack(track.id, { locked: !track.locked })}
                      className={`p-1 rounded hover:bg-neutral-800 ${
                        track.locked ? 'text-amber-400' : 'hover:text-neutral-200'
                      }`}
                      title={track.locked ? 'Unlock Track' : 'Lock Track'}
                    >
                      {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Track Content Lane */}
                <div
                  style={{ width: `${totalWidth}px` }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onSelectClip(null);
                    }
                  }}
                  className="h-full relative overflow-hidden flex-1 bg-neutral-900/10"
                >
                  {trackClips.map((clip) => (
                    <TimelineClipView
                      key={clip.id}
                      clip={clip}
                      zoom={zoom}
                      isSelected={selectedClipId === clip.id}
                      onSelect={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      onTrimLeft={onTrimClipLeft}
                      onTrimRight={onTrimClipRight}
                      onMoveClip={onMoveClip}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
