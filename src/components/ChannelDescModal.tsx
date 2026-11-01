import React, { useState } from 'react';
import { MessageSquare, X, Edit3, Eye, Check } from 'lucide-react';
import { Channel } from '../types';

interface ChannelDescModalProps {
  channel: Channel;
  onSaveDescription: (channelId: number, description: string) => void;
  onClose: () => void;
}

export const ChannelDescModal: React.FC<ChannelDescModalProps> = ({
  channel,
  onSaveDescription,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [desc, setDesc] = useState(channel.description || '');

  const handleSave = () => {
    onSaveDescription(channel.id, desc);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-mumble-500/10 text-mumble-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Channel Description</h3>
              <p className="text-xs text-slate-400">#{channel.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1"
              title={isEditing ? 'View rendered description' : 'Edit description text'}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              rows={6}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Enter HTML or plain text description for this channel..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-mumble-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm text-slate-200 min-h-[120px] max-h-80 overflow-y-auto leading-relaxed prose prose-invert prose-sm"
              dangerouslySetInnerHTML={{
                __html: channel.description || '<em class="text-slate-500">No description has been provided for this channel.</em>',
              }}
            />

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
