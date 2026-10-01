import { Clip, ProjectResolution, PreviewQuality, SubtitleWord } from '../types/editor';

/**
 * High-performance, low-RAM Canvas & Audio rendering engine.
 * Specifically optimized for low-spec dual/quad-core PCs with 4GB RAM.
 */

class MediaEngine {
  private videoElementPool: Map<string, HTMLVideoElement> = new Map();
  private audioElementPool: Map<string, HTMLAudioElement> = new Map();
  private lastRenderTime: number = 0;
  private currentEffectiveScale: number = 0.25;

  // Retrieve or create a pooled video element for a clip
  public getVideoElement(src: string): HTMLVideoElement {
    if (!this.videoElementPool.has(src)) {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = src;
      vid.preload = 'auto';
      vid.muted = true; // Video element muted; audio handled via audio pool or sync
      vid.playsInline = true;
      this.videoElementPool.set(src, vid);
    }
    return this.videoElementPool.get(src)!;
  }

  // Retrieve or create a pooled audio element for background track playback
  public getAudioElement(src: string): HTMLAudioElement {
    if (!this.audioElementPool.has(src)) {
      const aud = document.createElement('audio');
      aud.crossOrigin = 'anonymous';
      aud.src = src;
      aud.preload = 'auto';
      this.audioElementPool.set(src, aud);
    }
    return this.audioElementPool.get(src)!;
  }

  // Clear pools to free RAM immediately
  public clearPools(): void {
    this.videoElementPool.forEach((vid) => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
    });
    this.videoElementPool.clear();

    this.audioElementPool.forEach((aud) => {
      aud.pause();
      aud.removeAttribute('src');
      aud.load();
    });
    this.audioElementPool.clear();
  }

  // Calculate rendering scale factor based on quality setting
  public getScaleFactor(quality: PreviewQuality): number {
    switch (quality) {
      case 'quarter':
        return 0.25;
      case 'half':
        return 0.5;
      case 'full':
        return 1.0;
      case 'auto':
      default:
        return this.currentEffectiveScale;
    }
  }

  // Render a complete timeline frame at time `currentTime` onto a 2D canvas
  public renderFrame({
    canvas,
    clips,
    currentTime,
    projectResolution,
    quality,
    isLowEndMode,
  }: {
    canvas: HTMLCanvasElement;
    clips: Clip[];
    currentTime: number;
    projectResolution: ProjectResolution;
    quality: PreviewQuality;
    isLowEndMode: boolean;
  }): void {
    const startTime = performance.now();
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let scale = this.getScaleFactor(quality);
    if (isLowEndMode && scale > 0.5) {
      scale = 0.5; // Cap in low-end PC mode
    }

    const targetW = Math.max(320, Math.round(projectResolution.width * scale));
    const targetH = Math.max(180, Math.round(projectResolution.height * scale));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // 1. Draw solid dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, targetW, targetH);

    // Filter active clips at currentTime sorted by track order:
    // Tracks order: video 1 -> video 2 -> captions -> overlay
    const activeClips = clips.filter(
      (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
    );

    // Sort order: video clips first, then text, then captions
    const sortedClips = [...activeClips].sort((a, b) => {
      const typeRank = (t: string) => (t === 'video' ? 1 : t === 'image' ? 2 : t === 'text' ? 3 : 4);
      return typeRank(a.type) - typeRank(b.type);
    });

    for (const clip of sortedClips) {
      ctx.save();

      // Opacity
      ctx.globalAlpha = Math.max(0, Math.min(1, clip.opacity));

      // Coordinate scaling relative to target resolution
      const canvasScaleX = targetW / projectResolution.width;
      const canvasScaleY = targetH / projectResolution.height;

      // Transform center
      const centerX = targetW / 2 + clip.transform.x * canvasScaleX;
      const centerY = targetH / 2 + clip.transform.y * canvasScaleY;

      ctx.translate(centerX, centerY);
      if (clip.transform.rotation !== 0) {
        ctx.rotate((clip.transform.rotation * Math.PI) / 180);
      }
      if (clip.transform.scale !== 1) {
        ctx.scale(clip.transform.scale, clip.transform.scale);
      }

      // Build CSS Filter string (skip if all default for speed)
      if (!isLowEndMode) {
        const filters: string[] = [];
        const eff = clip.effects;
        if (eff.brightness !== 0) filters.push(`brightness(${1 + eff.brightness / 100})`);
        if (eff.contrast !== 0) filters.push(`contrast(${1 + eff.contrast / 100})`);
        if (eff.saturation !== 0) filters.push(`saturate(${1 + eff.saturation / 100})`);
        if (eff.hue !== 0) filters.push(`hue-rotate(${eff.hue}deg)`);
        if (eff.grayscale > 0) filters.push(`grayscale(${eff.grayscale / 100})`);
        if (eff.blur > 0 && !isLowEndMode) filters.push(`blur(${eff.blur * scale}px)`);

        if (filters.length > 0) {
          ctx.filter = filters.join(' ');
        }
      }

      // Render based on clip type
      if (clip.type === 'video' && clip.src) {
        const mediaSource = clip.isProxyActive && clip.proxySrc ? clip.proxySrc : clip.src;
        const video = this.getVideoElement(mediaSource);

        const clipMediaTime = (currentTime - clip.startTime) * clip.speed + clip.sourceOffset;
        if (!isNaN(video.duration) && Math.abs(video.currentTime - clipMediaTime) > 0.08) {
          video.currentTime = Math.max(0, Math.min(video.duration, clipMediaTime));
        }

        const drawW = projectResolution.width * canvasScaleX;
        const drawH = projectResolution.height * canvasScaleY;

        try {
          ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
        } catch {
          // Fallback if video isn't ready
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        }
      } else if (clip.type === 'text' && clip.textProps) {
        this.renderTextClip(ctx, clip, canvasScaleX);
      } else if (clip.type === 'caption' && clip.captionProps) {
        this.renderCaptionClip(ctx, clip, currentTime, canvasScaleX);
      }

      ctx.restore();
    }

    // Dynamic scale adjustment in 'auto' mode
    const renderDuration = performance.now() - startTime;
    this.lastRenderTime = renderDuration;
    if (quality === 'auto') {
      if (renderDuration > 30 && this.currentEffectiveScale > 0.25) {
        this.currentEffectiveScale = 0.25; // drop to 1/4 quality for low-end PC
      } else if (renderDuration < 10 && this.currentEffectiveScale < 0.5) {
        this.currentEffectiveScale = 0.5; // restore to 1/2
      }
    }
  }

  // Render styled text overlays
  private renderTextClip(ctx: CanvasRenderingContext2D, clip: Clip, scale: number): void {
    const p = clip.textProps!;
    const fontSize = Math.round(p.fontSize * scale);
    ctx.font = `bold ${fontSize}px "${p.fontFamily}", sans-serif`;
    ctx.textAlign = p.textAlign;
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(p.text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    // Background pill/box if enabled
    if (p.backgroundColor && p.backgroundColor !== 'transparent') {
      ctx.fillStyle = p.backgroundColor;
      const padX = 14 * scale;
      const padY = 6 * scale;
      let boxX = -textWidth / 2 - padX;
      if (p.textAlign === 'left') boxX = -padX;
      if (p.textAlign === 'right') boxX = -textWidth - padX;

      ctx.fillRect(boxX, -textHeight / 2 - padY, textWidth + padX * 2, textHeight + padY * 2);
    }

    // Shadow
    if (p.shadowBlur > 0) {
      ctx.shadowColor = p.shadowColor || 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = p.shadowBlur * scale;
    }

    // Outline
    if (p.outlineWidth > 0 && p.outlineColor) {
      ctx.strokeStyle = p.outlineColor;
      ctx.lineWidth = p.outlineWidth * scale;
      ctx.strokeText(p.text, 0, 0);
    }

    // Fill Text
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, 0, 0);
  }

  // Render animated AI Captions (Karaoke highlight or Punchy social style)
  private renderCaptionClip(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    currentTime: number,
    scale: number
  ): void {
    const p = clip.captionProps!;
    const fontSize = Math.round(p.fontSize * scale);
    ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = p.words || [];
    const clipOffset = currentTime - clip.startTime;

    if (words.length > 0 && p.style === 'highlight') {
      // Word-by-word karaoke highlighting
      let totalWidth = 0;
      const wordMetrics = words.map((w) => {
        const m = ctx.measureText(w.word + ' ');
        totalWidth += m.width;
        return { ...w, width: m.width };
      });

      let currentX = -totalWidth / 2;

      // Draw background box
      ctx.fillStyle = p.backgroundColor || 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(
        -totalWidth / 2 - 12 * scale,
        -fontSize * 0.75,
        totalWidth + 24 * scale,
        fontSize * 1.5
      );

      for (const item of wordMetrics) {
        const isCurrent = clipOffset >= item.start && clipOffset <= item.end;
        ctx.fillStyle = isCurrent ? p.highlightColor || '#facc15' : p.color || '#ffffff';
        ctx.fillText(item.word, currentX + item.width / 2, 0);
        currentX += item.width;
      }
    } else {
      // Social Punch style: clean bold text with backdrop
      const metrics = ctx.measureText(p.text);
      const textW = metrics.width;

      if (p.style === 'social' || p.style === 'bold') {
        ctx.fillStyle = p.backgroundColor || 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(-textW / 2 - 12 * scale, -fontSize * 0.75, textW + 24 * scale, fontSize * 1.5);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.strokeText(p.text, 0, 0);
      }

      ctx.fillStyle = p.color || '#ffffff';
      ctx.fillText(p.text, 0, 0);
    }
  }

  // Generate lightweight 360p or 480p proxy video from high-res source
  public async generateProxy(
    sourceUrl: string,
    targetResolution: '360p' | '480p' = '360p',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = sourceUrl;
    video.muted = true;
    await new Promise((r) => {
      video.onloadedmetadata = r;
      video.onerror = r;
    });

    const targetH = targetResolution === '360p' ? 360 : 480;
    const aspect = (video.videoWidth || 16) / (video.videoHeight || 9);
    const targetW = Math.round(targetH * aspect);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 800000, // 800 kbps: very lightweight on HDD & RAM
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      };

      recorder.start();
      video.currentTime = 0;
      video.play().catch(() => {});

      const duration = Math.min(video.duration || 10, 60);
      const interval = setInterval(() => {
        if (video.currentTime >= duration || video.ended) {
          clearInterval(interval);
          video.pause();
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, targetW, targetH);
        if (onProgress && duration > 0) {
          onProgress(Math.min(100, Math.round((video.currentTime / duration) * 100)));
        }
      }, 1000 / 24);
    });
  }

  // Audio synchronization helper during timeline playback
  public syncAudio({
    clips,
    currentTime,
    isPlaying,
  }: {
    clips: Clip[];
    currentTime: number;
    isPlaying: boolean;
  }): void {
    const audioClips = clips.filter((c) => c.type === 'audio' && !c.muted);

    audioClips.forEach((clip) => {
      if (!clip.src) return;
      const audio = this.getAudioElement(clip.src);

      const isWithinClip =
        currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration;

      if (isPlaying && isWithinClip) {
        const desiredAudioTime =
          (currentTime - clip.startTime) * clip.speed + clip.sourceOffset;

        if (Math.abs(audio.currentTime - desiredAudioTime) > 0.15) {
          audio.currentTime = desiredAudioTime;
        }

        audio.volume = Math.max(0, Math.min(1, clip.volume));
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    });
  }

  // Stop all playing audio elements
  public pauseAllAudio(): void {
    this.audioElementPool.forEach((aud) => {
      if (!aud.paused) aud.pause();
    });
  }
}

export const mediaEngine = new MediaEngine();
