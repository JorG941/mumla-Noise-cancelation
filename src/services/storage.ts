import { Server, SettingsState } from '../types';

const SETTINGS_KEY = 'mumla_settings_v1';
const FAVOURITES_KEY = 'mumla_favourites_v1';
const TOKENS_KEY = 'mumla_tokens_v1';

export const DEFAULT_SETTINGS: SettingsState = {
  audioInputMethod: 'voiceActivity',
  vadThreshold: 45,
  inputVolume: 100,
  preprocessorEnabled: true, // Suppresses ambient noise and normalizes audio volume
  echoCancellationMethod: 'speex',
  noiseSuppression: true,
  echoCancellation: true,
  inputSampleRate: 48000,
  inputBitrate: 40000,
  framesPerPacket: 2,
  halfDuplex: false,
  handsetMode: false,

  pttSound: true,
  hidePtt: false,
  togglePtt: false,
  talkKey: 'Space',
  hotCorner: 'none',
  pttButtonHeight: 56,

  showUserCount: true,
  startUpInPinnedMode: false,
  theme: 'dark',
  defaultUsername: 'Mumla_User',

  chatNotify: true,
  useTts: false,
  shortTtsMessages: false,
  autoReconnect: true,

  certificates: [
    {
      id: 'cert-1',
      name: 'Default Mumla Identity',
      fingerprint: '3b:a8:c1:9f:02:e4:65:d1:aa:90:7b:15:3e:7a:59:04:11:82:f0:8b',
      createdAt: '2025-01-15',
    },
  ],
  certificateId: 'cert-1',
  accessTokens: ['welcome-pass', 'vip-lounge'],
};

export const DEFAULT_SERVERS: Server[] = [
  {
    id: 'fav-1',
    name: 'Mumla Community Voice',
    host: 'voice.mumla.org',
    port: 64738,
    username: 'Mumla_User',
    isFavorite: true,
    ping: 28,
    users: 6,
    maxUsers: 100,
    country: 'Sweden',
    countryCode: 'SE',
    region: 'Stockholm',
  },
  {
    id: 'fav-2',
    name: 'Open Gaming & Tech HQ',
    host: 'mumble.freetech.net',
    port: 64738,
    username: 'Mumla_User',
    isFavorite: true,
    ping: 42,
    users: 14,
    maxUsers: 150,
    country: 'Germany',
    countryCode: 'DE',
    region: 'Frankfurt',
  },
  {
    id: 'fav-3',
    name: 'Global Audio Lab (Low Latency)',
    host: 'mumble.audiolab.io',
    port: 64738,
    username: 'Mumla_User',
    isFavorite: true,
    ping: 19,
    users: 3,
    maxUsers: 50,
    country: 'United States',
    countryCode: 'US',
    region: 'New York',
  },
];

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadFavourites(): Server[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    if (!raw) return DEFAULT_SERVERS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse favourites from localStorage', e);
    return DEFAULT_SERVERS;
  }
}

export function saveFavourites(servers: Server[]): void {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(servers));
  } catch (e) {
    console.error('Failed to save favourites to localStorage', e);
  }
}

export function loadTokens(): string[] {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return DEFAULT_SETTINGS.accessTokens;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SETTINGS.accessTokens;
  }
}

export function saveTokens(tokens: string[]): void {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save tokens', e);
  }
}
