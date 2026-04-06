import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Smile, Paperclip, Mic, Send, Image, Video, Film, X } from 'lucide-react';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachImage?: () => void;
  onAttachVideo?: () => void;
  onRecordAudio?: () => void;
  onSendGif?: () => void;
  isRecording?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  ({ 
    value, 
    onChange, 
    onSend, 
    onAttachImage, 
    onAttachVideo,
    onRecordAudio,
    onSendGif,
    isRecording,
    isLoading,
    placeholder = 'Type a message...',
    disabled 
  }, ref) => {
    const [showAttachments, setShowAttachments] = React.useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div ref={ref} className="flex items-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className="h-10 w-10 p-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {showAttachments && (
            <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-2 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAttachImage}
                className="flex-col gap-1 p-2"
                title="Send image"
              >
                <Image className="h-5 w-5" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAttachVideo}
                className="flex-col gap-1 p-2"
                title="Send video"
              >
                <Video className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSendGif}
                className="flex-col gap-1 p-2"
                title="Send GIF"
              >
                <Film className="h-5 w-5" />
                <span className="text-xs">GIF</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onRecordAudio}
          >
            <Mic className={cn('h-5 w-5', isRecording && 'text-danger animate-pulse')} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={onSendGif}
        >
          <Smile className="h-5 w-5" />
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          isLoading={isLoading}
          className="h-10 w-10 p-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export interface MediaPreviewProps {
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  onRemove?: () => void;
  progress?: number;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  type,
  url,
  onRemove,
  progress
}) => {
  return (
    <div className="relative inline-block">
      {type === 'image' && (
        <div className="relative inline-block">
          <img
            src={url}
            alt="Preview"
            className="max-h-64 max-w-full rounded-lg object-contain"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {type === 'video' && (
        <div className="relative inline-block">
          <video
            src={url}
            controls
            className="max-h-64 max-w-full rounded-lg"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {progress !== undefined && progress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-2 w-3/4 rounded-full bg-gray-600">
                <div 
                  className="h-full rounded-full bg-primary" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'audio' && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] p-3">
          <audio src={url} controls className="h-8 w-64" />
          {onRemove && (
            <button
              onClick={onRemove}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {type === 'gif' && (
        <div className="relative inline-block">
          <img
            src={url}
            alt="GIF"
            className="max-h-64 max-w-full rounded-lg"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export interface MessageBubbleProps {
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif';
  isOwn: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  replyTo?: {
    content: string;
    sender: string;
  };
  reactions?: {
    emoji: string;
    count: number;
  }[];
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  type,
  isOwn,
  timestamp,
  status,
  mediaUrl,
  replyTo,
  reactions,
  onReact,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const renderContent = () => {
    switch (type) {
      case 'image':
        return mediaUrl ? (
          <img
            src={mediaUrl}
            alt="Image"
            className="max-h-64 max-w-full cursor-pointer rounded-lg"
          />
        ) : null;
      
      case 'video':
        return mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            className="max-h-64 max-w-full rounded-lg"
          />
        ) : null;
      
      case 'audio':
        return mediaUrl ? (
          <audio src={mediaUrl} controls className="h-10 w-64" />
        ) : null;
      
      case 'gif':
        return mediaUrl ? (
          <img
            src={mediaUrl}
            alt="GIF"
            className="max-h-64 max-w-full cursor-pointer rounded-lg"
          />
        ) : null;
      
      default:
        return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group relative max-w-[70%] rounded-2xl px-4 py-2',
          isOwn ? 'bg-primary text-white' : 'bg-[var(--color-surface)] text-[var(--color-text)]'
        )}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        {replyTo && (
          <div className={cn(
            'mb-2 rounded-lg border-l-2 p-2 text-sm',
            isOwn ? 'border-white/30 bg-white/10' : 'border-[var(--color-border)] bg-[var(--color-bg)]'
          )}>
            <p className="font-semibold">{replyTo.sender}</p>
            <p className="truncate opacity-70">{replyTo.content}</p>
          </div>
        )}

        {renderContent()}
        
        <div className={cn(
          'mt-1 flex items-center gap-2 text-xs',
          isOwn ? 'justify-end text-white/70' : 'text-[var(--color-text-secondary)]'
        )}>
          <span>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && status && (
            <span>
              {status === 'sending' && '...'}
              {status === 'sent' && '✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'read' && <span className="text-secondary">✓✓</span>}
            </span>
          )}
        </div>

        {reactions && reactions.length > 0 && (
          <div className={cn(
            'absolute -bottom-3 flex gap-1 rounded-full border px-2 py-0.5',
            isOwn ? 'border-primary bg-[var(--color-surface)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          )}>
            {reactions.map((r, i) => (
              <span key={i} className="text-sm">
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)} 
            />
            <div className={cn(
              'absolute z-50 flex flex-col rounded-lg border py-1 shadow-lg',
              isOwn ? 'right-0 bg-[var(--color-elevated)]' : 'left-0 bg-[var(--color-elevated)]'
            )}>
              <button
                onClick={() => { onReact?.('👍'); setShowMenu(false); }}
                className="px-4 py-2 text-left hover:bg-[var(--color-surface)]"
              >
                Reactions
              </button>
              <button
                onClick={() => { onReply?.(); setShowMenu(false); }}
                className="px-4 py-2 text-left hover:bg-[var(--color-surface)]"
              >
                Reply
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => { onEdit?.(); setShowMenu(false); }}
                    className="px-4 py-2 text-left hover:bg-[var(--color-surface)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { onDelete?.(); setShowMenu(false); }}
                    className="px-4 py-2 text-left text-danger hover:bg-[var(--color-surface)]"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
