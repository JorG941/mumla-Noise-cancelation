import React, { useState } from 'react';
import { Hash, MessageSquare } from 'lucide-react';
import { ChannelTree } from './ChannelTree';
import { ChatPanel } from './ChatPanel';
import { PttButton } from './PttButton';
import { Channel, ChatMessage, InputMethod, User } from '../types';

interface ChannelViewProps {
  channels: Channel[];
  users: User[];
  messages: ChatMessage[];
  currentChannelId: number;
  currentUser: User;
  inputMethod: InputMethod;
  isTransmitting: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  togglePtt: boolean;
  pttButtonHeight: number;
  hidePtt: boolean;
  currentVolume: number;
  showUserCount: boolean;
  useTts: boolean;
  pinnedOnly?: boolean;

  onSelectChannel: (channelId: number) => void;
  onAddSubchannel: (parentChannelId: number) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: number) => void;
  onTogglePinChannel: (channelId: number) => void;
  onViewComment: (user: User) => void;
  onUserAction: (action: string, targetUser: User) => void;
  onViewChannelDescription: (channel: Channel) => void;
  onSendMessage: (text: string, targetType: 'channel' | 'tree' | 'whisper', targetName: string) => void;

  onPttStart: () => void;
  onPttEnd: () => void;
  onPttToggle: () => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channels,
  users,
  messages,
  currentChannelId,
  currentUser,
  inputMethod,
  isTransmitting,
  isMuted,
  isDeafened,
  togglePtt,
  pttButtonHeight,
  hidePtt,
  currentVolume,
  showUserCount,
  useTts,
  pinnedOnly = false,

  onSelectChannel,
  onAddSubchannel,
  onEditChannel,
  onDeleteChannel,
  onTogglePinChannel,
  onViewComment,
  onUserAction,
  onViewChannelDescription,
  onSendMessage,

  onPttStart,
  onPttEnd,
  onPttToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'channel' | 'chat'>('channel');
  const [whisperTarget, setWhisperTarget] = useState<User | null>(null);

  const currentChannel = channels.find((c) => c.id === currentChannelId) || channels[0] || {
    id: 0,
    name: 'Root',
    parentId: null,
    position: 0,
  };

  const handleWhisperUser = (user: User) => {
    setWhisperTarget(user);
    setActiveTab('chat');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Tab Switcher (matching Mumla's ViewPager tab strip) */}
      <div className="flex items-center bg-slate-900 border-b border-slate-800 px-4 shrink-0">
        <button
          onClick={() => setActiveTab('channel')}
          className={`flex items-center space-x-2 py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'channel'
              ? 'border-mumble-500 text-mumble-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>{pinnedOnly ? 'Pinned Channels' : 'Channels'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-2 py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 relative ${
            activeTab === 'chat'
              ? 'border-mumble-500 text-mumble-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {messages.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-mumble-500"></span>
          )}
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'channel' ? (
          <ChannelTree
            channels={channels}
            users={users}
            currentChannelId={currentChannelId}
            pinnedOnly={pinnedOnly}
            showUserCount={showUserCount}
            onSelectChannel={onSelectChannel}
            onAddSubchannel={onAddSubchannel}
            onEditChannel={onEditChannel}
            onDeleteChannel={onDeleteChannel}
            onTogglePinChannel={onTogglePinChannel}
            onViewComment={onViewComment}
            onUserAction={onUserAction}
            onWhisperUser={handleWhisperUser}
            onViewChannelDescription={onViewChannelDescription}
          />
        ) : (
          <ChatPanel
            messages={messages}
            currentChannel={currentChannel}
            currentUser={currentUser}
            onSendMessage={onSendMessage}
            whisperTarget={whisperTarget}
            onClearWhisper={() => setWhisperTarget(null)}
            useTts={useTts}
          />
        )}
      </div>

      {/* Bottom Push-To-Talk Button */}
      <PttButton
        inputMethod={inputMethod}
        isTransmitting={isTransmitting}
        isMuted={isMuted}
        isDeafened={isDeafened}
        toggleMode={togglePtt}
        buttonHeight={pttButtonHeight}
        hidePtt={hidePtt}
        currentVolume={currentVolume}
        onPttStart={onPttStart}
        onPttEnd={onPttEnd}
        onPttToggle={onPttToggle}
      />
    </div>
  );
};
