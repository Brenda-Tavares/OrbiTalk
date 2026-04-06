"use client";

import { useState, useEffect } from "react";
import { AITutorChat } from "./ai-tutor-chat";
import { AITutorPronunciation } from "./ai-tutor-pronunciation";
import { AITutorTranscription } from "./ai-tutor-transcription";
import { WarningBanner } from "./ai-tutor-warning";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/stores/theme";

type TabType = "chat" | "pronunciation" | "transcription";

interface AudioStatus {
  dailyUsed: number;
  dailyLimit: number;
  remaining: number | string;
  isPremium: boolean;
  pricing?: {
    monthly: { price: number };
    semestral: { price: number };
    permanent: { price: number };
  };
}

interface AITutorContainerProps {
  learningLanguage: string;
  apiBaseUrl: string;
  accessToken: string;
}

export function AITutorContainer({
  learningLanguage,
  apiBaseUrl,
  accessToken,
}: AITutorContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [audioStatus, setAudioStatus] = useState<AudioStatus | null>(null);
  const [warning, setWarning] = useState<{
    count: number;
    message: string;
  } | null>(null);
  const { theme } = useTheme();

  const tutorNames: Record<string, string> = {
    "pt-BR": "Luna",
    en: "Leo",
    zh: "Ming",
    yue: "Mei",
    ko: "Min-jun",
    ja: "Yuki",
    ru: "Alex",
  };

  const tutorLanguages: Record<string, string> = {
    "pt-BR": "Português",
    en: "English",
    zh: "中文",
    yue: "粵語",
    ko: "한국어",
    ja: "日本語",
    ru: "Русский",
  };

  const tutorName = tutorNames[learningLanguage] || "Leo";
  const tutorLanguage = tutorLanguages[learningLanguage] || "English";

  useEffect(() => {
    fetchAudioStatus();
  }, []);

  const fetchAudioStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai/audio-status`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAudioStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audio status:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    const response = await fetch(`${apiBaseUrl}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message,
        language: learningLanguage,
        learningLanguage,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      if (data.warning) {
        setWarning({
          count: data.warningCount,
          message: data.warning,
        });
      }
      throw new Error(data.error);
    }

    return {
      response: data.data.response,
      suggestions: data.data.suggestions,
    };
  };

  const handleEvaluatePronunciation = async (
    audioBlob: Blob,
    expectedText: string,
    language: string,
  ) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("expectedText", expectedText);
    formData.append("language", language);

    const response = await fetch(`${apiBaseUrl}/ai/pronunciation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      if (data.limit) {
        throw { limit: data.limit, used: data.used };
      }
      throw new Error(data.error);
    }

    return data.data;
  };

  const handleTranscribe = async (
    audioBlob: Blob,
    audioLanguage: string,
    targetLanguage?: string,
  ) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("audioLanguage", audioLanguage);
    if (targetLanguage) {
      formData.append("targetLanguage", targetLanguage);
    }

    const response = await fetch(`${apiBaseUrl}/ai/transcribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      if (data.limit) {
        throw { limit: data.limit, used: data.used };
      }
      throw new Error(data.error);
    }

    return data.data;
  };

  const handleLimitReached = () => {
    fetchAudioStatus();
  };

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: "chat",
      label: "Chat",
      icon: (
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      icon: (
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
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      id: "transcription",
      label: "Transcription",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {warning && (
        <div className="p-4">
          <WarningBanner
            warningCount={warning.count}
            maxWarnings={3}
            message={warning.message}
            onDismiss={() => setWarning(null)}
          />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <AITutorChat
            language={learningLanguage}
            learningLanguage={learningLanguage}
            tutorName={tutorName}
            tutorLanguage={tutorLanguage}
            onSendMessage={handleSendMessage}
            onWarning={(count, message) => setWarning({ count, message })}
          />
        )}

        {activeTab === "pronunciation" && (
          <div className="h-full overflow-y-auto p-4">
            <AITutorPronunciation
              language={learningLanguage}
              expectedText="Hello, how are you today?"
              onEvaluate={handleEvaluatePronunciation}
              onLimitReached={handleLimitReached}
              remainingFree={
                audioStatus?.isPremium ? "unlimited" : audioStatus?.remaining
              }
            />
          </div>
        )}

        {activeTab === "transcription" && (
          <div className="h-full overflow-y-auto p-4">
            <AITutorTranscription
              audioLanguage={learningLanguage}
              onTranscribe={handleTranscribe}
              onLimitReached={handleLimitReached}
              remainingFree={
                audioStatus?.isPremium ? "unlimited" : audioStatus?.remaining
              }
            />
          </div>
        )}
      </div>

      {!audioStatus?.isPremium && audioStatus?.pricing && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <p className="text-xs text-center text-[var(--text-secondary)] mb-2">
            Upgrade for unlimited audio transcription
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() =>
                (window.location.href = "/subscription?plan=monthly")
              }
            >
              $2.99/mo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() =>
                (window.location.href = "/subscription?plan=semestral")
              }
            >
              $14.99/6mo
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() =>
                (window.location.href = "/subscription?plan=permanent")
              }
            >
              $29.99 forever
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
