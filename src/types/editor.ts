/**
 * LightVideo Editor - Core Type Definitions
 * Designed for low RAM consumption, high throughput, and modular video editing.
 */

export type MediaType = 'video' | 'audio' | 'image' | 'text' | 'caption';

export type PerformanceMode = 'low' | 'balanced' | 'quality';
export type PreviewQuality = 'auto' | 'quarter' | 'half' | 'full';

export interface Transform {
  x: number; // Offset X in pixels
  y: number; // Offset Y in pixels
  scale: number; // 0.1 to 5.0
  rotation: number; // -180 to 180 degrees
}

export interface Crop {
  x: number; // 0 to 1
  y: number; // 0 to 1
  width: number; // 0 to 1
  height: number; // 0 to 1
}

export interface Effects {
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  hue: number; // -180 to 180 deg
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100
  blur: number; // 0 to 20 px
  vignette: number; // 0 to 100
  grayscale: number; // 0 to 100
}

export interface TextProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  textAlign: 'left' | 'center' | 'right';
  animation: 'none' | 'fade-in' | 'slide-up' | 'typewriter' | 'pop';
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface CaptionProperties {
  text: string;
  words?: SubtitleWord[];
  style: 'simple' | 'bold' | 'highlight' | 'social' | 'minimal';
  fontSize: number;
  color: string;
  highlightColor: string;
  backgroundColor: string;
}

export interface Keyframe {
  time: number; // relative to clip start
  transform?: Partial<Transform>;
  opacity?: number;
  volume?: number;
}

export interface Clip {
  id: string;
  name: string;
  type: MediaType;
  trackId: string;
  startTime: number; // Timeline position in seconds
  duration: number; // Active playback duration in seconds
  sourceOffset: number; // Start offset into source media in seconds
  sourceDuration: number; // Total length of original media in seconds
  src: string; // URL, blob or data URI
  proxySrc?: string; // Downscaled proxy file (e.g. 360p)
  isProxyActive?: boolean;
  volume: number; // 0.0 to 2.0 (1.0 default)
  speed: number; // 0.25 to 4.0 (1.0 default)
  muted: boolean;
  opacity: number; // 0.0 to 1.0
  transform: Transform;
  crop: Crop;
  effects: Effects;
  textProps?: TextProperties;
  captionProps?: CaptionProperties;
  keyframes: Keyframe[];
  colorTag?: string;
  waveform?: number[]; // Subsampled audio peaks for low RAM usage
  thumbnail?: string; // Single cached lightweight thumb
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'caption';
  locked: boolean;
  muted: boolean;
  visible: boolean;
  volume: number;
}

export interface ProjectResolution {
  width: number;
  height: number;
  label: string;
  aspectRatio: string;
}

export interface Project {
  id: string;
  name: string;
  resolution: ProjectResolution;
  fps: number;
  duration: number; // Total project length in seconds
  tracks: Track[];
  clips: Clip[];
  lastModified: number;
  version: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  src: string;
  proxySrc?: string;
  duration: number;
  width?: number;
  height?: number;
  fileSize?: number;
  isProxyReady?: boolean;
  thumbnail?: string;
  waveform?: number[];
}

export interface AppSettings {
  theme: 'dark' | 'light';
  performanceMode: PerformanceMode;
  autoEnableLowEndMode: boolean;
  previewQuality: PreviewQuality;
  enableProxyByDefault: boolean;
  proxyResolution: '360p' | '480p';
  maxCacheSizeMB: number;
  cacheLocation: string;
  proxyLocation: string;
  tempLocation: string;
  autosaveIntervalSec: number;
  defaultExportFormat: 'mp4' | 'webm' | 'mov';
  defaultExportResolution: string;
  defaultExportFps: number;
  aiLocalOnly: boolean;
  aiCaptionModel: 'fast' | 'balanced' | 'accurate';
}

export interface SystemPerformanceMetrics {
  cpuUsage: number; // simulated percentage
  ramUsageMB: number; // simulated megabytes
  ramLimitMB: number;
  diskIoMBs: number;
  previewFps: number;
  droppedFrames: number;
  isMemoryWarningActive: boolean;
}

export interface AiClipHighlight {
  id: string;
  title: string;
  startTime: number;
  duration: number;
  reason: string;
  viralityScore: number;
  aspectRatio: '9:16' | '1:1' | '16:9';
  previewThumb?: string;
}
