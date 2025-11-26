
import React, { useState, useRef, useEffect } from 'react';
import { Video, Image, Smile, Sparkles, X, Camera, Activity, MapPin, Tag, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { generatePostContent } from '../services/geminiService';

interface CreatePostProps {
  currentUser: User;
  onPostCreate: (content: string, image?: string) => void;
}

// Activity/Feeling Data - Expanded List
const FEELINGS_LIST = [
    { label: 'سعيد', emoji: '😃' },
    { label: 'محبوب', emoji: '🥰' },
    { label: 'حزين', emoji: '😢' },
    { label: 'متحمس', emoji: '🤩' },
    { label: 'محبط', emoji: '😞' },
    { label: 'شاكر', emoji: '🙏' },
    { label: 'غاضب', emoji: '😡' },
    { label: 'رائع', emoji: '😎' },
    { label: 'متعب', emoji: '😫' },
    { label: 'مفكر', emoji: '🤔' },
    { label: 'مبارك', emoji: '😇' },
    { label: 'حائر', emoji: '😕' },
    { label: 'قوي', emoji: '💪' },
    { label: 'نعسان', emoji: '😴' },
    { label: 'مريض', emoji: '🤒' },
    { label: 'مصدوم', emoji: '😱' },
    { label: 'خجول', emoji: '😊' },
    { label: 'مسترخٍ', emoji: '😌' },
    { label: 'فخور', emoji: '🦁' },
    { label: 'وحيد', emoji: '😔' },
    { label: 'ممتن', emoji: '🤲' },
    { label: 'متحفز', emoji: '🔥' },
    { label: 'جائع', emoji: '😋' },
    { label: 'عطشان', emoji: '🥤' },
    { label: 'بردان', emoji: '🥶' },
    { label: 'حران', emoji: '🥵' },
    { label: 'مبدع', emoji: '🎨' },
    { label: 'مشاغب', emoji: '😜' },
    { label: 'رومانسي', emoji: '🌹' },
    { label: 'قلق', emoji: '😰' }
];

const ACTIVITIES_LIST = [
    { label: 'يحتفل', emoji: '🎉' },
    { label: 'يشاهد', emoji: '📺' },
    { label: 'يأكل', emoji: '🍔' },
    { label: 'يشرب', emoji: '☕' },
    { label: 'يسافر إلى', emoji: '✈️' },
    { label: 'يستمع إلى', emoji: '🎧' },
    { label: 'يقرأ', emoji: '📖' },
    { label: 'يلعب', emoji: '🎮' },
    { label: 'يفكر في', emoji: '💭' },
    { label: 'يدعم', emoji: '🤝' },
    { label: 'يبحث عن', emoji: '🔍' },
    { label: 'يتعلم', emoji: '🧠' },
    { label: 'يعمل', emoji: '💼' },
    { label: 'يتمرن', emoji: '🏋️‍♂️' },
    { label: 'يطبخ', emoji: '🍳' },
    { label: 'يتسوق', emoji: '🛍️' },
    { label: 'يقود', emoji: '🚗' },
    { label: 'يغني', emoji: '🎤' },
    { label: 'يرسم', emoji: '🖌️' },
    { label: 'يبرمج', emoji: '💻' },
    { label: 'يصلي', emoji: '🕌' }
];

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreate }) => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  // Feeling/Activity State
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<{label: string, emoji: string} | null>(null);
  const [activityType, setActivityType] = useState<'feeling' | 'activity'>('feeling');

  // Live Video State
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AI Handler ---
  const handleMagicPost = async () => {
    setIsGenerating(true);
    let prompt = content;
    if (!prompt.trim()) {
        const topics = ["يوم جميل", "حكمة اليوم", "تكنولوجيا", "قهوة الصباح", "النجاح", "الأمل"];
        prompt = topics[Math.floor(Math.random() * topics.length)];
    }
    const aiContent = await generatePostContent(prompt);
    setContent(aiContent);
    setIsGenerating(false);
  };

  // --- Image/Video Handler ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        // Basic MIME type check from Base64 header
        if (result.startsWith('data:video/')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  // --- Live Video Handlers ---
  const startCamera = async () => {
      setCameraError(null);
      try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              throw new Error("API_NOT_SUPPORTED");
          }

          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setCameraStream(stream);
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err: any) {
          console.error("Error accessing camera:", err);
          let msg = "حدث خطأ أثناء تشغيل الكاميرا.";
          
          const errorMessage = err.message || "";
          const errorName = err.name || "";

          if (errorMessage === "API_NOT_SUPPORTED") {
              msg = "المتصفح لا يدعم تشغيل الكاميرا.";
          } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError' || errorMessage.includes("Requested device not found")) {
              msg = "لم يتم العثور على كاميرا متصلة بالجهاز. يرجى التأكد من توصيل الكاميرا.";
          } else if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
              msg = "تم رفض إذن الوصول للكاميرا. يرجى تفعيله من إعدادات المتصفح.";
          } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
              msg = "الكاميرا قيد الاستخدام من قبل تطبيق آخر.";
          }
          
          setCameraError(msg);
      }
  };

  const stopCamera = () => {
      if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
      }
  };

  useEffect(() => {
      if (showLiveModal) {
          startCamera();
      } else {
          stopCamera();
      }
      return () => stopCamera();
  }, [showLiveModal]);

  const handleGoLive = () => {
      if (cameraStream) {
          onPostCreate(`🎥 **بث مباشر:** ${currentUser.name} بدأ بثاً مباشراً الآن!`, undefined);
          setShowLiveModal(false);
      } else {
          alert("لا يمكن بدء البث بدون كاميرا.");
      }
  };

  // --- Submit Handler ---
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    let finalContent = content;
    
    if (selectedFeeling) {
         const activityString = activityType === 'feeling' ? `يشعر بـ ${selectedFeeling.label} ${selectedFeeling.emoji}` : `${selectedFeeling.label} ${selectedFeeling.emoji}`;
         finalContent = `${activityString}\n${content}`;
    }

    if (finalContent.trim() || selectedImage) {
      onPostCreate(finalContent, selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
      setMediaType(null);
      setSelectedFeeling(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 relative z-10">
      
      {/* Header: Avatar & Status */}
      <div className="flex gap-3 mb-3">
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name} 
          className="h-10 w-10 rounded-full cursor-pointer hover:opacity-90"
        />
        <div className="flex-1">
            {selectedFeeling && (
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1 animate-fadeIn">
                    <span className="font-semibold text-black">{currentUser.name}</span>
                    <span>{activityType === 'feeling' ? 'يشعر بـ' : ''}</span>
                    <span className="font-bold text-fb-blue">{selectedFeeling.label} {selectedFeeling.emoji}</span>
                    <button onClick={() => setSelectedFeeling(null)} className="hover:bg-gray-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
            )}
            <div className="bg-gray-100 rounded-xl px-4 py-2 hover:bg-gray-200 transition-colors">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-transparent w-full outline-none placeholder-gray-500 text-base resize-none overflow-hidden min-h-[40px]"
                    placeholder={`بم تفكر يا ${currentUser.name.split(' ')[0]}؟`}
                    rows={content.split('\n').length > 1 ? Math.min(content.split('\n').length, 5) : 1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // Prevent new line on enter
                            handleSubmit();
                        }
                    }}
                />
            </div>
        </div>
      </div>
      
      {/* Image/Video Preview */}
      {selectedImage && (
        <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 animate-fadeIn">
           {mediaType === 'video' ? (
               <video src={selectedImage} controls className="max-h-80 w-full object-contain" />
           ) : (
               <img src={selectedImage} alt="Selected" className="max-h-80 w-full object-contain" />
           )}
           <button 
             onClick={() => setSelectedImage(null)}
             className="absolute top-2 left-2 bg-white/80 p-1.5 rounded-full hover:bg-white shadow-sm z-10"
           >
             <X className="h-5 w-5 text-gray-700" />
           </button>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 flex items-center justify-between flex-wrap gap-y-2">
        <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          
          {/* Live Video Button */}
          <button 
            onClick={() => setShowLiveModal(true)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Video className="h-6 w-6 text-red-500" />
            <span className="text-gray-500 font-medium text-sm md:text-base hidden sm:inline">فيديو مباشر</span>
          </button>
          
          {/* Photo/Video Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Image className="h-6 w-6 text-green-500" />
            <span className="text-gray-500 font-medium text-sm md:text-base hidden sm:inline">صورة/فيديو</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleImageChange}
            />
          </button>

          {/* Feeling/Activity Button */}
          <button 
            onClick={() => setShowFeelingModal(true)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Smile className="h-6 w-6 text-yellow-500" />
            <span className="text-gray-500 font-medium text-sm md:text-base hidden sm:inline">شعور/نشاط</span>
          </button>

          {/* AI Button */}
           <button 
            onClick={handleMagicPost}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${isGenerating ? 'bg-purple-100' : 'hover:bg-purple-50'}`}
          >
            <Sparkles className={`h-6 w-6 text-purple-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-purple-600 font-medium text-sm md:text-base hidden sm:inline">
                {isGenerating ? 'جاري التفكير...' : 'ذكاء اصطناعي'}
            </span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      {(content || selectedImage || selectedFeeling) && (
          <div className="mt-3 flex justify-end animate-fadeIn">
               <button 
                 onClick={() => handleSubmit()}
                 className="bg-fb-blue text-white px-8 py-1.5 rounded-md font-semibold hover:bg-blue-700 transition shadow-sm"
               >
                   نشر
               </button>
          </div>
      )}

      {/* --- Live Video Modal --- */}
      {showLiveModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-white">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cameraStream ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          بث مباشر
                      </h3>
                      <button onClick={() => setShowLiveModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                      {cameraError ? (
                          <div className="text-white text-center p-6 flex flex-col items-center">
                              <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                              <p className="text-lg font-semibold mb-2 text-red-400">تعذر الوصول للكاميرا</p>
                              <p className="text-sm text-gray-300 max-w-xs">{cameraError}</p>
                              <button onClick={startCamera} className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition">
                                  إعادة المحاولة
                              </button>
                          </div>
                      ) : cameraStream ? (
                          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                      ) : (
                          <div className="text-white text-center flex flex-col items-center animate-pulse">
                              <Camera className="w-12 h-12 mb-2 opacity-50" />
                              <p>جاري تشغيل الكاميرا...</p>
                          </div>
                      )}
                      
                      {/* Controls Overlay */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                          <button className="bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/30 disabled:opacity-50" disabled={!!cameraError}><SettingsIcon /></button>
                          <button 
                            onClick={handleGoLive} 
                            disabled={!cameraStream}
                            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 disabled:bg-gray-600"
                          >
                              بدء البث المباشر
                          </button>
                          <button className="bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/30 disabled:opacity-50" disabled={!!cameraError}><MicIcon /></button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- Feeling/Activity Modal --- */}
      {showFeelingModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden h-[500px] flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-lg">بم تشعر؟</h3>
                      <button onClick={() => setShowFeelingModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="flex border-b">
                      <button 
                        onClick={() => setActivityType('feeling')}
                        className={`flex-1 py-3 font-semibold text-sm ${activityType === 'feeling' ? 'text-fb-blue border-b-2 border-fb-blue' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          مشاعر
                      </button>
                      <button 
                        onClick={() => setActivityType('activity')}
                        className={`flex-1 py-3 font-semibold text-sm ${activityType === 'activity' ? 'text-fb-blue border-b-2 border-fb-blue' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          أنشطة
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                      <div className="grid grid-cols-2 gap-2">
                          {(activityType === 'feeling' ? FEELINGS_LIST : ACTIVITIES_LIST).map((item, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => { setSelectedFeeling(item); setShowFeelingModal(false); }}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                              >
                                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                      {item.emoji}
                                  </div>
                                  <span className="font-medium text-gray-800">{item.label}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Simple internal icons for the Live Modal
const SettingsIcon = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MicIcon = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;

export default CreatePost;
