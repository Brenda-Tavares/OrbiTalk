"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { useTheme } from "@/stores/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  pronunciationScore?: number;
  feedback?: string;
}

interface AITutorChatProps {
  language: string;
  learningLanguage: string;
  tutorName: string;
  tutorLanguage: string;
  onSendMessage: (message: string) => Promise<{
    response: string;
    suggestions: string[];
  }>;
  onWarning?: (count: number, message: string) => void;
}

export function AITutorChat({
  language,
  learningLanguage,
  tutorName,
  tutorLanguage,
  onSendMessage,
  onWarning,
}: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const result = await onSendMessage(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      if (error.warning) {
        onWarning?.(error.warningCount, error.warning);
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Sorry, I couldn't process that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions: Record<string, string[]> = {
    "pt-BR": [
      "Como você está?",
      "Qual é o seu nome?",
      "Onde você mora?",
      "Eu estou aprendendo português",
    ],
    en: [
      "How are you?",
      "What is your name?",
      "Where do you live?",
      "I am learning English",
    ],
    zh: ["你好吗？", "你叫什么名字？", "你住在哪里？", "我在学习中文"],
    yue: ["你好嗎？", "你叫咩名？", "你住喺邊度？", "我學緊粵語"],
    ko: [
      "안녕하세요?",
      "이름이 뭐예요?",
      "어디에 살아요?",
      "한국어를 배우고 있어요",
    ],
    ja: [
      "元気ですか？",
      "お名前は何ですか？",
      "どこに、住んでますか？",
      "日本語を勉強しています",
    ],
    ru: ["Как дела?", "Как тебя зовут?", "Где ты живёшь?", "Я учу русский"],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {tutorName.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            {tutorName}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {tutorLanguage} Tutor
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Practice {tutorLanguage} with {tutorName}!
            </h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
              Start a conversation or try one of the suggestions below.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-br-sm"
                  : "bg-[var(--surface)] text-[var(--text-primary)] rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.pronunciationScore !== undefined && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Pronunciation:</span>
                    <span className="font-semibold">
                      {message.pronunciationScore}%
                    </span>
                  </div>
                  {message.feedback && (
                    <p className="text-xs mt-1 opacity-75">
                      {message.feedback}
                    </p>
                  )}
                </div>
              )}
              <span
                className={`text-xs mt-1 block ${
                  message.role === "user"
                    ? "text-white/60"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {showSuggestions && messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] text-center mb-2">
              Try saying:
            </p>
            {(
              suggestions[learningLanguage as keyof typeof suggestions] ||
              suggestions["en"]
            ).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="block w-full text-left px-4 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--surface-elevated)] rounded-lg text-[var(--text-primary)] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type in ${tutorLanguage}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
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
          </Button>
        </div>
      </div>
    </div>
  );
}
