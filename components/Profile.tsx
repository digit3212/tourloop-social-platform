
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Pen, Plus, MessageCircle, UserCheck, ChevronDown, UserMinus, Ban, UserPlus, Clock, LayoutGrid, Flag, Calendar, X, AlertCircle, Lock, CheckCircle, ThumbsUp, Share2, Send, Smile, Globe, Bookmark, BookmarkMinus, Bell, BellOff, Download, Trash2, MoreHorizontal, ChevronRight, ChevronLeft } from 'lucide-react';
import { User, Post, TabType, Photo, Album, VideoItem } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import ProfileAbout from './ProfileAbout';
import ProfileFriends from './ProfileFriends';
import ProfilePhotos from './ProfilePhotos';
import ProfileVideos from './ProfileVideos';
import ProfileIntro from './ProfileIntro';
import ProfileGroups from './ProfileGroups';
import ProfilePages from './ProfilePages';
import ProfileEvents from './ProfileEvents';

interface ProfileProps {
  currentUser: User;
  viewingUser?: User; 
  onFriendClick?: (user: User) => void;
  onMessageClick?: (user: User) => void;
  onFriendAction?: (action: 'unfriend' | 'block', user: User) => void;
  defaultTab?: TabType;
  
  // Posts
  posts: Post[];
  onPostCreate: (content: string, image?: string) => void;
  onTogglePin?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;

  // Update Handlers
  onUpdateAvatar?: (url: string) => void;
  onUpdateCover?: (url: string) => void;
  onUpdateName?: (newName: string) => void;
  onAddStory?: (url: string) => void;

  // Data Props for Photos
  photos?: Photo[];
  albums?: Album[];
  onAddPhoto?: (photo: Photo) => void;
  onCreateAlbum?: (album: Album) => void;
  onAddPhotoToAlbum?: (albumId: string, photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;

  // Data Props for Videos
  userVideos?: VideoItem[];
  onAddVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;

  // Saved Items Props
  savedPhotos?: Photo[];
  onToggleSave?: (photo: Photo) => void;
  savedVideos?: VideoItem[];
  onToggleSaveVideo?: (video: VideoItem) => void;
}

// Local Comment Interface
interface LocalComment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

type FriendshipStatus = 'friends' | 'not_friends' | 'request_sent';

const Profile: React.FC<ProfileProps> = ({ 
    currentUser, 
    viewingUser, 
    onFriendClick, 
    onMessageClick, 
    onFriendAction, 
    defaultTab,
    posts,
    onPostCreate,
    onTogglePin,
    onDeletePost,
    onUpdateAvatar,
    onUpdateCover,
    onUpdateName,
    onAddStory,
    photos = [],
    albums = [],
    onAddPhoto,
    onCreateAlbum,
    onAddPhotoToAlbum,
    onDeletePhoto,
    userVideos = [], 
    onAddVideo,
    onDeleteVideo,
    savedPhotos = [],
    onToggleSave,
    savedVideos = [],
    onToggleSaveVideo
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || 'posts');
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false); 
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('friends'); 
  
  // --- Identity Center State (Name Change) ---
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // --- Advanced Lightbox State ---
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [profileImagesList, setProfileImagesList] = useState<string[]>([]); // Determines navigation list
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(120); // Mock starting count
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const friendMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null); 
  
  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  const profileUser = viewingUser || currentUser;
  const isOwnProfile = profileUser.id === currentUser.id;

  // Filter posts for this profile
  const userPosts = posts.filter(post => post.author.id === profileUser.id);

  useEffect(() => {
      if (defaultTab) {
          setActiveTab(defaultTab);
      } else {
          setActiveTab('posts');
      }
      setShowFriendMenu(false);
      setShowMoreMenu(false);
      setFriendshipStatus('friends'); 
  }, [profileUser.id, defaultTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (friendMenuRef.current && !friendMenuRef.current.contains(event.target as Node)) {
            setShowFriendMenu(false);
        }
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
            setShowMoreMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsList, viewingImage]);

  // --- Lightbox Handlers ---
  
  // Generic open helper
  const handleOpenLightbox = (imgSrc: string) => {
      setViewingImage(imgSrc);
      setLikesCount(120); // Reset for demo
      setIsLiked(false);
      setCommentsList([]);
  };

  // Specific handler for Profile Picture click
  const handleViewAvatar = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!profileUser.avatar) return;

      // Get profile album photos
      const profileAlbum = albums.find(a => a.type === 'profile');
      let images: string[] = [];
      
      if (profileAlbum && profileAlbum.photos.length > 0) {
          images = profileAlbum.photos.map(p => p.url);
      } else {
          images = [profileUser.avatar];
      }

      setProfileImagesList(images);
      handleOpenLightbox(profileUser.avatar);
  };

  // Specific handler for Cover Photo click
  const handleViewCover = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!profileUser.coverPhoto) return;

      // Get cover album photos
      const coverAlbum = albums.find(a => a.type === 'cover');
      let images: string[] = [];

      if (coverAlbum && coverAlbum.photos.length > 0) {
          images = coverAlbum.photos.map(p => p.url);
      } else {
          images = [profileUser.coverPhoto];
      }

      setProfileImagesList(images);
      handleOpenLightbox(profileUser.coverPhoto);
  };

  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!viewingImage || profileImagesList.length <= 1) return;
      
      const currentIndex = profileImagesList.indexOf(viewingImage);
      // If current image is not in list (e.g. freshly uploaded), start from 0
      const startIdx = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIdx + 1) % profileImagesList.length;
      
      setViewingImage(profileImagesList[nextIndex]);
      
      // Reset interactions for new image
      setIsLiked(false);
      setCommentsList([]);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!viewingImage || profileImagesList.length <= 1) return;

      const currentIndex = profileImagesList.indexOf(viewingImage);
      const startIdx = currentIndex === -1 ? 0 : currentIndex;
      const prevIndex = (startIdx - 1 + profileImagesList.length) % profileImagesList.length;
      
      setViewingImage(profileImagesList[prevIndex]);

      // Reset interactions for new image
      setIsLiked(false);
      setCommentsList([]);
  };

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

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback?: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (file && callback) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) {
                  callback(reader.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleNameSubmit = () => {
      if (!newName.trim() || !passwordConfirm.trim()) return;
      
      setIsUpdatingName(true);
      setTimeout(() => {
          if (onUpdateName) {
              onUpdateName(newName);
          }
          setIsUpdatingName(false);
          setShowNameModal(false);
          setNewName('');
          setPasswordConfirm('');
      }, 1500);
  };

  const handleAction = (action: 'unfriend' | 'block') => {
      setShowFriendMenu(false);
      if (action === 'unfriend') {
          setFriendshipStatus('not_friends');
      }
      if (onFriendAction && profileUser) {
          onFriendAction(action, profileUser);
      }
  };

  const handleAddFriend = () => {
      setFriendshipStatus('request_sent');
  };

  const handleCancelRequest = () => {
      setFriendshipStatus('not_friends');
  };

  const getTabClass = (tabName: TabType) => 
    `px-4 py-3 font-semibold cursor-pointer whitespace-nowrap transition rounded-md ${
      activeTab === tabName
        ? 'text-fb-blue border-b-[3px] border-fb-blue rounded-none'
        : 'text-gray-500 hover:bg-gray-100'
    }`;

  const renderFriendButton = () => {
      if (friendshipStatus === 'friends') {
          return (
            <div className="relative" ref={friendMenuRef}>
                <button 
                    onClick={() => setShowFriendMenu(!showFriendMenu)}
                    className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
                >
                    <UserCheck className="w-5 h-5" />
                    <span>أصدقاء</span>
                    <ChevronDown className="w-4 h-4" />
                </button>
                {showFriendMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                        <div className="p-2 border-b border-gray-100 text-xs text-gray-500">إدارة الصداقة</div>
                        <button onClick={() => handleAction('unfriend')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium">
                            <UserMinus className="w-5 h-5 text-red-500" /> إلغاء الصداقة
                        </button>
                        <button onClick={() => handleAction('block')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium">
                            <Ban className="w-5 h-5 text-gray-600" /> حظر
                        </button>
                    </div>
                )}
            </div>
          );
      } else if (friendshipStatus === 'request_sent') {
          return (
            <button onClick={handleCancelRequest} className="bg-gray-200 text-fb-blue px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300 transition">
                <Clock className="w-5 h-5" /> <span>تم إرسال الطلب</span>
            </button>
          );
      } else {
          return (
            <button onClick={handleAddFriend} className="bg-fb-blue text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-700 transition">
                <UserPlus className="w-5 h-5" /> <span>إضافة صديق</span>
            </button>
          );
      }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto pb-10 relative">
      {/* Hidden Inputs */}
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onUpdateAvatar)} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onUpdateCover)} />
      <input type="file" ref={storyInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onAddStory)} />

      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-b-xl mb-4 pb-0 relative z-10">
        {/* Cover Photo - Clickable */}
        <div 
            className="relative h-[200px] md:h-[350px] w-full rounded-b-xl overflow-hidden bg-gray-300 group cursor-pointer"
            onClick={handleViewCover}
        >
          {profileUser.coverPhoto ? (
               <img
                src={profileUser.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover transition duration-300 group-hover:brightness-95"
              />
          ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                   لا توجد صورة غلاف
               </div>
          )}
          
          {isOwnProfile && (
            <button 
                onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-md flex items-center gap-2 font-semibold text-sm hover:bg-gray-100 transition shadow-sm z-10"
            >
                <Camera className="w-5 h-5" />
                <span className="hidden md:inline">تعديل صورة الغلاف</span>
            </button>
          )}
        </div>

        {/* Profile Info Area */}
        <div className="px-4 md:px-8 relative pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-8 mb-4 gap-4">
             {/* Avatar - Clickable */}
             <div className="relative z-10">
                <div 
                    className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md flex items-center justify-center cursor-pointer group"
                    onClick={handleViewAvatar}
                >
                    <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover group-hover:brightness-95 transition" />
                </div>
                {isOwnProfile && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                        className="absolute bottom-2 left-2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 border-2 border-white z-20"
                        title="تحديث صورة الملف الشخصي"
                    >
                        <Camera className="w-5 h-5 text-black" />
                    </div>
                )}
             </div>

             {/* Name & Friends */}
             <div className="flex-1 text-center md:text-right mb-2 md:mb-4 mt-2 md:mt-0">
                 <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                     <h1 className="text-3xl font-bold text-black">{profileUser.name}</h1>
                     
                     {/* Edit Name Icon */}
                     {isOwnProfile && (
                         <button 
                            onClick={() => { setNewName(currentUser.name); setShowNameModal(true); }}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition group relative"
                            title="تغيير الاسم"
                         >
                             <Pen className="w-5 h-5" />
                         </button>
                     )}
                 </div>
                 
                 {friendshipStatus === 'friends' && (
                     <>
                        <span className="text-gray-500 font-semibold text-[15px]">1.2 ألف صديق</span>
                        <div className="flex justify-center md:justify-start -space-x-2 space-x-reverse mt-2">
                            {[1,2,3,4,5,6].map(i => (
                                <img key={i} src={`https://picsum.photos/40/40?random=${i+200}`} className="w-8 h-8 rounded-full border-2 border-white" alt="friend" />
                            ))}
                        </div>
                     </>
                 )}
             </div>

             {/* Actions */}
             <div className="flex items-center gap-3 mb-4 mt-4 md:mt-0 relative">
                 {isOwnProfile ? (
                     <>
                        <button 
                            onClick={() => storyInputRef.current?.click()}
                            className="bg-fb-blue text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة إلى القصة</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('about')}
                            className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
                        >
                            <Pen className="w-4 h-4" />
                            <span>تعديل الملف الشخصي</span>
                        </button>
                     </>
                 ) : (
                     <>
                        {renderFriendButton()}
                        <button 
                            onClick={() => onMessageClick && onMessageClick(profileUser)}
                            className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>مراسلة</span>
                        </button>
                     </>
                 )}
             </div>
          </div>

          <div className="h-[1px] bg-gray-300 w-full mb-1"></div>

          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar pt-1">
             <div onClick={() => setActiveTab('posts')} className={getTabClass('posts')}>المنشورات</div>
             <div onClick={() => setActiveTab('about')} className={getTabClass('about')}>حول</div>
             <div onClick={() => setActiveTab('friends')} className={getTabClass('friends')}>الأصدقاء</div>
             <div onClick={() => setActiveTab('photos')} className={getTabClass('photos')}>الصور</div>
             <div onClick={() => setActiveTab('videos')} className={getTabClass('videos')}>مقاطع فيديو/ريلز</div>
             
             {/* More Dropdown */}
             <div className="relative" ref={moreMenuRef}>
                 <div 
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={`flex items-center gap-1 px-4 py-3 font-semibold cursor-pointer whitespace-nowrap transition rounded-md ${
                        ['groups', 'pages', 'events'].includes(activeTab)
                        ? 'text-fb-blue border-b-[3px] border-fb-blue rounded-none'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                 >
                     <span>المزيد</span>
                     <ChevronDown className="w-4 h-4" />
                 </div>
                 
                 {showMoreMenu && (
                     <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                         <button 
                            onClick={() => { setActiveTab('groups'); setShowMoreMenu(false); }} 
                            className="w-full text-right px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium"
                         >
                             المجموعات
                         </button>
                         <button 
                            onClick={() => { setActiveTab('pages'); setShowMoreMenu(false); }} 
                            className="w-full text-right px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium"
                         >
                             الصفحات
                         </button>
                         <button 
                            onClick={() => { setActiveTab('events'); setShowMoreMenu(false); }} 
                            className="w-full text-right px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium"
                         >
                             المناسبات
                         </button>
                     </div>
                 )}
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'posts' && (
        <div className="flex flex-col md:flex-row gap-4 px-4 md:px-0 animate-fadeIn relative z-20">
            {/* Left Sidebar (Intro, Photos, Friends) */}
            <div className="w-full md:w-5/12">
                <ProfileIntro 
                    currentUser={profileUser} 
                    isOwnProfile={isOwnProfile} 
                    photos={photos} 
                    onTabChange={setActiveTab} 
                />
            </div>

            {/* Right Feed (Posts) */}
            <div className="w-full md:w-7/12">
                {isOwnProfile && <CreatePost currentUser={currentUser} onPostCreate={onPostCreate} />}
                
                {userPosts.length > 0 ? (
                    userPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser} 
                            onTogglePin={onTogglePin}
                            onDelete={onDeletePost}
                        />
                    ))
                ) : (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                        <div className="mb-2 text-lg font-semibold">لا توجد منشورات بعد</div>
                        <p>عندما يقوم {profileUser.name} بنشر تحديثات، ستظهر هنا.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="px-4 md:px-0 animate-fadeIn"><ProfileAbout currentUser={profileUser} readonly={!isOwnProfile} /></div>
      )}
      {activeTab === 'friends' && (
        <div className="px-4 md:px-0"><ProfileFriends onFriendClick={onFriendClick} /></div>
      )}
      {activeTab === 'photos' && (
         <div className="px-4 md:px-0">
             <ProfilePhotos 
                currentUser={profileUser} 
                isOwnProfile={isOwnProfile} 
                photos={photos} 
                albums={albums}
                onAddPhoto={onAddPhoto}
                onCreateAlbum={onCreateAlbum}
                onAddPhotoToAlbum={onAddPhotoToAlbum}
                onUpdateAvatar={onUpdateAvatar}
                onDeletePhoto={onDeletePhoto}
                // Saved Props
                savedPhotos={savedPhotos}
                onToggleSave={onToggleSave}
             />
         </div>
      )}
      {activeTab === 'videos' && (
           <div className="px-4 md:px-0">
               <ProfileVideos 
                    currentUser={profileUser} 
                    isOwnProfile={isOwnProfile} 
                    userVideos={userVideos}
                    onAddVideo={onAddVideo}
                    onDeleteVideo={onDeleteVideo}
                    savedVideos={savedVideos}
                    onToggleSaveVideo={onToggleSaveVideo}
               />
           </div>
      )}
      
      {/* Tabs Content */}
      {activeTab === 'groups' && (
          <div className="px-4 md:px-0 animate-fadeIn">
              <ProfileGroups />
          </div>
      )}
      {activeTab === 'pages' && (
          <div className="px-4 md:px-0 animate-fadeIn">
              <ProfilePages />
          </div>
      )}
      {activeTab === 'events' && (
          <div className="px-4 md:px-0 animate-fadeIn">
              <ProfileEvents />
          </div>
      )}

      {/* --- Change Name Modal --- */}
      {showNameModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-900">تغيير الاسم</h3>
                      <button onClick={() => setShowNameModal(false)} className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-full transition">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      {/* Warning Box */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                              <span className="font-bold block mb-1">يرجى الانتباه:</span>
                              في حال قمت بتغيير اسمك على Tourloop، لن تتمكن من تغييره مرة أخرى لمدة 60 يوماً. لا تضف أي أحرف كبيرة أو علامات ترقيم أو أحرف غير عادية.
                          </div>
                      </div>

                      {/* Name Input */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none transition"
                              placeholder="الاسم الأول واسم العائلة"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                          />
                      </div>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Security */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-fb-blue" />
                              لأمانك، يرجى إدخال كلمة المرور لتأكيد التغيير
                          </label>
                          <input 
                              type="password" 
                              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none transition"
                              placeholder="كلمة المرور"
                              value={passwordConfirm}
                              onChange={(e) => setPasswordConfirm(e.target.value)}
                          />
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                      <button 
                          onClick={() => setShowNameModal(false)}
                          className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-md transition"
                      >
                          إلغاء
                      </button>
                      <button 
                          onClick={handleNameSubmit}
                          disabled={!newName.trim() || !passwordConfirm.trim() || isUpdatingName}
                          className="px-6 py-2 bg-fb-blue text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                          {isUpdatingName ? (
                              <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  جاري الحفظ...
                              </>
                          ) : (
                              'حفظ التغييرات'
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Advanced Split View Lightbox (Profile/Cover) --- */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center animate-fadeIn">
           <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
               
               {/* Image Section */}
               <div className="flex-1 bg-black flex items-center justify-center relative group" onClick={(e) => { e.stopPropagation(); }}>
                    
                    <button className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white z-[102]" onClick={() => setViewingImage(null)}>
                        <X className="w-6 h-6" />
                    </button>

                    {profileImagesList.length > 1 && (
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white z-10 transition hover:scale-110" onClick={handlePrevImage}>
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}

                    <img 
                        src={viewingImage} 
                        className="max-w-full max-h-[100vh] w-full h-full object-contain" 
                        alt="Profile Full screen" 
                    />

                    {profileImagesList.length > 1 && (
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white z-10 transition hover:scale-110" onClick={handleNextImage}>
                            <ChevronLeft className="w-8 h-8" />
                        </button>
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
                        
                        {/* Static Menu Button (No dropdown for profile view yet) */}
                        <div className="mr-auto relative">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

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
                            <div className="text-center text-gray-400 py-10 text-sm">كن أول من يعلق على هذه الصورة.</div>
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

export default Profile;
