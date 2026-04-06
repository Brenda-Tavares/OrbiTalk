"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/stores/theme";

interface WarningBannerProps {
  warningCount: number;
  maxWarnings: number;
  message: string;
  onDismiss?: () => void;
}

export function AITutorWarning({
  warningCount,
  maxWarnings,
  message,
  onDismiss,
}: WarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();

  if (!isVisible) return null;

  const remainingWarnings = maxWarnings - warningCount;
  const severity =
    warningCount === maxWarnings
      ? "danger"
      : warningCount >= maxWarnings - 1
        ? "warning"
        : "info";

  const getStyles = () => {
    switch (severity) {
      case "danger":
        return "bg-red-500/10 border-red-500/30 text-red-500";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    }
  };

  return (
    <div
      className={`rounded-lg p-4 border ${getStyles()} animate-in slide-in-from-top duration-300`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium mb-1">
            Warning {warningCount}/{maxWarnings}
          </p>
          <p className="text-sm opacity-90">{message}</p>
          {remainingWarnings > 0 && remainingWarnings <= 2 && (
            <p className="text-sm mt-2 opacity-75">
              {remainingWarnings === 1
                ? "1 more warning will result in account restrictions."
                : `${remainingWarnings} more warnings before account restrictions.`}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="opacity-70 hover:opacity-100"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
