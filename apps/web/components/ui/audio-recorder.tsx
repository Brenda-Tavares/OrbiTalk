import * as React from 'react';
import { Mic, Square, Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onSend,
  onCancel,
  maxDuration = 120, // 2 minutes default
}) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setError(null);
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    
    setIsSending(true);
    try {
      onSend(audioBlob, duration);
      resetRecording();
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    stopRecording();
    resetRecording();
    onCancel();
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-danger bg-danger/10 p-3">
        <p className="flex-1 text-sm text-danger">{error}</p>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Close
        </Button>
      </div>
    );
  }

  if (audioUrl && audioBlob) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <audio ref={audioRef} src={audioUrl} controls className="h-10 flex-1" />
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {formatDuration(duration)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-danger"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={isSending}
          isLoading={isSending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-danger" />
            <span className="font-mono text-lg font-semibold text-danger">
              {formatDuration(duration)}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              / {formatDuration(maxDuration)}
            </span>
          </div>

          <div className="flex flex-1 justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={pauseRecording}
            >
              {isPaused ? (
                <Mic className="h-5 w-5 text-danger" />
              ) : (
                <Square className="h-5 w-5 fill-current text-danger" />
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={stopRecording}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="flex-1"
          >
            <Mic className="mr-2 h-5 w-5" />
            Tap to record
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </>
      )}
    </div>
  );
};
