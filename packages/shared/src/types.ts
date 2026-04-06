export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  tag: string;
  fullHandle: string;
  avatar?: string;
  description?: string;
  visibility: 'first_name' | 'full_name';
  isVerified: boolean;
  isOnline: boolean;
  lastSeen: Date;
  language: string;
  theme: 'dark' | 'light' | 'medium';
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend extends User {
  friendshipId: string;
  since: Date;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'game_invite' | 'call';
  replyToId?: string;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
}

export interface Game {
  id: string;
  type: string;
  status: 'waiting' | 'in_progress' | 'finished' | 'abandoned';
  players: GamePlayer[];
  currentTurn: string;
  state: Record<string, unknown>;
  winner?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePlayer {
  userId: string;
  isReady: boolean;
  score: number;
  finishedAt?: Date;
}

export interface GameMove {
  gameId: string;
  userId: string;
  move: Record<string, unknown>;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export interface Call {
  id: string;
  chatId: string;
  initiatorId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSettings {
  language: Language;
  theme: Theme;
  notifications: {
    sounds: boolean;
    push: boolean;
    vibration: boolean;
  };
  privacy: {
    whoCanMessage: 'everyone' | 'friends';
    whoCanAdd: 'everyone' | 'friends';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
}

type Language = 'pt-BR' | 'en' | 'zh' | 'yue' | 'ko' | 'ja' | 'ru';
type Theme = 'dark' | 'light' | 'medium';
