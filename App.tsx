
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import ChatWindow from './components/ChatWindow';
import SavedItems from './components/SavedItems';
import Watch from './components/Watch';
import { User, View, Story, Photo, Album, VideoItem, Post } from './types';
import { Check, Info, X } from 'lucide-react';

const initialUser: User = {
  id: 'me',
  name: 'أحمد علي',
  avatar: 'https://picsum.photos/200/200?random=1', 
  coverPhoto: '',
  online: true
};

const initialPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'مارك زوكربيرج',
      avatar: 'https://picsum.photos/50/50?random=2',
      online: true
    },
    content: 'أطلقنا ميزة جديدة في تواصل! جربوها وأخبروني برأيكم. #تواصل_اجتماعي #تحديث_جديد 🚀',
    timestamp: 'منذ ساعتين',
    likes: 1204,
    comments: [
      {
        id: 'c1',
        author: { id: '3', name: 'سارة محمد', avatar: 'https://picsum.photos/50/50?random=3' },
        content: 'هذا يبدو رائعاً! عمل ممتاز يا فريق.',
        timestamp: 'منذ ساعة',
        likes: 5
      }
    ],
    shares: 45,
    image: 'https://picsum.photos/600/400?random=10',
    isPinned: false
  },
  {
    id: '2',
    author: {
      id: '4',
      name: 'عاشق التصوير',
      avatar: 'https://picsum.photos/50/50?random=4',
      online: false
    },
    content: 'غروب الشمس أمس كان خيالياً.. الألوان لا تصدق! 🌅📸',
    timestamp: 'منذ 5 ساعات',
    likes: 89,
    comments: [],
    shares: 2,
    image: 'https://picsum.photos/600/400?random=11',
    isPinned: false
  }
];

const initialStories: Story[] = [];
const initialYourPhotos: Photo[] = [];
const initialAlbums: Album[] = [
  { 
    id: 'a1', 
    title: 'صور الملف الشخصي', 
    coverUrl: '', 
    type: 'profile',
    photos: [] 
  },
  { 
    id: 'a2', 
    title: 'صور الغلاف', 
    coverUrl: '', 
    type: 'cover',
    photos: [] 
  }
];

const onlineUsers: User[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `u${i}`,
  name: `مستخدم ${i + 1}`,
  avatar: `https://picsum.photos/50/50?random=${i + 10}`,
  online: Math.random() > 0.3
}));

const App: React.FC = () => {
  const [currentView, setView] = useState<View>('home');
  
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [stories, setStories] = useState<Story[]>(initialStories);
  
  const [yourPhotos, setYourPhotos] = useState<Photo[]>(initialYourPhotos);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  
  // Real Saved Items State
  const [savedPhotos, setSavedPhotos] = useState<Photo[]>([]);
  const [savedVideos, setSavedVideos] = useState<VideoItem[]>([]);

  const [viewingProfile, setViewingProfile] = useState<User>(currentUser);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [appNotification, setAppNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
      setAppNotification({ message, type });
      setTimeout(() => setAppNotification(null), 4000);
  };

  // Modified handleCreatePost to accept skipPhotoAdd flag
  const handleCreatePost = (content: string, image?: string, skipPhotoAdd: boolean = false) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content,
      image,
      timestamp: 'الآن',
      likes: 0,
      comments: [],
      shares: 0,
      isPinned: false
    };

    // Update posts: Keep pinned posts at top, insert new post after them
    setPosts(prev => {
        const pinned = prev.filter(p => p.isPinned);
        const unpinned = prev.filter(p => !p.isPinned);
        return [...pinned, newPost, ...unpinned];
    });

    // If post has image, add to photos ONLY if skipPhotoAdd is false AND it's not a video
    if (image && !image.startsWith('data:video') && !skipPhotoAdd) {
        setYourPhotos(prev => {
            // Double check: don't add if exact same URL already exists
            const exists = prev.some(p => p.url === image);
            if (exists) return prev;

            const newPhoto: Photo = {
                id: `post_img_${Date.now()}`,
                url: image,
                likes: 0,
                comments: 0
            };
            return [newPhoto, ...prev];
        });
    }
    showNotification('تم نشر المنشور بنجاح');
  };

  const handleTogglePinPost = (postId: string) => {
      setPosts(prev => {
          // 1. Update the pinned state
          const updated = prev.map(post => 
              post.id === postId ? { ...post, isPinned: !post.isPinned } : post
          );
          
          // 2. Re-sort: Pinned items go to the top
          const pinned = updated.filter(p => p.isPinned);
          const unpinned = updated.filter(p => !p.isPinned);
          
          return [...pinned, ...unpinned];
      });

      const post = posts.find(p => p.id === postId);
      if (post) {
          showNotification(!post.isPinned ? 'تم تثبيت المنشور في الأعلى 📌' : 'تم إلغاء تثبيت المنشور');
      }
  };

  const handleDeletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      showNotification('تم حذف المنشور بنجاح', 'info');
  };

  const handleUpdateProfilePhoto = (newUrl: string) => {
      const existingPhoto = yourPhotos.find(p => p.url === newUrl);
      if (!existingPhoto) {
          const newPhoto: Photo = {
              id: `profile_${Date.now()}`,
              url: newUrl,
              likes: 0,
              comments: 0,
              description: 'تحديث صورة الملف الشخصي'
          };
          setYourPhotos(prev => [newPhoto, ...prev]);
          setAlbums(prevAlbums => prevAlbums.map(album => {
              if (album.type === 'profile') {
                  return { ...album, coverUrl: newUrl, photos: [newPhoto, ...album.photos] };
              }
              return album;
          }));
      }
      const updatedUser = { ...currentUser, avatar: newUrl };
      setCurrentUser(updatedUser);
      if (viewingProfile.id === currentUser.id) {
          setViewingProfile(updatedUser);
      }
      // Pass true to skip adding photo again in handleCreatePost
      handleCreatePost(`قام ${currentUser.name} بتحديث صورة الملف الشخصي.`, newUrl, true);
      showNotification('تم تحديث صورة الملف الشخصي بنجاح');
  };

  const handleUpdateCoverPhoto = (newUrl: string) => {
      const existingPhoto = yourPhotos.find(p => p.url === newUrl);
      if (!existingPhoto) {
          const newPhoto: Photo = {
              id: `cover_${Date.now()}`,
              url: newUrl,
              likes: 0,
              comments: 0,
              description: 'تحديث صورة الغلاف'
          };
          setYourPhotos(prev => [newPhoto, ...prev]);
          setAlbums(prevAlbums => prevAlbums.map(album => {
              if (album.type === 'cover') {
                  return { ...album, coverUrl: newUrl, photos: [newPhoto, ...album.photos] };
              }
              return album;
          }));
      }
      const updatedUser = { ...currentUser, coverPhoto: newUrl };
      setCurrentUser(updatedUser);
      if (viewingProfile.id === currentUser.id) {
          setViewingProfile(updatedUser);
      }
      // Pass true to skip adding photo again
      handleCreatePost(`قام ${currentUser.name} بتحديث صورة الغلاف.`, newUrl, true);
      showNotification('تم تحديث صورة الغلاف بنجاح');
  };

  const handleUpdateName = (newName: string) => {
      const updatedUser = { ...currentUser, name: newName };
      setCurrentUser(updatedUser);
      if (viewingProfile.id === currentUser.id) {
          setViewingProfile(updatedUser);
      }
      showNotification('تم تغيير الاسم بنجاح');
  };

  const handleAddStory = (mediaUrl: string) => {
      const newStory: Story = {
          id: `ns_${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          mediaUrl: mediaUrl,
          type: 'image',
          timestamp: 'الآن'
      };
      setStories([newStory, ...stories]);
      showNotification('تم إضافة القصة بنجاح');
  };

  const handleAddGenericPhoto = (photo: Photo) => {
      setYourPhotos(prev => [photo, ...prev]);
      showNotification('تم إضافة الصورة بنجاح');
  };

  const handleCreateAlbum = (newAlbum: Album) => {
      setAlbums(prev => [newAlbum, ...prev]);
      setYourPhotos(prev => [...newAlbum.photos, ...prev]);
      showNotification('تم إنشاء الألبوم بنجاح');
  };

  const handleAddPhotoToSpecificAlbum = (albumId: string, photo: Photo) => {
      setAlbums(prev => prev.map(album => {
          if (album.id === albumId) {
              return { ...album, photos: [photo, ...album.photos], coverUrl: photo.url };
          }
          return album;
      }));
      setYourPhotos(prev => [photo, ...prev]);
      showNotification('تم إضافة الصورة إلى الألبوم');
  };

  const handleDeletePhoto = (photoId: string) => {
      setYourPhotos(prev => prev.filter(p => p.id !== photoId));
      setAlbums(prev => prev.map(album => ({
          ...album,
          photos: album.photos.filter(p => p.id !== photoId)
      })));
      setSavedPhotos(prev => prev.filter(p => p.id !== photoId));
      showNotification('تم حذف الصورة بنجاح', 'info');
  };

  const handleToggleSave = (item: Photo | VideoItem) => {
      if ('duration' in item) {
          handleToggleSaveVideo(item as VideoItem);
      } else {
          const photo = item as Photo;
          const exists = savedPhotos.find(p => p.id === photo.id);
          if (exists) {
              setSavedPhotos(prev => prev.filter(p => p.id !== photo.id));
              showNotification('تمت إزالة المنشور من العناصر المحفوظة', 'info');
          } else {
              setSavedPhotos(prev => [photo, ...prev]);
              showNotification('تم حفظ المنشور في العناصر المحفوظة');
          }
      }
  };

  const handleToggleSaveVideo = (video: VideoItem) => {
      const exists = savedVideos.find(v => v.id === video.id);
      if (exists) {
          setSavedVideos(prev => prev.filter(v => v.id !== video.id));
          showNotification('تمت إزالة الفيديو من العناصر المحفوظة', 'info');
      } else {
          setSavedVideos(prev => [video, ...prev]);
          showNotification('تم حفظ الفيديو في العناصر المحفوظة');
      }
  };

  const handleProfileClick = () => {
    setViewingProfile(currentUser);
    setView('profile');
  };

  const handleFriendClick = (friend: User) => {
    setViewingProfile(friend);
    setView('profile');
  };

  const handleMessageClick = (user: User) => {
    setActiveChatUser(user);
  };

  const handleFriendAction = (action: 'unfriend' | 'block', user: User) => {
      if (action === 'unfriend') {
          showNotification(`تم إلغاء الصداقة مع ${user.name}.`, 'success');
      } else if (action === 'block') {
          showNotification(`تم حظر ${user.name} بنجاح.`, 'info');
          setView('home'); 
      }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#050505]">
      <Navbar currentView={currentView} setView={setView} />
      
      <div className="flex justify-between">
        <Sidebar 
            currentUser={currentUser} 
            onProfileClick={handleProfileClick} 
            onNavigate={(view) => setView(view)} 
        />
        
        <div className="flex-1 flex justify-center w-full">
           {currentView === 'home' && (
             <Feed 
                currentUser={currentUser} 
                stories={stories} 
                posts={posts}
                onAddStory={handleAddStory} 
                onPostCreate={handleCreatePost}
                onTogglePin={handleTogglePinPost}
                onDeletePost={handleDeletePost}
             />
           )}

           {currentView === 'watch' && (
             <Watch />
           )}

           {currentView === 'saved' && (
             <SavedItems 
                currentUser={currentUser}
                savedPhotos={savedPhotos} 
                savedVideos={savedVideos}
                onUnsave={handleToggleSave} 
             />
           )}
           
           {(currentView === 'profile' || currentView === 'friends' || currentView === 'profile_videos') && (
             <Profile 
                currentUser={currentUser} 
                viewingUser={currentView === 'friends' ? currentUser : viewingProfile}
                onFriendClick={handleFriendClick}
                onMessageClick={handleMessageClick}
                onFriendAction={handleFriendAction}
                defaultTab={currentView === 'friends' ? 'friends' : currentView === 'profile_videos' ? 'videos' : undefined}
                
                // Posts
                posts={posts}
                onPostCreate={handleCreatePost}
                onTogglePin={handleTogglePinPost}
                onDeletePost={handleDeletePost}

                // Update Handlers
                onUpdateAvatar={handleUpdateProfilePhoto}
                onUpdateCover={handleUpdateCoverPhoto}
                onUpdateName={handleUpdateName} 
                onAddStory={handleAddStory}
                
                // Photos/Albums
                photos={yourPhotos}
                albums={albums}
                onAddPhoto={handleAddGenericPhoto}
                onCreateAlbum={handleCreateAlbum}
                onAddPhotoToAlbum={handleAddPhotoToSpecificAlbum}
                onDeletePhoto={handleDeletePhoto}
                
                // Saved Props
                savedPhotos={savedPhotos}
                onToggleSave={handleToggleSave}
                savedVideos={savedVideos}
                onToggleSaveVideo={handleToggleSaveVideo}
             />
           )}

           {currentView !== 'home' && currentView !== 'profile' && currentView !== 'friends' && currentView !== 'saved' && currentView !== 'watch' && currentView !== 'profile_videos' && (
               <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full">
                   <div className="text-center text-gray-500">
                       <h2 className="text-2xl font-bold mb-2 capitalize">{currentView === 'marketplace' ? 'المتجر' : 'صفحة'}</h2>
                       <p>هذا القسم قيد التطوير حالياً.</p>
                       <button onClick={() => setView('home')} className="mt-4 text-fb-blue hover:underline">العودة للرئيسية</button>
                   </div>
               </div>
           )}
        </div>

        {currentView !== 'profile' && currentView !== 'friends' && currentView !== 'saved' && currentView !== 'profile_videos' && <Rightbar onlineUsers={onlineUsers} />}
      </div>

      {activeChatUser && (
        <ChatWindow 
          user={activeChatUser} 
          currentUser={currentUser}
          onClose={() => setActiveChatUser(null)} 
        />
      )}

      {appNotification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${appNotification.type === 'success' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                {appNotification.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <Info className="w-5 h-5 text-blue-400" />}
                <span className="font-medium text-sm">{appNotification.message}</span>
                <button onClick={() => setAppNotification(null)} className="mr-2 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
