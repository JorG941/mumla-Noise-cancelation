import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, X, ShieldAlert } from 'lucide-react';

interface AccessTokensModalProps {
  tokens: string[];
  onAddToken: (token: string) => void;
  onRemoveToken: (token: string) => void;
  onClose: () => void;
}

export const AccessTokensModal: React.FC<AccessTokensModalProps> = ({
  tokens,
  onAddToken,
  onRemoveToken,
  onClose,
}) => {
  const [newToken, setNewToken] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken.trim()) return;
    onAddToken(newToken.trim());
    setNewToken('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-mumble-500/10 text-mumble-400 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Channel Access Tokens</h3>
              <p className="text-xs text-slate-400">Tokens allow entering restricted server rooms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add token form */}
        <form onSubmit={handleAdd} className="flex space-x-2">
          <input
            type="text"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            placeholder="Enter token password..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500"
          />
          <button
            type="submit"
            disabled={!newToken.trim()}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              newToken.trim()
                ? 'bg-mumble-600 hover:bg-mumble-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Token list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tokens.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
              No access tokens registered for this server.
            </div>
          ) : (
            tokens.map((token, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-200"
              >
                <span>•••••••• ({token})</span>
                <button
                  onClick={() => onRemoveToken(token)}
                  className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                  title="Remove token"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
