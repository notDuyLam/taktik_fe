"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Video } from "@/types";
import { usersAPI, videosAPI } from "@/lib/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "videos">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const results = await usersAPI.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchVideos = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    try {
      setLoading(true);
      const results = await videosAPI.searchVideos(searchQuery);
      setVideos(results);
    } catch (error) {
      console.error("Error searching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "users") {
        searchUsers(query);
      } else {
        searchVideos(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, activeTab, searchUsers, searchVideos]);

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="search" />

      <div className="flex-1 max-w-4xl mx-auto p-6">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users or videos..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "videos"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Searching...</div>
            </div>
          ) : !query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MagnifyingGlassIcon className="w-12 h-12 mb-4 text-gray-300" />
              <div className="text-lg mb-2">Start typing to search</div>
              <div className="text-sm">Find users and videos on Taktik</div>
            </div>
          ) : (
            <>
              {/* Users Results */}
              {activeTab === "users" && (
                <div className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-gray-500">No users found</div>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.username)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                            {user.bio && (
                              <div className="text-sm text-gray-700 mt-1 truncate">
                                {user.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Videos Results */}
              {activeTab === "videos" && (
                <div>
                  {videos.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-gray-500">No videos found</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoClick(video.id)}
                          className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        >
                          {/* Video Thumbnail */}
                          <div className="aspect-[9/16] bg-gray-200 relative">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-sm">
                                  No thumbnail
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {formatCount(video.viewCount)} views
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="p-3">
                            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {video.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>
                                {video.user?.username || "Unknown User"}
                              </span>
                              <span className="mx-1">•</span>
                              <span>{formatCount(video.viewCount)} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
