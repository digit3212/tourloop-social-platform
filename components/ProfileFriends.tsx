
import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, UserMinus, Ban, Flag, Globe, Users, Lock, Check, Info, X, AlertTriangle } from 'lucide-react';
import { User } from '../types';

// Types
interface Friend {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  subtitle?: string; // e.g. "Work", "University"
}

type PrivacyLevel = 'public' | 'friends' | 'only_me';
type ActionType = 'unfriend' | 'block' | null;

interface ProfileFriendsProps {
    onFriendClick?: (user: User) => void;
}

// Mock Data
const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'محمد أحمد', avatar: 'https://picsum.photos/200/200?random=101', mutualFriends: 12, subtitle: 'زميل عمل' },
  { id: '2', name: 'سارة علي', avatar: 'https://picsum.photos/200/200?random=102', mutualFriends: 45 },
  { id: '3', name: 'يوسف محمود', avatar: 'https://picsum.photos/200/200?random=103', mutualFriends: 3 },
  { id: '4', name: 'منى زكي', avatar: 'https://picsum.photos/200/200?random=104', mutualFriends: 89, subtitle: 'جامعة القاهرة' },
  { id: '5', name: 'كريم عبد العزيز', avatar: 'https://picsum.photos/200/200?random=105', mutualFriends: 150 },
  { id: '6', name: 'أحمد حلمي', avatar: 'https://picsum.photos/200/200?random=106', mutualFriends: 230 },
  { id: '7', name: 'نور الشريف', avatar: 'https://picsum.photos/200/200?random=107', mutualFriends: 5 },
  { id: '8', name: 'عمر الشريف', avatar: 'https://picsum.photos/200/200?random=108', mutualFriends: 0 },
  { id: '9', name: 'ليلى علوي', avatar: 'https://picsum.photos/200/200?random=109', mutualFriends: 67 },
  { id: '10', name: 'هند صبري', avatar: 'https://picsum.photos/200/200?random=110', mutualFriends: 34 },
  { id: '11', name: 'خالد النبوي', avatar: 'https://picsum.photos/200/200?random=111', mutualFriends: 12 },
  { id: '12', name: 'عمرو دياب', avatar: 'https://picsum.photos/200/200?random=112', mutualFriends: 999 },
];

const ProfileFriends: React.FC<ProfileFriendsProps> = ({ onFriendClick }) => {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ActionType; friend: Friend | null }>({
      isOpen: false,
      type: null,
      friend: null
  });

  // Filter friends based on search
  const filteredFriends = friends.filter(f => f.name.includes(searchTerm));

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPrivacyMenu(false);
      setActiveMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  const handleMenuAction = (action: 'unfriend' | 'block' | 'report', friend: Friend) => {
    // Close the menu
    setActiveMenuId(null);

    if (action === 'report') {
        // Report logic is immediate (simulated)
        showNotification(`تم استلام البلاغ عن ${friend.name}. شكراً لمساعدتنا في الحفاظ على مجتمع آمن.`, 'success');
    } else {
        // Open Modal for destructive actions
        setModalConfig({
            isOpen: true,
            type: action,
            friend: friend
        });
    }
  };

  const confirmModalAction = () => {
      const { type, friend } = modalConfig;
      if (!friend || !type) return;

      if (type === 'unfriend') {
          setFriends(prev => prev.filter(f => f.id !== friend.id));
          showNotification(`تم إلغاء الصداقة مع ${friend.name}.`);
      } else if (type === 'block') {
          setFriends(prev => prev.filter(f => f.id !== friend.id));
          showNotification(`تم حظر ${friend.name} بنجاح. لن يظهر لك مرة أخرى.`, 'info');
      }

      closeModal();
  };

  const closeModal = () => {
      setModalConfig({ isOpen: false, type: null, friend: null });
  };

  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'friends': return <Users className="w-4 h-4" />;
      case 'only_me': return <Lock className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return 'العامة';
      case 'friends': return 'الأصدقاء';
      case 'only_me': return 'أنا فقط';
    }
  };

  const handleCardClick = (friend: Friend) => {
      if (onFriendClick) {
          // Convert Friend to User type
          const userObj: User = {
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              online: false // Mock
          };
          onFriendClick(userObj);
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] animate-fadeIn p-4 md:p-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900 mb-1">الأصدقاء</h2>
           <p className="text-gray-500 text-sm">{friends.length} صديقاً</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* Search */}
           <div className="relative flex-1 md:w-60">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border-transparent focus:border-fb-blue border rounded-full py-2 pr-10 pl-4 text-sm transition outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* Privacy Toggle */}
           <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center gap-2 text-fb-blue bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md font-medium text-sm transition"
              >
                  {getPrivacyIcon(privacyLevel)}
                  <span className="hidden md:inline">تعديل الخصوصية</span>
                  <span className="md:hidden">الخصوصية</span>
              </button>

              {showPrivacyMenu && (
                 <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                     <div className="p-3 border-b border-gray-100">
                         <h4 className="font-bold text-sm text-gray-900">من يمكنه رؤية قائمة أصدقائك؟</h4>
                     </div>
                     <div className="p-1">
                        {(['public', 'friends', 'only_me'] as PrivacyLevel[]).map((level) => (
                           <button
                             key={level}
                             onClick={() => { setPrivacyLevel(level); setShowPrivacyMenu(false); }}
                             className="w-full flex items-center justify-between p-2.5 hover:bg-gray-100 rounded-md transition text-right group"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white transition">
                                     {getPrivacyIcon(level)}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-semibold text-gray-900">{getPrivacyLabel(level)}</span>
                                 </div>
                              </div>
                              {privacyLevel === level && <Check className="w-5 h-5 text-fb-blue" />}
                           </button>
                        ))}
                     </div>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
          {filteredFriends.length > 0 ? filteredFriends.map((friend) => (
              <div 
                key={friend.id} 
                onClick={() => handleCardClick(friend)}
                // Z-index trick: Active card gets z-20 so its popup shows over other cards
                className={`border rounded-lg p-3 flex items-center gap-3 relative group transition cursor-pointer ${
                    activeMenuId === friend.id ? 'z-20 border-gray-300 shadow-md bg-gray-50' : 'z-0 border-gray-200 hover:shadow-sm'
                }`}
              >
                  <img src={friend.avatar} alt={friend.name} className="w-20 h-20 rounded-md object-cover border border-gray-100" />
                  
                  <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900 leading-tight mb-1 hover:underline">{friend.name}</h3>
                      {friend.subtitle && <p className="text-xs text-gray-500 mb-0.5">{friend.subtitle}</p>}
                      <p className="text-xs text-gray-500">{friend.mutualFriends} صديق مشترك</p>
                  </div>

                  {/* 3 Dots Menu Button */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === friend.id ? null : friend.id)}
                        className={`p-2 rounded-full transition ${activeMenuId === friend.id ? 'bg-blue-100 text-fb-blue' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                          <MoreHorizontal className="w-6 h-6" />
                      </button>

                      {/* Popup Menu */}
                      {activeMenuId === friend.id && (
                          <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn origin-top-left z-50">
                              <button 
                                onClick={() => handleMenuAction('unfriend', friend)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium border-b border-gray-50"
                              >
                                  <UserMinus className="w-5 h-5 text-red-500" />
                                  إلغاء الصداقة
                              </button>
                              <button 
                                onClick={() => handleMenuAction('block', friend)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium border-b border-gray-50"
                              >
                                  <Ban className="w-5 h-5" />
                                  حظر
                              </button>
                              <button 
                                onClick={() => handleMenuAction('report', friend)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition text-sm font-medium"
                              >
                                  <Flag className="w-5 h-5" />
                                  إبلاغ عن الملف الشخصي
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          )) : (
              <div className="col-span-1 md:col-span-2 py-10 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لا يوجد أصدقاء بهذا الاسم.</p>
              </div>
          )}
      </div>

      {/* Confirmation Modal */}
      {modalConfig.isOpen && modalConfig.friend && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={closeModal}>
              <div 
                  className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-scaleIn"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-900">
                          {modalConfig.type === 'unfriend' ? 'إلغاء الصداقة' : 'حظر المستخدم'}
                      </h3>
                      <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 text-center">
                      {modalConfig.type === 'unfriend' ? (
                          <>
                              <img src={modalConfig.friend.avatar} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white shadow-sm" />
                              <p className="text-gray-700 mb-2 font-medium">
                                  هل أنت متأكد من رغبتك في إلغاء صداقة <span className="font-bold">{modalConfig.friend.name}</span>؟
                              </p>
                              <p className="text-xs text-gray-500">
                                  لن تتمكنا من رؤية المعلومات الخاصة ببعضكما البعض.
                              </p>
                          </>
                      ) : (
                          <>
                              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Ban className="w-8 h-8 text-red-500" />
                              </div>
                              <p className="text-gray-700 mb-2 font-medium">
                                  هل أنت متأكد من حظر <span className="font-bold">{modalConfig.friend.name}</span>؟
                              </p>
                              <div className="text-xs text-gray-500 text-right bg-gray-50 p-3 rounded-md">
                                  <ul className="list-disc pr-4 space-y-1">
                                      <li>لن يتمكن من رؤية منشوراتك.</li>
                                      <li>لن يتمكن من إرسال رسائل لك.</li>
                                      <li>لن يتمكن من إضافتك كصديق.</li>
                                  </ul>
                              </div>
                          </>
                      )}
                  </div>

                  <div className="p-4 bg-gray-50 flex justify-end gap-3">
                      <button 
                          onClick={closeModal}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                          إلغاء
                      </button>
                      <button 
                          onClick={confirmModalAction}
                          className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition ${
                              modalConfig.type === 'unfriend' ? 'bg-fb-blue hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'
                          }`}
                      >
                          {modalConfig.type === 'unfriend' ? 'تأكيد' : 'حظر'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 md:right-10 z-[60] animate-bounce-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                {notification.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <Info className="w-5 h-5 text-blue-400" />}
                <span className="font-medium text-sm">{notification.message}</span>
                <button onClick={() => setNotification(null)} className="mr-2 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfileFriends;
