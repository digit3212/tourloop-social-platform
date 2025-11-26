
import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, Trash2, Play, X, ChevronRight, ChevronLeft, MoreHorizontal, MessageCircle, ThumbsUp, Share2, Send, Smile, Globe, BookmarkMinus } from 'lucide-react';
import { Photo, VideoItem, User } from '../types';

interface SavedItemsProps {
  currentUser: User;
  savedPhotos: Photo[];
  savedVideos?: VideoItem[];
  onUnsave: (item: Photo | VideoItem) => void;
}

// Local Comment Interface
interface LocalComment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

const SavedItems: React.FC<SavedItemsProps> = ({ currentUser, savedPhotos, savedVideos = [], onUnsave }) => {
  const hasItems = savedPhotos.length > 0 || savedVideos.length > 0;

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [activeListType, setActiveListType] = useState<'photos' | 'videos'>('photos');
  
  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsList, lightboxOpen]);

  const openLightbox = (index: number, type: 'photos' | 'videos') => {
      setActiveItemIndex(index);
      setActiveListType(type);
      setLightboxOpen(true);
      
      const item = type === 'photos' ? savedPhotos[index] : savedVideos[index];
      setLikesCount(item.likes);
      setIsLiked(false);
      setCommentsList([]);
      setCommentInput('');
  };

  const closeLightbox = () => {
      setLightboxOpen(false);
  };

  const nextItem = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const list = activeListType === 'photos' ? savedPhotos : savedVideos;
      const newIndex = (activeItemIndex + 1) % list.length;
      setActiveItemIndex(newIndex);
      // Reset state for new item
      const item = list[newIndex];
      setLikesCount(item.likes);
      setIsLiked(false);
      setCommentsList([]);
  };

  const prevItem = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const list = activeListType === 'photos' ? savedPhotos : savedVideos;
      const newIndex = (activeItemIndex - 1 + list.length) % list.length;
      setActiveItemIndex(newIndex);
      // Reset state for new item
      const item = list[newIndex];
      setLikesCount(item.likes);
      setIsLiked(false);
      setCommentsList([]);
  };

  const handleSendComment = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!commentInput.trim()) return;

      const newComment: LocalComment = {
          id: Date.now().toString(),
          user: currentUser.name,
          avatar: currentUser.avatar,
          text: commentInput,
          timestamp: 'الآن'
      };

      setCommentsList([...commentsList, newComment]);
      setCommentInput('');
  };

  const handleLike = () => {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleUnsaveCurrent = () => {
      const list = activeListType === 'photos' ? savedPhotos : savedVideos;
      const currentItem = list[activeItemIndex];
      onUnsave(currentItem);
      setLightboxOpen(false);
  };

  // Determine current item
  const currentItem = lightboxOpen 
      ? (activeListType === 'photos' ? savedPhotos[activeItemIndex] : savedVideos[activeItemIndex]) 
      : null;

  return (
    <div className="max-w-[940px] mx-auto py-8 px-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">العناصر المحفوظة</h2>
        <div className="bg-gray-200 p-2 rounded-full">
            <Bookmark className="w-6 h-6 text-black" />
        </div>
      </div>

      {!hasItems ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-gray-400" />
           </div>
           <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عناصر محفوظة</h3>
           <p className="text-gray-500">عندما تقوم بحفظ صور، فيديوهات، أو منشورات، ستظهر هنا ليسهل عليك الوصول إليها لاحقاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Photos */}
           {savedPhotos.map((photo, idx) => (
             <div key={photo.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex flex-col">
                 <div className="aspect-video bg-gray-100 relative group cursor-pointer" onClick={() => openLightbox(idx, 'photos')}>
                    <img src={photo.url} className="w-full h-full object-cover" alt="Saved Photo" />
                 </div>
                 <div className="p-4 flex justify-between items-center">
                    <div>
                        <div className="font-semibold text-gray-900">صورة محفوظة</div>
                        <div className="text-xs text-gray-500">تم الحفظ من الصور</div>
                    </div>
                    <button 
                      onClick={() => onUnsave(photo)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition"
                      title="إزالة من المحفوظات"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
             </div>
           ))}

           {/* Videos */}
           {savedVideos.map((video, idx) => (
             <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex flex-col">
                 <div className="aspect-video bg-black relative group cursor-pointer" onClick={() => openLightbox(idx, 'videos')}>
                    <video src={video.url} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/40 p-3 rounded-full group-hover:scale-110 transition">
                            <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                       {video.duration}
                    </div>
                 </div>
                 <div className="p-4 flex justify-between items-center">
                    <div>
                        <div className="font-semibold text-gray-900 line-clamp-1" title={video.title}>{video.title}</div>
                        <div className="text-xs text-gray-500">تم الحفظ من الفيديو</div>
                    </div>
                    <button 
                      onClick={() => onUnsave(video)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition"
                      title="إزالة من المحفوظات"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
             </div>
           ))}
        </div>
      )}

      {/* --- Lightbox Modal --- */}
      {lightboxOpen && currentItem && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center animate-fadeIn">
           <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
               
               {/* Media Section */}
               <div className="flex-1 bg-black flex items-center justify-center relative group" onClick={(e) => e.stopPropagation()}>
                    <button className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white z-[102]" onClick={closeLightbox}>
                        <X className="w-6 h-6" />
                    </button>
                    
                    {/* Navigation Buttons */}
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white z-10" onClick={prevItem}>
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white z-10" onClick={nextItem}>
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {activeListType === 'videos' ? (
                         <video 
                            src={currentItem.url} 
                            className="max-w-full max-h-[100vh] w-full h-full object-contain" 
                            controls
                            autoPlay
                        />
                    ) : (
                        <img src={currentItem.url} className="max-w-full max-h-[85vh] object-contain" alt="Full screen" />
                    )}
               </div>

               {/* Sidebar Section */}
               <div className="w-full md:w-[360px] bg-white flex flex-col h-[40vh] md:h-full border-l border-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3 relative">
                        <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{currentUser.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>الآن</span>
                                <span>·</span>
                                <Globe className="w-3 h-3" />
                            </div>
                        </div>
                        <div className="mr-auto relative">
                             <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Meta info if video */}
                    {activeListType === 'videos' && 'title' in currentItem && (
                        <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-100">
                            {(currentItem as VideoItem).title}
                        </div>
                    )}

                    {/* Stats & Actions */}
                    <div className="px-4 py-3 flex justify-between items-center text-sm text-gray-500 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                            <div className="bg-fb-blue p-1 rounded-full"><ThumbsUp className="w-3 h-3 text-white fill-current" /></div>
                            <span>{likesCount > 0 ? likesCount : ''}</span>
                        </div>
                        <div className="flex gap-3">
                            <span>{commentsList.length} تعليق</span>
                        </div>
                    </div>
                    <div className="px-2 py-1 flex items-center justify-between border-b border-gray-200">
                         <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-medium text-sm ${isLiked ? 'text-fb-blue' : 'text-gray-600'}`}>
                            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> أعجبني
                         </button>
                         <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-medium text-gray-600 text-sm">
                            <MessageCircle className="w-5 h-5" /> تعليق
                         </button>
                         <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-medium text-gray-600 text-sm">
                            <Share2 className="w-5 h-5" /> مشاركة
                         </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {commentsList.length === 0 ? (
                            <div className="text-center text-gray-400 py-10 text-sm">كن أول من يعلق.</div>
                        ) : (
                            commentsList.map(comment => (
                                <div key={comment.id} className="flex gap-2 items-start">
                                    <img src={comment.avatar} className="w-8 h-8 rounded-full" alt="commenter" />
                                    <div className="flex flex-col">
                                        <div className="bg-gray-200 px-3 py-2 rounded-2xl rounded-tr-none">
                                            <span className="font-bold text-xs block text-gray-900">{comment.user}</span>
                                            <span className="text-sm text-gray-800">{comment.text}</span>
                                        </div>
                                        <div className="flex gap-3 text-[11px] text-gray-500 pr-2 mt-1">
                                            <span className="font-semibold cursor-pointer hover:underline">أعجبني</span>
                                            <span className="font-semibold cursor-pointer hover:underline">رد</span>
                                            <span>{comment.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* Special Unsave Action in Footer area for easy access */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <button onClick={handleUnsaveCurrent} className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 text-gray-700">
                             <BookmarkMinus className="w-4 h-4 text-fb-blue" />
                             إزالة من العناصر المحفوظة
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-200 bg-white">
                        <form onSubmit={handleSendComment} className="flex items-center gap-2">
                             <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="me" />
                             <div className="flex-1 relative">
                                 <input type="text" className="w-full bg-gray-100 border-none rounded-full py-2 px-3 pr-10 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition" placeholder="اكتب تعليقاً..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                                 <Smile className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-700" />
                             </div>
                             <button type="submit" disabled={!commentInput.trim()} className="text-fb-blue disabled:opacity-50 hover:bg-blue-50 p-2 rounded-full transition"><Send className="w-5 h-5 rotate-180" /></button>
                        </form>
                    </div>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default SavedItems;
