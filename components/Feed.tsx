
import React, { useState, useEffect, useRef } from 'react';
import { Post, User, Story } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Plus, X, Pause, Play, Heart, Send, Smile } from 'lucide-react';

interface FeedProps {
  currentUser: User;
  stories: Story[];
  posts: Post[];
  onAddStory: (mediaUrl: string) => void;
  onPostCreate: (content: string, image?: string) => void;
  onTogglePin?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

// Interface for Floating Emoji Animation
interface FloatingEmoji {
    id: number;
    char: string;
    left: number; // Random horizontal position percentage
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const Feed: React.FC<FeedProps> = ({ currentUser, stories, posts, onAddStory, onPostCreate, onTogglePin, onDeletePost }) => {
  
  // Story Viewer State
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStoryLiked, setIsStoryLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Floating Emojis State
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  
  const storyInputRef = useRef<HTMLInputElement>(null);

  // --- Story Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) {
                  onAddStory(reader.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // reset
  };

  // Story Viewer Timer
  useEffect(() => {
      let interval: any;
      if (viewingStoryIndex !== null && !isPaused) {
          interval = setInterval(() => {
              setStoryProgress(prev => {
                  if (prev >= 100) {
                      // Move to next story
                      if (viewingStoryIndex < stories.length - 1) {
                          setViewingStoryIndex(viewingStoryIndex + 1);
                          return 0; // Reset progress for next story
                      } else {
                          // End of stories
                          setViewingStoryIndex(null);
                          return 0;
                      }
                  }
                  return prev + 1; // Speed of story
              });
          }, 50); // smoother update
      }
      return () => clearInterval(interval);
  }, [viewingStoryIndex, isPaused, stories.length]);

  // Reset progress when story index changes
  useEffect(() => {
      setStoryProgress(0);
      setIsStoryLiked(false);
      setCommentText('');
      setFloatingEmojis([]);
  }, [viewingStoryIndex]);


  const openStory = (index: number) => {
      setViewingStoryIndex(index);
      setStoryProgress(0);
      setIsPaused(false);
  };

  const closeStory = () => {
      setViewingStoryIndex(null);
      setStoryProgress(0);
      setFloatingEmojis([]);
  };

  const navigateStory = (direction: 'next' | 'prev') => {
      if (viewingStoryIndex === null) return;
      if (direction === 'next') {
          if (viewingStoryIndex < stories.length - 1) {
              setViewingStoryIndex(viewingStoryIndex + 1);
          } else {
              closeStory();
          }
      } else {
          if (viewingStoryIndex > 0) {
              setViewingStoryIndex(viewingStoryIndex - 1);
          }
      }
  };

  // --- Emoji Animation Logic ---
  const triggerEmoji = (char: string) => {
      const newEmoji: FloatingEmoji = {
          id: Date.now(),
          char,
          left: Math.random() * 60 + 20 // Random position between 20% and 80% width
      };
      setFloatingEmojis(prev => [...prev, newEmoji]);
      
      // Auto-remove emoji after animation duration (2s)
      setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
      }, 2000);
      
      // If heart, also toggle like state
      if (char === "❤️" && !isStoryLiked) {
          setIsStoryLiked(true);
      }
  };

  return (
    <div className="flex-1 max-w-[590px] mx-auto py-6 px-0 md:px-4 min-h-screen">
      <style>{`
        @keyframes floatUp {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
            100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }
        .animate-float {
            animation: floatUp 2s ease-out forwards;
        }
      `}</style>

      {/* Hidden Input for Add Story */}
      <input type="file" ref={storyInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Story Reel */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 px-4 md:px-0">
         {/* Add Story Card */}
         <div 
            onClick={() => storyInputRef.current?.click()}
            className="relative h-48 w-28 md:w-32 rounded-xl overflow-hidden cursor-pointer shadow-sm flex-shrink-0 group bg-gray-100"
         >
             <img src={currentUser.avatar} className="h-2/3 w-full object-cover transition duration-300 group-hover:scale-105 opacity-80" alt="My Story" />
             <div className="h-1/3 bg-white relative"></div>
             <div className="absolute bottom-0 w-full h-1/3 bg-white flex flex-col items-center justify-end pb-2">
                 <div className="absolute -top-4 bg-fb-blue rounded-full p-1 border-4 border-white">
                     <Plus className="h-4 w-4 text-white" />
                 </div>
                 <span className="text-xs font-semibold">إنشاء قصة</span>
             </div>
         </div>
         
         {/* Stories List */}
         {stories.map((story, index) => (
             <div 
                key={story.id} 
                onClick={() => openStory(index)}
                className="relative h-48 w-28 md:w-32 rounded-xl overflow-hidden cursor-pointer shadow-sm flex-shrink-0 group"
             >
                <img src={story.mediaUrl} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" alt="Story" />
                <div className="absolute top-2 right-2 bg-fb-blue rounded-full border-4 border-transparent p-0.5">
                    <img src={story.userAvatar} className="h-8 w-8 rounded-full border-2 border-white" alt="Avatar"/>
                </div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
                <div className="absolute bottom-2 right-2 text-white font-semibold text-sm drop-shadow-md truncate w-11/12">
                    {story.userName}
                </div>
             </div>
         ))}
      </div>

      <CreatePost currentUser={currentUser} onPostCreate={onPostCreate} />
      
      {posts.map(post => (
        <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser} 
            onTogglePin={onTogglePin}
            onDelete={onDeletePost}
        />
      ))}
      
      <div className="flex justify-center py-4">
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce mx-1"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce mx-1 delay-75"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce mx-1 delay-150"></div>
      </div>


      {/* --- Fullscreen Story Viewer --- */}
      {viewingStoryIndex !== null && (
          <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-fadeIn">
              
              {/* Floating Emojis Container */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {floatingEmojis.map(emoji => (
                      <div 
                        key={emoji.id}
                        className="absolute bottom-24 text-4xl animate-float"
                        style={{ left: `${emoji.left}%` }}
                      >
                          {emoji.char}
                      </div>
                  ))}
              </div>

              {/* Top Controls */}
              <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent z-20">
                  {/* Progress Bar */}
                  <div className="flex gap-1 mb-3">
                      {stories.map((_, idx) => (
                          <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx === viewingStoryIndex ? '' : idx < viewingStoryIndex ? 'w-full' : 'w-0'}`}
                                style={{ width: idx === viewingStoryIndex ? `${storyProgress}%` : undefined }}
                              ></div>
                          </div>
                      ))}
                  </div>

                  {/* Header Info */}
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <img src={stories[viewingStoryIndex].userAvatar} className="w-10 h-10 rounded-full border border-white/50" alt="avatar" />
                          <div className="flex flex-col">
                               <span className="font-bold text-sm">{stories[viewingStoryIndex].userName}</span>
                               <span className="text-xs text-white/80">{stories[viewingStoryIndex].timestamp}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          {/* New: Add Story Button inside Viewer */}
                          <button 
                             onClick={() => storyInputRef.current?.click()}
                             className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                             title="إضافة قصة جديدة"
                          >
                             <Plus className="w-6 h-6 text-white" />
                          </button>

                          <button onClick={() => setIsPaused(!isPaused)}>
                              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                          </button>
                          <button onClick={closeStory}>
                              <X className="w-8 h-8" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Main Content (Image) */}
              <div className="flex-1 flex items-center justify-center relative bg-gray-900 overflow-hidden">
                  <img 
                      src={stories[viewingStoryIndex].mediaUrl} 
                      alt="Story" 
                      className="w-full h-full object-contain"
                  />

                  {/* Navigation Zones (Hidden for clean UI) */}
                  <div className="absolute inset-0 flex">
                      <div className="w-1/4 h-full cursor-pointer z-10" onClick={() => navigateStory('prev')}></div>
                      <div className="w-2/4 h-full cursor-pointer z-10" onClick={() => setIsPaused(!isPaused)}></div>
                      <div className="w-1/4 h-full cursor-pointer z-10" onClick={() => navigateStory('next')}></div>
                  </div>
              </div>

              {/* Footer Interaction Area */}
              <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-4 px-4 z-40 flex flex-col gap-3">
                  
                  {/* Reaction Bar */}
                  <div className="flex justify-center gap-4 mb-1">
                      {REACTION_EMOJIS.map(emoji => (
                          <button 
                            key={emoji} 
                            onClick={() => triggerEmoji(emoji)}
                            className="text-2xl hover:scale-125 transition active:scale-95 cursor-pointer bg-white/10 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20"
                          >
                              {emoji}
                          </button>
                      ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                          <input 
                            type="text" 
                            placeholder="رد على القصة..." 
                            className="w-full bg-black/40 border border-white/30 rounded-full px-4 py-3 text-white placeholder-white/60 focus:border-white focus:bg-black/60 outline-none pr-10" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onFocus={() => setIsPaused(true)}
                            onBlur={() => !commentText && setIsPaused(false)}
                          />
                          <Smile className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 cursor-pointer hover:text-white" />
                      </div>
                      
                      {commentText ? (
                          <button 
                            onClick={() => {
                                setCommentText('');
                                setIsPaused(false);
                            }} 
                            className="text-fb-blue p-2 hover:bg-white/10 rounded-full transition"
                          >
                              <Send className="w-6 h-6 rotate-180" />
                          </button>
                      ) : (
                          <button 
                            onClick={() => {
                                setIsStoryLiked(!isStoryLiked);
                                if (!isStoryLiked) triggerEmoji("❤️");
                            }}
                            className={`p-2 rounded-full transition ${isStoryLiked ? 'text-red-500' : 'text-white hover:bg-white/10'}`}
                          >
                              <Heart className={`w-7 h-7 ${isStoryLiked ? 'fill-current' : ''}`} />
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Feed;
