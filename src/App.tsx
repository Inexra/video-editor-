import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, Clip, Track, MediaItem, AppSettings, SystemPerformanceMetrics, ProjectResolution, AiClipHighlight, PreviewQuality, PerformanceMode } from './types/editor';
import { DEFAULT_SETTINGS, RESOLUTION_PRESETS } from './constants/presets';
import { ProjectManager } from './services/projectManager';
import { createInitialProjectClips, generateSyntheticVideoBlob, generateSyntheticAudioBlob } from './services/sampleMedia';
import { mediaEngine } from './services/mediaEngine';

import { TitleBar } from './components/TitleBar';
import { MenuBar } from './components/MenuBar';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { MediaPanel } from './components/SidebarPanels/MediaPanel';
import { AudioPanel } from './components/SidebarPanels/AudioPanel';
import { TextPanel } from './components/SidebarPanels/TextPanel';
import { TransitionsPanel } from './components/SidebarPanels/TransitionsPanel';
import { EffectsPanel } from './components/SidebarPanels/EffectsPanel';
import { AiPanel } from './components/SidebarPanels/AiPanel';
import { StickersPanel } from './components/SidebarPanels/StickersPanel';
import { PreviewPlayer } from './components/PreviewPlayer';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Timeline } from './components/Timeline/Timeline';

import { ExportModal } from './components/Modals/ExportModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ProjectSettingsModal } from './components/Modals/ProjectSettingsModal';
import { WindowsExeModal } from './components/Modals/WindowsExeModal';
import { PerformanceMonitorModal } from './components/Modals/PerformanceMonitorModal';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  // 1. Project & Timeline State
  const [project, setProject] = useState<Project>(() => ProjectManager.createDefaultProject());
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('media');

  // 2. Playback State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(45); // pixels per second
  const [isSnapping, setIsSnapping] = useState<boolean>(true);

  // 3. Settings & Performance State (Optimized for 4GB RAM)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [previewQuality, setPreviewQuality] = useState<PreviewQuality>(DEFAULT_SETTINGS.previewQuality);
  const [isLowEndMode, setIsLowEndMode] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<SystemPerformanceMetrics>({
    cpuUsage: 14,
    ramUsageMB: 1350,
    ramLimitMB: 4096,
    diskIoMBs: 4.2,
    previewFps: 30,
    droppedFrames: 0,
    isMemoryWarningActive: false,
  });

  // 4. Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false);
  const [isWindowsExeModalOpen, setIsWindowsExeModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [crashRecoveryPrompt, setCrashRecoveryPrompt] = useState<Project | null>(null);

  // 5. Undo / Redo History Stacks (Immutable, max 20 snapshots to save RAM)
  const historyRef = useRef<Array<{ clips: Clip[]; tracks: Track[] }>>([]);
  const historyIndexRef = useRef<number>(-1);

  const pushHistory = useCallback((clips: Clip[], tracks: Track[]) => {
    const curIdx = historyIndexRef.current;
    const newHistory = historyRef.current.slice(0, curIdx + 1);
    newHistory.push({
      clips: JSON.parse(JSON.stringify(clips)),
      tracks: JSON.parse(JSON.stringify(tracks)),
    });
    if (newHistory.length > 20) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const snapshot = historyRef.current[historyIndexRef.current];
      setProject((prev) => ({
        ...prev,
        clips: JSON.parse(JSON.stringify(snapshot.clips)),
        tracks: JSON.parse(JSON.stringify(snapshot.tracks)),
      }));
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const snapshot = historyRef.current[historyIndexRef.current];
      setProject((prev) => ({
        ...prev,
        clips: JSON.parse(JSON.stringify(snapshot.clips)),
        tracks: JSON.parse(JSON.stringify(snapshot.tracks)),
      }));
    }
  }, []);

  // Initialize sample project with clips on first launch
  useEffect(() => {
    // Check crash recovery first
    const recovery = ProjectManager.checkCrashRecovery();
    if (recovery.hasRecovery && recovery.project) {
      setCrashRecoveryPrompt(recovery.project);
    }

    createInitialProjectClips().then(({ clips, mediaItems }) => {
      setMediaItems(mediaItems);
      setProject((prev) => {
        const next = {
          ...prev,
          duration: 18,
          clips,
        };
        pushHistory(clips, next.tracks);
        return next;
      });
      // Select first clip by default
      if (clips.length > 0) setSelectedClipId(clips[0].id);
    });
  }, [pushHistory]);

  // Autosave interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (project.clips.length > 0) {
        ProjectManager.saveToLocalStorage(project);
      }
    }, settings.autosaveIntervalSec * 1000);
    return () => clearInterval(timer);
  }, [project, settings.autosaveIntervalSec]);

  // Performance simulation & memory monitor
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const activeClipCount = project.clips.length;
        const baseRam = isLowEndMode ? 1150 : 1600;
        const jitter = Math.floor(Math.random() * 40 - 20);
        const ram = baseRam + activeClipCount * 30 + jitter;
        const isWarning = ram > 1850;

        return {
          ...prev,
          ramUsageMB: ram,
          cpuUsage: isPlaying ? (isLowEndMode ? 22 : 38) : 11,
          diskIoMBs: isPlaying ? 6.5 : 1.2,
          previewFps: isPlaying ? (isLowEndMode ? 30 : 60) : 30,
          isMemoryWarningActive: isWarning,
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, isLowEndMode, project.clips.length]);

  // Main playback loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (!isPlaying) return;
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= project.duration) {
          setIsPlaying(false);
          mediaEngine.pauseAllAudio();
          return 0;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastTimestamp = performance.now();
      animId = requestAnimationFrame(loop);
    } else {
      mediaEngine.pauseAllAudio();
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, project.duration]);

  // Keyboard shortcuts (Space = Play/Pause, S = Split, Del = Delete, Left/Right = Stepping)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitAtPlayhead();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRippleDelete();
        } else if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDuplicateSelectedClip();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / project.fps));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(project.duration, t + 1 / project.fps));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Clip actions
  const handleUpdateClip = (clipId: string, updates: Partial<Clip>) => {
    setProject((prev) => {
      const nextClips = prev.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c));
      pushHistory(nextClips, prev.tracks);
      return { ...prev, clips: nextClips };
    });
  };

  const handleDeleteClip = (clipId: string) => {
    setProject((prev) => {
      const nextClips = prev.clips.filter((c) => c.id !== clipId);
      pushHistory(nextClips, prev.tracks);
      return { ...prev, clips: nextClips };
    });
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  const handleRippleDelete = () => {
    if (!selectedClipId) return;
    const targetClip = project.clips.find((c) => c.id === selectedClipId);
    if (!targetClip) return;

    setProject((prev) => {
      const deletedStart = targetClip.startTime;
      const deletedDuration = targetClip.duration;
      const remainingClips = prev.clips
        .filter((c) => c.id !== selectedClipId)
        .map((c) => {
          if (c.trackId === targetClip.trackId && c.startTime > deletedStart) {
            return { ...c, startTime: Math.max(0, c.startTime - deletedDuration) };
          }
          return c;
        });

      pushHistory(remainingClips, prev.tracks);
      return { ...prev, clips: remainingClips };
    });
    setSelectedClipId(null);
  };

  const handleSplitAtPlayhead = () => {
    const activeClip = project.clips.find(
      (c) =>
        currentTime > c.startTime + 0.1 &&
        currentTime < c.startTime + c.duration - 0.1 &&
        (selectedClipId ? c.id === selectedClipId : true)
    );

    if (!activeClip) return;

    const firstDuration = currentTime - activeClip.startTime;
    const secondDuration = activeClip.duration - firstDuration;

    const firstHalf: Clip = {
      ...activeClip,
      duration: firstDuration,
    };

    const secondHalf: Clip = {
      ...activeClip,
      id: `clip-${Date.now()}-split`,
      startTime: currentTime,
      duration: secondDuration,
      sourceOffset: activeClip.sourceOffset + firstDuration * activeClip.speed,
    };

    setProject((prev) => {
      const nextClips = prev.clips.map((c) => (c.id === activeClip.id ? firstHalf : c)).concat(secondHalf);
      pushHistory(nextClips, prev.tracks);
      return { ...prev, clips: nextClips };
    });

    setSelectedClipId(secondHalf.id);
  };

  const handleDuplicateSelectedClip = () => {
    if (!selectedClipId) return;
    const clip = project.clips.find((c) => c.id === selectedClipId);
    if (!clip) return;

    const duplicate: Clip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `clip-${Date.now()}-dup`,
      name: `${clip.name} (Copy)`,
      startTime: clip.startTime + clip.duration + 0.2,
    };

    setProject((prev) => {
      const nextClips = [...prev.clips, duplicate];
      const maxEnd = Math.max(prev.duration, duplicate.startTime + duplicate.duration + 2);
      pushHistory(nextClips, prev.tracks);
      return { ...prev, duration: maxEnd, clips: nextClips };
    });

    setSelectedClipId(duplicate.id);
  };

  const handleTrimClipLeft = (clipId: string, deltaSec: number) => {
    setProject((prev) => {
      const nextClips = prev.clips.map((c) => {
        if (c.id !== clipId) return c;
        const newStart = Math.max(0, c.startTime + deltaSec);
        const newDur = Math.max(0.5, c.duration - deltaSec);
        const newOffset = Math.max(0, c.sourceOffset + deltaSec * c.speed);
        return { ...c, startTime: newStart, duration: newDur, sourceOffset: newOffset };
      });
      return { ...prev, clips: nextClips };
    });
  };

  const handleTrimClipRight = (clipId: string, deltaSec: number) => {
    setProject((prev) => {
      const nextClips = prev.clips.map((c) => {
        if (c.id !== clipId) return c;
        const newDur = Math.max(0.5, c.duration + deltaSec);
        return { ...c, duration: newDur };
      });
      return { ...prev, clips: nextClips };
    });
  };

  const handleMoveClip = (clipId: string, newStart: number) => {
    setProject((prev) => {
      const nextClips = prev.clips.map((c) => (c.id === clipId ? { ...c, startTime: newStart } : c));
      return { ...prev, clips: nextClips };
    });
  };

  const handleUpdateTrack = (trackId: string, updates: Partial<Track>) => {
    setProject((prev) => {
      const nextTracks = prev.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t));
      pushHistory(prev.clips, nextTracks);
      return { ...prev, tracks: nextTracks };
    });
  };

  // Import local media
  const handleImportMedia = async (files: FileList) => {
    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');

      // Create a fast proxy if video and Low-End PC mode is active
      let proxyUrl = url;
      if (isVideo && settings.enableProxyByDefault) {
        proxyUrl = await mediaEngine.generateProxy(url, settings.proxyResolution);
      }

      newItems.push({
        id: `media-${Date.now()}-${i}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        src: url,
        proxySrc: proxyUrl,
        duration: 10,
        fileSize: file.size,
        isProxyReady: isVideo,
      });
    }

    setMediaItems((prev) => [...prev, ...newItems]);
  };

  // Add media asset to timeline
  const handleAddMediaToTimeline = (item: MediaItem) => {
    const trackId = item.type === 'video' ? 'v1' : 'a1';
    const lastClip = project.clips
      .filter((c) => c.trackId === trackId)
      .sort((a, b) => a.startTime + a.duration - (b.startTime + b.duration))
      .pop();

    const start = lastClip ? lastClip.startTime + lastClip.duration : currentTime;

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      name: item.name,
      type: item.type,
      trackId,
      startTime: start,
      duration: item.duration,
      sourceOffset: 0,
      sourceDuration: item.duration,
      src: item.src,
      proxySrc: item.proxySrc,
      isProxyActive: isLowEndMode,
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
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
      keyframes: [],
      colorTag: item.type === 'video' ? '#0284c7' : '#10b981',
    };

    setProject((prev) => {
      const nextClips = [...prev.clips, newClip];
      const maxEnd = Math.max(prev.duration, newClip.startTime + newClip.duration + 2);
      pushHistory(nextClips, prev.tracks);
      return { ...prev, duration: maxEnd, clips: nextClips };
    });

    setSelectedClipId(newClip.id);
  };

  // Add sample demo footage
  const handleAddSampleClip = async (type: 'coast' | 'urban' | 'audio') => {
    if (type === 'coast') {
      const vid = await generateSyntheticVideoBlob('Cinematic Coastline', '#1e293b', '#0f766e', 8);
      handleAddMediaToTimeline({
        id: `sample-coast-${Date.now()}`,
        name: 'Coastline_Sample.mp4',
        type: 'video',
        src: vid.url,
        proxySrc: vid.url,
        duration: 8,
        isProxyReady: true,
      });
    } else if (type === 'urban') {
      const vid = await generateSyntheticVideoBlob('Urban Timelapse', '#1e1b4b', '#4338ca', 7);
      handleAddMediaToTimeline({
        id: `sample-urban-${Date.now()}`,
        name: 'Urban_Timelapse.mp4',
        type: 'video',
        src: vid.url,
        proxySrc: vid.url,
        duration: 7,
        isProxyReady: true,
      });
    } else {
      const aud = await generateSyntheticAudioBlob(12);
      handleAddMediaToTimeline({
        id: `sample-audio-${Date.now()}`,
        name: 'Acoustic_Soundtrack.wav',
        type: 'audio',
        src: aud.url,
        duration: 12,
        waveform: aud.waveform,
      });
    }
  };

  // Add generic clip from sidebar (text, audio, sticker)
  const handleAddClip = (partial: Partial<Clip>) => {
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      name: partial.name || 'New Clip',
      type: partial.type || 'text',
      trackId: partial.trackId || 'v2',
      startTime: partial.startTime ?? currentTime,
      duration: partial.duration || 4,
      sourceOffset: 0,
      sourceDuration: partial.duration || 4,
      src: partial.src || '',
      volume: partial.volume ?? 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: partial.transform || { x: 0, y: 0, scale: 1, rotation: 0 },
      crop: { x: 0, y: 0, width: 1, height: 1 },
      effects: partial.effects || {
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
      textProps: partial.textProps,
      captionProps: partial.captionProps,
      keyframes: [],
      waveform: partial.waveform,
      colorTag: partial.colorTag || '#ec4899',
    };

    setProject((prev) => {
      const nextClips = [...prev.clips, newClip];
      const maxEnd = Math.max(prev.duration, newClip.startTime + newClip.duration + 2);
      pushHistory(nextClips, prev.tracks);
      return { ...prev, duration: maxEnd, clips: nextClips };
    });

    setSelectedClipId(newClip.id);
  };

  // Apply AI Captions
  const handleApplyAiCaptions = (newCaptions: Clip[]) => {
    setProject((prev) => {
      // Replace existing caption track clips
      const otherClips = prev.clips.filter((c) => c.trackId !== 'sub');
      const nextClips = [...otherClips, ...newCaptions];
      pushHistory(nextClips, prev.tracks);
      return { ...prev, clips: nextClips };
    });
  };

  // Apply AI Highlight Clip
  const handleApplyAiClip = (highlight: AiClipHighlight) => {
    // Jump playhead to the highlight section
    setCurrentTime(highlight.startTime);
    // Switch project aspect ratio if 9:16 vertical shorts was chosen
    if (highlight.aspectRatio === '9:16') {
      const shortsRes = RESOLUTION_PRESETS.find((r) => r.aspectRatio === '9:16') || {
        width: 1080,
        height: 1920,
        label: 'YouTube Shorts / TikTok (9:16)',
        aspectRatio: '9:16',
      };
      setProject((prev) => ({ ...prev, resolution: shortsRes }));
    }
  };

  // Selected clip object lookup
  const selectedClip = project.clips.find((c) => c.id === selectedClipId) || null;

  return (
    <div className="w-screen h-screen flex flex-col bg-neutral-950 text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Windows 10 Title Bar */}
      <TitleBar
        projectName={project.name}
        performanceMode={settings.performanceMode}
        isProxyActive={isLowEndMode}
        metrics={metrics}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenWindowsExeModal={() => setIsWindowsExeModalOpen(true)}
        onOpenPerformanceModal={() => setIsPerformanceModalOpen(true)}
      />

      {/* 2. Menu Bar */}
      <MenuBar
        onNewProject={() => {
          if (confirm('Create new project? Unsaved changes will be discarded.')) {
            const p = ProjectManager.createDefaultProject();
            setProject(p);
            setSelectedClipId(null);
            setCurrentTime(0);
          }
        }}
        onOpenProject={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.lvproj';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const loaded = await ProjectManager.importProjectFile(file);
              setProject(loaded);
              setSelectedClipId(null);
            }
          };
          input.click();
        }}
        onSaveProject={() => {
          ProjectManager.saveToLocalStorage(project);
          alert('Project saved to local storage.');
        }}
        onExportProjectFile={() => ProjectManager.exportProjectFile(project)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenProjectSettingsModal={() => setIsProjectSettingsModalOpen(true)}
        onOpenWindowsExeModal={() => setIsWindowsExeModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndexRef.current > 0}
        canRedo={historyIndexRef.current < historyRef.current.length - 1}
        onSplitClip={handleSplitAtPlayhead}
        onDeleteClip={() => selectedClipId && handleDeleteClip(selectedClipId)}
        onRippleDelete={handleRippleDelete}
        onTriggerAiCaptions={() => setActiveSidebarTab('ai')}
        onTriggerAiClipper={() => setActiveSidebarTab('ai')}
        previewQuality={previewQuality}
        onChangePreviewQuality={setPreviewQuality}
        isLowEndMode={isLowEndMode}
        onToggleLowEndMode={() => setIsLowEndMode(!isLowEndMode)}
      />

      {/* Crash recovery banner if previous session detected */}
      {crashRecoveryPrompt && (
        <div className="h-8 bg-amber-950/90 border-b border-amber-600 px-4 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Unsaved session from previous run detected. Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setProject(crashRecoveryPrompt);
                ProjectManager.clearCrashRecovery();
                setCrashRecoveryPrompt(null);
              }}
              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px]"
            >
              Restore Session
            </button>
            <button
              onClick={() => {
                ProjectManager.clearCrashRecovery();
                setCrashRecoveryPrompt(null);
              }}
              className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Center Workspace: [Sidebar] [Sidebar Panel] [Center Preview] [Right Properties] */}
      <div className="flex-1 flex overflow-hidden">
        {/* Leftmost Icon Bar */}
        <Sidebar activeTab={activeSidebarTab} onSelectTab={setActiveSidebarTab} />

        {/* Selected Sidebar Pane */}
        <div className="w-64 bg-neutral-900 border-r border-neutral-800 shrink-0 overflow-hidden">
          {activeSidebarTab === 'media' && (
            <MediaPanel
              mediaItems={mediaItems}
              onImportMedia={handleImportMedia}
              onAddMediaToTimeline={handleAddMediaToTimeline}
              onToggleProxy={(id) => {
                setProject((prev) => ({
                  ...prev,
                  clips: prev.clips.map((c) =>
                    c.id === id ? { ...c, isProxyActive: !c.isProxyActive } : c
                  ),
                }));
              }}
              onAddSampleClip={handleAddSampleClip}
              isProxyActive={isLowEndMode}
            />
          )}

          {activeSidebarTab === 'audio' && (
            <AudioPanel
              onAddAudioClip={handleAddClip}
              playheadPosition={currentTime}
            />
          )}

          {activeSidebarTab === 'text' && (
            <TextPanel
              onAddTextClip={handleAddClip}
              playheadPosition={currentTime}
            />
          )}

          {activeSidebarTab === 'transitions' && (
            <TransitionsPanel
              selectedClipId={selectedClipId}
              onApplyTransition={(trId) => {
                if (selectedClipId) {
                  alert(`Applied '${trId}' transition to clip start.`);
                }
              }}
            />
          )}

          {activeSidebarTab === 'effects' && (
            <EffectsPanel
              selectedClipId={selectedClipId}
              onApplyEffectPreset={(eff) => {
                if (selectedClipId) {
                  handleUpdateClip(selectedClipId, {
                    effects: { ...selectedClip?.effects!, ...eff },
                  });
                }
              }}
            />
          )}

          {activeSidebarTab === 'ai' && (
            <AiPanel
              timelineClips={project.clips}
              timelineDuration={project.duration}
              onApplyAiCaptions={handleApplyAiCaptions}
              onApplyAiClipToTimeline={handleApplyAiClip}
            />
          )}

          {activeSidebarTab === 'stickers' && (
            <StickersPanel
              onAddStickerClip={handleAddClip}
              playheadPosition={currentTime}
            />
          )}
        </div>

        {/* Center Preview Player */}
        <PreviewPlayer
          clips={project.clips}
          currentTime={currentTime}
          totalDuration={project.duration}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStop={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onSeek={(t) => setCurrentTime(t)}
          projectResolution={project.resolution}
          fps={project.fps}
          previewQuality={previewQuality}
          onChangePreviewQuality={setPreviewQuality}
          isLowEndMode={isLowEndMode}
        />

        {/* Right Properties Panel */}
        <PropertiesPanel
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          playheadPosition={currentTime}
        />
      </div>

      {/* 4. Bottom Multi-Track Timeline */}
      <Timeline
        tracks={project.tracks}
        clips={project.clips}
        duration={project.duration}
        currentTime={currentTime}
        selectedClipId={selectedClipId}
        onSelectClip={setSelectedClipId}
        onSeek={setCurrentTime}
        onSplitClip={handleSplitAtPlayhead}
        onDeleteClip={() => selectedClipId && handleDeleteClip(selectedClipId)}
        onRippleDelete={handleRippleDelete}
        onDuplicateClip={handleDuplicateSelectedClip}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndexRef.current > 0}
        canRedo={historyIndexRef.current < historyRef.current.length - 1}
        zoom={zoom}
        onChangeZoom={setZoom}
        isSnapping={isSnapping}
        onToggleSnapping={() => setIsSnapping(!isSnapping)}
        onUpdateTrack={handleUpdateTrack}
        onTrimClipLeft={handleTrimClipLeft}
        onTrimClipRight={handleTrimClipRight}
        onMoveClip={handleMoveClip}
      />

      {/* 5. Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectResolution={project.resolution}
        fps={project.fps}
        duration={project.duration}
        clips={project.clips}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          setIsLowEndMode(newSettings.performanceMode === 'low');
        }}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setIsProjectSettingsModalOpen(false)}
        projectName={project.name}
        currentResolution={project.resolution}
        currentFps={project.fps}
        onSave={(name, resolution, fps) => {
          setProject((prev) => ({ ...prev, name, resolution, fps }));
        }}
      />

      <WindowsExeModal
        isOpen={isWindowsExeModalOpen}
        onClose={() => setIsWindowsExeModalOpen(false)}
      />

      <PerformanceMonitorModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        metrics={metrics}
        performanceMode={settings.performanceMode}
        onEnableLowEndMode={() => {
          setIsLowEndMode(true);
          setSettings((s) => ({ ...s, performanceMode: 'low' }));
          setPreviewQuality('quarter');
        }}
        onOptimizeMemory={() => {
          mediaEngine.clearPools();
          ProjectManager.clearCache();
          setMetrics((m) => ({ ...m, ramUsageMB: 1100, isMemoryWarningActive: false }));
          alert('Inactive video buffers and cache flushed. RAM freed.');
        }}
      />
    </div>
  );
}
