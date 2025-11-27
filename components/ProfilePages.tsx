import React, { useState } from 'react';
import { Flag, Search, ThumbsUp, MessageCircle } from 'lucide-react';

interface Page {
  id: string;
  name: string;
  avatar: string;
  category: string;
  likesCount: string;
  isLiked: boolean;
}

const INITIAL_PAGES: Page[] = [
  { id: '1', name: 'ناشيونال جيوغرافيك', avatar: 'https://picsum.photos/100/100?random=301', category: 'علوم وطبيعة', likesCount: '50M', isLiked: true },
  { id: '2', name: 'نادي ليفربول', avatar: 'https://picsum.photos/100/100?random=302', category: 'فريق رياضي', likesCount: '30M', isLiked: true },
  { id: '3', name: 'أخبار التقنية', avatar: 'https://picsum.photos/100/100?random=303', category: 'تكنولوجيا', likesCount: '1.2M', isLiked: true },
  { id: '4', name: 'مطبخ منال', avatar: 'https://picsum.photos/100/100?random=304', category: 'طعام وشراب', likesCount: '500K', isLiked: true },
];

const ProfilePages: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPages = pages.filter(p => p.name.includes(searchTerm));

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] animate-fadeIn p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">الصفحات</h2>
        <div className="relative flex-1 md:w-60 w-full">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             placeholder="بحث في الصفحات..." 
             className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border-transparent focus:border-fb-blue border rounded-full py-2 pr-10 pl-4 text-sm transition outline-none"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {filteredPages.length > 0 ? filteredPages.map(page => (
             <div key={page.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition">
                 <img src={page.avatar} alt={page.name} className="w-20 h-20 rounded-full border border-gray-100 object-cover" />
                 <div className="flex-1">
                     <h3 className="font-bold text-gray-900 text-[16px] hover:underline cursor-pointer">{page.name}</h3>
                     <span className="text-xs text-gray-500 block mb-1">{page.category}</span>
                     <span className="text-xs text-gray-400 block mb-3">{page.likesCount} إعجاب</span>
                     
                     <div className="flex gap-2">
                         <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition">
                             <MessageCircle className="w-4 h-4" /> مراسلة
                         </button>
                         <button className="flex-1 bg-fb-blue text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1 hover:bg-blue-700 transition">
                             <ThumbsUp className="w-4 h-4" /> أعجبني
                         </button>
                     </div>
                 </div>
             </div>
         )) : (
            <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500">
               <Flag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
               <p>لا توجد صفحات لعرضها.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ProfilePages;