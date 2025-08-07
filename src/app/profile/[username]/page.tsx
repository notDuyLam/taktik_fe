"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Video, UserStats } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI, videosAPI, followsAPI } from "@/lib/api";
import {
  UserPlusIcon,
  ChatBubbleOvalLeftIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { UserMinusIcon } from "@heroicons/react/24/solid";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Load user data
      console.log(`Loading profile for username: ${username}`);
      const userData = await usersAPI.getUserByUsername(username);
      console.log(userData);
      setUser(userData);

      // Load user's videos
      const userVideos = await videosAPI.getVideosByUser(userData.id);
      setVideos(userVideos);
      console.log(userVideos);

      // Load user stats
      const userStats = await usersAPI.getUserStats(userData.id);
      console.log(userStats);
      setStats(userStats);

      console.log(stats);

      // Check if current user is following this user
      if (currentUser && currentUser.id !== userData.id) {
        const following = await followsAPI.isFollowing(
          currentUser.id,
          userData.id
        );
        setIsFollowing(following);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Handle user not found
      // router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user) return;

    try {
      setFollowLoading(true);
      const response = await followsAPI.toggleFollow({
        followerId: currentUser.id,
        followingId: user.id,
      });

      setIsFollowing(response.isFollowing);

      // Update follower count
      if (stats) {
        setStats({
          ...stats,
          followerCount: response.isFollowing
            ? stats.followerCount + 1
            : stats.followerCount - 1,
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser || !user) return;
    router.push(`/messages?user=${user.username}`);
  };

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentPage="profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-xl mb-4">User not found</div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="profile" />

      <div className="flex-1 max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-2xl font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>

              {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

              {/* Stats */}
              {stats && (
                <div className="flex justify-center sm:justify-start space-x-6 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {formatCount(stats.followerCount)}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {formatCount(stats.followingCount)}
                    </div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {formatCount(stats.videoCount)}
                    </div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {formatCount(stats.totalLikes)}
                    </div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center sm:justify-start space-x-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => router.push("/settings")}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : currentUser ? (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {isFollowing ? (
                        <UserMinusIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlusIcon className="w-4 h-4 mr-2" />
                      )}
                      {followLoading
                        ? "Loading..."
                        : isFollowing
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-2" />
                      Message
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Videos ({videos.length})
            </h2>
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="text-lg mb-2">No videos yet</div>
              <div className="text-sm">
                {isOwnProfile
                  ? "Start creating content to build your profile!"
                  : `${user.username} hasn't posted any videos yet.`}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-xs text-center p-2">
                        {video.title}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    {formatCount(video.viewCount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
