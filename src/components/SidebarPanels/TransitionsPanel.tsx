import React from 'react';
import { Split, Sparkles, Check } from 'lucide-react';
import { TRANSITION_TYPES } from '../../constants/presets';

interface TransitionsPanelProps {
  onApplyTransition: (transitionId: string) => void;
  selectedClipId: string | null;
}

export const TransitionsPanel: React.FC<TransitionsPanelProps> = ({
  onApplyTransition,
  selectedClipId,
}) => {
  return (
    <div className="h-full flex flex-col p-3 bg-neutral-900/60 overflow-y-auto select-none text-xs">
      <div className="pb-2.5 border-b border-neutral-800">
        <h2 className="font-semibold text-white uppercase tracking-wider">Transitions</h2>
        <span className="text-[10px] text-neutral-400">Low-overhead software blends</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-neutral-300">
          {selectedClipId ? 'Click transition to apply to selected clip' : 'Select a clip to apply'}
        </span>
        {TRANSITION_TYPES.map((tr) => (
          <button
            key={tr.id}
            onClick={() => onApplyTransition(tr.id)}
            disabled={!selectedClipId}
            className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
              selectedClipId
                ? 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 hover:border-cyan-500/50 cursor-pointer'
                : 'bg-neutral-900/50 border-neutral-850 opacity-50 cursor-not-allowed'
            }`}
          >
            <div>
              <p className="font-medium text-neutral-200">{tr.name}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{tr.description}</p>
            </div>
            <Split className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
