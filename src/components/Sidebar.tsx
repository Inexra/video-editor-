import React from 'react';
import {
  Film,
  Music,
  Type,
  Split,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';

export type SidebarTab =
  | 'media'
  | 'audio'
  | 'text'
  | 'transitions'
  | 'effects'
  | 'ai'
  | 'stickers';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'media', label: 'Media', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'transitions', label: 'Transitions', icon: Split },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'ai', label: 'AI Tools', icon: Bot },
    { id: 'stickers', label: 'Stickers', icon: Layers },
  ] as const;


  return (
    <div className="w-14 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-2 select-none shrink-0 z-20">
      <div className="flex flex-col items-center gap-1.5 w-full px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as SidebarTab)}
              className={`w-full py-2.5 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] transition-colors relative ${
                isActive
                  ? 'bg-neutral-800 text-cyan-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
              }`}
              title={tab.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r" />
              )}
              <Icon className="w-4 h-4" />
              <span className="leading-none text-[9px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
