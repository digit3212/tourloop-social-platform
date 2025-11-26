
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Pen, Plus, MessageCircle, UserCheck, ChevronDown, UserMinus, Ban, UserPlus, Clock } from 'lucide-react';
import { User, Post, TabType, Photo, Album, VideoItem } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import ProfileAbout from './ProfileAbout';
import ProfileFriends from './ProfileFriends';
import ProfilePhotos from './ProfilePhotos';
import ProfileVideos from './ProfileVideos';
import ProfileIntro from './ProfileIntro';

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

  // Update Handlers
  onUpdateAvatar?: (url: string) => void;
  onUpdateCover?: (url: string) => void;
  onAddStory?: (url: string) => void;

  // Data Props for Photos
  photos?: Photo[];
  albums?: Album[];
  onAddPhoto?: (photo: Photo) => void;
  onCreateAlbum?: (album: Album) => void;
  onAddPhotoToAlbum?: (albumId: string, photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;

  // Saved Items Props
  savedPhotos?: Photo[];
  onToggleSave?: (photo: Photo) => void;
  savedVideos?: VideoItem[];
  onToggleSaveVideo?: (video: VideoItem) => void;
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
    onUpdateAvatar,
    onUpdateCover,
    onAddStory,
    photos = [],
    albums = [],
    onAddPhoto,
    onCreateAlbum,
    onAddPhotoToAlbum,
    onDeletePhoto,
    savedPhotos = [],
    onToggleSave,
    savedVideos = [],
    onToggleSaveVideo
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || 'posts');
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('friends'); 
  
  const friendMenuRef = useRef<HTMLDivElement>(null);
  
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
      setFriendshipStatus('friends'); 
  }, [profileUser.id, defaultTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (friendMenuRef.current && !friendMenuRef.current.contains(event.target as Node)) {
            setShowFriendMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- File Upload Helpers ---
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
      // Reset input
      e.target.value = '';
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
    <div className="w-full max-w-[940px] mx-auto pb-10">
      {/* Hidden Inputs */}
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onUpdateAvatar)} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onUpdateCover)} />
      <input type="file" ref={storyInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onAddStory)} />

      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-b-xl mb-4 pb-0 relative z-10">
        {/* Cover Photo */}
        <div className="relative h-[200px] md:h-[350px] w-full rounded-b-xl overflow-hidden bg-gray-300">
          {profileUser.coverPhoto ? (
               <img
                src={profileUser.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
          ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                   لا توجد صورة غلاف
               </div>
          )}
          
          {isOwnProfile && (
            <button 
                onClick={() => coverInputRef.current?.click()}
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
             {/* Avatar */}
             <div className="relative z-10">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md flex items-center justify-center">
                    <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                </div>
                {isOwnProfile && (
                    <div 
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-2 left-2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 border-2 border-white"
                        title="تحديث صورة الملف الشخصي"
                    >
                        <Camera className="w-5 h-5 text-black" />
                    </div>
                )}
             </div>

             {/* Name & Friends */}
             <div className="flex-1 text-center md:text-right mb-2 md:mb-4 mt-2 md:mt-0">
                 <h1 className="text-3xl font-bold mb-1 text-black">{profileUser.name}</h1>
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
                        <PostCard key={post.id} post={post} currentUser={currentUser} />
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
                    savedVideos={savedVideos}
                    onToggleSaveVideo={onToggleSaveVideo}
               />
           </div>
      )}
    </div>
  );
};

export default Profile;
