import React from 'react';
import { 
  FolderTree, 
  Pin, 
  Info, 
  KeyRound, 
  Star, 
  Globe, 
  Settings as SettingsIcon, 
  LogOut, 
  X, 
  Radio,
  Server as ServerIcon,
  ShieldCheck
} from 'lucide-react';
import { DrawerNavigation, Server } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: DrawerNavigation;
  onNavigate: (item: DrawerNavigation) => void;
  connectedServer: Server | null;
  onDisconnect: () => void;
  latency?: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeItem,
  onNavigate,
  connectedServer,
  onDisconnect,
  latency,
}) => {
  if (!isOpen) return null;

  const isConnected = !!connectedServer;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl">
        {/* Header / Connected Server Status */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-mumble-600 rounded-lg text-white shadow-lg shadow-mumble-600/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">Mumla</h1>
                <p className="text-xs text-slate-400">Mumble Voice &amp; Noise Cancel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection status card */}
          <div className={`mt-3 p-3 rounded-lg border text-sm ${
            isConnected 
              ? 'bg-slate-900/90 border-emerald-500/30' 
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isConnected ? 'Connected Server' : 'Connection Status'}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isConnected ? 'ONLINE' : 'DISCONNECTED'}
              </span>
            </div>
            <div className="mt-1 font-medium text-slate-100 truncate">
              {isConnected ? connectedServer.name : 'Not Connected'}
            </div>
            {isConnected && (
              <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{connectedServer.host}:{connectedServer.port}</span>
                {latency !== undefined && (
                  <span className="text-emerald-400 font-mono shrink-0 ml-2">{latency} ms</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Group 1: Connected Server Modules */}
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Connected Session
          </div>

          <button
            onClick={() => { onNavigate('all_channels'); onClose(); }}
            disabled={!isConnected}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !isConnected
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeItem === 'all_channels'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4 shrink-0" />
            <span>All Channels</span>
          </button>

          <button
            onClick={() => { onNavigate('pinned_channels'); onClose(); }}
            disabled={!isConnected}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !isConnected
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeItem === 'pinned_channels'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Pin className="w-4 h-4 shrink-0" />
            <span>Pinned Channels</span>
          </button>

          <button
            onClick={() => { onNavigate('server_info'); onClose(); }}
            disabled={!isConnected}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !isConnected
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeItem === 'server_info'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>Server Information</span>
          </button>

          <button
            onClick={() => { onNavigate('access_tokens'); onClose(); }}
            disabled={!isConnected}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !isConnected
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeItem === 'access_tokens'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Access Tokens</span>
          </button>

          {/* Group 2: Servers */}
          <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Servers
          </div>

          <button
            onClick={() => { onNavigate('favourites'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeItem === 'favourites'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => { onNavigate('public_servers'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeItem === 'public_servers'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0 text-sky-400" />
            <span>Public Servers</span>
          </button>

          {/* Group 3: General */}
          <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            General
          </div>

          <button
            onClick={() => { onNavigate('settings'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeItem === 'settings'
                ? 'bg-mumble-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Audio &amp; Settings</span>
          </button>
        </div>

        {/* Footer: Disconnect */}
        {isConnected && (
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to disconnect from ${connectedServer.name}?`)) {
                  onDisconnect();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
