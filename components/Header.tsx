
import React from 'react';
import { Bell, User, Globe, Moon, Sun, Coins, Crown, Rocket, LogIn, UserPlus } from 'lucide-react';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';
import { APP_LOGO_SVG } from '../constants';
import { getCurrentUser, logout } from '../services/authService';

const Header: React.FC = () => {
  const { navigate, currentPage, lang, theme, toggleLang, toggleTheme, userPrefs } = useAppContext();
  const t = translations[lang];
  const points = userPrefs.loyalty?.points || 0;
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('home')}>
            <div className="relative">
              <img 
                src={APP_LOGO_SVG} 
                alt="أبخص Logo" 
                className="w-12 h-12 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="mx-3 text-2xl font-black text-indigo-700 dark:text-indigo-500 tracking-tighter uppercase">{t.appName}</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {['home', 'search', 'wishlist', 'rewards', 'roadmap'].map((page) => (
              <button 
                key={page}
                onClick={() => navigate(page)}
                className={`relative px-1 py-2 text-sm font-black transition-all ${currentPage === page ? 'text-indigo-600' : 'text-gray-400 dark:text-slate-400 hover:text-indigo-500'}`}
              >
                {t[page as keyof typeof t]}
                {currentPage === page && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Loyalty Quick Access - Redesigned for elegance */}
            <button 
              onClick={() => navigate('rewards')}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-4 py-1.5 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg hover:shadow-amber-200/20 dark:hover:shadow-none transition-all group active:scale-95"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-tighter mb-0.5">{t.loyaltyHeader}</span>
                <span className="text-sm font-black text-slate-800 dark:text-amber-100">{points.toLocaleString()}</span>
              </div>
              <div className="bg-amber-400 p-2 rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-amber-200 dark:shadow-none">
                <Coins size={14} className="text-white fill-white" />
              </div>
            </button>

            <div className="h-8 w-px bg-gray-100 dark:bg-slate-700 mx-1"></div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              onClick={toggleLang}
              className="p-2 flex items-center gap-1 text-gray-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Globe size={18} />
              <span className="text-xs font-black uppercase">{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {currentUser ? (
              <>
                <button onClick={() => navigate('profile')} className="p-2 bg-indigo-50 dark:bg-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all" title={currentUser.email || currentUser.phoneNumber}>
                  <User size={20} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white font-black text-xs transition-all flex items-center gap-2"
                >
                  {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('login')}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white font-black text-xs transition-all flex items-center gap-2"
                >
                  <LogIn size={16} />
                  {lang === 'ar' ? 'دخول' : 'Login'}
                </button>
                <button 
                  onClick={() => navigate('signup')}
                  className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-600 hover:text-white font-black text-xs transition-all flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  {lang === 'ar' ? 'إنشاء' : 'Sign Up'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
