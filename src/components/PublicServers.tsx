import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Play, 
  Star, 
  Signal, 
  Users, 
  ExternalLink, 
  MapPin, 
  Zap,
  Check
} from 'lucide-react';
import { Server } from '../types';
import { PUBLIC_MUMBLE_SERVERS } from '../services/mockPublicServers';

interface PublicServersProps {
  onConnect: (server: Server) => void;
  onAddToFavorites: (server: Server) => void;
  favoriteIds: Set<string>;
  onQuickMatch: () => void;
}

export const PublicServers: React.FC<PublicServersProps> = ({
  onConnect,
  onAddToFavorites,
  favoriteIds,
  onQuickMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');

  const filteredServers = PUBLIC_MUMBLE_SERVERS.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (server.country && server.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (server.region && server.region.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesContinent =
      selectedContinent === 'ALL' || server.continent === selectedContinent;

    return matchesSearch && matchesContinent;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <span>Public Mumble Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse worldwide community servers (synchronized from mumble.info list)
          </p>
        </div>

        <button
          onClick={onQuickMatch}
          className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
        >
          <Zap className="w-4 h-4" />
          <span>Auto-Match Best Server</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search public servers by name, country or IP..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mumble-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          {['ALL', 'EU', 'NA', 'AS', 'OC', 'SA'].map((cont) => {
            const labels: Record<string, string> = {
              ALL: 'Global',
              EU: 'Europe',
              NA: 'North America',
              AS: 'Asia',
              OC: 'Oceania',
              SA: 'South America',
            };
            return (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedContinent === cont
                    ? 'bg-mumble-600 text-white font-semibold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {labels[cont] || cont}
              </button>
            );
          })}
        </div>
      </div>

      {/* Server grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServers.map((server) => {
          const isFavorited = favoriteIds.has(server.id) || favoriteIds.has(server.host);

          return (
            <div
              key={server.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:shadow-slate-950/60"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{server.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{server.host}:{server.port}</p>
                  </div>

                  <span className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    <Signal className="w-3 h-3" />
                    <span>{server.ping}ms</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{server.region}, {server.country}</span>
                  </span>

                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{server.users} / {server.maxUsers} users</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                <button
                  onClick={() => onConnect(server)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Connect</span>
                </button>

                <button
                  onClick={() => onAddToFavorites(server)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isFavorited
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isFavorited ? 'Already in Favorites' : 'Add to Favorites'}
                >
                  {isFavorited ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                </button>

                {server.url && (
                  <a
                    href={server.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors"
                    title="Visit server website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
