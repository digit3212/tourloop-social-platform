
import React, { useState, useRef, useEffect } from 'react';
import { Search, Home, Users, MonitorPlay, Store, Bell, MessageCircle, UserCircle, Infinity, Gamepad2, Settings, LogOut, Moon, Sun, Globe, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { View } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [activeTab, setActiveTab] = useState<View>('home');
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  // Settings Dropdown State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'language'>('main');
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (view: View) => {
    setActiveTab(view);
    setView(view);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setSettingsView('main'); // Reset view
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const navClass = (view: View) => 
    `flex items-center justify-center h-full px-2 md:px-8 cursor-pointer border-b-4 transition-all duration-200 ${
      activeTab === view 
        ? 'border-fb-blue text-fb-blue dark:text-fb-blue dark:border-fb-blue' 
        : 'border-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg'
    }`;

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-fb-dark shadow-sm h-14 flex items-center justify-between px-4 transition-colors duration-300" dir={dir}>
      {/* Logo & Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabClick('home')}>
           <div className="bg-fb-blue text-white p-1 rounded-md">
              <Infinity className="h-8 w-8" />
           </div>
           <span className="text-2xl font-bold text-fb-blue tracking-tight hidden md:block" style={{ fontFamily: 'sans-serif' }}>Tourloop</span>
        </div>
        
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-2 w-60 mx-2 transition-colors">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <input 
            type="text" 
            placeholder={t.search_placeholder} 
            className={`bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white ${dir === 'rtl' ? 'pr-2' : 'pl-2'}`}
          />
        </div>
        <div className="md:hidden bg-gray-100 dark:bg-gray-800 p-2 rounded-full mx-2">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Middle: Navigation */}
      <div className="hidden md:flex h-full flex-1 justify-center max-w-2xl mx-auto">
        <div className={navClass('home')} onClick={() => handleTabClick('home')} title={t.nav_home}>
          <Home className={`h-7 w-7 ${activeTab === 'home' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('friends')} onClick={() => handleTabClick('friends')} title={t.nav_friends}>
          <Users className={`h-7 w-7 ${activeTab === 'friends' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('watch')} onClick={() => handleTabClick('watch')} title={t.nav_watch}>
          <MonitorPlay className={`h-7 w-7 ${activeTab === 'watch' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('marketplace')} onClick={() => handleTabClick('marketplace')} title={t.nav_market}>
          <Store className={`h-7 w-7 ${activeTab === 'marketplace' ? 'fill-current' : ''}`} />
        </div>
        <div className={navClass('gaming')} onClick={() => handleTabClick('gaming')} title={t.nav_gaming}>
          <Gamepad2 className={`h-7 w-7 ${activeTab === 'gaming' ? 'fill-current' : ''}`} />
        </div>
      </div>

      {/* Left/Right: Profile & Settings */}
      <div className="flex items-center gap-2 md:gap-3"> 
        
        <div className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full cursor-pointer transition md:hidden" onClick={() => setView('profile')}>
          <UserCircle className="h-5 w-5 text-black dark:text-white" />
        </div>
        
        {/* Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
            <div 
                onClick={() => setShowSettings(!showSettings)}
                className={`bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full cursor-pointer transition ${showSettings ? 'bg-blue-100 dark:bg-blue-900/50 text-fb-blue' : 'text-black dark:text-white'}`}
            >
                <Settings className="h-5 w-5" />
            </div>

            {showSettings && (
                <div className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn origin-top-right ltr:right-0 rtl:left-0">
                    
                    {/* MAIN VIEW */}
                    {settingsView === 'main' && (
                      <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">الإعدادات والخصوصية</h3>
                        </div>
                        
                        <div className="p-2 space-y-1">
                            {/* Language Sub-menu Trigger */}
                            <button 
                                onClick={() => setSettingsView('language')}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full group-hover:bg-white dark:group-hover:bg-gray-500 transition">
                                        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">اللغة / Language</span>
                                </div>
                                {dir === 'rtl' ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                            </button>

                            {/* Dark Mode Toggle */}
                            <button 
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full group-hover:bg-white dark:group-hover:bg-gray-500 transition">
                                        {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Moon className="w-5 h-5 text-gray-700" />}
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
                                    </span>
                                </div>
                            </button>

                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                            {/* Logout */}
                            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition group text-red-600 dark:text-red-400">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full group-hover:bg-white dark:group-hover:bg-gray-600 transition">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">تسجيل الخروج</span>
                                </div>
                            </button>
                        </div>
                      </>
                    )}

                    {/* LANGUAGE SUB-MENU */}
                    {settingsView === 'language' && (
                       <div className="animate-slideLeft">
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                              <button 
                                onClick={() => setSettingsView('main')}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                              >
                                 {dir === 'rtl' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                              </button>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">اللغة</h3>
                          </div>
                          <div className="p-2 space-y-1">
                             <button 
                                onClick={() => { setLanguage('ar'); setShowSettings(false); }}
                                className={`w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ${language === 'ar' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                             >
                                <div className="flex flex-col items-start">
                                   <span className="font-medium text-gray-800 dark:text-gray-200">العربية</span>
                                   <span className="text-xs text-gray-500">Arabic</span>
                                </div>
                                {language === 'ar' && <Check className="w-5 h-5 text-fb-blue" />}
                             </button>

                             <button 
                                onClick={() => { setLanguage('en'); setShowSettings(false); }}
                                className={`w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                             >
                                <div className="flex flex-col items-start">
                                   <span className="font-medium text-gray-800 dark:text-gray-200">English</span>
                                   <span className="text-xs text-gray-500">الإنجليزية</span>
                                </div>
                                {language === 'en' && <Check className="w-5 h-5 text-fb-blue" />}
                             </button>
                          </div>
                       </div>
                    )}
                </div>
            )}
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full cursor-pointer transition relative">
          <Bell className="h-5 w-5 text-black dark:text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full cursor-pointer transition">
          <MessageCircle className="h-5 w-5 text-black dark:text-white" />
        </div>

        <div 
          className="hidden xl:flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 pl-3 rounded-full cursor-pointer transition" 
          onClick={() => setView('profile')}
        >
          <img src="https://picsum.photos/40/40?random=1" alt="Profile" className="h-8 w-8 rounded-full border border-gray-200" />
          <span className="font-semibold text-sm mx-2 text-gray-900 dark:text-white">أحمد</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;