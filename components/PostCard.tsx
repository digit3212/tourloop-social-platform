
import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Trash2, Pin } from 'lucide-react';
import { Post, Comment, User } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onTogglePin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onTogglePin, onDelete }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser,
      content: newComment,
      timestamp: 'الآن',
      likes: 0
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  // Helper to detect video type
  const isVideo = (url: string) => {
      return url.startsWith('data:video/') || url.includes('.mp4') || url.includes('.webm');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full border border-gray-200 cursor-pointer" />
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] hover:underline cursor-pointer text-fb-text">{post.author.name}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {post.isPinned && <Pin className="h-3 w-3 text-fb-blue fill-current rotate-45" />}
              <span>{post.timestamp}</span>
              <span>·</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        
        {/* Menu */}
        <div className="relative">
            <div 
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition"
                onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </div>
            {showMenu && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-xl rounded-lg border border-gray-100 z-10 overflow-hidden text-right">
                    {onTogglePin && (
                        <button onClick={() => { onTogglePin(post.id); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 text-sm flex items-center gap-2 text-gray-700">
                             <Pin className="w-4 h-4" /> {post.isPinned ? 'إلغاء التثبيت' : 'تثبيت المنشور'}
                        </button>
                    )}
                    {/* Show delete only if owner or if onDelete is explicitly passed */}
                    {onDelete && (currentUser.id === post.author.id) && (
                        <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2">
                             <Trash2 className="w-4 h-4" /> حذف المنشور
                        </button>
                    )}
                    {!onDelete && !onTogglePin && (
                        <div className="px-4 py-2 text-sm text-gray-500">لا توجد خيارات متاحة</div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-[15px] text-fb-text whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {/* Image or Video */}
      {post.image && (
        <div className="mt-2 w-full bg-gray-100 flex justify-center cursor-pointer">
          {isVideo(post.image) ? (
              <video 
                src={post.image} 
                controls 
                className="w-full h-auto max-h-[600px] object-contain" 
              />
          ) : (
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-auto max-h-[600px] object-cover" 
              />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 mx-2">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="bg-fb-blue rounded-full p-1 flex items-center justify-center h-4 w-4">
            <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
          </div>
          <span className="text-[13px] text-gray-500">{likesCount > 0 ? likesCount : ''}</span>
        </div>
        <div className="flex gap-4 text-[13px] text-gray-500">
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{comments.length} تعليق</span>
          <span className="cursor-pointer hover:underline">{post.shares} مشاركة</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1">
        <div className="flex items-center justify-between font-medium text-gray-500">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${isLiked ? 'text-fb-blue' : ''}`}
          >
            <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[15px]">أعجبني</span>
          </button>
          <button 
            onClick={() => setShowComments(prev => !prev)}
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[15px]">تعليق</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-[15px]">مشاركة</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                 <img src={comment.author.avatar} alt={comment.author.name} className="h-8 w-8 rounded-full" />
                 <div className="flex flex-col">
                    <div className="bg-gray-100 px-3 py-2 rounded-2xl inline-block">
                        <span className="font-semibold text-sm block cursor-pointer hover:underline">{comment.author.name}</span>
                        <span className="text-[15px]">{comment.content}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mr-3 mt-0.5">
                        <span className="font-semibold cursor-pointer hover:underline">أعجبني</span>
                        <span className="font-semibold cursor-pointer hover:underline">رد</span>
                        <span>{comment.timestamp}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 items-start mb-2">
             <img src={currentUser.avatar} alt="Me" className="h-8 w-8 rounded-full" />
             <div className="flex-1 relative">
                <form onSubmit={handleCommentSubmit} className="flex-1 bg-gray-100 rounded-2xl flex items-center px-3 py-2">
                    <input
                        type="text"
                        placeholder="اكتب تعليقاً..."
                        className="bg-transparent w-full outline-none text-[15px] placeholder-gray-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" disabled={!newComment} className="text-fb-blue disabled:opacity-50">
                        <MessageCircle className="w-5 h-5 mr-2 transform rotate-180" />
                    </button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
