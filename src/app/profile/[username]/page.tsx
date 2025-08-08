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
import { HeartIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

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
      const userData: any = await usersAPI.getUserByUsername(username);
      setUser(userData);

      // Load user's videos (prefer embedded videos from response if available)
      if (Array.isArray(userData.videos) && userData.videos.length > 0) {
        const mappedVideos: Video[] = userData.videos.map((v: any) => ({
          id: v.id,
          userId: userData.id,
          title: v.title,
          description: v.description,
          videoUrl: v.videoUrl,
          thumbnailUrl: v.thumbnailUrl,
          viewCount: v.viewCount ?? 0,
          createdAt: v.createdAt ?? new Date().toISOString(),
          user: {
            id: userData.id,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
            bio: userData.bio,
            createdAt: userData.createdAt,
          },
        }));
        setVideos(mappedVideos);
        const counts: Record<string, number> = {};
        for (const v of userData.videos) {
          counts[v.id] = Array.isArray(v.likes) ? v.likes.length : 0;
        }
        setLikeCounts(counts);
      } else {
        // Fallback to existing API
        const userVideos = await videosAPI.getVideosByUser(userData.id);
        setVideos(userVideos);
        // Like counts can be fetched on-demand later if needed
      }

      // Load user stats
      const userStats = await usersAPI.getUserStats(userData.id);
      console.log(userStats);
      setStats(userStats);


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
    router.push(`/?video=${videoId}`);
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
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPage="profile" />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-32 h-8 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="default" className="max-w-md mx-auto p-6">
            <AlertTitle className="text-lg">User not found</AlertTitle>
            <AlertDescription className="mt-1">
              The user you are looking for does not exist.
            </AlertDescription>
            <Button onClick={() => router.push("/")} className="mt-4 col-start-2 w-full" variant="default">
              Go Home
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="profile" />

      <div className="flex-1 max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="rounded-lg shadow p-0 mb-6">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center sm:items-start p-6 sm:pr-0">
                <div className="relative">
                  <Avatar className="w-28 h-28 ring-2 ring-border shadow-md bg-card">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left mt-0 px-6 pb-6 sm:pb-6 sm:border-l sm:border-border sm:pl-6">
                <h1 className="text-3xl font-bold text-foreground mb-1 mt-4 break-all">{user.username}</h1>
                <p className="text-muted-foreground mb-2 text-base">@{user.username}</p>
                {user.bio && <p className="text-foreground/80 mt-2 mb-4 text-sm max-w-xl mx-auto sm:mx-0">{user.bio}</p>}
                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 bg-accent rounded-lg p-4 border border-border">
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="font-bold text-lg text-foreground">{formatCount(stats.followerCount)}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="font-bold text-lg text-foreground">{formatCount(stats.followingCount)}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="font-bold text-lg text-foreground">{formatCount(stats.videoCount)}</div>
                      <div className="text-xs text-muted-foreground">Videos</div>
                    </div>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="font-bold text-lg text-foreground">{formatCount(stats.totalLikes)}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2 min-h-[48px]">
                  {isOwnProfile ? (
                    <Button onClick={() => router.push("/settings")} variant="secondary" className="flex items-center px-4 py-2 text-base min-w-[140px]">
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : currentUser ? (
                    <>
                      {/* Invisible placeholder for Edit Profile button to reserve space */}
                      <span className="inline-block min-w-[140px] h-10 align-middle opacity-0 pointer-events-none select-none" aria-hidden="true"></span>
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        variant={isFollowing ? "secondary" : "outline"}
                        className="flex items-center px-4 py-2 text-base"
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
                      </Button>
                      <Button
                        onClick={handleMessage}
                        variant="outline"
                        className="flex items-center px-4 py-2 text-base"
                      >
                        <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  ) : (
                    // Always reserve space for the edit button
                    <span className="inline-block min-w-[140px] h-10 align-middle opacity-0 pointer-events-none select-none" aria-hidden="true"></span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Videos Section */}
        <Card className="rounded-lg shadow">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Videos ({videos.length})</h2>
          </div>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="text-lg mb-2">No videos yet</div>
              <div className="text-sm">
                {isOwnProfile
                  ? "Start creating content to build your profile!"
                  : `${user.username} hasn't posted any videos yet.`}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="w-full max-w-[240px] aspect-[9/16] relative cursor-pointer overflow-hidden rounded-md hover:scale-105 transition-transform duration-200 shadow-md"
                  onClick={() => handleVideoClick(video.id)}
                >
                  {video.thumbnailUrl ? (
                    <>
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent px-2 py-2 z-10">
                        <div className="text-white text-xs font-semibold truncate">
                          {video.title}
                        </div>
                        <div className="text-gray-300 text-xs flex items-center gap-3">
                          <span>{video.viewCount} views</span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-3 h-3" />
                            {likeCounts[video.id] ?? 0}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground text-xs text-center p-2">
                      {video.title}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
