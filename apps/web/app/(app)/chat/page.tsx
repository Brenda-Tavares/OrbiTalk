"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; text: string; sent: boolean; time: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setChats([
      {
        id: "1",
        name: "Maria Santos",
        lastMessage: "Olá! Como vai?",
        lastMessageTime: "2 min",
        unreadCount: 2,
        isOnline: true,
      },
      {
        id: "2",
        name: "João Silva",
        lastMessage: "Vamos jogar gamão?",
        lastMessageTime: "1h",
        unreadCount: 0,
        isOnline: false,
      },
      {
        id: "3",
        name: "Ana Chen",
        lastMessage: "Can we practice Chinese?",
        lastMessageTime: "3h",
        unreadCount: 1,
        isOnline: true,
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Entendi! 😄",
          sent: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          {t("nav.chat")}
        </h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!selectedChat ? (
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <p>{t("chat.empty") || "Nenhuma conversa ainda"}</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                      {chat.name.charAt(0)}
                    </div>
                    {chat.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[var(--color-bg)]" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-[var(--color-text)]">
                          {chat.name}
                        </span>
                        {chat.isVerified && <VerifiedBadge size={14} />}
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-[var(--color-surface)] rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-[var(--color-text)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                  {selectedChat.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[var(--color-text)]">
                    {selectedChat.name}
                  </span>
                  {selectedChat.isVerified && <VerifiedBadge size={14} />}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-[var(--color-text-secondary)] py-8">
                  <p>{t("chat.start") || "Envie uma mensagem para começar"}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sent ? "bg-primary-500 text-white" : "bg-[var(--color-surface)] text-[var(--color-text)]"}`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${msg.sent ? "text-white/70" : "text-[var(--color-text-secondary)]"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-[var(--color-border)] flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={t("chat.placeholder") || "Digite uma mensagem..."}
                className="flex-1 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text)]"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-primary-500 rounded-full text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
