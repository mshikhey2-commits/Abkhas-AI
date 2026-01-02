
import React, { Suspense, lazy } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ProductDetails from './pages/ProductDetails';
import InfoPage from './pages/InfoPage';
import ComparePage from './pages/ComparePage';
import Rewards from './pages/Rewards';
import Roadmap from './pages/Roadmap';
import AIChatBot from './components/AIChatBot';
import CompareDrawer from './components/CompareDrawer';
import SessionWarning from './components/SessionWarning';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { translations } from './translations';
import { APP_LOGO_SVG } from './constants';
import { ChevronLeft, ChevronRight, Twitter, Instagram, Youtube, Mail, ExternalLink, Calendar } from 'lucide-react';

// Lazy load auth pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Loading component for lazy-loaded auth pages
const AuthLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentPage, pageParams, lang, userPrefs, updatePrefs, navigate, toggleLang, user } = useAppContext();
  const t = translations[lang];
  
  // Session timeout monitoring
  useSessionTimeout();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} userPrefs={userPrefs} lang={lang} />;
      case 'search':
        return <SearchResults query={pageParams.q || ''} onNavigate={navigate} userPrefs={userPrefs} lang={lang} />;
      case 'product':
        return <ProductDetails productId={pageParams.id} />;
      case 'compare':
        return <ComparePage />;
      case 'rewards':
        return <Rewards />;
      case 'roadmap':
        return <Roadmap />;
      case 'login':
        return (
          <Suspense fallback={<AuthLoadingFallback />}>
            <Login lang={lang} />
          </Suspense>
        );
      case 'signup':
        return (
          <Suspense fallback={<AuthLoadingFallback />}>
            <Signup lang={lang} />
          </Suspense>
        );
      case 'about':
        return <InfoPage type="about" />;
      case 'privacy':
        return <InfoPage type="privacy" />;
      case 'terms':
        return <InfoPage type="terms" />;
      case 'contact':
        return <InfoPage type="contact" />;
      case 'profile':
        return (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-8 tracking-tight">
              {lang === 'ar' ? 'التفضيلات الشخصية' : 'Personal Preferences'}
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em]">
                  {lang === 'ar' ? 'اللغة المختارة' : 'Preferred Language'}
                </label>
                <div className="flex gap-3">
                   <button onClick={() => lang !== 'ar' && toggleLang()} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${lang === 'ar' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 border-gray-100 dark:border-slate-700'}`}>العربية</button>
                   <button onClick={() => lang !== 'en' && toggleLang()} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${lang === 'en' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 border-gray-100 dark:border-slate-700'}`}>English</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em]">
                  {t.calendar}
                </label>
                <div className="flex gap-3">
                   <button onClick={() => updatePrefs({ calendar: 'gregorian' })} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${userPrefs.calendar === 'gregorian' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 border-gray-100 dark:border-slate-700'}`}>{t.gregorian}</button>
                   <button onClick={() => updatePrefs({ calendar: 'hijri' })} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${userPrefs.calendar === 'hijri' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 border-gray-100 dark:border-slate-700'}`}>{t.hijri}</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em]">
                  {lang === 'ar' ? 'حالة الاستخدام' : 'Main Use Case'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['gaming', 'camera', 'everyday'].map(u => (
                    <button 
                      key={u} 
                      onClick={() => updatePrefs({ use_case: u as any })} 
                      className={`py-4 rounded-2xl border-2 text-sm font-black transition-all ${userPrefs.use_case === u ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 border-gray-100 dark:border-slate-700'}`}
                    >
                      {t[u as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-10 border-t border-gray-100 dark:border-slate-700">
                <button 
                  onClick={() => navigate('home')}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {t.home}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Home onNavigate={navigate} userPrefs={userPrefs} lang={lang} />;
    }
  };

  const ListChevron = () => (
    lang === 'ar' ? 
    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> : 
    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {currentPage !== 'login' && currentPage !== 'signup' && <Header />}
      <main className={currentPage === 'login' || currentPage === 'signup' ? 'flex-grow w-full' : 'flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full'}>
        {renderPage()}
      </main>
      {currentPage !== 'login' && currentPage !== 'signup' && <AIChatBot />}
      {currentPage !== 'login' && currentPage !== 'signup' && <CompareDrawer />}
      
      <footer className={currentPage === 'login' || currentPage === 'signup' ? 'hidden' : 'bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 py-20 transition-colors'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={APP_LOGO_SVG} alt="أبخص Logo" className="w-12 h-12 rounded-2xl shadow-lg" />
                <span className="text-3xl font-black text-indigo-700 dark:text-indigo-500 tracking-tighter uppercase">{t.appName}</span>
              </div>
              <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed font-bold">
                {t.footerDesc} خبرة الذكاء الاصطناعي بين يديك لتتسوق بذكاء وتوفر بذكاء.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"><Twitter size={18} /></a>
                <a href="#" className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-gray-400 hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
                <a href="#" className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-gray-400 hover:text-red-600 transition-colors"><Youtube size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-[0.2em] mb-8 pb-2 border-b-2 border-indigo-600 w-fit">{t.company}</h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigate('about')} className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-2 group"><ListChevron /> {t.aboutUs}</button></li>
                <li><button onClick={() => navigate('roadmap')} className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-2 group"><ListChevron /> {t.roadmap}</button></li>
                <li><button onClick={() => navigate('profile')} className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-2 group"><ListChevron /> {lang === 'ar' ? 'تفضيلاتك' : 'Preferences'}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-[0.2em] mb-8 pb-2 border-b-2 border-indigo-600 w-fit">{t.support}</h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigate('contact')} className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-2 group"><ListChevron /> {t.contactUs}</button></li>
                <li><button onClick={() => navigate('privacy')} className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-2 group"><ListChevron /> {t.privacyPolicy}</button></li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
               <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2"><Mail size={18} /> {t.support}</h4>
               <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">{t.footerInquiry}</p>
               <button onClick={() => navigate('contact')} className="w-full bg-white dark:bg-slate-800 text-indigo-600 py-3 rounded-xl font-black text-xs shadow-sm hover:shadow-lg flex items-center justify-center gap-2">
                 {t.contactUs} <ExternalLink size={14} />
               </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Session timeout warning */}
      {user && <SessionWarning />}
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
