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
// Removed Card/CardContent to avoid default borders on the info overlay
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlayIcon } from "@heroicons/react/24/solid";

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
    // Prevent page from scrolling while using the player
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY > 0) {
      onScroll("down");
    } else {
      onScroll("up");
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Block scroll gestures from bubbling to page when player is active
    if (!showComments) {
      e.preventDefault();
      e.stopPropagation();
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
      className="relative w-full h-screen overflow-hidden overscroll-none"
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      tabIndex={0}
      onKeyDown={(e) => {
        // prevent window scroll and handle navigation/controls
        if (e.code === "Space" || e.key === " ") {
          e.preventDefault();
          handleVideoClick();
        }
        if (e.key === "ArrowDown" || e.key === "PageDown") {
          e.preventDefault();
          onScroll("down");
        }
        if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault();
          onScroll("up");
        }
      }}
    >
      {/* Constrain to 9:16 frame centered on the screen */}
      <div className="relative h-full aspect-[9/16] mx-auto bg-black">
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          src={video.videoUrl}
          loop
          muted
          playsInline
          onClick={handleVideoClick}
          onEnded={onVideoEnd}
          onTimeUpdate={handleVideoTimeUpdate}
        />

        {/* Play overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center" onClick={handleVideoClick}>
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Video info (no border) anchored to screen left */}
      <div className="absolute bottom-0 left-0 right-20 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
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
      </div>

      {/* Action buttons anchored to screen right */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 p-2 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md z-10">
        {/* Like button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleLike}
            aria-label={isLiked ? "Unlike" : "Like"}
            className={`size-12 rounded-full border transition-colors duration-150 flex items-center justify-center shadow-sm ${
              isLiked
                ? "bg-red-500 hover:bg-red-500/90 border-red-500/60 text-white"
                : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
            }`}
            variant="ghost"
          >
            {isLiked ? (
              <HeartSolidIcon className="size-6" />
            ) : (
              <HeartIcon className="size-6" />
            )}
          </Button>
          <span className={`text-xs mt-1 ${isLiked ? "text-red-300" : "text-white/80"}`}>
            {formatCount(stats.likeCount)}
          </span>
        </div>
        {/* Comment button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={() => setShowComments(true)}
            aria-label="Open comments"
            className="size-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-sm transition-colors duration-150"
            variant="ghost"
          >
            <ChatBubbleOvalLeftIcon className="size-6" />
          </Button>
          <span className="text-white/80 text-xs mt-1">
            {formatCount(stats.commentCount)}
          </span>
        </div>
        {/* Share button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleShare}
            aria-label="Share video"
            className="size-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-sm transition-colors duration-150"
            variant="ghost"
          >
            <ShareIcon className="size-6" />
          </Button>
          <span className="text-white/80 text-xs mt-1">Share</span>
        </div>
        {/* Follow button (circular) */}
        {user && video.user && user.id !== video.user.id && (
          <Button
            onClick={handleFollow}
            aria-label={isFollowing ? "Unfollow user" : "Follow user"}
            className={`size-12 rounded-full border flex items-center justify-center shadow-sm transition-colors duration-150 ${
              isFollowing
                ? "bg-white text-gray-900 hover:bg-white/90 border-white/80"
                : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
            variant="ghost"
          >
            {isFollowing ? (
              <UserMinusIcon className="size-5" />
            ) : (
              <UserPlusIcon className="size-5" />
            )}
          </Button>
        )}
      </div>

      {/* Comments Section */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="p-0 sm:max-w-lg w-[calc(100%-2rem)]">
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
