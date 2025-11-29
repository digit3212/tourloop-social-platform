
import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Trash2, Pin, Bookmark, Bell, BellOff, Users, UserPlus, Lock, ChevronLeft, ArrowRight, AtSign, BookmarkMinus } from 'lucide-react';
import { Post, Comment, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onTogglePin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onToggleSave?: (post: Post) => void;
}

type MenuView = 'main' | 'audience' | 'comments';
type AudienceType = 'public' | 'friends' | 'friends_of_friends' | 'only_me';
type CommentAudienceType = 'public' | 'friends' | 'mentions';

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onTogglePin, onDelete, onToggleSave }) => {
  const { t, dir } = useLanguage();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState('');
  
  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>('main');
  const menuRef = useRef<HTMLDivElement>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  
  // Post Settings State
  const [audience, setAudience] = useState<AudienceType>('public');
  const [commentAudience, setCommentAudience] = useState<CommentAudienceType>('public');
  
  // Save State (Local for visual feedback immediately, but uses prop for logic)
  const [isSaved, setIsSaved] = useState(false);

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

  const isVideo = (url: string) => {
      return url.startsWith('data:video/') || url.includes('.mp4') || url.includes('.webm');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowMenu(false);
            setMenuView('main');
        }
    };
    if (showMenu) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getAudienceIcon = (type: AudienceType) => {
      switch(type) {
          case 'public': return <Globe className="w-3 h-3" />;
          case 'friends': return <Users className="w-3 h-3" />;
          case 'friends_of_friends': return <UserPlus className="w-3 h-3" />;
          case 'only_me': return <Lock className="w-3 h-3" />;
      }
  };

  // Menu Actions
  const handlePinAction = () => {
      if (onTogglePin) onTogglePin(post.id);
      setShowMenu(false);
  };

  const handleDeleteAction = () => {
      if (onDelete) {
          if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
              onDelete(post.id);
          }
      }
      setShowMenu(false);
  };

  const handleToggleNotifications = () => {
      setNotificationsOn(!notificationsOn);
      setShowMenu(false);
  };

  const handleSavePost = () => {
      if (onToggleSave) onToggleSave(post);
      setIsSaved(!isSaved);
      setShowMenu(false);
  }

  const isOwner = post.author.id === currentUser.id;

  return (
    <div className="bg-white dark:bg-fb-dark rounded-lg shadow-sm mb-4 relative transition-colors duration-300">
      {/* Pinned Indicator */}
      {post.isPinned && (
          <div className="px-4 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Pin className="w-3 h-3 fill-current" />
              <span>{t.post_pinned}</span>
          </div>
      )}

      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${post.isPinned ? 'pt-2' : ''}`}>
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full border border-gray-200 cursor-pointer" />
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] hover:underline cursor-pointer text-fb-text dark:text-white">{post.author.name}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{post.timestamp}</span>
              <span>·</span>
              {getAudienceIcon(audience)}
            </div>
          </div>
        </div>
        
        {/* Options Menu */}
        <div className="relative" ref={menuRef}>
            <div 
                onClick={() => { setShowMenu(!showMenu); setMenuView('main'); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer transition text-gray-600 dark:text-gray-300"
            >
                <MoreHorizontal className="h-5 w-5" />
            </div>

            {showMenu && (
                <div className={`absolute top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animate-fadeIn ${dir === 'rtl' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}>
                    
                    {/* MAIN VIEW */}
                    {menuView === 'main' && (
                        <>
                            <button onClick={handlePinAction} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <Pin className={`w-5 h-5 ${post.isPinned ? 'fill-current text-fb-blue' : ''}`} />
                                {post.isPinned ? 'إلغاء تثبيت المنشور' : 'تثبيت المنشور'}
                            </button>
                            
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                            <button onClick={handleSavePost} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                {isSaved ? <BookmarkMinus className="w-5 h-5 text-fb-blue" /> : <Bookmark className="w-5 h-5" />}
                                {isSaved ? 'إلغاء حفظ المنشور' : 'حفظ المنشور'}
                            </button>

                            <button onClick={handleToggleNotifications} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                {notificationsOn ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                {notificationsOn ? 'إيقاف تشغيل الإشعارات' : 'تشغيل الإشعارات'}
                            </button>

                            <button onClick={() => setMenuView('audience')} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200 group">
                                <div className="flex items-center gap-3"><Globe className="w-5 h-5" /> تعديل الجمهور</div>
                                {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600" /> : <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />}
                            </button>

                            <button onClick={() => setMenuView('comments')} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200 group">
                                <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5" /> من الذي يمكنه التعليق؟</div>
                                {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600" /> : <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />}
                            </button>

                            {isOwner && (
                                <>
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    <button onClick={handleDeleteAction} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-red-600 font-medium dark:text-red-400">
                                        <Trash2 className="w-5 h-5" /> نقل إلى سلة المهملات
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {/* AUDIENCE VIEW */}
                    {menuView === 'audience' && (
                        <div className="animate-slideLeft">
                            <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-100 dark:border-gray-700">
                                <button onClick={() => setMenuView('main')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                                </button>
                                <span className="font-bold text-sm text-gray-800 dark:text-white">تعديل الجمهور</span>
                            </div>
                            <div className="py-2">
                                {(['public', 'friends', 'friends_of_friends', 'only_me'] as AudienceType[]).map((type) => (
                                    <button 
                                        key={type}
                                        onClick={() => { setAudience(type); setShowMenu(false); }}
                                        className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full">{getAudienceIcon(type)}</div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {type === 'public' ? 'العامة' : type === 'friends' ? 'الأصدقاء' : type === 'friends_of_friends' ? 'أصدقاء الأصدقاء' : 'أنا فقط'}
                                                </span>
                                            </div>
                                        </div>
                                        {audience === type && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COMMENTS VIEW */}
                    {menuView === 'comments' && (
                        <div className="animate-slideLeft">
                                <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-100 dark:border-gray-700">
                                <button onClick={() => setMenuView('main')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                                </button>
                                <span className="font-bold text-sm text-gray-800 dark:text-white">من الذي يمكنه التعليق؟</span>
                            </div>
                            <div className="py-2">
                                <div className="px-4 text-xs text-gray-500 dark:text-gray-400 mb-2">اختر من يُسمح له بالتعليق على منشورك.</div>
                                
                                <button onClick={() => { setCommentAudience('public'); setShowMenu(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full"><Globe className="w-4 h-4" /></div>
                                            <span className="font-semibold">العامة</span>
                                        </div>
                                        {commentAudience === 'public' && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                </button>

                                <button onClick={() => { setCommentAudience('friends'); setShowMenu(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full"><Users className="w-4 h-4" /></div>
                                            <span className="font-semibold">الأصدقاء</span>
                                        </div>
                                        {commentAudience === 'friends' && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                </button>

                                <button onClick={() => { setCommentAudience('mentions'); setShowMenu(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full"><AtSign className="w-4 h-4" /></div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">الملفات الشخصية والصفحات التي ذكرتها</span>
                                            </div>
                                        </div>
                                        {commentAudience === 'mentions' && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-[15px] text-fb-text dark:text-gray-200 whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {/* Image or Video */}
      {post.image && (
        <div className="mt-2 w-full bg-gray-100 dark:bg-gray-900 flex justify-center cursor-pointer">
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
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mx-2">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="bg-fb-blue rounded-full p-1 flex items-center justify-center h-4 w-4">
            <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
          </div>
          <span className="text-[13px] text-gray-500 dark:text-gray-400">{likesCount > 0 ? likesCount : ''}</span>
        </div>
        <div className="flex gap-4 text-[13px] text-gray-500 dark:text-gray-400">
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{comments.length} {t.btn_comment}</span>
          <span className="cursor-pointer hover:underline">{post.shares} {t.btn_share}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1">
        <div className="flex items-center justify-between font-medium text-gray-500 dark:text-gray-400">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isLiked ? 'text-fb-blue' : ''}`}
          >
            <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[15px]">{t.btn_like}</span>
          </button>
          <button 
            onClick={() => setShowComments(prev => !prev)}
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[15px]">{t.btn_comment}</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-[15px]">{t.btn_share}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                 <img src={comment.author.avatar} alt={comment.author.name} className="h-8 w-8 rounded-full" />
                 <div className="flex flex-col">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl inline-block">
                        <span className="font-semibold text-sm block cursor-pointer hover:underline text-black dark:text-white">{comment.author.name}</span>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">{comment.content}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mr-3 mt-0.5">
                        <span className="font-semibold cursor-pointer hover:underline">{t.btn_like}</span>
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
                <form onSubmit={handleCommentSubmit} className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center px-3 py-2">
                    <input
                        type="text"
                        placeholder={t.write_comment}
                        className="bg-transparent w-full outline-none text-[15px] placeholder-gray-500 dark:placeholder-gray-400 text-black dark:text-white"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" disabled={!newComment} className="text-fb-blue disabled:opacity-50">
                        <MessageCircle className={`w-5 h-5 mr-2 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
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