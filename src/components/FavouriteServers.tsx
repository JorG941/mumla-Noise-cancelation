import React, { useState } from 'react';
import { 
  Plus, 
  Server as ServerIcon, 
  Play, 
  Edit2, 
  Trash2, 
  Zap, 
  Users, 
  Signal, 
  Search, 
  ShieldCheck,
  Star
} from 'lucide-react';
import { Server } from '../types';

interface FavouriteServersProps {
  servers: Server[];
  onConnect: (server: Server) => void;
  onAddServer: (server: Omit<Server, 'id'>) => void;
  onEditServer: (server: Server) => void;
  onDeleteServer: (id: string) => void;
  onQuickMatch: () => void;
  defaultUsername: string;
}

export const FavouriteServers: React.FC<FavouriteServersProps> = ({
  servers,
  onConnect,
  onAddServer,
  onEditServer,
  onDeleteServer,
  onQuickMatch,
  defaultUsername,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formHost, setFormHost] = useState('');
  const [formPort, setFormPort] = useState('64738');
  const [formUsername, setFormUsername] = useState(defaultUsername);
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setFormName('');
    setFormHost('');
    setFormPort('64738');
    setFormUsername(defaultUsername);
    setFormPassword('');
    setFormError('');
    setShowAddModal(true);
  };

  const openEditModal = (s: Server) => {
    setEditingServer(s);
    setFormName(s.name);
    setFormHost(s.host);
    setFormPort(String(s.port));
    setFormUsername(s.username || defaultUsername);
    setFormPassword(s.password || '');
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHost.trim()) {
      setFormError('Please enter a server address or hostname.');
      return;
    }
    const portNum = parseInt(formPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setFormError('Port must be between 1 and 65535.');
      return;
    }

    onAddServer({
      name: formName.trim() || formHost.trim(),
      host: formHost.trim(),
      port: portNum,
      username: formUsername.trim() || defaultUsername,
      password: formPassword || undefined,
      isFavorite: true,
      ping: Math.floor(Math.random() * 25) + 18,
      users: Math.floor(Math.random() * 8) + 2,
      maxUsers: 100,
    });

    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;
    if (!formHost.trim()) {
      setFormError('Please enter a server address or hostname.');
      return;
    }
    const portNum = parseInt(formPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setFormError('Port must be between 1 and 65535.');
      return;
    }

    onEditServer({
      ...editingServer,
      name: formName.trim() || formHost.trim(),
      host: formHost.trim(),
      port: portNum,
      username: formUsername.trim() || defaultUsername,
      password: formPassword || undefined,
    });

    setEditingServer(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Favorite Mumble Servers</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your saved voice channels and fast-connect endpoints
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onQuickMatch}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            title="Automatically pick optimal low-latency server"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Find Server</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-3.5 py-2 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-mumble-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Server</span>
          </button>
        </div>
      </div>

      {/* Servers List */}
      {servers.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <ServerIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No favorite servers added yet.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-mumble-600 hover:bg-mumble-500 text-white text-xs font-semibold rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Server</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-slate-950/60 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-mumble-500/10 border border-mumble-500/20 text-mumble-400 rounded-lg group-hover:scale-105 transition-transform">
                      <ServerIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm truncate max-w-[170px]" title={server.name}>
                        {server.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate max-w-[170px]" title={`${server.host}:${server.port}`}>
                        {server.host}:{server.port}
                      </p>
                    </div>
                  </div>

                  {server.ping !== undefined && (
                    <span className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <Signal className="w-3 h-3" />
                      <span>{server.ping}ms</span>
                    </span>
                  )}
                </div>

                {/* Info row */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{server.users ?? 0} / {server.maxUsers ?? 100} users</span>
                  </span>

                  <span className="text-slate-400">
                    User: <strong className="text-slate-300">{server.username || defaultUsername}</strong>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 flex items-center space-x-2">
                <button
                  onClick={() => onConnect(server)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Connect</span>
                </button>

                <button
                  onClick={() => openEditModal(server)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors"
                  title="Edit server"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete favorite server "${server.name}"?`)) {
                      onDeleteServer(server.id);
                    }
                  }}
                  className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 border border-slate-800 transition-colors"
                  title="Delete server"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Server Modal */}
      {(showAddModal || editingServer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ServerIcon className="w-5 h-5 text-mumble-400" />
              <span>{editingServer ? 'Edit Server' : 'Add New Server'}</span>
            </h3>

            {formError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={editingServer ? handleSaveEdit : handleSaveAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Server Label / Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="My Gaming Mumble"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Address / Host *
                  </label>
                  <input
                    type="text"
                    required
                    value={formHost}
                    onChange={(e) => setFormHost(e.target.value)}
                    placeholder="voice.example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formPort}
                    onChange={(e) => setFormPort(e.target.value)}
                    placeholder="64738"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder={defaultUsername}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingServer(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mumble-600 hover:bg-mumble-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Save Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
