import { Clip, MediaItem } from '../types/editor';

/**
 * Creates lightweight procedural video/audio clips using HTML5 canvas and Web Audio.
 * Keeps memory overhead under 5 MB total, ideal for testing 4GB RAM environments.
 */

// Generate a procedural video clip with moving gradients, shapes, and timecode
export function generateSyntheticVideoBlob(
  title: string,
  bgColor1: string,
  bgColor2: string,
  durationSec: number = 8
): Promise<{ url: string; duration: number }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      resolve({ url, duration: durationSec });
    };

    mediaRecorder.start();

    const totalFrames = durationSec * 30;
    let frame = 0;

    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const t = frame / 30;
      // Draw smooth moving gradient
      const grad = ctx.createLinearGradient(
        0,
        0,
        canvas.width + Math.sin(t) * 100,
        canvas.height + Math.cos(t) * 100
      );
      grad.addColorStop(0, bgColor1);
      grad.addColorStop(1, bgColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving geometric light orb
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      const orbX = (canvas.width / 2) + Math.cos(t * 1.5) * 150;
      const orbY = (canvas.height / 2) + Math.sin(t * 2) * 60;
      ctx.arc(orbX, orbY, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Title & frame display
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '14px monospace';
      ctx.fillText(`00:0${Math.floor(t)}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')} · 640x360 Proxy Ready`, canvas.width / 2, canvas.height / 2 + 25);

      frame++;
    }, 1000 / 30);
  });
}

// Generate a procedural audio tone / melody for testing waveforms
export function generateSyntheticAudioBlob(durationSec: number = 10): Promise<{ url: string; waveform: number[] }> {
  return new Promise((resolve) => {
    const sampleRate = 22050; // Low sample rate for low RAM
    const length = sampleRate * durationSec;
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
      sampleRate,
    });
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const waveform: number[] = [];
    const step = Math.floor(length / 60);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Gentle ambient chords: root + 5th with low frequency pulse
      const wave =
        Math.sin(2 * Math.PI * 220 * t) * 0.2 +
        Math.sin(2 * Math.PI * 330 * t) * 0.15 * Math.sin(t * 1.5) +
        Math.sin(2 * Math.PI * 110 * t) * 0.25;
      data[i] = wave;
      if (i % step === 0 && waveform.length < 60) {
        waveform.push(Math.min(1, Math.abs(wave) * 1.8));
      }
    }

    // Convert buffer to wav blob
    const wavBlob = audioBufferToWav(buffer);
    const url = URL.createObjectURL(wavBlob);
    resolve({ url, waveform });
  });
}

// Minimal AudioBuffer to WAV encoder
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  out.setUint32(pos, 0x46464952, false); pos += 4;
  setUint32(length - 8);
  out.setUint32(pos, 0x45564157, false); pos += 4;
  // FMT sub-chunk
  out.setUint32(pos, 0x20746d66, false); pos += 4;
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  // data sub-chunk
  out.setUint32(pos, 0x61746164, false); pos += 4;
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

// Generate standard default project starter clips
export async function createInitialProjectClips(): Promise<{ clips: Clip[]; mediaItems: MediaItem[] }> {
  // Generate sample media items
  const v1 = await generateSyntheticVideoBlob('Cinematic Coastline', '#1e293b', '#0f766e', 8);
  const v2 = await generateSyntheticVideoBlob('Urban Timelapse', '#1e1b4b', '#4338ca', 7);
  const a1 = await generateSyntheticAudioBlob(15);

  const mediaItems: MediaItem[] = [
    {
      id: 'm1',
      name: 'Coastline_4K_Sample.mp4',
      type: 'video',
      src: v1.url,
      proxySrc: v1.url,
      duration: 8,
      width: 1920,
      height: 1080,
      isProxyReady: true,
      fileSize: 4500000,
    },
    {
      id: 'm2',
      name: 'Urban_B_Roll.mp4',
      type: 'video',
      src: v2.url,
      proxySrc: v2.url,
      duration: 7,
      width: 1920,
      height: 1080,
      isProxyReady: true,
      fileSize: 3800000,
    },
    {
      id: 'm3',
      name: 'Acoustic_Soundtrack.wav',
      type: 'audio',
      src: a1.url,
      duration: 15,
      waveform: a1.waveform,
      fileSize: 1200000,
    },
  ];

  const clips: Clip[] = [
    {
      id: 'clip-v1',
      name: 'Coastline_4K_Sample.mp4',
      type: 'video',
      trackId: 'v1',
      startTime: 0,
      duration: 6,
      sourceOffset: 0,
      sourceDuration: 8,
      src: v1.url,
      proxySrc: v1.url,
      isProxyActive: true,
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
      crop: { x: 0, y: 0, width: 1, height: 1 },
      effects: {
        brightness: 5,
        contrast: 10,
        saturation: 15,
        hue: 0,
        exposure: 0,
        temperature: 0,
        blur: 0,
        vignette: 10,
        grayscale: 0,
      },
      keyframes: [],
      colorTag: '#0284c7',
    },
    {
      id: 'clip-v2',
      name: 'Urban_B_Roll.mp4',
      type: 'video',
      trackId: 'v1',
      startTime: 6,
      duration: 6,
      sourceOffset: 0,
      sourceDuration: 7,
      src: v2.url,
      proxySrc: v2.url,
      isProxyActive: true,
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
      crop: { x: 0, y: 0, width: 1, height: 1 },
      effects: {
        brightness: 0,
        contrast: 5,
        saturation: 5,
        hue: 0,
        exposure: 0,
        temperature: -5,
        blur: 0,
        vignette: 0,
        grayscale: 0,
      },
      keyframes: [],
      colorTag: '#6366f1',
    },
    {
      id: 'clip-text-1',
      name: 'Title: LightVideo Intro',
      type: 'text',
      trackId: 'v2',
      startTime: 0.5,
      duration: 3.5,
      sourceOffset: 0,
      sourceDuration: 3.5,
      src: '',
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: -40, scale: 1, rotation: 0 },
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
      textProps: {
        text: 'LIGHTVIDEO EDITOR',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 38,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        outlineColor: '#0284c7',
        outlineWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowBlur: 8,
        textAlign: 'center',
        animation: 'pop',
      },
      keyframes: [],
      colorTag: '#ec4899',
    },
    {
      id: 'clip-caption-1',
      name: 'AI Caption 1',
      type: 'caption',
      trackId: 'sub',
      startTime: 1.0,
      duration: 3.0,
      sourceOffset: 0,
      sourceDuration: 3.0,
      src: '',
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 110, scale: 1, rotation: 0 },
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
      captionProps: {
        text: 'Ultra-fast video editing on 4 GB RAM',
        words: [
          { word: 'Ultra-fast', start: 0, end: 0.6 },
          { word: 'video', start: 0.6, end: 1.2 },
          { word: 'editing', start: 1.2, end: 1.8 },
          { word: 'on', start: 1.8, end: 2.2 },
          { word: '4', start: 2.2, end: 2.5 },
          { word: 'GB', start: 2.5, end: 2.8 },
          { word: 'RAM', start: 2.8, end: 3.0 },
        ],
        style: 'social',
        fontSize: 26,
        color: '#ffffff',
        highlightColor: '#facc15',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
      },
      keyframes: [],
      colorTag: '#eab308',
    },
    {
      id: 'clip-caption-2',
      name: 'AI Caption 2',
      type: 'caption',
      trackId: 'sub',
      startTime: 4.5,
      duration: 3.5,
      sourceOffset: 0,
      sourceDuration: 3.5,
      src: '',
      volume: 1,
      speed: 1,
      muted: false,
      opacity: 1,
      transform: { x: 0, y: 110, scale: 1, rotation: 0 },
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
      captionProps: {
        text: 'Automatic Proxy & Real-time AI Captions',
        words: [
          { word: 'Automatic', start: 0, end: 0.8 },
          { word: 'Proxy', start: 0.8, end: 1.4 },
          { word: '&', start: 1.4, end: 1.7 },
          { word: 'Real-time', start: 1.7, end: 2.5 },
          { word: 'AI', start: 2.5, end: 2.9 },
          { word: 'Captions', start: 2.9, end: 3.5 },
        ],
        style: 'social',
        fontSize: 26,
        color: '#ffffff',
        highlightColor: '#38bdf8',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
      },
      keyframes: [],
      colorTag: '#eab308',
    },
    {
      id: 'clip-a1',
      name: 'Acoustic_Soundtrack.wav',
      type: 'audio',
      trackId: 'a1',
      startTime: 0,
      duration: 12,
      sourceOffset: 0,
      sourceDuration: 15,
      src: a1.url,
      volume: 0.85,
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
      waveform: a1.waveform,
      colorTag: '#10b981',
    },
  ];

  return { clips, mediaItems };
}
