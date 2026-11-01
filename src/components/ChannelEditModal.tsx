import React, { useState } from 'react';
import { Hash, X, Check } from 'lucide-react';
import { Channel } from '../types';

interface ChannelEditModalProps {
  channel?: Channel;
  parentChannelId?: number;
  onSave: (name: string, description: string, isTemporary: boolean) => void;
  onClose: () => void;
}

export const ChannelEditModal: React.FC<ChannelEditModalProps> = ({
  channel,
  parentChannelId,
  onSave,
  onClose,
}) => {
  const isEditing = !!channel;
  const [name, setName] = useState(channel?.name || '');
  const [description, setDescription] = useState(channel?.description || '');
  const [isTemporary, setIsTemporary] = useState(channel?.isTemporary || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a channel name.');
      return;
    }
    onSave(name.trim(), description.trim(), isTemporary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-mumble-500/10 text-mumble-400 rounded-lg">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isEditing ? 'Edit Channel' : 'Add New Subchannel'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? channel.name : 'Create room under parent channel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Channel Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gaming Squad"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mumble-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Channel Description / Topic
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rules, links, or channel description..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-mumble-500"
            />
          </div>

          <div className="flex items-center space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="isTemp"
              checked={isTemporary}
              onChange={(e) => setIsTemporary(e.target.checked)}
              className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="isTemp" className="text-xs text-slate-300 cursor-pointer">
              Temporary channel (deleted when empty)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-bold"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Channel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
