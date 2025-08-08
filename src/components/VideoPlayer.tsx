"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoStats } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { videosAPI, likesAPI, followsAPI, usersAPI } from "@/lib/api";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  UserMinusIcon,
} from "@heroicons/react/24/solid";
import CommentSection from "@/components/CommentSection";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoPlayerProps {
  video: Video;
  onVideoEnd: () => void;
  onScroll: (direction: "up" | "down") => void;
  onAuthRequired: () => void;
}

export default function VideoPlayer({
  video,
  onVideoEnd,
  onScroll,
  onAuthRequired,
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<VideoStats>({
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }

    // Load video stats
    loadVideoStats();

    // Check if user has liked this video
    if (user) {
      checkIfLiked();
      checkIfFollowing();
    }

    // Reset view counted flag for new video
    setViewCounted(false);
  }, [video.id, user]);

  const loadVideoStats = async () => {
    try {
      const videoStats = await videosAPI.getVideoStats(video.id);
      setStats(videoStats);
    } catch (error) {
      console.error("Error loading video stats:", error);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;
    try {
      const liked = await likesAPI.hasUserLikedVideo(user.id, video.id);
      setIsLiked(liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !video.user) return;
    try {
      const following = await followsAPI.isFollowing(
        user.id,
        video.user.id || video.userId
      );
      setIsFollowing(following);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!viewCounted && videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      // Count view after 3% of video is watched
      if (currentTime / duration > 0.03) {
        incrementViewCount();
        setViewCounted(true);
      }
    }
  };

  const incrementViewCount = async () => {
    try {
      await videosAPI.incrementViewCount(video.id);
      setStats((prev) => ({ ...prev, viewCount: prev.viewCount + 1 }));
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    try {
      const response = await likesAPI.toggleLike({
        userId: user.id,
        videoId: video.id,
      });
      setIsLiked(response.isLiked);
      setStats((prev) => ({ ...prev, likeCount: response.likeCount }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!video.user && !video.userId) return;

    try {
      const targetUserId = video.user?.id || video.userId;
      const response = await followsAPI.toggleFollow({
        followerId: user.id,
        followingId: targetUserId,
      });
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      onScroll("down");
    } else {
      onScroll("up");
    }
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
    <div
      className="relative w-full h-screen overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={video.videoUrl}
        loop
        muted
        playsInline
        onClick={handleVideoClick}
        onEnded={onVideoEnd}
        onTimeUpdate={handleVideoTimeUpdate}
      />

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
          </div>
        </div>
      )}

      {/* Video info */}
      <Card className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black to-transparent">
        <CardContent className="p-0">
          <div className="mb-2">
            <h3 className="text-white text-lg font-semibold">{video.title}</h3>
            {video.description && (
              <p className="text-white text-sm opacity-90 mt-1">
                {video.description}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={video.user?.avatarUrl} alt={video.user?.username} />
              <AvatarFallback>{video.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-white font-medium">
              {video.user?.username || "Unknown User"}
            </span>
            {user && video.user && user.id !== video.user.id && (
              <Button
                onClick={handleFollow}
                className={`ml-3 px-4 py-1 text-sm rounded-full bg-white/80 text-gray-900 shadow-sm hover:bg-white focus:bg-white/90 focus:outline-none transition-colors border-none ${isFollowing ? 'font-semibold' : ''}`}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
        {/* Like button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleLike}
            className="w-12 h-12 flex items-center justify-center"
            variant={isLiked ? "default" : "outline"}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-8 h-8" />
            ) : (
              <HeartIcon className="w-8 h-8" />
            )}
          </Button>
          <span className="text-white text-xs mt-1">
            {formatCount(stats.likeCount)}
          </span>
        </div>
        {/* Comment button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={() => setShowComments(true)}
            className="w-12 h-12 flex items-center justify-center"
            variant="outline"
          >
            <ChatBubbleOvalLeftIcon className="w-8 h-8" />
          </Button>
          <span className="text-white text-xs mt-1">
            {formatCount(stats.commentCount)}
          </span>
        </div>
        {/* Share button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleShare}
            className="w-12 h-12 flex items-center justify-center"
            variant="outline"
          >
            <ShareIcon className="w-8 h-8" />
          </Button>
          <span className="text-white text-xs mt-1">Share</span>
        </div>
        {/* Follow button (circular) */}
        {user && video.user && user.id !== video.user.id && (
          <Button
            onClick={handleFollow}
            className="w-12 h-12 flex items-center justify-center rounded-full"
            variant={isFollowing ? "secondary" : "default"}
          >
            {isFollowing ? (
              <UserMinusIcon className="w-6 h-6" />
            ) : (
              <UserPlusIcon className="w-6 h-6" />
            )}
          </Button>
        )}
      </div>

      {/* Comments Section */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent>
          <CommentSection
            videoId={video.id}
            onClose={() => setShowComments(false)}
            onCommentCountChange={(count: number) =>
              setStats((prev) => ({ ...prev, commentCount: count }))
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
