export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  isFavorite?: boolean;
  ping?: number;
  users?: number;
  maxUsers?: number;
  country?: string;
  countryCode?: string;
  continent?: string;
  region?: string;
  url?: string;
}

export type TalkState = 'passive' | 'talking' | 'whispering' | 'shouting';

export interface User {
  session: number;
  name: string;
  channelId: number;
  isMuted: boolean;
  isDeafened: boolean;
  isSelfMuted: boolean;
  isSelfDeafened: boolean;
  isSuppressed: boolean;
  isPrioritySpeaker: boolean;
  talkState: TalkState;
  comment?: string;
  isRegistered?: boolean;
  isCurrentUser?: boolean;
  ping?: number;
  volumeBoost?: number; // local volume adjustment 0-200%
  isLocallyMuted?: boolean;
  isIgnored?: boolean;
}

export interface Channel {
  id: number;
  name: string;
  parentId: number | null;
  description?: string;
  position: number;
  isPinned?: boolean;
  isTemporary?: boolean;
  links?: number[];
  maxUsers?: number;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: string;
  senderSession?: number;
  target: string;
  targetType: 'channel' | 'tree' | 'whisper';
  text: string;
  isSystem?: boolean;
}

export type InputMethod = 'voiceActivity' | 'ptt' | 'continuous';
export type HotCornerPosition = 'none' | 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight';

export interface SettingsState {
  // Audio Input & Processing
  audioInputMethod: InputMethod;
  vadThreshold: number; // 0 - 100
  inputVolume: number; // 0 - 200 (%)
  preprocessorEnabled: boolean; // Suppresses ambient noise & normalizes volume (Key feature)
  echoCancellationMethod: 'none' | 'speex' | 'multichannel';
  noiseSuppression: boolean;
  echoCancellation: boolean;
  inputSampleRate: 8000 | 16000 | 32000 | 48000;
  inputBitrate: number; // 8000 to 96000 bps
  framesPerPacket: number; // 1, 2, 3, 4
  halfDuplex: boolean;
  handsetMode: boolean;

  // PTT Options
  pttSound: boolean;
  hidePtt: boolean;
  togglePtt: boolean;
  talkKey: string;
  hotCorner: HotCornerPosition;
  pttButtonHeight: number; // pixels, default 56

  // Server & Channel UI
  showUserCount: boolean;
  startUpInPinnedMode: boolean;
  theme: 'dark' | 'light' | 'classic';
  defaultUsername: string;

  // Chat & Speech
  chatNotify: boolean;
  useTts: boolean;
  shortTtsMessages: boolean;
  autoReconnect: boolean;

  // Certificates
  certificateId?: string;
  certificates: CertificateItem[];

  // Access Tokens
  accessTokens: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  fingerprint: string;
  createdAt: string;
}

export type DrawerNavigation =
  | 'all_channels'
  | 'pinned_channels'
  | 'server_info'
  | 'access_tokens'
  | 'favourites'
  | 'public_servers'
  | 'settings';
