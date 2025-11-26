
import React from 'react';
import { Play, Clock, Eye, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

const Watch: React.FC = () => {
  // Mock Videos for the public Watch Feed
  const watchVideos = [
    { id: 'w1', title: 'جولة في الطبيعة الخلابة', views: '1.2M', time: 'منذ ساعتين', duration: '5:30', thumb: 'https://picsum.photos/800/450?random=50' },
    { id: 'w2', title: 'أفضل لحظات كرة القدم 2024', views: '500K', time: 'منذ 5 ساعات', duration: '10:15', thumb: 'https://picsum.photos/800/450?random=51' },
    { id: 'w3', title: 'طريقة تحضير القهوة المختصة', views: '200K', time: 'منذ يوم', duration: '3:45', thumb: 'https://picsum.photos/800/450?random=52' },
    { id: 'w4', title: 'مراجعة أحدث الهواتف الذكية', views: '800K', time: 'منذ يومين', duration: '12:20', thumb: 'https://picsum.photos/800/450?random=53' },
  ];

  return (
    <div className="max-w-[700px] mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Watch</h2>
      
      <div className="space-y-6">
        {watchVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <img src={`https://picsum.photos/40/40?random=${video.id}`} className="w-10 h-10 rounded-full" alt="channel" />
                  <div>
                     <h4 className="font-bold text-sm text-gray-900">صانع محتوى {video.id}</h4>
                     <span className="text-xs text-gray-500">{video.time}</span>
                  </div>
               </div>
               <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            {/* Video Thumbnail (Mock Player) */}
            <div className="relative aspect-video bg-black group cursor-pointer">
                <img src={video.thumb} className="w-full h-full object-cover opacity-90" alt={video.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 p-4 rounded-full group-hover:scale-110 transition">
                        <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                    {video.duration}
                </div>
            </div>

            {/* Content Info */}
            <div className="p-3">
                <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views}</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 font-medium text-sm">
                        <ThumbsUp className="w-5 h-5" /> أعجبني
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 font-medium text-sm">
                        <MessageCircle className="w-5 h-5" /> تعليق
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 font-medium text-sm">
                        <Share2 className="w-5 h-5" /> مشاركة
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watch;
