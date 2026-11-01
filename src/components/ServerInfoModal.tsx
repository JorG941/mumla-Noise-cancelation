import React from 'react';
import { Info, Shield, Radio, Activity, Cpu, Wifi, X } from 'lucide-react';
import { Server } from '../types';

interface ServerInfoModalProps {
  server: Server;
  onClose: () => void;
  latency: number;
}

export const ServerInfoModal: React.FC<ServerInfoModalProps> = ({
  server,
  onClose,
  latency,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-mumble-500/10 text-mumble-400 rounded-lg">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Server Information</h3>
              <p className="text-xs text-slate-400">{server.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Grid */}
        <div className="space-y-3">
          {/* Host & Latency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>Host &amp; Port</span>
              </div>
              <div className="mt-1 font-mono text-xs text-slate-200 truncate">
                {server.host}:{server.port}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Latency</span>
              </div>
              <div className="mt-1 font-mono text-xs text-emerald-400 font-bold">
                {latency.toFixed(1)} ms
              </div>
            </div>
          </div>

          {/* Cryptographic Security Details (Mumble standard) */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Encryption &amp; Security</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Control Channel</div>
                <div className="text-slate-200 font-mono text-[11px] mt-0.5">TLS 1.3 / AES-256-SHA</div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Voice Channel</div>
                <div className="text-slate-200 font-mono text-[11px] mt-0.5">OCB-AES-128 / UDP</div>
              </div>
            </div>
          </div>

          {/* Audio Engine & Protocol Details */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-mumble-400" />
              <span>Audio Bandwidth &amp; Codec</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[11px]">Codec:</span>
                <span className="text-slate-200 font-mono ml-2">Opus 48.0 kHz</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Protocol:</span>
                <span className="text-slate-200 font-mono ml-2">Mumble v1.4.2</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Current:</span>
                <span className="text-slate-200 font-mono ml-2">40.0 kbit/s</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Maximum:</span>
                <span className="text-slate-200 font-mono ml-2">96.0 kbit/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
