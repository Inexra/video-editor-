# LightVideo Editor

LightVideo Editor is a high-performance, lightweight AI-powered desktop video editor engineered specifically for low-end computers running Windows 10 64-bit with 4 GB RAM and conventional Hard Disk Drives (HDD).

---

## 1. System Requirements

### Target Hardware (Tested & Supported)
* **Operating System**: Windows 10 64-bit (or Windows 11)
* **RAM**: 4 GB RAM (typically ~1.5 GB - 2.5 GB free during editing)
* **CPU**: Low-end dual-core or quad-core processor (e.g. Intel Celeron, Pentium, Core i3, AMD Athlon/Ryzen 3)
* **Storage**: 5400/7200 RPM Hard Disk Drive (HDD) or SSD
* **Graphics**: Integrated Graphics (Intel HD/UHD Graphics, AMD Radeon Vega) - No dedicated GPU required

---

## 2. Performance Architecture

1. **Proxy Editing Engine (360p / 480p)**
   - High-resolution footage (1080p, 1440p, 4K) is downscaled into a lightweight proxy stream for instant timeline scrubbing without dropping frames.
   - The final export renders against the original full-quality assets.

2. **Chunked Streaming & Low RAM Footprint**
   - Media files are referenced via streaming blob handles rather than loading uncompressed frames into RAM.
   - Video buffers are recycled through an element pool.
   - The process memory is capped to prevent Windows swapping churn on an HDD.

3. **Subsampled Waveform Extraction**
   - Audio waveforms are computed as sparse peak arrays (~2 KB per clip) rather than multi-megabyte raw float buffers.

4. **Dedicated "Low-End PC Mode"**
   - Auto-enabled when low memory is detected.
   - Forces 1/4 preview resolution, clamps preview FPS, and disables heavy preview-time filters.

---

## 3. How to Build the Standalone `.exe` (`LightVideoEditor.exe`)

The application can be compiled directly into a standalone Windows 10 `.exe` executable or packaged installer.

### Prerequisites
* Node.js 18+ installed on Windows 10

### Step-by-Step Compilation:

```bash
# 1. Install dependencies
npm install

# 2. Build the optimized React production bundle
npm run build

# 3. Package into Windows 10 x64 standalone executable & installer
npx electron-builder --win nsis portable
```

### Outputs Generated:
* **Standalone Portable `.exe`**: `dist/LightVideoEditor-Portable.exe` (Runs directly without installation)
* **Setup Installer**: `dist/LightVideoEditor-Setup.exe` (Standard Windows 10 wizard)
* **Unpacked Executable**: `dist/win-unpacked/LightVideoEditor.exe`

---

## 4. Key Features

* **Multi-Track Timeline**: Video tracks, audio tracks, text overlays, and AI subtitle tracks with pixel-accurate scrubbing, trimming, cutting, and splitting.
* **AI Auto-Captions**: Built-in speech cadence detection generating synchronized subtitle blocks with styles (Karaoke highlight, TikTok punch, minimal). Exportable as `.SRT`, `.VTT`, or `.TXT`.
* **AI Clipper (Shorts & Reels)**: Automatically analyzes long videos for high-energy hooks and generates curated 15s/30s/60s vertical clips.
* **Canvas Preview Player**: Smooth playback with adaptive quality scaling (1/4, 1/2, Full, Auto).
* **Color & Transform Controls**: Scale, position, rotation, opacity, crop, brightness, contrast, saturation, and vignette.
* **Crash Recovery & Auto-Save**: Snapshots saved every 60 seconds to protect against power loss or crashes.
* **HDD Cache Manager**: User-configurable disk cache limit (1GB, 2GB, 5GB) to ensure hard drives are never filled.

---

## 5. Troubleshooting Guide

* **"High memory usage detected" warning**:
  - Click the banner or navigate to `Tools -> Performance Monitor` and click "Flush Inactive Video Buffers".
  - Ensure "Low-End PC Mode" is enabled.
* **Timeline lagging on 1080p/4K files**:
  - In the Media tab, toggle "Use Proxy (360p)".
* **Audio playback out of sync**:
  - Set preview quality to `1/4 (Low RAM)` to allow CPU render frames to match audio clock.
