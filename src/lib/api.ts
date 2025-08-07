import {
  User,
  Video,
  Comment,
  Like,
  Follow,
  Chat,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  LikeRequest,
  LikeResponse,
  FollowRequest,
  FollowResponse,
  CommentRequest,
  ChatRequest,
  VideoStats,
  UserStats,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to get auth headers for form data
const getAuthHeadersFormData = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: RegisterRequest): Promise<AuthResponse> =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  validateToken: (
    token: string
  ): Promise<{ valid: boolean; username?: string; userId?: string }> =>
    apiRequest("/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  getCurrentUser: (): Promise<User> => apiRequest("/api/auth/me"),
};

// Users API
export const usersAPI = {
  getAllUsers: (): Promise<User[]> => apiRequest("/api/users"),

  getUserById: (id: string): Promise<User> => apiRequest(`/api/users/${id}`),

  getUserByUsername: (username: string): Promise<User> =>
    apiRequest(`/api/users/username/${username}`),

  updateUser: (id: string, userData: Partial<User>): Promise<User> =>
    apiRequest(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: string): Promise<void> =>
    apiRequest(`/api/users/${id}`, {
      method: "DELETE",
    }),

  searchUsers: (query: string): Promise<User[]> =>
    apiRequest(`/api/users/search?query=${encodeURIComponent(query)}`),

  getUserStats: (id: string): Promise<UserStats> =>
    apiRequest(`/api/users/${id}/stats`),
};

// Videos API
export const videosAPI = {
  getAllVideos: (): Promise<Video[]> => apiRequest("/api/videos"),

  getVideoById: (id: string): Promise<Video> => apiRequest(`/api/videos/${id}`),

  getVideosByUser: (userId: string): Promise<Video[]> =>
    apiRequest(`/api/videos/user/${userId}`),

  createVideo: (
    videoData: Omit<Video, "id" | "createdAt" | "viewCount">
  ): Promise<Video> =>
    apiRequest("/api/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    }),

  updateVideo: (id: string, videoData: Partial<Video>): Promise<Video> =>
    apiRequest(`/api/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(videoData),
    }),

  deleteVideo: (id: string): Promise<void> =>
    apiRequest(`/api/videos/${id}`, {
      method: "DELETE",
    }),

  getFeedForUser: (userId: string): Promise<Video[]> =>
    apiRequest(`/api/videos/feed/${userId}`),

  getTrendingVideos: (): Promise<Video[]> => apiRequest("/api/videos/trending"),

  searchVideos: (query: string): Promise<Video[]> =>
    apiRequest(`/api/videos/search?query=${encodeURIComponent(query)}`),

  incrementViewCount: (id: string): Promise<void> =>
    apiRequest(`/api/videos/${id}/view`, {
      method: "POST",
    }),

  getVideoStats: (id: string): Promise<VideoStats> =>
    apiRequest(`/api/videos/${id}/stats`),

  getPopularVideos: (minViews: number = 1000): Promise<Video[]> =>
    apiRequest(`/api/videos/popular?minViews=${minViews}`),

  uploadVideo: async (formData: FormData): Promise<Video> => {
    const url = `${API_BASE_URL}/api/videos/upload`;
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

// Comments API
export const commentsAPI = {
  getCommentsByVideo: (videoId: string): Promise<Comment[]> =>
    apiRequest(`/api/comments/video/${videoId}`),

  getTopLevelComments: (videoId: string): Promise<Comment[]> =>
    apiRequest(`/api/comments/video/${videoId}/top-level`),

  getReplies: (commentId: string): Promise<Comment[]> =>
    apiRequest(`/api/comments/${commentId}/replies`),

  getCommentById: (id: string): Promise<Comment> =>
    apiRequest(`/api/comments/${id}`),

  createComment: (commentData: CommentRequest): Promise<Comment> =>
    apiRequest("/api/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  updateComment: (id: string, content: string): Promise<Comment> =>
    apiRequest(`/api/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  deleteComment: (id: string): Promise<void> =>
    apiRequest(`/api/comments/${id}`, {
      method: "DELETE",
    }),

  getCommentsByUser: (userId: string): Promise<Comment[]> =>
    apiRequest(`/api/comments/user/${userId}`),

  searchComments: (query: string): Promise<Comment[]> =>
    apiRequest(`/api/comments/search?query=${encodeURIComponent(query)}`),

  getCommentCount: (videoId: string): Promise<number> =>
    apiRequest(`/api/comments/video/${videoId}/count`),
};

// Likes API
export const likesAPI = {
  likeVideo: (likeData: LikeRequest): Promise<Like> =>
    apiRequest("/api/likes", {
      method: "POST",
      body: JSON.stringify(likeData),
    }),

  unlikeVideo: (likeData: LikeRequest): Promise<void> =>
    apiRequest("/api/likes", {
      method: "DELETE",
      body: JSON.stringify(likeData),
    }),

  hasUserLikedVideo: (userId: string, videoId: string): Promise<boolean> =>
    apiRequest(`/api/likes/check?userId=${userId}&videoId=${videoId}`),

  getLikeCount: (videoId: string): Promise<number> =>
    apiRequest(`/api/likes/video/${videoId}/count`),

  toggleLike: (likeData: LikeRequest): Promise<LikeResponse> =>
    apiRequest("/api/likes/toggle", {
      method: "POST",
      body: JSON.stringify(likeData),
    }),

  getVideosLikedByUser: (userId: string): Promise<Video[]> =>
    apiRequest(`/api/likes/user/${userId}/videos`),
};

// Follows API
export const followsAPI = {
  followUser: (followData: FollowRequest): Promise<Follow> =>
    apiRequest("/api/follows", {
      method: "POST",
      body: JSON.stringify(followData),
    }),

  unfollowUser: (followData: FollowRequest): Promise<void> =>
    apiRequest("/api/follows", {
      method: "DELETE",
      body: JSON.stringify(followData),
    }),

  isFollowing: (followerId: string, followingId: string): Promise<boolean> =>
    apiRequest(
      `/api/follows/check?followerId=${followerId}&followingId=${followingId}`
    ),

  getFollowers: (userId: string): Promise<User[]> =>
    apiRequest(`/api/follows/${userId}/followers`),

  getFollowing: (userId: string): Promise<User[]> =>
    apiRequest(`/api/follows/${userId}/following`),

  getFollowerCount: (userId: string): Promise<number> =>
    apiRequest(`/api/follows/${userId}/followers/count`),

  getFollowingCount: (userId: string): Promise<number> =>
    apiRequest(`/api/follows/${userId}/following/count`),

  toggleFollow: (followData: FollowRequest): Promise<FollowResponse> =>
    apiRequest("/api/follows/toggle", {
      method: "POST",
      body: JSON.stringify(followData),
    }),

  getSuggestedUsers: (userId: string): Promise<User[]> =>
    apiRequest(`/api/follows/${userId}/suggestions`),
};

// Chats API
export const chatsAPI = {
  getChatsByUser: (userId: string): Promise<Chat[]> =>
    apiRequest(`/api/chats/user/${userId}`),

  createOrGetChat: (chatData: ChatRequest): Promise<Chat> =>
    apiRequest("/api/chats/create", {
      method: "POST",
      body: JSON.stringify(chatData),
    }),

  getChatById: (id: string): Promise<Chat> => apiRequest(`/api/chats/${id}`),

  getChatBetweenUsers: (user1Id: string, user2Id: string): Promise<Chat> =>
    apiRequest(`/api/chats/between?user1Id=${user1Id}&user2Id=${user2Id}`),

  deleteChat: (id: string): Promise<void> =>
    apiRequest(`/api/chats/${id}`, {
      method: "DELETE",
    }),

  getRecentChats: (userId: string): Promise<Chat[]> =>
    apiRequest(`/api/chats/user/${userId}/recent`),
};
