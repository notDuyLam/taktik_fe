"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Video } from "@/types";
import { videosAPI } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import VideoUpload from "@/components/VideoUpload";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { usersAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videosLoading, setVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoLoading, setSelectedVideoLoading] = useState(false);
  const [initialSelectedId, setInitialSelectedId] = useState<string | null>(null);
  const [initialSelectedVideo, setInitialSelectedVideo] = useState<Video | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get("video");

  useEffect(() => {
    if (!loading) {
      if (user) {
        loadUserFeed();
      } else {
        loadTrendingVideos();
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (videoIdParam) {
      // Capture the very first selected id to anchor the playlist order
      setInitialSelectedId((prev) => prev ?? videoIdParam);
      fetchSelectedVideo(videoIdParam);
    } else {
      setSelectedVideo(null);
      setInitialSelectedId(null);
      setInitialSelectedVideo(null);
    }
  }, [videoIdParam]);

  const fetchSelectedVideo = async (videoId: string) => {
    setSelectedVideoLoading(true);
    try {
      const video = await videosAPI.getVideoById(videoId);
      // Fetch user info if not present
      let videoWithUser = video;
      if (!video.user && video.userId) {
        try {
          const user = await usersAPI.getUserById(video.userId);
          videoWithUser = { ...video, user };
        } catch (e) {
          // If user fetch fails, fallback to video only
          videoWithUser = video;
        }
      }
      setSelectedVideo(videoWithUser);
      // Persist the first chosen video object for anchored playlist ordering
      setInitialSelectedVideo((prev) => prev ?? videoWithUser);
    } catch (error) {
      setSelectedVideo(null);
    } finally {
      setSelectedVideoLoading(false);
    }
  };

  const loadUserFeed = async () => {
    try {
      if (!user) return;
      setVideosLoading(true);
      const feedVideos = await videosAPI.getFeedForUser(user.id);

      // If user has no feed, show trending videos
      if (feedVideos.length === 0) {
        const trendingVideos = await videosAPI.getTrendingVideos();
        setVideos(trendingVideos);
      } else {
        setVideos(feedVideos);
      }
    } catch (error) {
      console.error("Error loading user feed:", error);
      // Fallback to trending videos
      loadTrendingVideos();
    } finally {
      setVideosLoading(false);
    }
  };

  const loadTrendingVideos = async () => {
    try {
      setVideosLoading(true);
      const trendingVideos = await videosAPI.getTrendingVideos();
      setVideos(trendingVideos);
    } catch (error) {
      console.error("Error loading trending videos:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleScroll = (direction: "up" | "down") => {
    if (direction === "up" && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else if (direction === "down" && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleUploadSuccess = () => {
    // Reload videos after successful upload
    if (user) {
      loadUserFeed();
    } else {
      loadTrendingVideos();
    }
  };

  // Add a handler for clicking a video (from trending)
  const handleTrendingVideoClick = (videoId: string) => {
    router.push(`/?video=${videoId}`);
  };

  // Build the display order when a specific video is selected: selected first, then trending
  const displayVideos: Video[] = initialSelectedId
    ? [
        // If the initially selected video is part of trending, place it first using that object
        initialSelectedVideo ||
          videos.find((v) => v.id === initialSelectedId) ||
          // As a fallback, use the current selected video object
          selectedVideo!,
        ...videos.filter((v) => v.id !== initialSelectedId),
      ]
    : videos;

  if (loading || videosLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading feed...</p>
      </div>
    );
  }

  return (
      <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />
      {/* Main video feed */}
      <div className={`flex-1 relative ${selectedVideo ? "" : "overflow-y-auto"}`}>
        {/* Selected video at the top if present */}
        {selectedVideoLoading ? (
          <div className="flex flex-col items-center justify-center h-96 text-foreground">
            <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading video...</p>
          </div>
        ) : selectedVideo ? (
          <div className="mb-8">
            <VideoPlayer
              video={selectedVideo}
              onAuthRequired={() => setShowAuthModal(true)}
              onVideoEnd={() => {
                const currentIndex = displayVideos.findIndex((v) => v.id === selectedVideo.id);
                if (currentIndex > -1 && currentIndex < displayVideos.length - 1) {
                  const nextVideo = displayVideos[currentIndex + 1];
                  router.push(`/?video=${nextVideo.id}`);
                } else {
                  // If none left, clear selection to show trending grid
                  router.push(`/`);
                }
              }}
              onScroll={(direction) => {
                const currentIndex = displayVideos.findIndex((v) => v.id === selectedVideo.id);
                let newIndex = currentIndex;
                if (direction === "down" && currentIndex < displayVideos.length - 1) {
                  newIndex = currentIndex + 1;  
                } else if (direction === "up" && currentIndex > 0) {
                  newIndex = currentIndex - 1;
                }
                if (newIndex !== currentIndex && newIndex >= 0 && newIndex < displayVideos.length) {
                  const nextVideo = displayVideos[newIndex];
                  router.push(`/?video=${nextVideo.id}`);
                }
              }}
            />
          </div>
        ) : videos.length > 0 && !selectedVideo ? (
          <div>
            <h2 className="text-foreground text-xl font-bold mb-4 ml-4 mt-4">
              Trending Videos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4 pb-8">
              {videos.map((video) => (
                <Card
                key={video.id}
                className="w-full max-w-[240px] aspect-[9/16] relative cursor-pointer overflow-hidden rounded-md hover:scale-105 transition-transform duration-200 shadow-md"
                onClick={() => handleTrendingVideoClick(video.id)}
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
                      <div className="text-gray-300 text-xs">{video.viewCount} views</div>
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
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[70vh] px-4">
            <Card className="w-full max-w-md overflow-hidden">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-2xl">📭</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">No videos found</h3>
                <p className="mt-2 text-muted-foreground">
                  {!user
                    ? "Create an account to get a personalized feed."
                    : "Follow some creators to see their latest videos in your feed."}
                </p>
                {!user && (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="mt-6 px-6"
                    variant="default"
                  >
                    Create account
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Floating Upload Button - only show for authenticated users */}
      {user && (
        <Button
          variant="default"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40 flex items-center justify-center lg:hidden"
          onClick={() => setShowUploadModal(true)}
          title="Upload Video"
        >
          <PlusIcon className="w-8 h-8" />
        </Button>
      )}
      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUpload
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
