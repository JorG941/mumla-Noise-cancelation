import React, { useState } from 'react';
import { 
  Sliders, 
  Mic, 
  Volume2, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  HelpCircle, 
  Key, 
  Save, 
  RotateCcw,
  Zap,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { CertificateItem, HotCornerPosition, InputMethod, SettingsState } from '../types';

interface SettingsModalProps {
  settings: SettingsState;
  onUpdateSettings: (newSettings: SettingsState) => void;
  currentVolume: number;
  onTestMicrophone: () => Promise<boolean>;
  isTestingMic: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  currentVolume,
  onTestMicrophone,
  isTestingMic,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'ptt' | 'auth' | 'general'>('audio');
  const [recordingKey, setRecordingKey] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [showCertDialog, setShowCertDialog] = useState(false);

  const update = <K extends keyof SettingsState>(key: K, val: SettingsState[K]) => {
    onUpdateSettings({ ...settings, [key]: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recordingKey) return;
    e.preventDefault();
    e.stopPropagation();
    update('talkKey', e.code);
    setRecordingKey(false);
  };

  const handleGenerateCertificate = () => {
    const certName = newCertName.trim() || 'Mumla Identity Certificate';
    // Generate simulated SHA-1/SHA-256 fingerprint hex
    const chars = '0123456789abcdef';
    let fp = '';
    for (let i = 0; i < 20; i++) {
      fp += chars[Math.floor(Math.random() * chars.length)];
      fp += chars[Math.floor(Math.random() * chars.length)];
      if (i < 19) fp += ':';
    }

    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      name: certName,
      fingerprint: fp,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newCerts = [...settings.certificates, newCert];
    onUpdateSettings({
      ...settings,
      certificates: newCerts,
      certificateId: newCert.id,
    });

    setNewCertName('');
    setShowCertDialog(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 select-none" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-mumble-400" />
          <span>Mumla Audio &amp; Client Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure noise cancellation, speech detection thresholds, and cryptographic certificates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'audio'
              ? 'border-mumble-500 text-mumble-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio &amp; Noise Cancel</span>
        </button>

        <button
          onClick={() => setActiveTab('ptt')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'ptt'
              ? 'border-mumble-500 text-mumble-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Push-To-Talk</span>
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'auth'
              ? 'border-mumble-500 text-mumble-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Certificates</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-mumble-500 text-mumble-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>General</span>
        </button>
      </div>

      {/* TAB 1: AUDIO & NOISE SUPPRESSION */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          {/* Card: Audio Input Method */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Mic className="w-4 h-4 text-mumble-400" />
              <span>Audio Transmission Mode</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'voiceActivity', title: 'Voice Activity (VAD)', desc: 'Transmits when speaking volume exceeds threshold' },
                { id: 'ptt', title: 'Push-to-Talk (PTT)', desc: 'Transmits only while key or on-screen button is held' },
                { id: 'continuous', title: 'Continuous', desc: 'Always transmits microphone audio' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update('audioInputMethod', opt.id as InputMethod)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    settings.audioInputMethod === opt.id
                      ? 'bg-mumble-600/20 border-mumble-500 text-white ring-2 ring-mumble-500/20 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-200">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card: Realtime Live VAD Meter & Threshold Slider */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center space-x-2">
                  <span>Voice Detection Threshold</span>
                  <span className="text-xs text-mumble-400 font-mono font-bold">
                    {settings.vadThreshold}%
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Microphone transmits when the input level crosses the threshold marker
                </p>
              </div>

              <button
                onClick={onTestMicrophone}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  isTestingMic 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isTestingMic ? 'Stop Mic Test' : 'Test Mic Live'}</span>
              </button>
            </div>

            {/* Visualizer Bar */}
            <div className="space-y-2">
              <div className="relative h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-700/80">
                {/* Level meter */}
                <div
                  className={`h-full transition-all duration-75 ${
                    currentVolume >= settings.vadThreshold
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      : 'bg-gradient-to-r from-slate-600 to-slate-500'
                  }`}
                  style={{ width: `${Math.min(100, currentVolume)}%` }}
                />

                {/* Threshold line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-md shadow-amber-400/50 z-10"
                  style={{ left: `${settings.vadThreshold}%` }}
                />
              </div>

              {/* Slider control */}
              <input
                type="range"
                min="0"
                max="100"
                value={settings.vadThreshold}
                onChange={(e) => update('vadThreshold', parseInt(e.target.value, 10))}
                className="w-full accent-mumble-500 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0% (Quiet / Sensitive)</span>
                <span>Current Volume: <strong className="text-white">{currentVolume}%</strong></span>
                <span>100% (Loud)</span>
              </div>
            </div>
          </div>

          {/* Card: Noise Cancellation Preprocessor (Key feature of this fork) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-slate-100">
                    Active Noise Suppression &amp; Audio Preprocessor
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Suppresses ambient background noise (fans, keyboard typing, room echo) and automatically normalizes speech volume via dynamic multi-stage compression.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.preprocessorEnabled}
                  onChange={(e) => update('preprocessorEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Acoustic Echo Cancellation</div>
                  <div className="text-[11px] text-slate-400">Removes speaker playback feedback</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.echoCancellation}
                  onChange={(e) => update('echoCancellation', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Hardware WebRTC Filtering</div>
                  <div className="text-[11px] text-slate-400">Direct hardware mic noise gating</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.noiseSuppression}
                  onChange={(e) => update('noiseSuppression', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Card: Volume Boost & Quality Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100">
              Audio Volume &amp; Quality Parameters
            </h3>

            <div className="space-y-4">
              {/* Input Volume */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Microphone Amplification Boost</span>
                  <span className="font-mono text-mumble-400">{settings.inputVolume}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={settings.inputVolume}
                  onChange={(e) => update('inputVolume', parseInt(e.target.value, 10))}
                  className="w-full accent-mumble-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sample Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Input Sample Rate
                  </label>
                  <select
                    value={settings.inputSampleRate}
                    onChange={(e) => update('inputSampleRate', parseInt(e.target.value, 10) as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-mumble-500"
                  >
                    <option value="8000">8,000 Hz (Low Bandwidth)</option>
                    <option value="16000">16,000 Hz (Voice optimized)</option>
                    <option value="32000">32,000 Hz (Wideband)</option>
                    <option value="48000">48,000 Hz (Fullband Hi-Fi Opus)</option>
                  </select>
                </div>

                {/* Bitrate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Bitrate: {(settings.inputBitrate / 1000).toFixed(0)} kbps
                  </label>
                  <input
                    type="range"
                    min="8000"
                    max="96000"
                    step="4000"
                    value={settings.inputBitrate}
                    onChange={(e) => update('inputBitrate', parseInt(e.target.value, 10))}
                    className="w-full accent-mumble-500 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUSH TO TALK */}
      {activeTab === 'ptt' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-mumble-400" />
              <span>PTT Trigger &amp; Keybindings</span>
            </h3>

            {/* Key recorder */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">Push-to-Talk Keybind</div>
                <div className="text-[11px] text-slate-400">Press this key anywhere while browsing the app</div>
              </div>

              <button
                onClick={() => setRecordingKey(true)}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                  recordingKey
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {recordingKey ? 'Press any key...' : settings.talkKey || 'Click to bind'}
              </button>
            </div>

            {/* Hot Corner */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Hot Corner Trigger</div>
                  <div className="text-[11px] text-slate-400">Floating on-screen PTT trigger button in corner</div>
                </div>
              </div>

              <select
                value={settings.hotCorner}
                onChange={(e) => update('hotCorner', e.target.value as HotCornerPosition)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-mumble-500"
              >
                <option value="none">Disabled (No Hot Corner)</option>
                <option value="bottomRight">Bottom-Right Corner</option>
                <option value="bottomLeft">Bottom-Left Corner</option>
                <option value="topRight">Top-Right Corner</option>
                <option value="topLeft">Top-Left Corner</option>
              </select>
            </div>

            {/* PTT Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Toggle PTT Mode</div>
                  <div className="text-[11px] text-slate-400">Click once to start talking, click again to stop</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.togglePtt}
                  onChange={(e) => update('togglePtt', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">PTT Beep Cue Sound</div>
                  <div className="text-[11px] text-slate-400">Plays classic Mumble chirp on transmission start/stop</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pttSound}
                  onChange={(e) => update('pttSound', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Hide Bottom PTT Button</div>
                  <div className="text-[11px] text-slate-400">Useful if using hardware keys or Hot Corner only</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hidePtt}
                  onChange={(e) => update('hidePtt', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>PTT Button Height</span>
                  <span className="font-mono text-mumble-400">{settings.pttButtonHeight}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={settings.pttButtonHeight}
                  onChange={(e) => update('pttButtonHeight', parseInt(e.target.value, 10))}
                  className="w-full accent-mumble-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATES & AUTH */}
      {activeTab === 'auth' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mumble User Identity Certificates</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mumble uses cryptographic certificates instead of passwords to verify user accounts
                </p>
              </div>

              <button
                onClick={() => setShowCertDialog(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-mumble-600 hover:bg-mumble-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate New</span>
              </button>
            </div>

            {/* List of certificates */}
            <div className="space-y-2">
              {settings.certificates.map((cert) => {
                const isSelected = settings.certificateId === cert.id;

                return (
                  <div
                    key={cert.id}
                    onClick={() => update('certificateId', cert.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-mumble-600/20 border-mumble-500 text-white ring-1 ring-mumble-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs">{cert.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Fingerprint: {cert.fingerprint}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Created: {cert.createdAt}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      {isSelected ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold hover:text-white">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal to generate new certificate */}
          {showCertDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Generate Certificate</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Creates a self-signed X.509 cryptographic certificate for passwordless authentication across Mumble servers.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Certificate Label
                  </label>
                  <input
                    type="text"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder="My Laptop Identity"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mumble-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowCertDialog(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider">
              General Client Preferences
            </h3>

            {/* Default Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Default Nickname
              </label>
              <input
                type="text"
                value={settings.defaultUsername}
                onChange={(e) => update('defaultUsername', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mumble-500"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Show Channel User Count</div>
                  <div className="text-[11px] text-slate-400">Displays number of online users beside channel titles</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showUserCount}
                  onChange={(e) => update('showUserCount', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Start Up in Pinned Mode</div>
                  <div className="text-[11px] text-slate-400">Only show pinned channels on server join</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startUpInPinnedMode}
                  onChange={(e) => update('startUpInPinnedMode', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Text-to-Speech (TTS)</div>
                  <div className="text-[11px] text-slate-400">Reads incoming chat messages aloud</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.useTts}
                  onChange={(e) => update('useTts', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Auto-Reconnect</div>
                  <div className="text-[11px] text-slate-400">Automatically rejoin server if disconnected</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoReconnect}
                  onChange={(e) => update('autoReconnect', e.target.checked)}
                  className="w-4 h-4 rounded text-mumble-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
