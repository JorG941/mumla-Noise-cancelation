import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Hash, 
  Volume2, 
  Mic, 
  MicOff, 
  Headphones, 
  Star, 
  MessageSquare, 
  MoreVertical, 
  Plus, 
  Edit2, 
  Trash2, 
  Pin, 
  PinOff,
  User as UserIcon,
  Link as LinkIcon,
  ArrowRightCircle,
  Shield,
  VolumeX,
  Radio
} from 'lucide-react';
import { Channel, User } from '../types';

interface ChannelTreeProps {
  channels: Channel[];
  users: User[];
  currentChannelId: number;
  pinnedOnly?: boolean;
  showUserCount?: boolean;
  onSelectChannel: (channelId: number) => void;
  onAddSubchannel: (parentChannelId: number) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: number) => void;
  onTogglePinChannel: (channelId: number) => void;
  onViewComment: (user: User) => void;
  onUserAction: (action: string, targetUser: User) => void;
  onWhisperUser: (user: User) => void;
  onViewChannelDescription: (channel: Channel) => void;
}

export const ChannelTree: React.FC<ChannelTreeProps> = ({
  channels,
  users,
  currentChannelId,
  pinnedOnly = false,
  showUserCount = true,
  onSelectChannel,
  onAddSubchannel,
  onEditChannel,
  onDeleteChannel,
  onTogglePinChannel,
  onViewComment,
  onUserAction,
  onWhisperUser,
  onViewChannelDescription,
}) => {
  // Expansion state: map channelId -> boolean
  const [expanded, setExpanded] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Active dropdown menu state
  const [activeMenu, setActiveMenu] = useState<{ type: 'channel' | 'user'; id: number } | null>(null);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree
  const channelsByParent: Record<number, Channel[]> = {};
  channels.forEach((ch) => {
    const pId = ch.parentId ?? -1;
    if (!channelsByParent[pId]) channelsByParent[pId] = [];
    channelsByParent[pId].push(ch);
  });

  // Users by channel
  const usersByChannel: Record<number, User[]> = {};
  users.forEach((u) => {
    if (!usersByChannel[u.channelId]) usersByChannel[u.channelId] = [];
    usersByChannel[u.channelId].push(u);
  });

  const renderChannel = (channel: Channel, depth: number = 0) => {
    if (pinnedOnly && !channel.isPinned) {
      // Check if any subchannel is pinned
      const hasPinnedChild = channels.some(c => c.parentId === channel.id && c.isPinned);
      if (!hasPinnedChild) return null;
    }

    const isCurrent = channel.id === currentChannelId;
    const isExpanded = expanded[channel.id] ?? true;
    const childChannels = channelsByParent[channel.id] || [];
    const channelUsers = usersByChannel[channel.id] || [];
    const hasChildren = childChannels.length > 0 || channelUsers.length > 0;
    const totalUsersInSubtree = channelUsers.length + childChannels.reduce((acc, c) => acc + (usersByChannel[c.id]?.length || 0), 0);

    return (
      <div key={`chan-${channel.id}`} className="select-none">
        {/* Channel Row */}
        <div 
          onClick={() => onSelectChannel(channel.id)}
          style={{ paddingLeft: `${Math.max(10, depth * 20)}px` }}
          className={`group flex items-center justify-between py-2.5 pr-2.5 rounded-lg text-sm cursor-pointer transition-colors border ${
            isCurrent
              ? 'bg-mumble-600/20 border-mumble-500/40 text-white font-medium shadow-sm'
              : 'hover:bg-slate-800/60 border-transparent text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {/* Expand / Collapse toggle */}
            <button
              onClick={(e) => toggleExpand(channel.id, e)}
              className={`p-1 rounded text-slate-400 hover:text-white transition-transform ${
                !hasChildren ? 'invisible' : ''
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Channel Icon */}
            <div className={`p-1 rounded ${isCurrent ? 'bg-mumble-500 text-white' : 'text-slate-400'}`}>
              <Hash className="w-4 h-4" />
            </div>

            {/* Channel Name */}
            <span className={`truncate text-sm ${isCurrent ? 'font-semibold text-white' : 'text-slate-200'}`}>
              {channel.name}
            </span>

            {/* Pinned Icon */}
            {channel.isPinned && (
              <span title="Pinned Channel">
                <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </span>
            )}

            {/* Linked Icon */}
            {channel.links && channel.links.length > 0 && (
              <span title="Linked Channel">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Description view button */}
            {channel.description && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewChannelDescription(channel);
                }}
                className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-700/50"
                title="View Channel Description"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            {/* User count badge */}
            {showUserCount && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                channelUsers.length > 0
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400'
              }`}>
                {channelUsers.length}
              </span>
            )}

            {/* Channel Menu Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu?.id === channel.id && activeMenu.type === 'channel' ? null : { type: 'channel', id: channel.id });
                }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
                title="Channel options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Context Dropdown */}
              {activeMenu?.type === 'channel' && activeMenu.id === channel.id && (
                <div 
                  className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onSelectChannel(channel.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                  >
                    <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Join Channel</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddSubchannel(channel.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Add Subchannel</span>
                  </button>
                  <button
                    onClick={() => {
                      onEditChannel(channel);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Channel</span>
                  </button>
                  <button
                    onClick={() => {
                      onTogglePinChannel(channel.id);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                  >
                    {channel.isPinned ? (
                      <>
                        <PinOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Unpin Channel</span>
                      </>
                    ) : (
                      <>
                        <Pin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pin Channel</span>
                      </>
                    )}
                  </button>
                  {channel.id !== 0 && (
                    <button
                      onClick={() => {
                        onDeleteChannel(channel.id);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-slate-800 text-left border-t border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Channel</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Children (Users + Subchannels) */}
        {isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {/* Users in this channel */}
            {channelUsers.map((user) => renderUser(user, depth + 1))}

            {/* Nested Subchannels */}
            {childChannels.map((child) => renderChannel(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderUser = (user: User, depth: number) => {
    const isTalking = user.talkState === 'talking' || user.talkState === 'shouting';
    const isMuted = user.isMuted || user.isSelfMuted || user.isLocallyMuted;
    const isDeafened = user.isDeafened || user.isSelfDeafened;

    return (
      <div
        key={`user-${user.session}`}
        style={{ paddingLeft: `${Math.max(16, depth * 22)}px` }}
        className={`group flex items-center justify-between py-2 pr-2.5 rounded-lg text-sm transition-colors ${
          user.isCurrentUser ? 'bg-slate-800/40' : 'hover:bg-slate-800/30'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Talk State Circle (matching Mumla's circle drawable) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
              isDeafened
                ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                : isMuted
                ? 'border-rose-500/80 bg-rose-500/10 text-rose-400'
                : isTalking
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30 talking-pulse'
                : 'border-slate-600 bg-slate-800 text-slate-400'
            }`}>
              {isDeafened ? (
                <Headphones className="w-3.5 h-3.5" />
              ) : isMuted ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className={`w-3.5 h-3.5 ${isTalking ? 'text-emerald-400' : 'text-slate-400'}`} />
              )}
            </div>

            {/* Priority Speaker Indicator */}
            {user.isPrioritySpeaker && (
              <span 
                className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900" 
                title="Priority Speaker"
              >
                <Star className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
          </div>

          {/* User Name & Details */}
          <div className="min-w-0 flex items-center space-x-1.5">
            <span className={`truncate text-sm ${
              user.isCurrentUser ? 'font-semibold text-white' : 'text-slate-300'
            }`}>
              {user.name}
            </span>

            {user.isCurrentUser && (
              <span className="text-[10px] px-1.5 py-0.2 bg-mumble-500/20 text-mumble-400 rounded font-medium">
                You
              </span>
            )}

            {user.isRegistered && (
              <span title="Registered User">
                <Shield className="w-3 h-3 text-sky-400 shrink-0" />
              </span>
            )}

            {user.isLocallyMuted && (
              <span title="Locally Muted">
                <VolumeX className="w-3 h-3 text-rose-400 shrink-0" />
              </span>
            )}
          </div>
        </div>

        {/* Right side: Comment, Ping, Menu */}
        <div className="flex items-center space-x-2 shrink-0">
          {user.comment && (
            <button
              onClick={() => onViewComment(user)}
              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-700/50"
              title={`Comment: ${user.comment}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {user.ping !== undefined && (
            <span className="text-[11px] font-mono text-slate-400">
              {user.ping}ms
            </span>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu?.id === user.session && activeMenu.type === 'user' ? null : { type: 'user', id: user.session });
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
              title="User options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {activeMenu?.type === 'user' && activeMenu.id === user.session && (
              <div 
                className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {!user.isCurrentUser && (
                  <>
                    <button
                      onClick={() => {
                        onWhisperUser(user);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Whisper / PM</span>
                    </button>
                    <button
                      onClick={() => {
                        onUserAction('toggle_local_mute', user);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>{user.isLocallyMuted ? 'Unmute Locally' : 'Local Mute'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    onUserAction('toggle_server_mute', user);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                >
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>{user.isMuted ? 'Server Unmute' : 'Server Mute'}</span>
                </button>

                <button
                  onClick={() => {
                    onUserAction('toggle_priority', user);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.isPrioritySpeaker ? 'Remove Priority' : 'Priority Speaker'}</span>
                </button>

                <button
                  onClick={() => {
                    onViewComment(user);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>{user.comment ? 'View Comment' : 'Set Comment'}</span>
                </button>

                {!user.isCurrentUser && (
                  <button
                    onClick={() => {
                      onUserAction('kick', user);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-slate-800 text-left border-t border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kick User</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Click outside listener to dismiss menus
  return (
    <div 
      className="p-3 space-y-1 relative"
      onClick={() => setActiveMenu(null)}
    >
      {/* Root channels */}
      {(channelsByParent[-1] || channels.filter(c => c.parentId === null)).map((root) => renderChannel(root, 0))}
    </div>
  );
};
