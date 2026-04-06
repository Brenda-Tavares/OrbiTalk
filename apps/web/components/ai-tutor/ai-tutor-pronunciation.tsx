"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { useTheme } from "@/stores/theme";

interface PronunciationResult {
  score: number;
  feedback: string;
  phonemes: {
    char: string;
    score: number;
    correct: boolean;
  }[];
  tips: string[];
}

interface AITutorPronunciationProps {
  language: string;
  expectedText: string;
  onEvaluate: (
    audioBlob: Blob,
    expectedText: string,
    language: string,
  ) => Promise<PronunciationResult>;
  onLimitReached?: (limit: number, used: number) => void;
  remainingFree?: number | string;
}

export function AITutorPronunciation({
  language,
  expectedText,
  onEvaluate,
  onLimitReached,
  remainingFree,
}: AITutorPronunciationProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setIsEvaluating(true);
    setError(null);
    setResult(null);

    try {
      const evaluation = await onEvaluate(audioBlob, expectedText, language);
      setResult(evaluation);
    } catch (err: any) {
      if (err.limit) {
        onLimitReached?.(err.limit, err.used);
      }
      setError(err.message || "Failed to evaluate pronunciation");
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-yellow-500";
    if (score >= 70) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great!";
    if (score >= 70) return "Good";
    return "Keep practicing";
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Practice Pronunciation
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Read the text below and record your voice
        </p>
      </div>

      <div className="bg-[var(--surface)] rounded-xl p-6 text-center">
        <p className="text-2xl font-medium text-[var(--text-primary)] mb-2">
          {expectedText}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          Language: {language.toUpperCase()}
        </p>
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
        </div>
      )}

      <div className="flex flex-col items-center">
        <AudioRecorder
          onRecordingComplete={handleAudioRecorded}
          disabled={isEvaluating}
          language={language}
        />

        {isEvaluating && (
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
            <span>Analyzing your pronunciation...</span>
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
          <div className="bg-[var(--surface)] rounded-xl p-6">
            <div className="text-center mb-4">
              <div
                className={`text-6xl font-bold ${getScoreColor(result.score)}`}
              >
                {result.score}%
              </div>
              <p className="text-lg font-medium text-[var(--text-primary)] mt-2">
                {getScoreLabel(result.score)}
              </p>
            </div>

            <p className="text-center text-[var(--text-secondary)] mb-4">
              {result.feedback}
            </p>

            {result.phonemes.length > 0 && (
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Phoneme Analysis:
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {result.phonemes.map((phoneme, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        phoneme.correct
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                      title={`Score: ${phoneme.score}%`}
                    >
                      {phoneme.char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.tips.length > 0 && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                Tips for improvement:
              </p>
              <ul className="space-y-1">
                {result.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setResult(null)}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
