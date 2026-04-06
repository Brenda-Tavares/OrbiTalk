"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { useTheme } from "@/stores/theme";

interface TranscriptionResult {
  original: string;
  originalLanguage: string;
  translated?: string;
  targetLanguage?: string;
  isPremium: boolean;
  remainingFree?: number | string;
}

interface AITutorTranscriptionProps {
  audioLanguage: string;
  onTranscribe: (
    audioBlob: Blob,
    audioLanguage: string,
    targetLanguage?: string,
  ) => Promise<TranscriptionResult>;
  onLimitReached?: (limit: number, used: number) => void;
  remainingFree?: number | string;
}

const LANGUAGES = [
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "en", name: "English" },
  { code: "zh", name: "中文 (Mandarim)" },
  { code: "yue", name: "粵語 (Cantonês)" },
  { code: "ko", name: "한국어 (Coreano)" },
  { code: "ja", name: "日本語 (Japonês)" },
  { code: "ru", name: "Русский (Russo)" },
];

export function AITutorTranscription({
  audioLanguage,
  onTranscribe,
  onLimitReached,
  remainingFree,
}: AITutorTranscriptionProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const { theme } = useTheme();

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    setResult(null);

    try {
      const transcription = await onTranscribe(
        audioBlob,
        audioLanguage,
        targetLanguage || undefined,
      );
      setResult(transcription);
    } catch (err: any) {
      if (err.limit) {
        onLimitReached?.(err.limit, err.used);
      }
      setError(err.message || "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Audio Transcription
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Record audio to transcribe and optionally translate
        </p>
      </div>

      <div className="bg-[var(--surface)] rounded-xl p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">
            Audio Language
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-[var(--surface-elevated)] rounded-lg text-[var(--text-primary)] font-medium">
              {LANGUAGES.find((l) => l.code === audioLanguage)?.name ||
                audioLanguage}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">
            Translate to (optional)
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]"
          >
            <option value="">No translation</option>
            {LANGUAGES.filter((l) => l.code !== audioLanguage).map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {typeof remainingFree === "number" && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-[var(--text-secondary)]">
            Free transcriptions remaining today:
          </span>
          <span
            className={`font-semibold ${
              remainingFree <= 2
                ? "text-[var(--error)]"
                : "text-[var(--primary)]"
            }`}
          >
            {remainingFree}
          </span>
          {remainingFree <= 3 && (
            <Button
              variant="link"
              size="sm"
              className="text-[var(--primary)] p-0 h-auto"
              onClick={() => (window.location.href = "/subscription")}
            >
              Upgrade
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center">
        <AudioRecorder
          onRecordingComplete={handleAudioRecorded}
          disabled={isTranscribing}
          language={audioLanguage}
        />

        {isTranscribing && (
          <div className="mt-4 flex items-center gap-2 text-[var(--text-secondary)]">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Transcribing audio...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg p-4">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[var(--surface)] rounded-xl p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                  Original
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {result.originalLanguage}
                </span>
              </div>
              <p className="text-lg text-[var(--text-primary)]">
                {result.original}
              </p>
            </div>

            {result.translated && (
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--primary)] uppercase">
                    Translation
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {result.targetLanguage}
                  </span>
                </div>
                <p className="text-lg text-[var(--primary)]">
                  {result.translated}
                </p>
              </div>
            )}

            {result.remainingFree !== "unlimited" && (
              <div className="border-t border-[var(--border)] pt-2 text-xs text-[var(--text-secondary)]">
                {typeof result.remainingFree === "number" &&
                  result.remainingFree > 0 && (
                    <span>
                      {result.remainingFree} free transcriptions remaining today
                    </span>
                  )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Transcribe Another
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  result.translated
                    ? `${result.original}\n\n${result.translated}`
                    : result.original,
                );
              }}
              className="flex-1"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
