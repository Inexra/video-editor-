import React, { useState } from 'react';
import { Bot, Subtitles, Scissors, Sparkles, Download, CheckCircle2, Play, Flame } from 'lucide-react';
import { Clip, AiClipHighlight } from '../../types/editor';
import { generateAiCaptions, analyzeAndFindClips } from '../../services/aiEngine';

interface AiPanelProps {
  timelineClips: Clip[];
  timelineDuration: number;
  onApplyAiCaptions: (newCaptionClips: Clip[]) => void;
  onApplyAiClipToTimeline: (highlight: AiClipHighlight) => void;
}

export const AiPanel: React.FC<AiPanelProps> = ({
  timelineClips,
  timelineDuration,
  onApplyAiCaptions,
  onApplyAiClipToTimeline,
}) => {
  const [activeAiTab, setActiveAiTab] = useState<'captions' | 'clipper'>('captions');

  // Captions state
  const [captionModel, setCaptionModel] = useState<'fast' | 'balanced' | 'accurate'>('fast');
  const [captionStyle, setCaptionStyle] = useState<'simple' | 'bold' | 'highlight' | 'social' | 'minimal'>('social');
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [captionProgress, setCaptionProgress] = useState(0);
  const [captionStatus, setCaptionStatus] = useState('');
  const [lastSrt, setLastSrt] = useState<string | null>(null);
  const [lastVtt, setLastVtt] = useState<string | null>(null);

  // Clipper state
  const [clipperDuration, setClipperDuration] = useState<number>(15);
  const [clipperAspect, setClipperAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [isGeneratingClips, setIsGeneratingClips] = useState(false);
  const [clipperProgress, setClipperProgress] = useState(0);
  const [clipperStatus, setClipperStatus] = useState('');
  const [suggestedClips, setSuggestedClips] = useState<AiClipHighlight[]>([]);

  // Trigger caption generation
  const handleGenerateCaptions = async () => {
    setIsGeneratingCaptions(true);
    setCaptionProgress(0);
    try {
      const result = await generateAiCaptions({
        timelineDuration,
        model: captionModel,
        style: captionStyle,
        onProgress: (p, status) => {
          setCaptionProgress(p);
          setCaptionStatus(status);
        },
      });

      onApplyAiCaptions(result.clips);
      setLastSrt(result.srtContent);
      setLastVtt(result.vttContent);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Trigger AI clipper
  const handleGenerateClips = async () => {
    setIsGeneratingClips(true);
    setClipperProgress(0);
    try {
      const results = await analyzeAndFindClips({
        timelineClips,
        targetDuration: clipperDuration,
        targetCount: 3,
        aspectRatio: clipperAspect,
        onProgress: (p, status) => {
          setClipperProgress(p);
          setClipperStatus(status);
        },
      });
      setSuggestedClips(results);
    } finally {
      setIsGeneratingClips(false);
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <div className="flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-white uppercase tracking-wider">AI Studio Tools</h2>
        </div>
        <span className="text-[10px] text-neutral-400">Offline-first · Zero cloud lag · 4GB RAM ready</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mt-2.5 p-1 bg-neutral-850 rounded-lg">
        <button
          onClick={() => setActiveAiTab('captions')}
          className={`flex-1 py-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1 ${
            activeAiTab === 'captions' ? 'bg-neutral-750 text-cyan-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Subtitles className="w-3.5 h-3.5" />
          <span>AI Captions</span>
        </button>
        <button
          onClick={() => setActiveAiTab('clipper')}
          className={`flex-1 py-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1 ${
            activeAiTab === 'clipper' ? 'bg-neutral-750 text-cyan-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>AI Clipper</span>
        </button>
      </div>

      {/* CAPTIONS TAB */}
      {activeAiTab === 'captions' && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              AI Speech Model
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'fast', label: 'Fast', desc: 'Low RAM (4GB)' },
                { id: 'balanced', label: 'Balanced', desc: 'Standard' },
                { id: 'accurate', label: 'Accurate', desc: 'Deep VAD' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCaptionModel(m.id as any)}
                  className={`p-1.5 rounded border text-left transition-colors ${
                    captionModel === m.id
                      ? 'bg-neutral-800 border-cyan-500/80 text-white'
                      : 'bg-neutral-850 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <p className="font-semibold text-[11px]">{m.label}</p>
                  <p className="text-[9px] text-neutral-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Visual Caption Style
            </label>
            <select
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value as any)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="social">Social Punch (TikTok / Shorts)</option>
              <option value="highlight">Karaoke Active Word Highlight</option>
              <option value="bold">Bold Impact</option>
              <option value="simple">Simple Classic</option>
              <option value="minimal">Minimal Broadcast</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateCaptions}
            disabled={isGeneratingCaptions}
            className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingCaptions ? 'Generating Captions...' : 'Generate Auto-Captions'}</span>
          </button>

          {/* Progress display */}
          {isGeneratingCaptions && (
            <div className="p-2.5 rounded bg-neutral-850 border border-neutral-750">
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span className="truncate max-w-[180px]">{captionStatus}</span>
                <span className="font-mono text-cyan-400">{captionProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${captionProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Subtitles section */}
          {lastSrt && (
            <div className="pt-2 border-t border-neutral-800 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-neutral-300">Export Subtitle Files</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => downloadTextFile(lastSrt, 'captions.srt')}
                  className="py-1.5 px-2 rounded bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 text-[10px] flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Download .SRT</span>
                </button>
                <button
                  onClick={() => downloadTextFile(lastVtt || '', 'captions.vtt')}
                  className="py-1.5 px-2 rounded bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 text-[10px] flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Download .VTT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLIPPER TAB */}
      {activeAiTab === 'clipper' && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Target Duration Preset
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[15, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setClipperDuration(dur)}
                  className={`py-1.5 rounded border text-center transition-colors ${
                    clipperDuration === dur
                      ? 'bg-neutral-800 border-cyan-500/80 text-white font-medium'
                      : 'bg-neutral-850 border-neutral-750 text-neutral-400'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Social Output Format
            </label>
            <select
              value={clipperAspect}
              onChange={(e) => setClipperAspect(e.target.value as any)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="9:16">9:16 Vertical (TikTok / Shorts)</option>
              <option value="1:1">1:1 Square (Instagram Feed)</option>
              <option value="16:9">16:9 Landscape (YouTube Highlight)</option>
            </select>
          </div>

          {/* Action button */}
          <button
            onClick={handleGenerateClips}
            disabled={isGeneratingClips}
            className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>{isGeneratingClips ? 'Analyzing Video...' : 'Find Viral Clips'}</span>
          </button>

          {/* Progress display */}
          {isGeneratingClips && (
            <div className="p-2.5 rounded bg-neutral-850 border border-neutral-750">
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span className="truncate max-w-[180px]">{clipperStatus}</span>
                <span className="font-mono text-cyan-400">{clipperProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${clipperProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Suggested Highlights */}
          {suggestedClips.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[11px] font-medium text-neutral-300">
                Suggested Viral Sections ({suggestedClips.length})
              </span>
              {suggestedClips.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200 truncate max-w-[180px]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />
                      {item.viralityScore}%
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">{item.reason}</p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
                    <span>
                      {Math.floor(item.startTime)}s - {Math.floor(item.startTime + item.duration)}s ({item.duration}s)
                    </span>
                    <button
                      onClick={() => onApplyAiClipToTimeline(item)}
                      className="px-2 py-0.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white font-medium"
                    >
                      Use Clip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
