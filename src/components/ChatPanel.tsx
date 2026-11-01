import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Shield, User as UserIcon, Hash, Radio, X } from 'lucide-react';
import { ChatMessage, Channel, User } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentChannel: Channel;
  currentUser: User;
  onSendMessage: (text: string, targetType: 'channel' | 'tree' | 'whisper', targetName: string) => void;
  whisperTarget: User | null;
  onClearWhisper: () => void;
  useTts: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentChannel,
  currentUser,
  onSendMessage,
  whisperTarget,
  onClearWhisper,
  useTts,
}) => {
  const [inputText, setInputText] = useState('');
  const [targetType, setTargetType] = useState<'channel' | 'tree'>('channel');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (whisperTarget) {
      onSendMessage(inputText.trim(), 'whisper', whisperTarget.name);
    } else {
      onSendMessage(inputText.trim(), targetType, currentChannel.name);
    }

    // TTS if enabled
    if (useTts && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(inputText.trim());
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // audio policy
      }
    }

    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Target indicator banner */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs font-medium border-b ${
        whisperTarget 
          ? 'bg-cyan-950/80 border-cyan-800/60 text-cyan-200' 
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2">
          {whisperTarget ? (
            <>
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Whispering directly to <strong className="text-white">{whisperTarget.name}</strong></span>
            </>
          ) : (
            <>
              <Hash className="w-3.5 h-3.5 text-mumble-400" />
              <span>Sending to channel: <strong className="text-white">{currentChannel.name}</strong></span>
            </>
          )}
        </div>

        {whisperTarget && (
          <button
            onClick={onClearWhisper}
            className="p-1 text-cyan-300 hover:text-white rounded hover:bg-cyan-900"
            title="Cancel whisper target"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser.name;
          const isWhisper = msg.targetType === 'whisper';
          const isSys = msg.isSystem;

          if (isSys) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block px-3 py-1 bg-slate-900/90 text-slate-400 text-xs rounded-full border border-slate-800">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Header: Sender, Time, Target */}
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span className={`font-semibold ${isMe ? 'text-mumble-400' : 'text-slate-300'}`}>
                  {msg.sender}
                </span>
                {isWhisper ? (
                  <span className="text-cyan-400 font-medium">→ Whisper</span>
                ) : (
                  <span>→ #{msg.target}</span>
                )}
                <span className="text-slate-400 font-mono text-[10px]">{msg.timestamp}</span>
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                isWhisper
                  ? 'bg-cyan-950/70 border border-cyan-800/80 text-cyan-100 rounded-tr-sm'
                  : isMe
                  ? 'bg-mumble-600 text-white rounded-tr-sm shadow-md shadow-mumble-950/50'
                  : 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700/60'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={whisperTarget ? `Whisper to ${whisperTarget.name}...` : `Message #${currentChannel.name}...`}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
            inputText.trim()
              ? 'bg-mumble-600 hover:bg-mumble-500 text-white shadow-md shadow-mumble-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
