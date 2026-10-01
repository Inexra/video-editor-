import { ProjectResolution, AppSettings, Track } from '../types/editor';

export const RESOLUTION_PRESETS: ProjectResolution[] = [
  { width: 1920, height: 1080, label: '1080p Full HD (16:9)', aspectRatio: '16:9' },
  { width: 1280, height: 720, label: '720p HD (16:9)', aspectRatio: '16:9' },
  { width: 1080, height: 1920, label: 'TikTok / YouTube Shorts (9:16)', aspectRatio: '9:16' },
  { width: 1080, height: 1080, label: 'Instagram Square (1:1)', aspectRatio: '1:1' },
  { width: 1080, height: 1350, label: 'Instagram Portrait (4:5)', aspectRatio: '4:5' },
  { width: 854, height: 480, label: '480p SD - Low RAM (16:9)', aspectRatio: '16:9' },
  { width: 640, height: 360, label: '360p - Ultra Low RAM (16:9)', aspectRatio: '16:9' },
  { width: 2560, height: 1440, label: '1440p 2K QHD (16:9)', aspectRatio: '16:9' },
  { width: 3840, height: 2160, label: '4K UHD (16:9)', aspectRatio: '16:9' },
];

export const FRAME_RATE_OPTIONS = [24, 25, 30, 50, 60, 90, 120];

export const DEFAULT_TRACKS: Track[] = [
  { id: 'v2', name: 'Overlay / Text', type: 'video', locked: false, muted: false, visible: true, volume: 1 },
  { id: 'v1', name: 'Video 1', type: 'video', locked: false, muted: false, visible: true, volume: 1 },
  { id: 'sub', name: 'AI Subtitles', type: 'caption', locked: false, muted: false, visible: true, volume: 1 },
  { id: 'a1', name: 'Main Audio', type: 'audio', locked: false, muted: false, visible: true, volume: 1 },
  { id: 'a2', name: 'Music / SFX', type: 'audio', locked: false, muted: false, visible: true, volume: 0.8 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  performanceMode: 'low', // Low-end PC mode default for 4GB RAM target
  autoEnableLowEndMode: true,
  previewQuality: 'quarter', // 1/4 preview for fast fluid rendering on low-end dual-core
  enableProxyByDefault: true,
  proxyResolution: '360p',
  maxCacheSizeMB: 1024, // 1 GB cache limit for HDD
  cacheLocation: 'C:\\Users\\User\\AppData\\Local\\LightVideoEditor\\Cache',
  proxyLocation: 'C:\\Users\\User\\AppData\\Local\\LightVideoEditor\\Proxies',
  tempLocation: 'C:\\Users\\User\\AppData\\Local\\Temp\\LightVideoEditor',
  autosaveIntervalSec: 60,
  defaultExportFormat: 'mp4',
  defaultExportResolution: '1920x1080',
  defaultExportFps: 30,
  aiLocalOnly: true,
  aiCaptionModel: 'fast',
};

export const TRANSITION_TYPES = [
  { id: 'cut', name: 'Cut', description: 'Instant cut' },
  { id: 'cross-fade', name: 'Cross Dissolve', description: 'Smooth linear blend' },
  { id: 'dip-black', name: 'Dip to Black', description: 'Fades through darkness' },
  { id: 'dip-white', name: 'Dip to White', description: 'Flash/impact white fade' },
  { id: 'slide-left', name: 'Slide Left', description: 'Horizontal wipe transition' },
  { id: 'wipe', name: 'Soft Wipe', description: 'Lightweight diagonal push' },
];

export const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Inter',
  'Arial',
  'Impact',
  'Trebuchet MS',
  'Georgia',
  'Courier New',
  'JetBrains Mono',
];
