
import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, Image as ImageIcon, Pen, X, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Upload, ThumbsUp, MessageCircle, Share2, Send, Smile, Globe, Download, UserCircle, Trash2, Bell, Bookmark, Lock, Users, UserPlus, BellOff, BookmarkMinus, AtSign, ChevronDown } from 'lucide-react';
import { User, Photo, Album } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfilePhotosProps {
  currentUser: User;
  isOwnProfile: boolean;
  photos: Photo[];
  albums: Album[];
  onAddPhoto?: (photo: Photo) => void;
  onCreateAlbum?: (album: Album) => void;
  onAddPhotoToAlbum?: (albumId: string, photo: Photo) => void;
  onUpdateAvatar?: (url: string) => void;
  onDeletePhoto?: (photoId: string) => void;
  savedPhotos?: Photo[];
  onToggleSave?: (photo: Photo) => void;
}

type PhotoTab = 'your_photos' | 'tagged_photos' | 'albums';
type AudienceType = 'public' | 'friends' | 'friends_of_friends' | 'only_me';
type CommentAudienceType = 'public' | 'friends' | 'mentions';
type MenuView = 'main' | 'audience' | 'comments';
type PrivacyLevel = 'public' | 'friends' | 'friends_of_friends' | 'only_me';

// Local interface for comments inside lightbox
interface LocalComment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

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


const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ 
  currentUser, 
  isOwnProfile, 
  photos, 
  albums,
  onAddPhoto,
  onCreateAlbum,
  onAddPhotoToAlbum,
  onUpdateAvatar,
  onDeletePhoto,
  savedPhotos = [],
  onToggleSave
}) => {
  const { t } = useLanguage();
  // --- State ---
  const [activeTab, setActiveTab] = useState<PhotoTab>('your_photos');
  const [taggedPhotos] = useState<Photo[]>([]);

  // UI State
  const [viewingAlbum, setViewingAlbum] = useState<Album | null>(null);
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentLightboxSource, setCurrentLightboxSource] = useState<Photo[]>([]);
  
  // Dropdown Menu State
  const [showMenu, setShowMenu] = useState(false); 
  const [menuView, setMenuView] = useState<MenuView>('main');

  // Interaction State (Lightbox)
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  
  // Menu Item States
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [audience, setAudience] = useState<AudienceType>('public');
  const [commentAudience, setCommentAudience] = useState<CommentAudienceType>('public');

  // Create Album Modal State
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumFiles, setNewAlbumFiles] = useState<string[]>([]); 

  // NEW: Upload Privacy State
  const [uploadPrivacy, setUploadPrivacy] = useState<PrivacyLevel>('public');

  // Refs
  const mainInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const addToAlbumInputRef = useRef<HTMLInputElement>(null); 
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (viewingAlbum) {
      const updatedAlbum = albums.find(a => a.id === viewingAlbum.id);
      if (updatedAlbum) {
        setViewingAlbum(updatedAlbum);
      }
    }
  }, [albums, viewingAlbum?.id]);

  useEffect(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsList, lightboxOpen]);

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


  // --- Helpers ---
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAddPhoto) {
      for (let i = 0; i < e.target.files.length; i++) {
        const base64 = await readFileAsBase64(e.target.files[i]);
        const newPhoto: Photo = {
          id: `new_${Date.now()}_${i}`,
          url: base64,
          likes: 0,
          comments: 0,
          // In a real app, we would store the privacy here too
        };
        onAddPhoto(newPhoto);
      }
      setActiveTab('your_photos');
    }
  };

  const handleAddToAlbumFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && viewingAlbum && onAddPhotoToAlbum) {
          for (let i = 0; i < e.target.files.length; i++) {
              const base64 = await readFileAsBase64(e.target.files[i]);
              const newPhoto: Photo = {
                  id: `album_add_${Date.now()}_${i}`,
                  url: base64,
                  likes: 0,
                  comments: 0
              };
              onAddPhotoToAlbum(viewingAlbum.id, newPhoto);
          }
      }
      e.target.value = ''; 
  };

  const openLightbox = (index: number, source: Photo[]) => {
    setCurrentLightboxSource(source);
    setLightboxIndex(index);
    setLightboxOpen(true);
    
    setLikesCount(source[index].likes);
    setIsLiked(false); 
    setCommentsList([]); 
    setCommentInput('');
    setShowMenu(false);
    setMenuView('main');
    setAudience('public');
    setCommentAudience('public');
    setNotificationsOn(true); 
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIndex = (lightboxIndex + 1) % currentLightboxSource.length;
    setLightboxIndex(newIndex);
    setLikesCount(currentLightboxSource[newIndex].likes);
    setIsLiked(false);
    setCommentsList([]);
    setShowMenu(false);
    setMenuView('main');
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIndex = (lightboxIndex - 1 + currentLightboxSource.length) % currentLightboxSource.length;
    setLightboxIndex(newIndex);
    setLikesCount(currentLightboxSource[newIndex].likes);
    setIsLiked(false);
    setCommentsList([]);
    setShowMenu(false);
    setMenuView('main');
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

  // --- Menu Handlers ---
  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = currentLightboxSource[lightboxIndex].url;
      link.download = `photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowMenu(false);
  };

  const handleSetProfilePicture = () => {
      if (onUpdateAvatar) {
          onUpdateAvatar(currentLightboxSource[lightboxIndex].url);
          setShowMenu(false);
          setLightboxOpen(false); 
      }
  };

  const handleDeleteCurrentPhoto = () => {
      const currentPhoto = currentLightboxSource[lightboxIndex];
      if (onDeletePhoto && currentPhoto) {
        if (window.confirm('هل أنت متأكد من حذف هذه الصورة نهائياً؟')) {
            setLightboxOpen(false);
            onDeletePhoto(currentPhoto.id);
        }
      }
      setShowMenu(false);
  };

  const handleToggleNotifications = () => {
      setNotificationsOn(!notificationsOn);
      setShowMenu(false);
  };

  const handleSavePost = () => {
      if (onToggleSave && currentLightboxSource[lightboxIndex]) {
          onToggleSave(currentLightboxSource[lightboxIndex]);
      }
      setShowMenu(false);
  };

  const isCurrentPhotoSaved = currentLightboxSource[lightboxIndex] 
      ? savedPhotos.some(p => p.id === currentLightboxSource[lightboxIndex].id)
      : false;

  // --- Create Album Handlers ---
  const handleAlbumFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const promises = Array.from(e.target.files).map((file) => readFileAsBase64(file as File));
      const results = await Promise.all(promises);
      setNewAlbumFiles(prev => [...prev, ...results]);
    }
  };

  const handleCreateAlbum = () => {
    if (!newAlbumTitle.trim() || !onCreateAlbum) return;

    const albumPhotos: Photo[] = newAlbumFiles.map((url, i) => ({
      id: `album_new_${Date.now()}_${i}`,
      url: url,
      likes: 0,
      comments: 0
    }));

    const newAlbum: Album = {
      id: Date.now().toString(),
      title: newAlbumTitle,
      coverUrl: albumPhotos.length > 0 ? albumPhotos[0].url : '', 
      type: 'user',
      photos: albumPhotos
    };

    onCreateAlbum(newAlbum);
    setNewAlbumTitle('');
    setNewAlbumFiles([]);
    setShowCreateAlbumModal(false);
  };

  const handleAlbumClick = (album: Album) => {
    setViewingAlbum(album);
  };

  // --- Renderers ---

  const renderPhotoGrid = (photosToRender: Photo[], emptyMessage: string) => {
    if (photosToRender.length === 0) {
      return (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-2" />
          <h3 className="text-xl font-bold text-gray-700">{emptyMessage}</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {photosToRender.map((photo, idx) => (
          <div 
            key={photo.id} 
            onClick={() => openLightbox(idx, photosToRender)}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border border-gray-200"
          >
            <img src={photo.url} alt="User content" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-200 flex items-start justify-end p-2">
              <button className="p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-700 shadow-sm" onClick={(e) => e.stopPropagation()}>
                 <Pen className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar mb-4 border-b border-gray-200 pb-2">
      <button
        onClick={() => setActiveTab('your_photos')}
        className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap ${
          activeTab === 'your_photos' ? 'text-fb-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        الصور الخاصة بك
      </button>
      <button
        onClick={() => setActiveTab('tagged_photos')}
        className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap ${
          activeTab === 'tagged_photos' ? 'text-fb-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        صور تمت الإشارة إليك فيها
      </button>
      <button
        onClick={() => setActiveTab('albums')}
        className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap ${
          activeTab === 'albums' ? 'text-fb-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        الألبومات
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 min-h-[500px] animate-fadeIn relative">
      <input type="file" multiple accept="image/*" className="hidden" ref={mainInputRef} onChange={handleMainUpload} />
      <input type="file" multiple accept="image/*" className="hidden" ref={addToAlbumInputRef} onChange={handleAddToAlbumFileSelect} />

      {!viewingAlbum && (
        <div className="flex items-center justify-between mb-2">
           <h2 className="text-xl font-bold text-gray-900">الصور</h2>
           {isOwnProfile && (
              <div className="flex gap-3 items-center">
                 {/* Privacy Selector for Upload */}
                 <PrivacySelect value={uploadPrivacy} onChange={setUploadPrivacy} small />
                 
                 <button 
                  onClick={() => mainInputRef.current?.click()}
                  className="text-fb-blue font-medium text-sm hover:bg-blue-50 px-3 py-1.5 rounded-md transition flex items-center gap-2"
                 >
                    <Plus className="w-4 h-4" />
                    إضافة صورة
                 </button>
                 {/* Removed the extra 'More' button here as requested */}
              </div>
           )}
        </div>
      )}

      {viewingAlbum ? (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
             <button onClick={() => setViewingAlbum(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowRight className="w-6 h-6 text-gray-600" />
             </button>
             <div>
               <h3 className="font-bold text-lg">{viewingAlbum.title}</h3>
               <span className="text-sm text-gray-500">{viewingAlbum.photos.length} عنصر</span>
             </div>
             {isOwnProfile && (
                <button 
                  onClick={() => addToAlbumInputRef.current?.click()} 
                  className="mr-auto text-fb-blue font-medium text-sm hover:bg-blue-50 px-3 py-1.5 rounded-md transition flex items-center gap-1"
                >
                   <Plus className="w-4 h-4" />
                   إضافة إلى الألبوم
                </button>
             )}
          </div>
          {renderPhotoGrid(viewingAlbum.photos, 'هذا الألبوم فارغ.')}
        </div>
      ) : (
        <>
          {renderTabs()}
          <div className="mt-4">
            {activeTab === 'your_photos' && renderPhotoGrid(photos, 'لا توجد صور خاصة بك بعد.')}
            {activeTab === 'tagged_photos' && renderPhotoGrid(taggedPhotos, 'لا توجد صور تمت الإشارة إليك فيها.')}
            {activeTab === 'albums' && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {isOwnProfile && (
                   <div 
                     onClick={() => setShowCreateAlbumModal(true)}
                     className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition group"
                   >
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition">
                       <Plus className="w-6 h-6 text-fb-blue" />
                     </div>
                     <span className="font-semibold text-fb-blue">إنشاء ألبوم</span>
                   </div>
                 )}
           
                 {albums.map((album) => (
                   <div key={album.id} className="cursor-pointer group" onClick={() => handleAlbumClick(album)}>
                     <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 mb-2 bg-gray-100">
                        {album.coverUrl ? (
                             <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:opacity-90 transition" />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                                 <ImageIcon className="w-10 h-10" />
                             </div>
                        )}
                        {album.type && album.type !== 'user' && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                               {album.type === 'profile' ? 'الملف الشخصي' : 'الغلاف'}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-200"></div>
                     </div>
                     <div className="px-1">
                        <h4 className="font-bold text-[15px] text-gray-900 group-hover:underline truncate">{album.title}</h4>
                        <span className="text-gray-500 text-xs">{album.photos.length} عنصر</span>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </>
      )}

      {/* --- Lightbox Modal --- */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center animate-fadeIn">
           <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
               
               {/* Image Section */}
               <div className="flex-1 bg-black flex items-center justify-center relative group" onClick={(e) => e.stopPropagation()}>
                    <button className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white z-[102]" onClick={() => setLightboxOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white disabled:opacity-30 z-10" onClick={prevPhoto}>
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    <img src={currentLightboxSource[lightboxIndex].url} className="max-w-full max-h-[85vh] object-contain" alt="Full screen" />
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white disabled:opacity-30 z-10" onClick={nextPhoto}>
                        <ChevronLeft className="w-8 h-8" />
                    </button>
               </div>

               {/* Sidebar */}
               <div className="w-full md:w-[360px] bg-white flex flex-col h-[40vh] md:h-full border-l border-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3 relative">
                        <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{currentUser.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>الآن</span>
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
                                            <button onClick={handleSavePost} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                {isCurrentPhotoSaved ? <BookmarkMinus className="w-5 h-5 text-fb-blue" /> : <Bookmark className="w-5 h-5" />} 
                                                {isCurrentPhotoSaved ? 'إلغاء حفظ المنشور' : 'حفظ المنشور في العناصر المحفوظة'}
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
                                            
                                            <button onClick={handleToggleNotifications} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                {notificationsOn ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                {notificationsOn ? 'إيقاف تشغيل الإشعارات لهذا المنشور' : 'تشغيل الإشعارات لهذا المنشور'}
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            
                                            <button onClick={handleDownload} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                <Download className="w-5 h-5" /> تنزيل
                                            </button>
                                            
                                            {isOwnProfile && (
                                                <>
                                                    <button onClick={handleSetProfilePicture} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700">
                                                        <UserCircle className="w-5 h-5" /> تعيين كصورة ملف شخصي
                                                    </button>
                                                    <button onClick={handleDeleteCurrentPhoto} className="w-full text-right px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-sm text-red-600 font-medium">
                                                        <Trash2 className="w-5 h-5" /> حذف الصورة
                                                    </button>
                                                </>
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

      {/* --- Create Album Modal --- */}
      {showCreateAlbumModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">إنشاء ألبوم</h3>
                <button onClick={() => setShowCreateAlbumModal(false)} className="text-gray-500 hover:text-gray-700 bg-gray-200 rounded-full p-1"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">اسم الألبوم</label>
                   <input type="text" placeholder="أدخل اسم الألبوم..." className="w-full border p-2 rounded-md focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} />
                </div>
                <div>
                    <input type="file" multiple accept="image/*" className="hidden" ref={albumInputRef} onChange={handleAlbumFilesSelect} />
                    <div onClick={() => albumInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition">
                         <Upload className="w-10 h-10 text-gray-400 mb-2" />
                         <span className="text-sm font-medium text-gray-600">اضغط لإضافة صور من جهازك</span>
                         <span className="text-xs text-gray-400 mt-1">يمكنك اختيار صور متعددة</span>
                    </div>
                </div>
                {newAlbumFiles.length > 0 && (
                   <div className="grid grid-cols-4 gap-2 mt-4">
                      {newAlbumFiles.map((url, i) => (
                         <div key={i} className="aspect-square relative rounded-md overflow-hidden group">
                            <img src={url} className="w-full h-full object-cover" alt="preview" />
                            <button onClick={() => setNewAlbumFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition"><X className="w-3 h-3" /></button>
                         </div>
                      ))}
                   </div>
                )}
             </div>
             <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                <button onClick={() => setShowCreateAlbumModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-md">إلغاء</button>
                <button onClick={handleCreateAlbum} disabled={!newAlbumTitle.trim()} className="px-6 py-2 bg-fb-blue text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition">
                   {newAlbumFiles.length > 0 ? `إنشاء ورفع ${newAlbumFiles.length} صورة` : 'إنشاء ألبوم فارغ'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotos;
