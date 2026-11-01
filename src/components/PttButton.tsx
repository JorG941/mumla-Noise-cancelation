import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { InputMethod } from '../types';

interface PttButtonProps {
  inputMethod: InputMethod;
  isTransmitting: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  toggleMode: boolean;
  buttonHeight: number;
  hidePtt: boolean;
  currentVolume: number;
  onPttStart: () => void;
  onPttEnd: () => void;
  onPttToggle: () => void;
}

export const PttButton: React.FC<PttButtonProps> = ({
  inputMethod,
  isTransmitting,
  isMuted,
  isDeafened,
  toggleMode,
  buttonHeight,
  hidePtt,
  currentVolume,
  onPttStart,
  onPttEnd,
  onPttToggle,
}) => {
  if (hidePtt || inputMethod !== 'ptt') {
    return null;
  }

  const disabled = isMuted || isDeafened;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (toggleMode) {
      onPttToggle();
    } else {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onPttStart();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled || toggleMode) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
    onPttEnd();
  };

  const handlePointerCancel = () => {
    if (disabled || toggleMode) return;
    onPttEnd();
  };

  return (
    <div className="w-full select-none px-3 pb-3 bg-slate-900 border-t border-slate-800/80">
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        disabled={disabled}
        style={{ height: `${Math.max(48, Math.min(120, buttonHeight))}px` }}
        className={`w-full relative overflow-hidden rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-150 flex items-center justify-center space-x-3 shadow-lg active:scale-[0.99] ${
          disabled
            ? 'bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            : isTransmitting
            ? 'bg-emerald-600 text-white shadow-emerald-600/40 ring-4 ring-emerald-500/30'
            : 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 shadow-slate-950/40'
        }`}
      >
        {/* Realtime volume level overlay bar when transmitting */}
        {isTransmitting && (
          <div 
            className="absolute left-0 bottom-0 top-0 bg-emerald-500/30 transition-all duration-75 pointer-events-none"
            style={{ width: `${Math.min(100, currentVolume * 1.5)}%` }}
          />
        )}

        <div className="relative z-10 flex items-center space-x-2">
          {disabled ? (
            <MicOff className="w-5 h-5 text-slate-500" />
          ) : isTransmitting ? (
            <Volume2 className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Mic className="w-5 h-5 text-slate-400" />
          )}

          <span>
            {disabled 
              ? (isDeafened ? 'Deafened' : 'Muted') 
              : isTransmitting 
              ? 'Transmitting Voice' 
              : toggleMode 
              ? 'Push to Talk (Toggle)' 
              : 'Hold to Talk (PTT)'
            }
          </span>
        </div>
      </button>
    </div>
  );
};
