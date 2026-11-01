import React from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { HotCornerPosition } from '../types';

interface HotCornerPttProps {
  position: HotCornerPosition;
  isTransmitting: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  onPttStart: () => void;
  onPttEnd: () => void;
}

export const HotCornerPtt: React.FC<HotCornerPttProps> = ({
  position,
  isTransmitting,
  isMuted,
  isDeafened,
  onPttStart,
  onPttEnd,
}) => {
  if (position === 'none') return null;

  const disabled = isMuted || isDeafened;

  let posClasses = '';
  switch (position) {
    case 'topLeft':
      posClasses = 'top-4 left-4';
      break;
    case 'topRight':
      posClasses = 'top-4 right-4';
      break;
    case 'bottomLeft':
      posClasses = 'bottom-6 left-4';
      break;
    case 'bottomRight':
      posClasses = 'bottom-6 right-4';
      break;
  }

  return (
    <div className={`fixed z-40 ${posClasses}`}>
      <button
        onPointerDown={(e) => {
          if (disabled) return;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          onPttStart();
        }}
        onPointerUp={(e) => {
          if (disabled) return;
          try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (_) {}
          onPttEnd();
        }}
        onPointerCancel={onPttEnd}
        disabled={disabled}
        title="Hot Corner Push-to-Talk"
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          disabled
            ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed border border-slate-700'
            : isTransmitting
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/50 scale-110 shadow-emerald-600/50'
            : 'bg-mumble-600 hover:bg-mumble-500 text-white border-2 border-white/20 active:scale-95'
        }`}
      >
        {isTransmitting ? (
          <Volume2 className="w-7 h-7 animate-pulse" />
        ) : (
          <Mic className="w-7 h-7" />
        )}
      </button>
    </div>
  );
};
