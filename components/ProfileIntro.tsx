

import React, { useState, useRef } from 'react';
import { Globe, Heart, Search, X, Check, Coffee, Music, Camera, Book, Gamepad2, Plane, Code, Dumbbell, Palette, PenTool, Tv, Headphones, Utensils, Laptop, Car, Bike, Leaf, Sun, Moon, Star, Anchor, Gift, Smile, Mic, Video, Briefcase, Upload, Plus, PenLine, Quote, Droplet } from 'lucide-react';
import { User, Photo } from '../types';

interface ProfileIntroProps {
  currentUser: User;
  isOwnProfile: boolean;
  photos: Photo[];
  onTabChange: (tab: any) => void;
}

// Hobbies Data with Emojis
const HOBBIES_LIST = [
  { id: 'football', name: 'كرة القدم', emoji: '⚽' },
  { id: 'reading', name: 'القراءة', emoji: '📚' },
  { id: 'travel', name: 'السفر', emoji: '✈️' },
  { id: 'gaming', name: 'ألعاب الفيديو', emoji: '🎮' },
  { id: 'music', name: 'الموسيقى', emoji: '🎵' },
  { id: 'cooking', name: 'الطبخ', emoji: '🍳' },
  { id: 'photography', name: 'التصوير', emoji: '📸' },
  { id: 'coding', name: 'البرمجة', emoji: '💻' },
  { id: 'drawing', name: 'الرسم', emoji: '🎨' },
  { id: 'gym', name: 'الجيم', emoji: '💪' },
  { id: 'swimming', name: 'السباحة', emoji: '🏊' },
  { id: 'movies', name: 'مشاهدة الأفلام', emoji: '🎬' },
  { id: 'writing', name: 'الكتابة', emoji: '✍️' },
  { id: 'shopping', name: 'التسوق', emoji: '🛍️' },
  { id: 'camping', name: 'التخييم', emoji: '⛺' },
  { id: 'fishing', name: 'صيد السمك', emoji: '🎣' },
  { id: 'chess', name: 'الشطرنج', emoji: '♟️' },
  { id: 'cars', name: 'السيارات', emoji: '🚗' },
  { id: 'cycling', name: 'ركوب الدراجات', emoji: '🚴' },
  { id: 'meditation', name: 'التأمل', emoji: '🧘' },
  { id: 'gardening', name: 'الزراعة', emoji: '🌱' },
  { id: 'pets', name: 'تربية الحيوانات', emoji: '🐾' },
  { id: 'design', name: 'التصميم', emoji: '🖌️' },
  { id: 'coffee', name: 'عشاق القهوة', emoji: '☕' },
  { id: 'history', name: 'التاريخ', emoji: '📜' },
  { id: 'science', name: 'العلوم', emoji: '🔬' },
  { id: 'tech', name: 'التقنية', emoji: '📱' },
  { id: 'running', name: 'الجري', emoji: '🏃' },
  { id: 'yoga', name: 'اليوغا', emoji: '🤸' },
  { id: 'dancing', name: 'الرقص', emoji: '💃' },
  { id: 'singing', name: 'الغناء', emoji: '🎤' },
  { id: 'volunteering', name: 'العمل التطوعي', emoji: '🤝' },
  { id: 'fashion', name: 'الموضة', emoji: '👗' },
  { id: 'makeup', name: 'المكياج', emoji: '💄' },
  { id: 'anime', name: 'الأنمي', emoji: '👺' },
  { id: 'billiards', name: 'البلياردو', emoji: '🎱' },
  { id: 'tennis', name: 'التنس', emoji: '🎾' },
  { id: 'basketball', name: 'كرة السلة', emoji: '🏀' }
];

const ProfileIntro: React.FC<ProfileIntroProps> = ({ currentUser, isOwnProfile, photos, onTabChange }) => {
  // Bio State
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  // Hobbies State
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [isHobbiesModalOpen, setIsHobbiesModalOpen] = useState(false);
  const [searchHobby, setSearchHobby] = useState('');
  const [selectedHobbiesTemp, setSelectedHobbiesTemp] = useState<string[]>([]);

  // Featured Photos State
  const [featuredPhotos, setFeaturedPhotos] = useState<string[]>([]);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [tempFeaturedPhotos, setTempFeaturedPhotos] = useState<string[]>([]);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  // --- Helper ---
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Bio Handlers ---
  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
  };

  // --- Hobbies Handlers ---
  const openHobbiesModal = () => {
    setSelectedHobbiesTemp(hobbies);
    setSearchHobby('');
    setIsHobbiesModalOpen(true);
  };

  const toggleHobbySelection = (hobbyId: string) => {
    if (selectedHobbiesTemp.includes(hobbyId)) {
      setSelectedHobbiesTemp(prev => prev.filter(id => id !== hobbyId));
    } else {
      setSelectedHobbiesTemp(prev => [...prev, hobbyId]);
    }
  };

  const handleSaveHobbies = () => {
    setHobbies(selectedHobbiesTemp);
    setIsHobbiesModalOpen(false);
  };

  // --- Featured Photos Handlers ---
  const openFeaturedModal = () => {
      setTempFeaturedPhotos(featuredPhotos);
      setIsFeaturedModalOpen(true);
  };

  const handleFeaturedFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const promises = Array.from(e.target.files).map((file: File) => readFileAsBase64(file));
          const results = await Promise.all(promises);
          setTempFeaturedPhotos(prev => [...prev, ...results]);
      }
      if (featuredInputRef.current) {
          featuredInputRef.current.value = '';
      }
  };

  const removeTempFeaturedPhoto = (index: number) => {
      setTempFeaturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveFeatured = () => {
      setFeaturedPhotos(tempFeaturedPhotos);
      setIsFeaturedModalOpen(false);
  };

  const filteredHobbies = HOBBIES_LIST.filter(h => 
    h.name.includes(searchHobby)
  );

  return (
    <>
      <div className="w-full space-y-4 h-fit sticky top-20">
        
        {/* --- Intro / Bio Section --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm animate-fadeIn">
          <h3 className="font-bold text-xl mb-3 text-gray-900">نبذة مختصرة</h3>
          
          {/* Bio Text */}
          {!isEditingBio ? (
            <div className="space-y-3">
              <div className="text-center text-[15px] mb-4 text-gray-800 leading-relaxed whitespace-pre-line">
                {bio || (isOwnProfile ? <span className="text-gray-400 italic">أضف نبذة مختصرة عن نفسك...</span> : <span className="text-gray-400 italic">لا توجد نبذة مختصرة.</span>)}
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => { setTempBio(bio); setIsEditingBio(true); }}
                  className="w-full bg-gray-100 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition text-gray-700"
                >
                  {bio ? 'تعديل النبذة المختصرة' : 'إضافة نبذة مختصرة'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea 
                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-center outline-none focus:ring-2 focus:ring-fb-blue text-sm resize-none h-24"
                placeholder="وصف قصير عن نفسك..."
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 text-sm text-gray-500 justify-end">
                 <span>{100 - tempBio.length} حرف متبقي</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-gray-200 py-2 rounded-md font-semibold text-sm hover:bg-gray-300 transition text-gray-700">إلغاء</button>
                 <button onClick={handleSaveBio} className="flex-1 bg-fb-blue text-white py-2 rounded-md font-semibold text-sm hover:bg-blue-700 transition">حفظ</button>
              </div>
            </div>
          )}

          {/* Hobbies Display */}
          <div className="mt-6">
             {hobbies.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {hobbies.map(hobbyId => {
                    const h = HOBBIES_LIST.find(item => item.id === hobbyId);
                    if (!h) return null;
                    return (
                      <div key={hobbyId} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-gray-50 cursor-default">
                         <span>{h.emoji}</span>
                         <span className="font-medium text-gray-700">{h.name}</span>
                      </div>
                    );
                  })}
               </div>
             )}

             {isOwnProfile && (
                <button 
                  onClick={openHobbiesModal}
                  className="w-full bg-gray-100 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition text-gray-700 mt-2"
                >
                   {hobbies.length > 0 ? 'تعديل الهوايات' : 'إضافة هوايات'}
                </button>
             )}
          </div>

          {/* Featured Photos Display */}
          <div className="mt-6">
              {featuredPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                      {featuredPhotos.map((photo, idx) => (
                          <div key={idx} className="aspect-video rounded-lg overflow-hidden">
                              <img src={photo} alt={`Featured ${idx}`} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
              )}

              {isOwnProfile && (
                 <button 
                   onClick={openFeaturedModal}
                   className="w-full bg-gray-100 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition text-gray-700 mt-2"
                 >
                    {featuredPhotos.length > 0 ? 'تعديل العناصر المميزة' : 'إضافة صور مميزة'}
                 </button>
              )}
          </div>
        </div>

        {/* --- Photos Preview Section --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm animate-fadeIn delay-75">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xl text-gray-900">الصور</h3>
            <span className="text-fb-blue text-[15px] cursor-pointer hover:underline font-medium" onClick={() => onTabChange('photos')}>عرض الكل للصور</span>
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {photos.slice(0, 9).map(p => (
                <img key={p.id} src={p.url} className="w-full h-full object-cover aspect-square cursor-pointer hover:opacity-90 transition" alt="photo" onClick={() => onTabChange('photos')} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6 text-sm">لا توجد صور بعد.</div>
          )}
        </div>

        {/* --- Friends Preview Section --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm animate-fadeIn delay-100">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-xl text-gray-900">الأصدقاء</h3>
            <span className="text-fb-blue text-[15px] cursor-pointer hover:underline font-medium" onClick={() => onTabChange('friends')}>عرض كل الأصدقاء</span>
          </div>
          <div className="text-gray-500 text-[15px] mb-3">1204 صديق</div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="cursor-pointer group">
                <img src={`https://picsum.photos/300/300?random=${i + 400}`} className="w-full aspect-square object-cover rounded-lg mb-1 group-hover:opacity-90 transition" alt="friend" />
                <span className="text-xs font-semibold leading-tight block group-hover:underline text-gray-800">صديق {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Hobbies Modal --- */}
      {isHobbiesModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white relative">
               <h3 className="font-bold text-xl text-center flex-1">إضافة هوايات</h3>
               <button 
                 onClick={() => setIsHobbiesModalOpen(false)}
                 className="absolute left-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"
               >
                 <X className="w-5 h-5 text-gray-600" />
               </button>
            </div>

            {/* Search */}
            <div className="p-4 bg-white">
                <div className="relative">
                   <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text"
                     placeholder="ما هي هواياتك؟"
                     className="w-full bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 outline-none focus:ring-2 focus:ring-fb-blue/50 transition"
                     value={searchHobby}
                     onChange={(e) => setSearchHobby(e.target.value)}
                   />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
               <h4 className="text-sm font-bold text-gray-500 mb-3">هوايات مقترحة</h4>
               <div className="flex flex-wrap gap-2">
                  {filteredHobbies.map(hobby => {
                    const isSelected = selectedHobbiesTemp.includes(hobby.id);
                    return (
                      <button
                        key={hobby.id}
                        onClick={() => toggleHobbySelection(hobby.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition text-sm font-medium ${
                          isSelected 
                            ? 'border-fb-blue bg-blue-50 text-fb-blue' 
                            : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                         <span>{hobby.emoji}</span>
                         <span>{hobby.name}</span>
                         {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    )
                  })}
                  {filteredHobbies.length === 0 && (
                     <div className="w-full text-center py-10 text-gray-400">
                        لا توجد نتائج بحث مطابقة.
                     </div>
                  )}
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
               <button 
                  onClick={() => setIsHobbiesModalOpen(false)} 
                  className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-md transition"
               >
                 إلغاء
               </button>
               <button 
                  onClick={handleSaveHobbies}
                  className="px-6 py-2 bg-fb-blue text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-sm"
               >
                 حفظ الهوايات
               </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Featured Photos Modal --- */}
      {isFeaturedModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">
                  
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white relative">
                      <h3 className="font-bold text-xl text-center flex-1">تعديل العناصر المميزة</h3>
                      <button 
                          onClick={() => setIsFeaturedModalOpen(false)}
                          className="absolute left-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"
                      >
                          <X className="w-5 h-5 text-gray-600" />
                      </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 bg-white">
                      <p className="text-sm text-gray-500 text-center mb-6">
                          اختر صوراً تعبر عن شخصيتك لتظهر في مقدمة ملفك الشخصي.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-3">
                          {tempFeaturedPhotos.map((photo, index) => (
                              <div key={index} className="aspect-[3/4] relative rounded-lg overflow-hidden border border-gray-200 group">
                                  <img src={photo} alt="Featured" className="w-full h-full object-cover" />
                                  <button 
                                      onClick={() => removeTempFeaturedPhoto(index)}
                                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition"
                                  >
                                      <X className="w-4 h-4 text-gray-700 hover:text-red-600" />
                                  </button>
                              </div>
                          ))}

                          {/* Add Button */}
                          <div 
                              onClick={() => featuredInputRef.current?.click()}
                              className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-fb-blue transition group"
                          >
                              <input 
                                  type="file" 
                                  multiple 
                                  accept="image/*" 
                                  className="hidden" 
                                  ref={featuredInputRef} 
                                  onChange={handleFeaturedFilesSelect}
                              />
                              <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white transition mb-2">
                                  <Plus className="w-6 h-6 text-fb-blue" />
                              </div>
                              <span className="text-sm font-semibold text-fb-blue">إضافة المزيد</span>
                          </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                      <button 
                          onClick={() => setIsFeaturedModalOpen(false)} 
                          className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-md transition"
                      >
                          إلغاء
                      </button>
                      <button 
                          onClick={handleSaveFeatured}
                          className="px-6 py-2 bg-fb-blue text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-sm"
                      >
                          حفظ
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ProfileIntro;
