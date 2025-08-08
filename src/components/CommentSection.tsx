"use client";

import { useEffect, useState } from "react";
import { Comment } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { commentsAPI } from "@/lib/api";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface CommentSectionProps {
  videoId: string;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;
}

export default function CommentSection({
  videoId,
  onClose,
  onCommentCountChange,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const videoComments = await commentsAPI.getTopLevelComments(videoId);
      setComments(videoComments);
      onCommentCountChange(videoComments.length);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const comment = await commentsAPI.createComment({
        content: newComment.trim(),
        userId: user.id,
        videoId,
      });

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      onCommentCountChange(comments.length + 1);
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 h-full sm:h-3/4 sm:rounded-t-lg flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-neutral-900">Comments</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300"
            aria-label="Close comments"
          >
            <XMarkIcon className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-3 py-6 bg-neutral-50">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-neutral-500">Loading comments...</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
              <div className="text-lg mb-2">No comments yet</div>
              <div className="text-sm">Be the first to comment!</div>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4 w-full">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full overflow-hidden ring-2 ring-neutral-100 shadow-sm">
                      {comment.user?.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-400 flex items-center justify-center text-white text-xs">
                          {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-neutral-900">
                        {comment.user?.username || "Unknown User"}
                      </span>
                      <span className="text-neutral-400 text-xs">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-neutral-100 w-full">
                      <p className="text-sm text-neutral-900 break-words leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="p-3 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-end gap-3">
              <div className="flex-shrink-0 pb-1">
                <div className="w-9 h-9 bg-neutral-200 rounded-full overflow-hidden ring-2 ring-neutral-100 shadow-sm">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-400 flex items-center justify-center text-white text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent bg-white shadow-sm text-sm"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-full hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  aria-label="Send comment"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-neutral-200 text-center bg-neutral-50">
            <p className="text-neutral-500 text-sm">Sign in to leave a comment</p>
          </div>
        )}
      </div>
    </div>
  );
}
