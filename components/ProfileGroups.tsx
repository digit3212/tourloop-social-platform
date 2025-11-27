import React, { useState } from 'react';
import { Users, Search, MoreHorizontal } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  coverUrl: string;
  membersCount: string;
  role: 'admin' | 'member';
  lastActive: string;
}

const INITIAL_GROUPS: Group[] = [
  { id: '1', name: 'عشاق البرمجة', coverUrl: 'https://picsum.photos/300/150?random=201', membersCount: '15K', role: 'admin', lastActive: 'منذ ساعة' },
  { id: '2', name: 'تصميم الجرافيك العربي', coverUrl: 'https://picsum.photos/300/150?random=202', membersCount: '42K', role: 'member', lastActive: 'منذ 5 ساعات' },
  { id: '3', name: 'سوق المستعمل', coverUrl: 'https://picsum.photos/300/150?random=203', membersCount: '102K', role: 'member', lastActive: 'منذ يوم' },
  { id: '4', name: 'وظائف خالية', coverUrl: 'https://picsum.photos/300/150?random=204', membersCount: '250K', role: 'member', lastActive: 'منذ 3 ساعات' },
  { id: '5', name: 'نادي القراءة', coverUrl: 'https://picsum.photos/300/150?random=205', membersCount: '5.3K', role: 'member', lastActive: 'منذ يومين' },
];

const ProfileGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(g => g.name.includes(searchTerm));

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] animate-fadeIn p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">المجموعات</h2>
        <div className="relative flex-1 md:w-60 w-full">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             placeholder="بحث في المجموعات..." 
             className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border-transparent focus:border-fb-blue border rounded-full py-2 pr-10 pl-4 text-sm transition outline-none"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredGroups.map(group => (
             <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col group hover:shadow-md transition">
                <div className="h-24 overflow-hidden relative">
                   <img src={group.coverUrl} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                   <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-[15px] hover:underline cursor-pointer mb-1">{group.name}</h3>
                   </div>
                   <span className="text-xs text-gray-500 mb-4">{group.membersCount} عضو · {group.lastActive}</span>
                   
                   <div className="mt-auto pt-2 flex items-center gap-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 rounded-md text-sm transition">
                         زيارة
                      </button>
                      <button className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md">
                         <MoreHorizontal className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
           <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
           <p>لا توجد مجموعات لعرضها.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileGroups;
