"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/stores/theme";
import { useAuth } from "@/stores/auth";
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

export function CreatePost() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onSuccess, setOnSuccess] = useState<(() => void) | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (response.ok) {
        setContent("");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">
                {user?.nickname?.charAt(0) || "U"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent border-none resize-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              rows={3}
              maxLength={5000}
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="icon">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  {content.length}/5000
                </span>
                <Button
                  type="submit"
                  disabled={!content.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}

interface PostsFeedProps {
  userId?: string;
  onAuthorClick?: (userId: string) => void;
}

export function PostsFeed({ userId, onAuthorClick }: PostsFeedProps) {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPosts();
  }, [isAuthenticated, userId, refreshKey]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const url = userId ? `/api/users/${userId}/posts` : "/api/posts/feed";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReact = async (postId: string, type: "LIKE" | "DISLIKE") => {
    try {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;

            let likesCount = p.likesCount;
            let dislikesCount = p.dislikesCount;
            let userReaction = data.data.type;

            if (p.userReaction === type) {
              userReaction = null;
              if (type === "LIKE") likesCount--;
              else dislikesCount--;
            } else {
              if (p.userReaction === "LIKE") likesCount--;
              if (p.userReaction === "DISLIKE") dislikesCount--;
              if (type === "LIKE") likesCount++;
              else dislikesCount++;
            }

            return { ...p, likesCount, dislikesCount, userReaction };
          }),
        );
      }
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  const handleComment = (postId: string) => {
    onAuthorClick?.(postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleAuthorClick = (authorId: string) => {
    if (onAuthorClick) {
      onAuthorClick(authorId);
    } else {
      window.location.href = `/profile/${authorId}`;
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <p className="text-[var(--text-secondary)]">
          {userId
            ? "No posts yet. Add friends to see their posts!"
            : "No posts to show. Start by adding some friends!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!userId && <CreatePost />}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onReact={handleReact}
          onComment={handleComment}
          onDelete={post.author.id === user?.id ? handleDelete : undefined}
          onAuthorClick={handleAuthorClick}
          isOwner={post.author.id === user?.id}
        />
      ))}
    </div>
  );
}
