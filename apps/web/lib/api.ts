const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Request failed",
          details: data.details,
        };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Upload failed",
        };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload error",
      };
    }
  }
}

export const api = new ApiClient();

export interface User {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  tag?: string;
  avatar?: string;
  bio?: string;
  description?: string;
  country?: string;
  countryCode?: string;
  languages: string[];
  interests: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Post {
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

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    country: string;
    languages: string[];
  }) => api.post<AuthResponse>("/api/auth/register", data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),

  me: () => api.get<User>("/api/auth/me"),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/api/auth/refresh", { refreshToken }),

  updateProfile: (data: Partial<User>) =>
    api.put<User>("/api/auth/profile", data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/api/auth/change-password", { currentPassword, newPassword }),
};

export const discoveryApi = {
  getUsers: (filters?: {
    language?: string;
    online?: boolean;
    country?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.language) params.append("language", filters.language);
    if (filters?.online) params.append("online", "true");
    if (filters?.country) params.append("country", filters.country);
    if (filters?.ageMin) params.append("ageMin", filters.ageMin.toString());
    if (filters?.ageMax) params.append("ageMax", filters.ageMax.toString());
    if (filters?.gender) params.append("gender", filters.gender);
    if (filters?.page) params.append("page", filters.page.toString());
    return api.get<{ users: any[]; page: number; hasMore: boolean }>(
      `/api/discovery/discover?${params.toString()}`,
    );
  },

  getRecommendations: () => api.get<any[]>("/api/discovery/recommendations"),

  sendFriendRequest: (userId: string) =>
    api.post(`/api/discovery/friend/request`, { userId }),

  acceptFriend: (requestId: string) =>
    api.post(`/api/discovery/friends/accept/${requestId}`),

  rejectFriend: (requestId: string) =>
    api.post(`/api/discovery/friends/reject/${requestId}`),

  getFriends: () => api.get<any[]>("/api/discovery/friends"),

  removeFriend: (userId: string) =>
    api.delete(`/api/discovery/friends/${userId}`),

  getUserProfile: (userId: string) =>
    api.get<any>(`/api/discovery/discover/${userId}`),

  blockUser: (userId: string, reason: string, otherReason?: string) =>
    api.post(`/api/discovery/block/${userId}`, { reason, otherReason }),
};

export const postsApi = {
  getPosts: (page = 1, limit = 20) =>
    api.get<Post[]>(`/api/posts?page=${page}&limit=${limit}`),

  getPost: (id: string) => api.get<Post>(`/api/posts/${id}`),

  createPost: (content: string, imageUrl?: string) =>
    api.post<Post>("/api/posts", { content, imageUrl }),

  deletePost: (id: string) => api.delete(`/api/posts/${id}`),

  like: (postId: string) => api.post(`/api/posts/${postId}/like`),

  dislike: (postId: string) => api.post(`/api/posts/${postId}/dislike`),

  removeReaction: (postId: string) =>
    api.delete(`/api/posts/${postId}/reaction`),

  comment: (postId: string, content: string) =>
    api.post(`/api/posts/${postId}/comments`, { content }),

  getComments: (postId: string) => api.get(`/api/posts/${postId}/comments`),
};

export const chatApi = {
  getConversations: () => api.get<Conversation[]>("/api/chat/conversations"),

  getMessages: (conversationId: string, page = 1) =>
    api.get<Message[]>(`/api/chat/${conversationId}/messages?page=${page}`),

  sendMessage: (conversationId: string, content: string) =>
    api.post<Message>(`/api/chat/${conversationId}/messages`, { content }),

  markAsRead: (conversationId: string) =>
    api.post(`/api/chat/${conversationId}/read`),

  startConversation: (userId: string) =>
    api.post<Conversation>("/api/chat/start", { userId }),
};

export const companionApi = {
  chat: (message: string, context?: string) =>
    api.post<{ response: string; shouldReport: boolean }>(
      "/api/companion/chat",
      {
        message,
        context,
      },
    ),

  analyzeSituation: (description: string) =>
    api.post<{ analysis: string; suggestions: string[] }>(
      "/api/companion/analyze",
      { description },
    ),
};

export const compatibilityApi = {
  calculate: (userId: string) =>
    api.post<{ percentage: number; details: string }>(
      "/api/compatibility/calculate",
      { userId },
    ),

  getWithUser: (userId: string) =>
    api.get<{ percentage: number; details: string }>(
      `/api/compatibility/${userId}`,
    ),
};

export const reportsApi = {
  create: (data: {
    type: string;
    targetId: string;
    description: string;
    evidence?: string[];
  }) => api.post("/api/reports", data),

  getMyReports: () => api.get("/api/reports/my-reports"),

  blockUser: (userId: string) => api.post("/api/reports/block", { userId }),

  unblockUser: (userId: string) => api.delete(`/api/reports/block/${userId}`),

  getBlockedUsers: () => api.get("/api/reports/blocked"),
};

export const verificationApi = {
  submitVerification: (idDocument: string, selfie: string) => {
    const formData = new FormData();
    formData.append("idDocument", idDocument);
    formData.append("selfie", selfie);
    return api.upload<{ status: string }>("/api/verification/submit", formData);
  },

  getStatus: () =>
    api.get<{ status: string; level?: number }>("/api/verification/status"),
};

export default api;
