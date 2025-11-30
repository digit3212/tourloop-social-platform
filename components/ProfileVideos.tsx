
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Video, Film, Plus, Play, MoreHorizontal, Clock, Eye, Trash2, X, ChevronRight, ChevronLeft, PictureInPicture, ThumbsUp, MessageCircle, Share2, Send, Smile, Bookmark, BookmarkMinus, Globe, Users, AtSign, UserPlus, Lock, Bell, BellOff, Download, ArrowRight, ChevronDown } from 'lucide-react';
import { User, VideoItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfileVideosProps {
  currentUser: User;
  isOwnProfile: boolean;
  savedVideos?: VideoItem[];
  onToggleSaveVideo?: (video: VideoItem) => void;
  // New Props
  userVideos?: VideoItem[];
  onAddVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
}

// Local interface for comments inside lightbox
interface LocalComment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

type MenuView = 'main' | 'audience' | 'comments';
type AudienceType = 'public' | 'friends' | 'friends_of_friends' | 'only_me';
type CommentAudienceType = 'public' | 'friends' | 'mentions';
type PrivacyLevel = 'public' | 'friends' | 'friends_of_friends' | 'only_me';

// --- Privacy Selector Component (Local Reuse) ---
interface PrivacySelectProps { value: PrivacyLevel; onChange: (val: PrivacyLevel) => void; small?: boolean; }
const PrivacySelect: React.FC<PrivacySelectProps> = ({ value, onChange, small }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options: { val: PrivacyLevel; label: string; icon: React.ElementType }[] = [
    { val: 'public', label: t.dir === 'rtl' ? 'عام' : 'Public', icon: Globe },
    { val: 'friends', label: t.dir === 'rtl' ? 'الأصدقاء' : 'Friends', icon: Users },
    { val: 'friends_of_friends', label: t.dir === 'rtl' ? 'أصدقاءالأصدقاء' : 'Friends of friends', icon: Users },
    { val: 'only_me', label: t.dir === 'rtl' ? 'أنا فقط' : 'Only Me', icon: Lock },
  ];
  const selected = options.find((o) => o.val === value) || options[0];
  const Icon = selected.icon;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-md transition font-medium text-gray-700 border border-gray-200 ${small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}>
        <Icon className={small ? "w-3 h-3" : "w-4 h-4"} /> <span>{selected.label}</span> <ChevronDown className={small ? "w-3 h-3" : "w-3 h-3"} />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-36 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden animate-fadeIn">
          {options.map((opt) => (
            <div key={opt.val} onClick={() => { onChange(opt.val); setIsOpen(false); }} className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${value === opt.val ? 'bg-blue-50 text-fb-blue' : 'text-gray-700'}`}>
              <opt.icon className="w-4 h-4" /> <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileVideos: React.FC<ProfileVideosProps> = ({ 
    currentUser, 
    isOwnProfile,
    savedVideos = [],
    onToggleSaveVideo,
    userVideos = [], // Receiving global videos
    onAddVideo,
    onDeleteVideo
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'reels'>('videos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Derived State: Filter global userVideos based on type
  // This replaces the local state to ensure synchronization with App.tsx
  const videos = useMemo(() => userVideos.filter(v => v.type === 'video'), [userVideos]);
  const reels = useMemo(() => userVideos.filter(v => v.type === 'reel'), [userVideos]);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activePlaylist, setActivePlaylist] = useState<VideoItem[]>([]);

  // Interaction State (Lightbox)
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  
  // Menu & Settings State
  const [showMenu, setShowMenu] = useState(false); 
  const [menuView, setMenuView] = useState<MenuView>('main');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [audience, setAudience] = useState<AudienceType>('public');
  const [commentAudience, setCommentAudience] = useState<CommentAudienceType>('public');

  // NEW: Upload Privacy
  const [uploadPrivacy, setUploadPrivacy] = useState<PrivacyLevel>('public');

  // --- Effects ---
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

  useEffect(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsList, lightboxOpen]);


  // --- Helper Functions ---
  const getVideoMetadata = (url: string): Promise<{ duration: number, width: number, height: number }> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve({ 
                duration: video.duration, 
                width: video.videoWidth, 
                height: video.videoHeight 
            });
        };
        video.src = url;
    });
  };

  const formatDuration = (seconds: number) => {
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getAudienceIcon = (type: AudienceType) => {
      switch(type) {
          case 'public': return <Globe className="w-3 h-3" />;
          case 'friends': return <Users className="w-3 h-3" />;
          case 'friends_of_friends': return <UserPlus className="w-3 h-3" />;
          case 'only_me': return <Lock className="w-3 h-3" />;
      }
  };

  const getAudienceLabel = (type: AudienceType) => {
    switch(type) {
        case 'public': return 'العامة';
        case 'friends': return 'الأصدقاء';
        case 'friends_of_friends': return 'أصدقاء الأصدقاء';
        case 'only_me': return 'أنت فقط';
    }
  };

  const getAudienceDescription = (type: AudienceType) => {
    switch(type) {
        case 'public': return 'أي شخص على فيسبوك أو خارجه';
        case 'friends': return 'أصدقاؤك على فيسبوك';
        case 'friends_of_friends': return 'أصدقاء أصدقائك';
        case 'only_me': return 'أنت فقط';
    }
  };

  // --- Handlers ---
  const handleFileClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onAddVideo) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              const meta = await getVideoMetadata(base64);
              const isReel = meta.height > meta.width;
              const detectedType = isReel ? 'reel' : 'video';

              const newItem: VideoItem = {
                  id: `vid_direct_${Date.now()}`,
                  url: base64,
                  title: isReel ? 'ريلز جديد' : 'فيديو جديد',
                  views: 0,
                  timestamp: 'الآن',
                  duration: formatDuration(meta.duration),
                  type: detectedType,
                  likes: 0,
                  comments: 0
              };

              // Use global handler only
              onAddVideo(newItem);
              
              // Switch tab
              if (detectedType === 'video') {
                  setActiveTab('videos');
              } else {
                  setActiveTab('reels');
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleDelete = (id: string) => {
     if (lightboxOpen) setLightboxOpen(false);

     setTimeout(() => {
         if (onDeleteVideo) {
             onDeleteVideo(id);
         }
     }, 100);
     setShowMenu(false);
  };

  // Lightbox Logic
  const openLightbox = (index: number, playlist: VideoItem[]) => {
      setActivePlaylist(playlist);
      setActiveVideoIndex(index);
      setLightboxOpen(true);
      
      // Reset Interaction State
      setLikesCount(playlist[index].likes);
      setIsLiked(false);
      setCommentsList([]);
      setCommentInput('');
      setShowMenu(false);
      setMenuView('main');
      setNotificationsOn(true);
  };

  const closeLightbox = () => {
      setLightboxOpen(false);
      setActivePlaylist([]);
  };

  const nextVideo = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newIndex = (activeVideoIndex + 1) % activePlaylist.length;
      setActiveVideoIndex(newIndex);
      resetLightboxState(activePlaylist[newIndex]);
  };

  const prevVideo = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newIndex = (activeVideoIndex - 1 + activePlaylist.length) % activePlaylist.length;
      setActiveVideoIndex(newIndex);
      resetLightboxState(activePlaylist[newIndex]);
  };

  const resetLightboxState = (video: VideoItem) => {
      setLikesCount(video.likes);
      setIsLiked(false);
      setCommentsList([]);
      setShowMenu(false);
      setMenuView('main');
  };

  // Interaction Handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
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

  const handleTogglePiP = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoPlayerRef.current) {
          try {
              if (document.pictureInPictureElement) {
                  await document.exitPictureInPicture();
              } else {
                  await videoPlayerRef.current.requestPictureInPicture();
              }
          } catch (error) {
              console.error("PiP failed", error);
          }
      }
  };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = activePlaylist[activeVideoIndex].url;
      link.download = `video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowMenu(false);
  };

  const handleSaveVideo = () => {
      if (onToggleSaveVideo && activePlaylist[activeVideoIndex]) {
          onToggleSaveVideo(activePlaylist[activeVideoIndex]);
      }
      setShowMenu(false);
  };

  const currentVideo = activePlaylist[activeVideoIndex];
  const isCurrentVideoSaved = currentVideo ? savedVideos.some(v => v.id === currentVideo.id) : false;

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] animate-fadeIn p-4 relative">
       {/* Hidden Input */}
       <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*" 
          onChange={handleFileChange} 
       />

       {/* Header Section */}
       <div className="flex items-center justify-between mb-2">
           <h2 className="text-xl font-bold text-gray-900">مقاطع فيديو/ريلز</h2>
           {isOwnProfile && (
                <div className="flex gap-3 items-center">
                    {/* Privacy Selector for Upload */}
                    <PrivacySelect value={uploadPrivacy} onChange={setUploadPrivacy} small />

                    <button 
                    onClick={handleFileClick}
                    className="flex items-center gap-2 bg-fb-blue text-white px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة فيديو</span>
                    </button>
                </div>
           )}
       </div>

       {/* Tabs */}
       <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar mb-4 border-b border-gray-200 pb-2">
            <button 
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'videos' ? 'text-fb-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Video className="w-4 h-4" />
                <span>مقاطع الفيديو</span>
            </button>
            <button 
                onClick={() => setActiveTab('reels')}
                className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'reels' ? 'text-fb-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Film className="w-4 h-4" />
                <span>ريلز (Reels)</span>
            </button>
       </div>

       {/* Content Grid */}
       <div className="mt-4">
           {activeTab === 'videos' && (
               videos.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {videos.map((video, idx) => (
                           <div 
                                key={video.id} 
                                className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                                onClick={() => openLightbox(idx, videos)}
                            >
                               <div className="aspect-video bg-black relative">
                                   <video src={video.url} className="w-full h-full object-contain pointer-events-none" />
                                   <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition flex items-center justify-center">
                                       <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition">
                                            <Play className="w-8 h-8 text-white fill-white" />
                                       </div>
                                   </div>
                                   <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                       {video.duration}
                                   </div>
                               </div>
                               <div className="p-3">
                                   <h3 className="font-bold text-gray-900 text-sm mb-1">{video.title}</h3>
                                   <div className="flex items-center text-xs text-gray-500 gap-3">
                                       <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views} مشاهدة</span>
                                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.timestamp}</span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                       <Video className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                       <h3 className="text-lg font-bold text-gray-600">لا توجد مقاطع فيديو</h3>
                   </div>
               )
           )}

           {activeTab === 'reels' && (
               reels.length > 0 ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {reels.map((reel, idx) => (
                           <div 
                                key={reel.id} 
                                className="group relative bg-black rounded-lg overflow-hidden aspect-[9/16] shadow-md cursor-pointer"
                                onClick={() => openLightbox(idx, reels)}
                           >
                               <video src={reel.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition pointer-events-none" />
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                                   <Play className="w-6 h-6 text-white fill-current" />
                               </div>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                       <Film className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                       <h3 className="text-lg font-bold text-gray-600">لا توجد مقاطع ريلز</h3>
                   </div>
               )
           )}
       </div>

       {/* --- SPLIT VIEW LIGHTBOX --- */}
       {lightboxOpen && currentVideo && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center animate-fadeIn">
           <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
               
               {/* Video Player Section (Left) */}
               <div className="flex-1 bg-black flex items-center justify-center relative group" onClick={(e) => e.stopPropagation()}>
                    
                    <button className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white z-[102]" onClick={closeLightbox}>
                        <X className="w-6 h-6" />
                    </button>

                    {/* PiP Button - Top Left next to Close */}
                    <button 
                        onClick={handleTogglePiP}
                        className="absolute top-4 left-16 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white z-[102]"
                        title="تشغيل في نافذة عائمة"
                    >
                        <PictureInPicture className="w-6 h-6" />
                    </button>
                    
                    {activePlaylist.length > 1 && (
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white disabled:opacity-30 z-10" onClick={prevVideo}>
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}

                    <video 
                        ref={videoPlayerRef}
                        src={currentVideo.url} 
                        className="max-w-full max-h-[100vh] w-full h-full object-contain" 
                        controls
                        autoPlay
                    />

                    {activePlaylist.length > 1 && (
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white disabled:opacity-30 z-10" onClick={nextVideo}>
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}
               </div>

               {/* Sidebar Section (Right) */}
               <div className="w-full md:w-[360px] bg-white flex flex-col h-[40vh] md:h-full border-l border-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3 relative">
                        <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{currentUser.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{currentVideo.timestamp}</span>
                                <span>·</span>
                                {getAudienceIcon(audience)}
                            </div>
                        </div>
                        
                        {/* Nested Dropdown Menu */}
                        <div className="mr-auto relative" ref={menuRef}>
                            <button onClick={() => { setShowMenu(!showMenu); setMenuView('main'); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {showMenu && (
                                <div className="absolute left-0 top-full mt-1 w-80 bg-white shadow-xl rounded-lg border border-gray-100 z-50 overflow-hidden animate-fadeIn origin-top-left">
                                    
                                    {/* MAIN VIEW */}
                                    {menuView === 'main' && (
                                        <>
                                            <button onClick={handleSaveVideo} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                {isCurrentVideoSaved ? <BookmarkMinus className="w-5 h-5 text-fb-blue" /> : <Bookmark className="w-5 h-5" />} 
                                                {isCurrentVideoSaved ? 'إلغاء حفظ الفيديو' : 'حفظ الفيديو في العناصر المحفوظة'}
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            
                                            <button onClick={() => setMenuView('comments')} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700 group">
                                                <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5" /> من الذي يمكنه التعليق؟</div>
                                                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                            </button>
                                            
                                            <button onClick={() => setMenuView('audience')} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700 group">
                                                <div className="flex items-center gap-3"><Globe className="w-5 h-5" /> تعديل الجمهور</div>
                                                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                            </button>
                                            
                                            <button onClick={() => { setNotificationsOn(!notificationsOn); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                {notificationsOn ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                {notificationsOn ? 'إيقاف تشغيل الإشعارات لهذا الفيديو' : 'تشغيل الإشعارات لهذا الفيديو'}
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            
                                            <button onClick={handleDownload} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                <Download className="w-5 h-5" /> تنزيل
                                            </button>
                                            
                                            {isOwnProfile && (
                                                <button onClick={() => handleDelete(currentVideo.id)} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-red-600 font-medium">
                                                    <Trash2 className="w-5 h-5" /> حذف الفيديو
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* AUDIENCE VIEW */}
                                    {menuView === 'audience' && (
                                        <div className="animate-slideLeft">
                                            <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-100">
                                                <button onClick={() => setMenuView('main')} className="p-1 hover:bg-gray-200 rounded-full"><ArrowRight className="w-5 h-5 text-gray-600" /></button>
                                                <span className="font-bold text-sm text-gray-800">تعديل الجمهور</span>
                                            </div>
                                            <div className="py-2">
                                                {(['public', 'friends', 'friends_of_friends', 'only_me'] as AudienceType[]).map((type) => (
                                                    <button 
                                                        key={type}
                                                        onClick={() => { setAudience(type); setShowMenu(false); }}
                                                        className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-gray-100 p-2 rounded-full">{getAudienceIcon(type)}</div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">{getAudienceLabel(type)}</span>
                                                                <span className="text-xs text-gray-500">{getAudienceDescription(type)}</span>
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
                                             <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-100">
                                                <button onClick={() => setMenuView('main')} className="p-1 hover:bg-gray-200 rounded-full"><ArrowRight className="w-5 h-5 text-gray-600" /></button>
                                                <span className="font-bold text-sm text-gray-800">من الذي يمكنه التعليق؟</span>
                                            </div>
                                            <div className="py-2">
                                                <div className="px-4 text-xs text-gray-500 mb-2">اختر من يُسمح له بالتعليق على منشورك.</div>
                                                
                                                <button onClick={() => { setCommentAudience('public'); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700">
                                                     <div className="flex items-center gap-3">
                                                         <div className="bg-gray-100 p-2 rounded-full"><Globe className="w-4 h-4" /></div>
                                                         <span className="font-semibold">العامة</span>
                                                     </div>
                                                     {commentAudience === 'public' && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                                </button>

                                                <button onClick={() => { setCommentAudience('friends'); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700">
                                                     <div className="flex items-center gap-3">
                                                         <div className="bg-gray-100 p-2 rounded-full"><Users className="w-4 h-4" /></div>
                                                         <span className="font-semibold">الأصدقاء</span>
                                                     </div>
                                                     {commentAudience === 'friends' && <div className="w-2 h-2 bg-fb-blue rounded-full"></div>}
                                                </button>

                                                <button onClick={() => { setCommentAudience('mentions'); setShowMenu(false); }} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700">
                                                     <div className="flex items-center gap-3">
                                                         <div className="bg-gray-100 p-2 rounded-full"><AtSign className="w-4 h-4" /></div>
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

                    {/* Stats & Actions */}
                    <div className="px-4 py-3 flex justify-between items-center text-sm text-gray-500 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                            <div className="bg-fb-blue p-1 rounded-full"><ThumbsUp className="w-3 h-3 text-white fill-current" /></div>
                            <span>{likesCount > 0 ? likesCount : ''}</span>
                        </div>
                        <div className="flex gap-3">
                            <span>{currentVideo.views} مشاهدة</span>
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
                            <div className="text-center text-gray-400 py-10 text-sm">كن أول من يعلق على هذا الفيديو.</div>
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

export default ProfileVideos;
