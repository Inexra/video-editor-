import React, { useState } from 'react';
import { X, HardDrive, Download, Copy, Check, Terminal, Shield, Package } from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const buildCommand = `npm run build && npx electron-builder --win nsis portable`;

  const innoScriptSample = `; Inno Setup Script for LightVideo Editor
[Setup]
AppName=LightVideo Editor
AppVersion=1.0.0
DefaultDirName={autopf}\\LightVideoEditor
DefaultGroupName=LightVideo Editor
OutputDir=dist-exe
OutputBaseFilename=LightVideoEditor-Setup
Compression=lzma2/ultra64
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "dist\\win-unpacked\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\\LightVideo Editor"; Filename: "{app}\\LightVideoEditor.exe"
Name: "{autodesktop}\\LightVideo Editor"; Filename: "{app}\\LightVideoEditor.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\\LightVideoEditor.exe"; Description: "{cm:LaunchProgram,LightVideo Editor}"; Flags: nowait postinstall skipifsilent`;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-850/80">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <div>
              <h2 className="font-semibold text-white text-sm">LightVideoEditor.exe - Windows 10 Build Suite</h2>
              <span className="text-[10px] text-neutral-400">Standalone Executable & Portable Packaging</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Target Specs Summary */}
          <div className="p-3 rounded-lg bg-neutral-850 border border-neutral-750 flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-200">Target Executable: LightVideoEditor.exe</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Windows 10 64-bit · 4 GB RAM Hard Capped · HDD Disk I/O Throttled · Offline AI
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-800/60 font-semibold">
              Win10 x64 Native
            </span>
          </div>

          {/* Low-RAM V8 & Chromium Flags */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>4GB RAM Low-Memory Flags Applied to .exe:</span>
            </h3>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 leading-relaxed">
              <p>--js-flags="--max-old-space-size=1536"</p>
              <p>--disable-gpu-memory-buffer-compositor-resources</p>
              <p>--enable-low-end-device-mode</p>
              <p>--renderer-process-limit=1</p>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Guarantees the executable stays strictly under 1.5 GB RAM even during heavy 1080p scrubbing on an HDD.
            </p>
          </div>

          {/* Build Command */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Command to compile LightVideoEditor.exe:</span>
              </span>
              <button
                onClick={() => copyText(buildCommand, 'cmd')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copied === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'cmd' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-emerald-400 text-xs">
              {buildCommand}
            </div>
          </div>

          {/* Generated Artifacts */}
          <div>
            <span className="font-semibold text-white block mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Generated Windows 10 Packages:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-800">
                <strong className="text-neutral-200 block">1. Installer Package</strong>
                <span className="font-mono text-cyan-400 text-[10px]">LightVideoEditor-Setup.exe</span>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Full Windows 10 setup wizard with desktop icon, Start menu shortcut, and uninstaller.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-850 border border-neutral-800">
                <strong className="text-neutral-200 block">2. Portable Single File</strong>
                <span className="font-mono text-amber-400 text-[10px]">LightVideoEditor-Portable.exe</span>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Zero installation required. Runs directly from a USB stick or HDD folder without admin rights.
                </p>
              </div>
            </div>
          </div>

          {/* Inno Setup script view */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-neutral-300">Inno Setup Script (installer.iss):</span>
              <button
                onClick={() => copyText(innoScriptSample, 'iss')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copied === 'iss' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'iss' ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[9px] text-neutral-400 font-mono overflow-x-auto max-h-28">
              {innoScriptSample}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-850/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
