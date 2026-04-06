"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/stores/theme";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  author: {
    id: string;
    nickname: string;
    tag: string;
    avatar?: string;
    isVerified: boolean;
  };
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  userReaction: "LIKE" | "DISLIKE" | null;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onReact: (postId: string, type: "LIKE" | "DISLIKE") => void;
  onComment: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onAuthorClick: (userId: string) => void;
  isOwner: boolean;
}

export function PostCard({
  post,
  onReact,
  onComment,
  onDelete,
  onAuthorClick,
  isOwner,
}: PostCardProps) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onAuthorClick(post.author.id)}
            className="flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center overflow-hidden">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {post.author.nickname.charAt(0)}
                </span>
              )}
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAuthorClick(post.author.id)}
                className="font-semibold text-[var(--text-primary)] hover:underline"
              >
                {post.author.nickname}
              </button>
              <span className="text-[var(--text-secondary)]">
                #{post.author.tag}
              </span>
              {post.author.isVerified && <VerifiedBadge size={16} />}
              <span className="text-xs text-[var(--text-secondary)]">
                · {formatDate(post.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-[var(--text-primary)] whitespace-pre-wrap break-words">
              {post.content}
            </p>

            {post.mediaUrls.length > 0 && (
              <div
                className={`mt-3 grid gap-2 ${
                  post.mediaUrls.length === 1
                    ? ""
                    : post.mediaUrls.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2"
                }`}
              >
                {post.mediaUrls.slice(0, 4).map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface)]"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {post.mediaUrls.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          +{post.mediaUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--surface-elevated)]"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border)]">
          <button
            onClick={() => onReact(post.id, "LIKE")}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.userReaction === "LIKE"
                ? "text-green-500"
                : "text-[var(--text-secondary)] hover:text-green-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={post.userReaction === "LIKE" ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>{post.likesCount}</span>
          </button>

          <button
            onClick={() => onReact(post.id, "DISLIKE")}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.userReaction === "DISLIKE"
                ? "text-red-500"
                : "text-[var(--text-secondary)] hover:text-red-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={post.userReaction === "DISLIKE" ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
            <span>{post.dislikesCount}</span>
          </button>

          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentsCount}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
