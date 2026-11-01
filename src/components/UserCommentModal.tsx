import React, { useState } from 'react';
import { MessageSquare, X, Check } from 'lucide-react';
import { User } from '../types';

interface UserCommentModalProps {
  user: User;
  onSaveComment?: (session: number, comment: string) => void;
  onClose: () => void;
  isCurrentUser: boolean;
}

export const UserCommentModal: React.FC<UserCommentModalProps> = ({
  user,
  onSaveComment,
  onClose,
  isCurrentUser,
}) => {
  const [commentText, setCommentText] = useState(user.comment || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveComment) {
      onSaveComment(user.session, commentText);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-mumble-500/10 text-mumble-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">User Comment</h3>
              <p className="text-xs text-slate-400">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCurrentUser ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Your Status / Comment
              </label>
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are you doing? (e.g. In game, AFK, listening to music)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-mumble-500"
              />
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
                <span>Save Comment</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm text-slate-200 min-h-[80px]">
              {user.comment ? user.comment : <span className="text-slate-500 italic">No comment set by user.</span>}
            </div>

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
