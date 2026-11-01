import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Mic, 
  MicOff, 
  Headphones, 
  Radio, 
  Plus, 
  Star, 
  Globe, 
  Sliders, 
  LogOut, 
  Activity, 
  Zap,
  Volume2,
  FolderTree,
  Pin
} from 'lucide-react';
import { 
  Channel, 
  ChatMessage, 
  DrawerNavigation, 
  Server, 
  SettingsState, 
  TalkState, 
  User 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_SERVERS, 
  loadFavourites, 
  loadSettings, 
  loadTokens, 
  saveFavourites, 
  saveSettings, 
  saveTokens 
} from './services/storage';
import { 
  INITIAL_CHANNELS, 
  INITIAL_MESSAGES, 
  INITIAL_USERS 
} from './services/mumbleSession';
import { PUBLIC_MUMBLE_SERVERS } from './services/mockPublicServers';
import { AudioEngine } from './services/audioEngine';

// Components
import { NavigationDrawer } from './components/NavigationDrawer';
import { ChannelView } from './components/ChannelView';
import { FavouriteServers } from './components/FavouriteServers';
import { PublicServers } from './components/PublicServers';
import { SettingsModal } from './components/SettingsModal';
import { ServerInfoModal } from './components/ServerInfoModal';
import { AccessTokensModal } from './components/AccessTokensModal';
import { UserCommentModal } from './components/UserCommentModal';
import { ChannelEditModal } from './components/ChannelEditModal';
import { ChannelDescModal } from './components/ChannelDescModal';
import { HotCornerPtt } from './components/HotCornerPtt';

export function App() {
  // Persistent State
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [favouriteServers, setFavouriteServers] = useState<Server[]>(loadFavourites);
  const [accessTokens, setAccessTokens] = useState<string[]>(loadTokens);

  // Connection State
  const [connectedServer, setConnectedServer] = useState<Server | null>(favouriteServers[0] || null);
  const [currentChannelId, setCurrentChannelId] = useState<number>(1);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [latency, setLatency] = useState<number>(24);

  // Audio & Talk State
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  // Navigation & Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<DrawerNavigation>('all_channels');

  // Modals
  const [showServerInfo, setShowServerInfo] = useState(false);
  const [showAccessTokens, setShowAccessTokens] = useState(false);
  const [selectedUserForComment, setSelectedUserForComment] = useState<User | null>(null);
  const [channelEditTarget, setChannelEditTarget] = useState<{ channel?: Channel; parentId?: number } | null>(null);
  const [channelDescTarget, setChannelDescTarget] = useState<Channel | null>(null);

  // Audio Engine Ref
  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize Audio Engine
  useEffect(() => {
    const engine = new AudioEngine(settings);
    engine.setCallbacks(
      (vol) => setCurrentVolume(vol),
      (talkState) => {
        setIsTransmitting(talkState === 'talking');
        setUsers((prev) =>
          prev.map((u) => (u.isCurrentUser ? { ...u, talkState } : u))
        );
      }
    );
    audioEngineRef.current = engine;

    return () => {
      engine.stopMicrophone();
    };
  }, []);

  // Sync settings with audio engine & persistence
  useEffect(() => {
    saveSettings(settings);
    if (audioEngineRef.current) {
      audioEngineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Sync favorites & tokens
  useEffect(() => {
    saveFavourites(favouriteServers);
  }, [favouriteServers]);

  useEffect(() => {
    saveTokens(accessTokens);
  }, [accessTokens]);

  // Update current user name when defaultUsername changes
  useEffect(() => {
    setUsers((prev) =>
      prev.map((u) => (u.isCurrentUser ? { ...u, name: settings.defaultUsername } : u))
    );
  }, [settings.defaultUsername]);

  // Latency jitter interval
  useEffect(() => {
    if (!connectedServer) return;
    const interval = setInterval(() => {
      setLatency((prev) => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(12, Math.min(80, Math.round(prev + delta)));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [connectedServer]);

  // Simulated peer chatter in connected server
  useEffect(() => {
    if (!connectedServer) return;

    const chatterInterval = setInterval(() => {
      // Pick a random non-current user to speak or stop speaking
      setUsers((prev) => {
        const otherUsers = prev.filter((u) => !u.isCurrentUser && !u.isDeafened && !u.isMuted);
        if (otherUsers.length === 0) return prev;

        const target = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        const nextState: TalkState = target.talkState === 'talking' ? 'passive' : (Math.random() > 0.4 ? 'talking' : 'passive');

        return prev.map((u) =>
          u.session === target.session ? { ...u, talkState: nextState } : u
        );
      });
    }, 3200);

    return () => clearInterval(chatterInterval);
  }, [connectedServer]);

  // Global Push-to-Talk Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (settings.audioInputMethod === 'ptt' && e.code === settings.talkKey) {
        if (!e.repeat) {
          if (settings.togglePtt) {
            audioEngineRef.current?.togglePtt();
          } else {
            audioEngineRef.current?.setPttActive(true);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (settings.audioInputMethod === 'ptt' && e.code === settings.talkKey) {
        if (!settings.togglePtt) {
          audioEngineRef.current?.setPttActive(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.audioInputMethod, settings.talkKey, settings.togglePtt]);

  // Actions
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioEngineRef.current) {
      audioEngineRef.current.setMuteDeafen(nextMute, isDeafened);
    }
    setUsers((prev) =>
      prev.map((u) => (u.isCurrentUser ? { ...u, isSelfMuted: nextMute } : u))
    );
  };

  const handleToggleDeafen = () => {
    const nextDeaf = !isDeafened;
    setIsDeafened(nextDeaf);
    if (nextDeaf && !isMuted) {
      setIsMuted(true);
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.setMuteDeafen(nextDeaf || isMuted, nextDeaf);
    }
    setUsers((prev) =>
      prev.map((u) => (u.isCurrentUser ? { ...u, isSelfDeafened: nextDeaf, isSelfMuted: nextDeaf || isMuted } : u))
    );
  };

  const handleConnectServer = async (server: Server) => {
    setConnectedServer(server);
    setActiveNav('all_channels');
    setLatency(server.ping || 25);

    // Add connect notice
    const connectMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'System',
      target: 'Root',
      targetType: 'channel',
      text: `Connected to ${server.name} (${server.host}:${server.port}). Preprocessor active.`,
      isSystem: true,
    };
    setMessages((prev) => [...prev, connectMsg]);

    // Start audio engine capture if user hasn't started yet
    if (audioEngineRef.current) {
      await audioEngineRef.current.startMicrophone();
    }
  };

  const handleDisconnect = () => {
    setConnectedServer(null);
    setActiveNav('favourites');
    setIsTransmitting(false);
    if (audioEngineRef.current) {
      audioEngineRef.current.stopMicrophone();
    }
  };

  const handleQuickMatch = () => {
    // Pick the public server with the best ping
    const sorted = [...PUBLIC_MUMBLE_SERVERS].sort((a, b) => (a.ping || 999) - (b.ping || 999));
    const best = sorted[0];
    if (best) {
      if (window.confirm(`Found optimal server: ${best.name} in ${best.region}, ${best.country} (${best.ping}ms latency).\n\nConnect now?`)) {
        handleConnectServer(best);
      }
    }
  };

  const handleSendMessage = (text: string, targetType: 'channel' | 'tree' | 'whisper', targetName: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: settings.defaultUsername,
      target: targetName,
      targetType,
      text,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleUserAction = (action: string, targetUser: User) => {
    if (action === 'toggle_local_mute') {
      setUsers((prev) =>
        prev.map((u) =>
          u.session === targetUser.session
            ? { ...u, isLocallyMuted: !u.isLocallyMuted }
            : u
        )
      );
    } else if (action === 'toggle_server_mute') {
      setUsers((prev) =>
        prev.map((u) =>
          u.session === targetUser.session
            ? { ...u, isMuted: !u.isMuted }
            : u
        )
      );
    } else if (action === 'toggle_priority') {
      setUsers((prev) =>
        prev.map((u) =>
          u.session === targetUser.session
            ? { ...u, isPrioritySpeaker: !u.isPrioritySpeaker }
            : u
        )
      );
    } else if (action === 'kick') {
      if (window.confirm(`Kick ${targetUser.name} from the server?`)) {
        setUsers((prev) => prev.filter((u) => u.session !== targetUser.session));
      }
    }
  };

  const handleSaveChannel = (name: string, description: string, isTemporary: boolean) => {
    if (channelEditTarget?.channel) {
      // Edit existing
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channelEditTarget.channel!.id
            ? { ...c, name, description, isTemporary }
            : c
        )
      );
    } else {
      // Create new subchannel
      const newId = Math.max(...channels.map((c) => c.id)) + 1;
      const newChan: Channel = {
        id: newId,
        name,
        description,
        isTemporary,
        parentId: channelEditTarget?.parentId ?? currentChannelId,
        position: channels.length,
      };
      setChannels((prev) => [...prev, newChan]);
    }
    setChannelEditTarget(null);
  };

  const handleDeleteChannel = (channelId: number) => {
    if (channelId === 0) return;
    if (window.confirm('Are you sure you want to delete this channel?')) {
      // Move users to parent
      setUsers((prev) =>
        prev.map((u) => (u.channelId === channelId ? { ...u, channelId: 0 } : u))
      );
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
      if (currentChannelId === channelId) {
        setCurrentChannelId(0);
      }
    }
  };

  const handleTogglePinChannel = (channelId: number) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleTestMicrophone = async () => {
    if (isTestingMic) {
      audioEngineRef.current?.stopMicrophone();
      setIsTestingMic(false);
      return false;
    } else {
      const ok = await audioEngineRef.current?.startMicrophone();
      setIsTestingMic(!!ok);
      return !!ok;
    }
  };

  const currentChannel = channels.find((c) => c.id === currentChannelId) || channels[0];
  const currentUser = users.find((u) => u.isCurrentUser) || users[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar (Mumla Action Bar) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-4 z-20 shrink-0 select-none shadow-md">
        {/* Left: Drawer button + Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open Drawer Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 truncate">
            <span className="font-bold text-white text-base tracking-tight truncate">
              {connectedServer ? connectedServer.name : 'Mumla Voice'}
            </span>

            {connectedServer && currentChannel && (
              <span className="hidden sm:inline-flex items-center space-x-1 text-xs text-mumble-400 font-medium">
                <span>/</span>
                <span>#{currentChannel.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Mute / Deafen, Connection Indicator, Actions */}
        <div className="flex items-center space-x-1.5 md:space-x-2 shrink-0">
          {connectedServer && (
            <>
              {/* Quick Mute Toggle */}
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-lg border transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-950'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Quick Deafen Toggle */}
              <button
                onClick={handleToggleDeafen}
                className={`p-2 rounded-lg border transition-all ${
                  isDeafened
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-950'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
              >
                <Headphones className="w-4 h-4" />
              </button>

              {/* Add Channel Button */}
              <button
                onClick={() => setChannelEditTarget({ parentId: currentChannelId })}
                className="hidden md:flex p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Add Channel"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Latency Pill */}
              <button
                onClick={() => setShowServerInfo(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-colors"
                title="Server Ping & Encryption Details"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{latency}ms</span>
              </button>
            </>
          )}

          {/* Settings button */}
          <button
            onClick={() => setActiveNav('settings')}
            className={`p-2 rounded-lg border transition-colors ${
              activeNav === 'settings'
                ? 'bg-mumble-600 border-mumble-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden relative">
        {activeNav === 'all_channels' && connectedServer && (
          <ChannelView
            channels={channels}
            users={users}
            messages={messages}
            currentChannelId={currentChannelId}
            currentUser={currentUser}
            inputMethod={settings.audioInputMethod}
            isTransmitting={isTransmitting}
            isMuted={isMuted}
            isDeafened={isDeafened}
            togglePtt={settings.togglePtt}
            pttButtonHeight={settings.pttButtonHeight}
            hidePtt={settings.hidePtt}
            currentVolume={currentVolume}
            showUserCount={settings.showUserCount}
            useTts={settings.useTts}
            pinnedOnly={false}
            onSelectChannel={(cId) => {
              setCurrentChannelId(cId);
              setUsers((prev) =>
                prev.map((u) => (u.isCurrentUser ? { ...u, channelId: cId } : u))
              );
            }}
            onAddSubchannel={(pId) => setChannelEditTarget({ parentId: pId })}
            onEditChannel={(c) => setChannelEditTarget({ channel: c })}
            onDeleteChannel={handleDeleteChannel}
            onTogglePinChannel={handleTogglePinChannel}
            onViewComment={(u) => setSelectedUserForComment(u)}
            onUserAction={handleUserAction}
            onViewChannelDescription={(c) => setChannelDescTarget(c)}
            onSendMessage={handleSendMessage}
            onPttStart={() => audioEngineRef.current?.setPttActive(true)}
            onPttEnd={() => audioEngineRef.current?.setPttActive(false)}
            onPttToggle={() => audioEngineRef.current?.togglePtt()}
          />
        )}

        {activeNav === 'pinned_channels' && connectedServer && (
          <ChannelView
            channels={channels}
            users={users}
            messages={messages}
            currentChannelId={currentChannelId}
            currentUser={currentUser}
            inputMethod={settings.audioInputMethod}
            isTransmitting={isTransmitting}
            isMuted={isMuted}
            isDeafened={isDeafened}
            togglePtt={settings.togglePtt}
            pttButtonHeight={settings.pttButtonHeight}
            hidePtt={settings.hidePtt}
            currentVolume={currentVolume}
            showUserCount={settings.showUserCount}
            useTts={settings.useTts}
            pinnedOnly={true}
            onSelectChannel={(cId) => {
              setCurrentChannelId(cId);
              setUsers((prev) =>
                prev.map((u) => (u.isCurrentUser ? { ...u, channelId: cId } : u))
              );
            }}
            onAddSubchannel={(pId) => setChannelEditTarget({ parentId: pId })}
            onEditChannel={(c) => setChannelEditTarget({ channel: c })}
            onDeleteChannel={handleDeleteChannel}
            onTogglePinChannel={handleTogglePinChannel}
            onViewComment={(u) => setSelectedUserForComment(u)}
            onUserAction={handleUserAction}
            onViewChannelDescription={(c) => setChannelDescTarget(c)}
            onSendMessage={handleSendMessage}
            onPttStart={() => audioEngineRef.current?.setPttActive(true)}
            onPttEnd={() => audioEngineRef.current?.setPttActive(false)}
            onPttToggle={() => audioEngineRef.current?.togglePtt()}
          />
        )}

        {activeNav === 'favourites' && (
          <div className="h-full overflow-y-auto">
            <FavouriteServers
              servers={favouriteServers}
              onConnect={handleConnectServer}
              onAddServer={(s) => {
                const newServer: Server = {
                  ...s,
                  id: `fav-${Date.now()}`,
                };
                setFavouriteServers((prev) => [...prev, newServer]);
              }}
              onEditServer={(s) => {
                setFavouriteServers((prev) =>
                  prev.map((item) => (item.id === s.id ? s : item))
                );
              }}
              onDeleteServer={(id) => {
                setFavouriteServers((prev) => prev.filter((s) => s.id !== id));
              }}
              onQuickMatch={handleQuickMatch}
              defaultUsername={settings.defaultUsername}
            />
          </div>
        )}

        {activeNav === 'public_servers' && (
          <div className="h-full overflow-y-auto">
            <PublicServers
              onConnect={handleConnectServer}
              onAddToFavorites={(s) => {
                if (!favouriteServers.some((f) => f.host === s.host)) {
                  setFavouriteServers((prev) => [...prev, { ...s, isFavorite: true }]);
                }
              }}
              favoriteIds={new Set(favouriteServers.map((s) => s.id))}
              onQuickMatch={handleQuickMatch}
            />
          </div>
        )}

        {activeNav === 'settings' && (
          <div className="h-full overflow-y-auto">
            <SettingsModal
              settings={settings}
              onUpdateSettings={setSettings}
              currentVolume={currentVolume}
              onTestMicrophone={handleTestMicrophone}
              isTestingMic={isTestingMic}
            />
          </div>
        )}
      </main>

      {/* Floating Hot Corner PTT */}
      {connectedServer && settings.hotCorner !== 'none' && (
        <HotCornerPtt
          position={settings.hotCorner}
          isTransmitting={isTransmitting}
          isMuted={isMuted}
          isDeafened={isDeafened}
          onPttStart={() => audioEngineRef.current?.setPttActive(true)}
          onPttEnd={() => audioEngineRef.current?.setPttActive(false)}
        />
      )}

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem={activeNav}
        onNavigate={(item) => {
          if (item === 'server_info') {
            setShowServerInfo(true);
          } else if (item === 'access_tokens') {
            setShowAccessTokens(true);
          } else {
            setActiveNav(item);
          }
        }}
        connectedServer={connectedServer}
        onDisconnect={handleDisconnect}
        latency={latency}
      />

      {/* Modals */}
      {showServerInfo && connectedServer && (
        <ServerInfoModal
          server={connectedServer}
          onClose={() => setShowServerInfo(false)}
          latency={latency}
        />
      )}

      {showAccessTokens && (
        <AccessTokensModal
          tokens={accessTokens}
          onAddToken={(t) => setAccessTokens((prev) => [...prev, t])}
          onRemoveToken={(t) => setAccessTokens((prev) => prev.filter((tok) => tok !== t))}
          onClose={() => setShowAccessTokens(false)}
        />
      )}

      {selectedUserForComment && (
        <UserCommentModal
          user={selectedUserForComment}
          isCurrentUser={selectedUserForComment.isCurrentUser || false}
          onSaveComment={(session, comment) => {
            setUsers((prev) =>
              prev.map((u) => (u.session === session ? { ...u, comment } : u))
            );
          }}
          onClose={() => setSelectedUserForComment(null)}
        />
      )}

      {channelEditTarget && (
        <ChannelEditModal
          channel={channelEditTarget.channel}
          parentChannelId={channelEditTarget.parentId}
          onSave={handleSaveChannel}
          onClose={() => setChannelEditTarget(null)}
        />
      )}

      {channelDescTarget && (
        <ChannelDescModal
          channel={channelDescTarget}
          onSaveDescription={(cId, description) => {
            setChannels((prev) =>
              prev.map((c) => (c.id === cId ? { ...c, description } : c))
            );
          }}
          onClose={() => setChannelDescTarget(null)}
        />
      )}
    </div>
  );
}

export default App;
