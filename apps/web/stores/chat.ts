import { create } from 'zustand';

interface Chat {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isTyping: boolean;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  removeChat: (chatId: string) => void;
  setTyping: (isTyping: boolean) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  isTyping: false,
  setChats: (chats) => set({ chats }),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, ...updates } : c
      ),
    })),
  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
    })),
  setTyping: (isTyping) => set({ isTyping }),
  incrementUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId && state.activeChatId !== chatId
          ? { ...c, unreadCount: c.unreadCount + 1 }
          : c
      ),
    })),
  clearUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
