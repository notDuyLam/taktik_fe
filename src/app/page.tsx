'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Video } from '@/types';
import { videosAPI } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Load user's feed
        loadUserFeed();
      } else {
        // Load trending videos for non-authenticated users
        loadTrendingVideos();
      }
    }
  }, [user, loading]);

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
      console.error('Error loading user feed:', error);
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
      console.error('Error loading trending videos:', error);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else if (direction === 'down' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  if (loading || videosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Main video feed */}
      <div className="flex-1 relative">
        {videos.length > 0 ? (
          <VideoPlayer
            video={videos[currentVideoIndex]}
            onVideoEnd={handleVideoEnd}
            onScroll={handleScroll}
            onAuthRequired={() => setShowAuthModal(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-screen text-white">
            <div className="text-center">
              <h2 className="text-2xl mb-4">No videos found</h2>
              <p className="text-gray-400">
                {!user 
                  ? 'Sign up to see personalized content!' 
                  : 'Follow some users to see their videos in your feed!'
                }
              </p>
              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
