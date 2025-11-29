
import React from 'react';
import { Users, Bookmark, Calendar, Clock, ChevronDown, MonitorPlay, Store, LayoutGrid } from 'lucide-react';
import { User, View } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  currentUser: User;
  onProfileClick: () => void;
  onNavigate: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onProfileClick, onNavigate }) => {
  const { t } = useLanguage();

  const menuItems = [
    { icon: <Users className="h-6 w-6 text-fb-blue" />, label: t.nav_friends, view: 'friends' as View },
    { icon: <Store className="h-6 w-6 text-fb-blue" />, label: t.nav_market, view: 'marketplace' as View },
    { icon: <MonitorPlay className="h-6 w-6 text-fb-blue" />, label: t.nav_watch, view: 'profile_videos' as View },
    { icon: <Clock className="h-6 w-6 text-fb-blue" />, label: t.menu_memories, view: 'home' as View },
    { icon: <Bookmark className="h-6 w-6 text-fb-blue" />, label: t.menu_saved, view: 'saved' as View },
    { icon: <LayoutGrid className="h-6 w-6 text-fb-blue" />, label: t.menu_groups, view: 'home' as View },
    { icon: <Calendar className="h-6 w-6 text-fb-blue" />, label: t.menu_events, view: 'home' as View },
  ];

  return (
    <div className="hidden lg:block w-[300px] h-[calc(100vh-56px)] overflow-y-auto sticky top-14 p-4 hover:overflow-y-scroll no-scrollbar">
      <ul className="space-y-1">
        <li 
          className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition"
          onClick={onProfileClick}
        >
          <img src={currentUser.avatar} alt={currentUser.name} className="h-9 w-9 rounded-full border border-gray-200" />
          <span className="font-medium text-[15px]">{currentUser.name}</span>
        </li>
        
        {menuItems.map((item, index) => (
          <li 
            key={index} 
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition"
            onClick={() => onNavigate(item.view)}
          >
            <div className="flex items-center justify-center w-9 h-9">
                {item.icon}
            </div>
            <span className="font-medium text-[15px]">{item.label}</span>
          </li>
        ))}
        
        <li className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
            <ChevronDown className="h-6 w-6 text-black" />
          </div>
          <span className="font-medium text-[15px]">{t.menu_more}</span>
        </li>
      </ul>

      <div className="border-t border-gray-300 my-4 mx-2"></div>

      <div className="px-2">
        <h3 className="text-gray-500 font-semibold text-[17px] mb-2">{t.shortcuts}</h3>
        <ul className="space-y-1">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition">
              <img src={`https://picsum.photos/40/40?random=${i + 20}`} className="h-9 w-9 rounded-lg" alt="Group" />
              <span className="font-medium text-[15px]">مجموعة المبرمجين العرب {i}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto p-4 text-xs text-gray-500 leading-normal">
        {t.privacy_footer}
      </div>
    </div>
  );
};

export default Sidebar;
