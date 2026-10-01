import React, { useRef } from 'react';
import { Upload, Plus, Film, Music, Image as ImageIcon, Zap, CheckCircle2, Clock } from 'lucide-react';
import { MediaItem, Clip } from '../../types/editor';

interface MediaPanelProps {
  mediaItems: MediaItem[];
  onImportMedia: (files: FileList) => void;
  onAddMediaToTimeline: (media: MediaItem) => void;
  onToggleProxy: (mediaId: string) => void;
  onAddSampleClip: (type: 'coast' | 'urban' | 'audio') => void;
  isProxyActive: boolean;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
  mediaItems,
  onImportMedia,
  onAddMediaToTimeline,
  onToggleProxy,
  onAddSampleClip,
  isProxyActive,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportMedia(e.dataTransfer.files);
    }
  };

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none">
      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
        <div>
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Project Media</h2>
          <span className="text-[10px] text-neutral-400">Streamed from disk · Zero RAM bloat</span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs flex items-center gap-1 transition-colors"
        >
          <Upload className="w-3 h-3 text-cyan-400" />
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onImportMedia(e.target.files);
            }
          }}
        />
      </div>

      {/* Drag & Drop Import Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="mt-3 p-3 border border-dashed border-neutral-700 hover:border-cyan-500/70 rounded-lg bg-neutral-850/50 hover:bg-neutral-800/40 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1.5" />
        <p className="text-xs text-neutral-200 font-medium">Drop MP4, WebM, WAV, MP3</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">Or browse files from your computer</p>
      </div>

      {/* Media Items List */}
      <div className="mt-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-neutral-300">Imported Assets ({mediaItems.length})</span>
          <span className="text-[10px] text-cyan-400 font-mono">Proxy: 360p</span>
        </div>

        {mediaItems.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs">
            No media imported yet. Drop video files above.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="group p-2 rounded-lg bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center shrink-0 text-neutral-400">
                    {item.type === 'video' ? (
                      <Film className="w-4 h-4 text-cyan-400" />
                    ) : item.type === 'audio' ? (
                      <Music className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-neutral-200 font-medium truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                      <span>{Math.floor(item.duration)}s</span>
                      <span>·</span>
                      <span>{item.type === 'video' ? '1080p' : 'Audio'}</span>
                      {item.isProxyReady && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Proxy
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddMediaToTimeline(item)}
                    className="p-1.5 rounded bg-neutral-750 hover:bg-cyan-600 hover:text-white text-neutral-300 transition-colors"
                    title="Add to timeline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Built-in Footage Bank for immediate testing */}
      <div className="mt-4 pt-3 border-t border-neutral-800">
        <span className="text-[11px] font-medium text-neutral-300 block mb-2">
          Built-in Demo Media (Zero Download)
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <button
            onClick={() => onAddSampleClip('coast')}
            className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 flex flex-col items-center gap-1 text-center transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate w-full">Coastline</span>
          </button>
          <button
            onClick={() => onAddSampleClip('urban')}
            className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 flex flex-col items-center gap-1 text-center transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate w-full">Urban</span>
          </button>
          <button
            onClick={() => onAddSampleClip('audio')}
            className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 flex flex-col items-center gap-1 text-center transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate w-full">Music</span>
          </button>
        </div>
      </div>
    </div>
  );
};
