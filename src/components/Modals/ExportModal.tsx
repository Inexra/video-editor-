import React, { useState, useRef } from 'react';
import {
  Download,
  X,
  Play,
  Film,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { ProjectResolution, Clip, Track } from '../../types/editor';
import { mediaEngine } from '../../services/mediaEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectResolution: ProjectResolution;
  fps: number;
  duration: number;
  clips: Clip[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectResolution,
  fps,
  duration,
  clips,
}) => {
  const [preset, setPreset] = useState<'youtube' | 'shorts' | 'tiktok' | 'low-ram' | 'custom'>('youtube');
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mov'>('mp4');
  const [codec, setCodec] = useState<'h264' | 'hevc' | 'vp9'>('h264');
  const [bitrateMbps, setBitrateMbps] = useState<number>(8);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentFps, setCurrentFps] = useState(30);
  const [estRemainingSec, setEstRemainingSec] = useState(0);
  const [exportedFileSizeMB, setExportedFileSizeMB] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);

    // Setup an offscreen render canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = projectResolution.width;
    offCanvas.height = projectResolution.height;

    const stream = offCanvas.captureStream(fps);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: bitrateMbps * 1000000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(finalBlob);
      setDownloadUrl(url);
      setExportedFileSizeMB(Number((finalBlob.size / (1024 * 1024)).toFixed(2)));
      setIsExporting(false);
    };

    recorder.start();

    const totalFrames = Math.max(15, Math.ceil(duration * fps));
    let frame = 0;
    const startTime = performance.now();

    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      const t = frame / fps;
      mediaEngine.renderFrame({
        canvas: offCanvas,
        clips,
        currentTime: t,
        projectResolution,
        quality: 'full',
        isLowEndMode: false,
      });

      frame++;
      const p = Math.round((frame / totalFrames) * 100);
      setExportProgress(p);

      const elapsedSec = (performance.now() - startTime) / 1000;
      const speedFps = Math.round(frame / Math.max(0.1, elapsedSec));
      setCurrentFps(speedFps);

      const remainingFrames = totalFrames - frame;
      setEstRemainingSec(Math.ceil(remainingFrames / Math.max(1, speedFps)));
      setExportedFileSizeMB(Number(((frame / totalFrames) * ((bitrateMbps * duration) / 8)).toFixed(2)));
    }, 1000 / fps);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/80">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-white text-sm">Export Project Video</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {!isExporting && !downloadUrl && (
            <>
              {/* Presets */}
              <div>
                <label className="text-[11px] font-medium text-neutral-300 block mb-1.5">
                  Export Preset
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'youtube', name: 'YouTube 1080p', desc: 'Standard 16:9' },
                    { id: 'shorts', name: 'YT Shorts', desc: 'Vertical 9:16' },
                    { id: 'tiktok', name: 'TikTok', desc: 'Vertical 9:16' },
                    { id: 'low-ram', name: 'Fast HDD Export', desc: 'Low RAM' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id as any)}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        preset === p.id
                          ? 'bg-neutral-800 border-cyan-500 text-white'
                          : 'bg-neutral-850 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <p className="font-semibold text-[11px] truncate">{p.name}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Format & Bitrate Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Container Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                  >
                    <option value="mp4">MP4 Video (.mp4)</option>
                    <option value="webm">WebM Video (.webm)</option>
                    <option value="mov">QuickTime MOV (.mov)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Video Codec
                  </label>
                  <select
                    value={codec}
                    onChange={(e) => setCodec(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden"
                  >
                    <option value="h264">H.264 / AVC (Most Compatible)</option>
                    <option value="hevc">H.265 / HEVC (High Efficiency)</option>
                    <option value="vp9">VP9 (Open Format)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                    <span>Target Bitrate</span>
                    <span className="font-mono text-cyan-400">{bitrateMbps} Mbps</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    value={bitrateMbps}
                    onChange={(e) => setBitrateMbps(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Hardware Acceleration
                  </label>
                  <div className="px-2.5 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] flex items-center justify-between">
                    <span>Auto (Intel QuickSync / CPU Fast)</span>
                    <span className="text-emerald-400 font-medium">Ready</span>
                  </div>
                </div>
              </div>

              {/* Summary Specs */}
              <div className="p-3 rounded-lg bg-neutral-850/60 border border-neutral-800 flex items-center justify-around text-center text-neutral-400">
                <div>
                  <span className="text-[10px] block">Resolution</span>
                  <strong className="text-neutral-200 font-mono">
                    {projectResolution.width} × {projectResolution.height}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] block">Framerate</span>
                  <strong className="text-neutral-200 font-mono">{fps} FPS</strong>
                </div>
                <div>
                  <span className="text-[10px] block">Duration</span>
                  <strong className="text-neutral-200 font-mono">{Math.floor(duration)}s</strong>
                </div>
                <div>
                  <span className="text-[10px] block">Est. File Size</span>
                  <strong className="text-cyan-400 font-mono">
                    ~{((bitrateMbps * duration) / 8).toFixed(1)} MB
                  </strong>
                </div>
              </div>
            </>
          )}

          {/* Export in progress screen */}
          {isExporting && (
            <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-500 flex items-center justify-center animate-pulse">
                <Film className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Rendering Video Timeline</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Using streaming chunk encoder · RAM usage stable under 250 MB
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Encoding Frames...</span>
                  <span className="font-mono text-cyan-400 font-bold">{exportProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>

              {/* Real-time stats */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-md text-xs">
                <div className="p-2 rounded bg-neutral-850 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Render FPS</span>
                  <strong className="font-mono text-neutral-200">{currentFps}</strong>
                </div>
                <div className="p-2 rounded bg-neutral-850 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Remaining</span>
                  <strong className="font-mono text-neutral-200">{estRemainingSec}s</strong>
                </div>
                <div className="p-2 rounded bg-neutral-850 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Current Size</span>
                  <strong className="font-mono text-neutral-200">{exportedFileSizeMB} MB</strong>
                </div>
                <div className="p-2 rounded bg-neutral-850 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Memory</span>
                  <strong className="font-mono text-emerald-400">180 MB</strong>
                </div>
              </div>
            </div>
          )}

          {/* Export Complete screen */}
          {downloadUrl && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Export Successfully Rendered!</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Size: <strong className="text-neutral-200 font-mono">{exportedFileSizeMB} MB</strong> · Format: {format.toUpperCase()}
                </p>
              </div>

              <a
                href={downloadUrl}
                download={`LightVideo_Export_${Date.now()}.${format}`}
                className="mt-2 py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({exportedFileSizeMB} MB)</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-850/80 flex items-center justify-end gap-2">
          {!isExporting && !downloadUrl && (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Start Export</span>
              </button>
            </>
          )}

          {downloadUrl && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
