"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";
import { postsApi } from "@/lib/api";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface PostWithAuthor {
  id: string;
  content: string;
  imageUrl?: string;
  author: {
    id: string;
    nickname: string;
    tag: string;
    avatar?: string;
    isVerified: boolean;
  };
  likes: number;
  dislikes: number;
  comments: number;
  createdAt: string;
  userReaction?: "like" | "dislike";
}

export default function PostsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const response = await postsApi.getPosts();
      if (response.success && response.data) {
        setPosts(response.data);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.userReaction === "like") {
      await postsApi.removeReaction(postId);
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return { ...p, likes: p.likes - 1, userReaction: undefined };
          }
          return p;
        }),
      );
    } else {
      await postsApi.like(postId);
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: p.userReaction === "dislike" ? p.likes + 2 : p.likes + 1,
              dislikes:
                p.userReaction === "dislike" ? p.dislikes - 1 : p.dislikes,
              userReaction: "like",
            };
          }
          return p;
        }),
      );
    }
  };

  const handleDislike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.userReaction === "dislike") {
      await postsApi.removeReaction(postId);
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return { ...p, dislikes: p.dislikes - 1, userReaction: undefined };
          }
          return p;
        }),
      );
    } else {
      await postsApi.dislike(postId);
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              dislikes:
                p.userReaction === "like" ? p.dislikes + 2 : p.dislikes + 1,
              likes: p.userReaction === "like" ? p.likes - 1 : p.likes,
              userReaction: "dislike",
            };
          }
          return p;
        }),
      );
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);

    const response = await postsApi.createPost(newPost);
    if (response.success && response.data) {
      setPosts([response.data, ...posts]);
      setNewPost("");
    }
    setPosting(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-4">
          {t("nav.posts")}
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPost()}
            placeholder={t("posts.placeholder") || "O que você está pensando?"}
            className="flex-1 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text)]"
          />
          <button
            onClick={createPost}
            disabled={posting || !newPost.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-full font-medium disabled:opacity-50"
          >
            {posting ? "..." : t("common.post") || "Postar"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">
            <p>{t("posts.empty") || "Nenhuma publicação ainda"}</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {post.author?.nickname?.charAt(0) || "?"}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[var(--color-text)]">
                    {post.author?.nickname || "Usuário"}
                  </span>
                  {post.author?.isVerified && <VerifiedBadge size={14} />}
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {" "}
                    • {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-[var(--color-text)] mb-4">{post.content}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    post.userReaction === "like"
                      ? "bg-success/20 text-success"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={
                      post.userReaction === "like" ? "currentColor" : "none"
                    }
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
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => handleDislike(post.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    post.userReaction === "dislike"
                      ? "bg-danger/20 text-danger"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={
                      post.userReaction === "dislike" ? "currentColor" : "none"
                    }
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
                  <span>{post.dislikes}</span>
                </button>

                <button className="flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
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
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
