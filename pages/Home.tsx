
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Smartphone, Laptop, Tv, Home as HomeIcon, ShoppingBag, ThumbsUp, ThumbsDown, CheckCircle2, Camera, Loader2, Target, TrendingUp, ShieldCheck, ChevronLeft, Info as InfoIcon, BrainCircuit, Zap, BarChart3, ChevronRight, Crown, CreditCard, BellRing } from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import { Product, RecommendationResponse, UserPreferences, Language } from '../types';
import ProductCard from '../components/ProductCard';
import { calculateProductScore } from '../services/scoring';
import { getBatchRecommendationExplanations, identifyProductFromImage, fetchProductImageFromWeb } from '../services/geminiService';
import { translations } from '../translations';
import { useHaptics } from '../hooks/useHaptics';
import { HomeSkeleton } from '../components/Skeletons';
import { useAppContext } from '../context/AppContext';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
  userPrefs: UserPreferences;
  lang: Language;
}

const Home: React.FC<HomeProps> = ({ onNavigate, userPrefs, lang }) => {
  const { updatePrefs } = useAppContext();
  
  // 🟥 CRITICAL_STATE_CONSOLIDATION: Consolidated 7 useState into single state object
  const [state, setState] = useState({
    searchQuery: '',
    recommendations: [] as RecommendationResponse[],
    isLoading: true,
    isExplaining: false,
    isVisualSearching: false,
    feedbackSubmitted: false,
    trainingProgress: 82,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];
  const { trigger } = useHaptics();

  // Helper functions for state updates
  const setSearchQuery = (q: string) => setState(prev => ({ ...prev, searchQuery: q }));
  const setRecommendations = (recs: RecommendationResponse[]) => setState(prev => ({ ...prev, recommendations: recs }));
  const setIsLoading = (loading: boolean) => setState(prev => ({ ...prev, isLoading: loading }));
  const setIsExplaining = (explaining: boolean) => setState(prev => ({ ...prev, isExplaining: explaining }));
  const setIsVisualSearching = (searching: boolean) => setState(prev => ({ ...prev, isVisualSearching: searching }));
  const setFeedbackSubmitted = (submitted: boolean) => setState(prev => ({ ...prev, feedbackSubmitted: submitted }));
  const setTrainingProgress = (progress: number) => setState(prev => ({ ...prev, trainingProgress: progress }));

  useEffect(() => {
    const fetchRecommendations = async () => {
      const scoredProducts = MOCK_PRODUCTS.map(p => ({
        ...p,
        score: calculateProductScore(p, userPrefs)
      })).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);

      const initialRecs: RecommendationResponse[] = scoredProducts.map(p => ({
        product: p,
        score: p.score || 0,
        why_this: [lang === 'ar' ? "جاري تحليل المواصفات..." : "Analyzing specs..."],
        pro_tip: ""
      }));

      setRecommendations(initialRecs);
      setIsLoading(false);
      setIsExplaining(true);

      try {
        // 🟥 CRITICAL_ERROR_BOUNDARY: Monitor batch data fetch
        const [batchData] = await Promise.all([
          getBatchRecommendationExplanations(scoredProducts, userPrefs)
        ]);

        setRecommendations(prev => prev.map(rec => ({
          ...rec,
          why_this: batchData[rec.product.product_id]?.reasons || [lang === 'ar' ? "خيار ممتاز بناءً على الأداء والمراجعات." : "Excellent choice based on performance."],
          pro_tip: batchData[rec.product.product_id]?.pro_tip || ""
        })));

        // 🟥 CRITICAL_ERROR_BOUNDARY: Sequential image fetching to prevent race conditions
        for (const product of scoredProducts) {
          try {
            const imageUrl = await fetchProductImageFromWeb(product.name);
            if (imageUrl) {
              setRecommendations(prev => prev.map(rec => 
                rec.product.product_id === product.product_id 
                  ? { ...rec, product: { ...rec.product, thumbnail_url: imageUrl } }
                  : rec
              ));
            }
          } catch (imageError) {
            console.error('🟥 CRITICAL_ERROR_BOUNDARY: Image fetch failed for', product.name, imageError);
          }
        }

      } catch (err) {
        console.error("🟥 CRITICAL_ERROR_BOUNDARY: AI Explanation background fetch failed", err);
      } finally {
        setIsExplaining(false);
      }
    };

    fetchRecommendations();
  }, [userPrefs.budget_range.max, userPrefs.use_case, userPrefs.priority, lang]);

  const handleVisualSearch = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVisualSearching(true);
    trigger('medium');
    try {
      // 🟥 CRITICAL_ERROR_BOUNDARY: File read with error handling
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await identifyProductFromImage(base64);
          setIsVisualSearching(false);
          if (result) onNavigate('search', { q: result });
          else alert(t.noResult);
        } catch (error) {
          console.error('🟥 CRITICAL_ERROR_BOUNDARY: Image identification failed:', error);
          setIsVisualSearching(false);
          alert(t.noResult);
        }
      };
      reader.onerror = () => {
        console.error('🟥 CRITICAL_ERROR_BOUNDARY: File read error');
        setIsVisualSearching(false);
        alert(t.noResult);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('🟥 CRITICAL_ERROR_BOUNDARY: File handling error:', error);
      setIsVisualSearching(false);
      alert(t.noResult);
    }
  };

  const handleFeedback = (useful: boolean) => {
    trigger(useful ? 'success' : 'medium');
    setFeedbackSubmitted(true);
    const increment = useful ? 5 : 2;
    setTrainingProgress(prev => Math.min(prev + increment, 100));
  };

  if (isLoading) return <HomeSkeleton />;

  const categories = [
    { id: 'phones', name: t.phones, icon: <Smartphone size={20} />, active: true },
    { id: 'laptops', name: t.laptops, icon: <Laptop size={20} /> },
    { id: 'tvs', name: t.tvs, icon: <Tv size={20} /> },
    { id: 'appliances', name: t.appliances, icon: <HomeIcon size={20} /> },
  ];

  return (
    <div className="space-y-12 pb-12 transition-all animate-in fade-in duration-500">
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
        <div className="relative z-10 md:w-3/4 text-start">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/10">
            <TrendingUp size={16} className="text-blue-200" />
            <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'محرك أبخص 3.0: مفعّل' : 'Abkhas Engine 3.0: Active'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
            {t.heroTitle}
          </h1>
          <p className="text-indigo-50 text-xl mb-12 max-w-2xl font-medium leading-relaxed opacity-90">
            {t.heroSub}
          </p>
          
          <div className="relative max-w-2xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative">
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full bg-white text-gray-900 rounded-[2rem] py-6 ps-16 pe-40 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-2xl transition-all font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate('search', { q: searchQuery })}
              />
              <Search className="absolute start-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              
              <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button 
                   onClick={handleVisualSearch}
                   className="p-3 bg-gray-50 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm"
                   title={t.visualSearch}
                 >
                   {isVisualSearching ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                 </button>
                 <button 
                    onClick={() => onNavigate('search', { q: searchQuery })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all font-black text-sm shadow-lg"
                  >
                    {t.searchBtn}
                  </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
        <div className="absolute -end-20 -bottom-20 opacity-10 rotate-12 pointer-events-none">
          <ShoppingBag size={600} />
        </div>
      </section>

      <section className="px-2">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.categoriesTitle}</h2>
          <button className="text-indigo-600 font-black text-sm hover:underline flex items-center gap-1 uppercase tracking-widest">
            {lang === 'ar' ? 'كل الفئات' : 'All Categories'} 
            {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div 
              key={cat.id}
              className={`group flex items-center p-5 rounded-[1.8rem] border transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${cat.active ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-50 dark:ring-indigo-900/10' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-indigo-200 shadow-sm'}`}
            >
              <div className={`p-3.5 rounded-2xl ms-0 me-3 transition-all ${cat.active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                {cat.icon}
              </div>
              <span className={`font-black text-sm uppercase tracking-widest ${cat.active ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-amber-500/20">
         <div className="absolute top-0 end-0 p-8 opacity-10">
            <Crown size={200} className="text-amber-400" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-start">
               <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full mb-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20">
                  <Zap size={14} className="fill-current" /> {t.proBadge}
               </div>
               <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">{t.upgradePro}</h3>
               <p className="text-slate-400 text-lg mb-8 max-w-lg font-medium italic">
                  {lang === 'ar' ? 'وفر أكثر مع ميزات الذكاء الاصطناعي المتقدمة وتنبيهات الأسعار اللحظية.' : 'Save more with advanced AI features and real-time price alerts.'}
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                     <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><BellRing size={18} /></div>
                     <span className="text-xs font-bold">{t.proFeature1}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                     <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Target size={18} /></div>
                     <span className="text-xs font-bold">{t.proFeature2}</span>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <button onClick={() => updatePrefs({ subscription: 'pro' })} className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/10 transition-all active:scale-95 flex items-center gap-3">
                    <CreditCard size={18} /> {lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
                  </button>
                  <div className="flex flex-col">
                     <span className="text-2xl font-black text-amber-400">{t.proPrice}</span>
                     <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{lang === 'ar' ? 'قابلة للإلغاء أي وقت' : 'Cancel anytime'}</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4 text-start">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-3 rounded-2xl text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.aiRecTitle}</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                {lang === 'ar' ? 'تحليل لحظي لـ ' : 'Live analysis for '} {t[userPrefs.use_case as keyof typeof t]}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((rec, index) => (
            <div key={rec.product.product_id} className="animate-in zoom-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <ProductCard 
                product={rec.product} 
                onClick={() => onNavigate('product', { id: rec.product.product_id })} 
                lang={lang}
                aiReasons={rec.why_this}
                isExplaining={isExplaining}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
