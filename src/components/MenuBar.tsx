import React, { useState, useRef, useEffect } from 'react';
import {
  FileVideo,
  Save,
  FolderOpen,
  Settings,
  Scissors,
  RotateCcw,
  RotateCw,
  Sparkles,
  Sliders,
  Download,
  HelpCircle,
  HardDrive,
  Cpu,
  Monitor,
  Eye,
  Trash2,
} from 'lucide-react';

interface MenuBarProps {
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onExportProjectFile: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenProjectSettingsModal: () => void;
  onOpenWindowsExeModal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSplitClip: () => void;
  onDeleteClip: () => void;
  onRippleDelete: () => void;
  onTriggerAiCaptions: () => void;
  onTriggerAiClipper: () => void;
  previewQuality: string;
  onChangePreviewQuality: (q: 'quarter' | 'half' | 'full' | 'auto') => void;
  isLowEndMode: boolean;
  onToggleLowEndMode: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNewProject,
  onOpenProject,
  onSaveProject,
  onExportProjectFile,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenProjectSettingsModal,
  onOpenWindowsExeModal,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSplitClip,
  onDeleteClip,
  onRippleDelete,
  onTriggerAiCaptions,
  onTriggerAiClipper,
  previewQuality,
  onChangePreviewQuality,
  isLowEndMode,
  onToggleLowEndMode,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  return (
    <div
      ref={menuRef}
      className="h-8 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between px-3 text-xs select-none relative z-40 text-neutral-300"
    >
      {/* Menu items */}
      <div className="flex items-center gap-1">
        {/* FILE */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('file')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'file' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 top-full mt-0.5 w-52 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => { onNewProject(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>New Project</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+N</span>
              </button>
              <button
                onClick={() => { onOpenProject(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Open Project (.lvproj)</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+O</span>
              </button>
              <div className="h-px bg-neutral-750 my-1" />
              <button
                onClick={() => { onSaveProject(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Save Project</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+S</span>
              </button>
              <button
                onClick={() => { onExportProjectFile(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Export Project File</span>
                <span className="text-neutral-500 text-[10px]">.lvproj</span>
              </button>
              <div className="h-px bg-neutral-750 my-1" />
              <button
                onClick={() => { onOpenSettingsModal(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Settings</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+,</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('edit')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'edit' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-0.5 w-52 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <button
                disabled={!canUndo}
                onClick={() => { onUndo(); setActiveMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  canUndo ? 'hover:bg-neutral-750' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span>Undo</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+Z</span>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => { onRedo(); setActiveMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  canRedo ? 'hover:bg-neutral-750' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span>Redo</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+Y</span>
              </button>
              <div className="h-px bg-neutral-750 my-1" />
              <button
                onClick={() => { onSplitClip(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Split at Playhead</span>
                <span className="text-neutral-500 text-[10px]">S</span>
              </button>
              <button
                onClick={() => { onDeleteClip(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Delete Clip</span>
                <span className="text-neutral-500 text-[10px]">Del</span>
              </button>
              <button
                onClick={() => { onRippleDelete(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Ripple Delete</span>
                <span className="text-neutral-500 text-[10px]">Shift+Del</span>
              </button>
            </div>
          )}
        </div>

        {/* PROJECT */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('project')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'project' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            Project
          </button>
          {activeMenu === 'project' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => { onOpenProjectSettingsModal(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Resolution & Frame Rate</span>
                <span className="text-neutral-500 text-[10px]">1080p 30fps</span>
              </button>
              <button
                onClick={() => { onToggleLowEndMode(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Low-End PC Mode (4GB)</span>
                <span className="text-cyan-400 text-[10px] font-medium">{isLowEndMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>

        {/* AI TOOLS */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('ai')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'ai' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            AI
          </button>
          {activeMenu === 'ai' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => { onTriggerAiCaptions(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>AI Auto-Captions</span>
                <span className="text-amber-400 text-[10px]">Local / Fast</span>
              </button>
              <button
                onClick={() => { onTriggerAiClipper(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>AI Clipper (Shorts & Reels)</span>
                <span className="text-cyan-400 text-[10px]">Highlight</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('view')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'view' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 top-full mt-0.5 w-52 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] text-neutral-500 font-semibold tracking-wider">
                PREVIEW QUALITY
              </div>
              {(['quarter', 'half', 'full', 'auto'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => { onChangePreviewQuality(q); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
                >
                  <span className="capitalize">{q === 'quarter' ? '1/4 (Low RAM)' : q === 'half' ? '1/2' : q === 'full' ? 'Full Quality' : 'Auto (Adaptive)'}</span>
                  {previewQuality === q && <span className="text-cyan-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EXPORT */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('export')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeMenu === 'export' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            Export
          </button>
          {activeMenu === 'export' && (
            <div className="absolute left-0 top-full mt-0.5 w-52 bg-neutral-850 border border-neutral-700/80 rounded shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => { onOpenExportModal(); setActiveMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-750 flex items-center justify-between"
              >
                <span>Export Video...</span>
                <span className="text-neutral-500 text-[10px]">Ctrl+E</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Quick Actions: Export Video Primary CTA */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExportModal}
          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Export Video</span>
        </button>
      </div>
    </div>
  );
};
