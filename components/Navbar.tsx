import React, { useState } from 'react';
import { Search, Home, Users, MonitorPlay, Store, Bell, MessageCircle, Menu, UserCircle, Infinity } from 'lucide-react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [activeTab, setActiveTab] = useState<View>('home');

  const handleTabClick = (view: View) => {
    setActiveTab(view);
    setView(view);
  };

  const navClass = (view: View) => 
    `flex items-center justify-center h-full px-2 md:px-10 cursor-pointer border-b-4 transition-all duration-200 ${
      activeTab === view 
        ? 'border-fb-blue text-fb-blue' 
        : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg'
    }`;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm h-14 flex items-center justify-between px-4">
      {/* Right: Logo & Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabClick('home')}>
           <div className="bg-fb-blue text-white p-1 rounded-md">
              <Infinity className="h-8 w-8" />
           </div>
           <span className="text-2xl font-bold text-fb-blue tracking-tight hidden md:block" style={{ fontFamily: 'sans-serif' }}>Tourloop</span>
        </div>
        
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-2 w-60 mr-2">
          <Search className="h-5 w-5 text-gray-500 ml-2" />
          <input 
            type="text" 
            placeholder="بحث في Tourloop" 
            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500"
          />
        </div>
        <div className="md:hidden bg-gray-100 p-2 rounded-full mr-2">
            <Search className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Middle: Navigation */}
      <div className="hidden md:flex h-full flex-1 justify-center max-w-xl mx-auto">
        <div className={navClass('home')} onClick={() => handleTabClick('home')} title="الرئيسية">
          <Home className={`h-7 w-7 ${activeTab === 'home' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('friends')} onClick={() => handleTabClick('friends')} title="الأصدقاء">
          <Users className={`h-7 w-7 ${activeTab === 'friends' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('watch')} onClick={() => handleTabClick('watch')} title="فيديو">
          <MonitorPlay className={`h-7 w-7 ${activeTab === 'watch' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('marketplace')} onClick={() => handleTabClick('marketplace')} title="المتجر">
          <Store className={`h-7 w-7 ${activeTab === 'marketplace' ? 'fill-current' : ''}`} />
        </div>
      </div>

      {/* Left: Profile & Settings */}
      <div className="flex items-center gap-2 md:gap-3" dir="ltr"> 
        
        <div className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full cursor-pointer transition md:hidden" onClick={() => setView('profile')}>
          <UserCircle className="h-5 w-5 text-black" />
        </div>
        
        <div className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full cursor-pointer transition relative">
          <Bell className="h-5 w-5 text-black" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
        </div>
        
        <div className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full cursor-pointer transition">
          <MessageCircle className="h-5 w-5 text-black" />
        </div>

        <div className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full cursor-pointer transition">
          <Menu className="h-5 w-5 text-black" />
        </div>

        <div 
          className="hidden xl:flex items-center gap-2 hover:bg-gray-100 p-1 pl-3 rounded-full cursor-pointer transition" 
          dir="rtl"
          onClick={() => setView('profile')}
        >
          <img src="https://picsum.photos/40/40?random=1" alt="Profile" className="h-8 w-8 rounded-full border border-gray-200" />
          <span className="font-semibold text-sm mr-2">أحمد</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;