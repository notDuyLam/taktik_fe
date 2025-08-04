// API Response Types
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface UserStats {
  followerCount: number;
  followingCount: number;
  videoCount: number;
  totalLikes: number;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  viewCount: number;
  createdAt: string;
  user?: User;
}

export interface VideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentCommentId?: string;
  createdAt: string;
  user?: User;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  user1?: User;
  user2?: User;
}

// Auth Types
export interface AuthResponse {
  token?: string;
  user?: UserResponse;
  message?: string;
  error?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
}

// Request Types
export interface LikeRequest {
  userId: string;
  videoId: string;
}

export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

export interface FollowRequest {
  followerId: string;
  followingId: string;
}

export interface FollowResponse {
  isFollowing: boolean;
  followerCount: number;
}

export interface CommentRequest {
  content: string;
  userId: string;
  videoId: string;
  parentCommentId?: string;
}

export interface ChatRequest {
  user1Id: string;
  user2Id: string;
}
