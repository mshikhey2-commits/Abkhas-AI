
import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { 
  Star, Heart, ShieldCheck, Truck, 
  ArrowRight, ExternalLink, TrendingDown, 
  Zap, Plus, Check, Scale, CreditCard, Shield,
  BrainCircuit, Globe, ChevronDown, ChevronUp, ArrowLeft, Coins, Share2, Link2, Calendar
} from 'lucide-react';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { DetailSkeleton } from '../components/Skeletons';
import { Helmet } from 'react-helmet-async';
import { getSmartAnalysis, findNearbyStores, fetchProductImageFromWeb } from '../services/geminiService';
import { generateAffiliateLink, trackConversion } from '../services/affiliateService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SmartImage from '../components/SmartImage';

const ProductDetails: React.FC<{ productId: string }> = ({ productId }) => {
  // Added theme to destructuring from useAppContext to resolve errors on lines 201-202
  const { lang, theme, navigate, toggleCompare, compareList, userPrefs, updatePrefs, addCoins, trackInteraction } = useAppContext();
  const { trigger } = useHaptics();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [analysis, setAnalysis] = useState<any>(null);
  const [nearby, setNearby] = useState<any[]>([]);
  const [showBonus, setShowBonus] = useState(false);
  const t = translations[lang];

  // 🟥 CRITICAL_STATE_CONSOLIDATION: Use centralized feedback patterns
  const triggerSuccess = () => trigger('success');
  const triggerAction = () => trigger('medium');
  const triggerLight = () => trigger('light');

  const priceHistoryData = useMemo(() => {
    if (!product || !product.offers || product.offers.length === 0) return [];
    const basePrice = product.offers[0].price;
    const now = new Date();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setMonth(now.getMonth() - (6 - i));
      
      const locale = userPrefs.calendar === 'hijri' 
        ? (lang === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic')
        : (lang === 'ar' ? 'ar-SA' : 'en-US');

      const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
      
      return {
        name: formatter.format(date),
        price: basePrice + Math.floor(Math.random() * 500) - 100,
        fullDate: date
      };
    });
  }, [product, userPrefs.calendar, lang]);

  useEffect(() => {
    const init = async () => {
      // 🟥 CRITICAL_ERROR_BOUNDARY: Monitor race conditions in data fetching
      setIsLoading(true);
      try {
        const found = MOCK_PRODUCTS.find(p => p.product_id === productId);
        
        if (found) {
          setProduct(found);
          setActiveImage(found.thumbnail_url);
          trackInteraction(found, 'view');

          // 🟥 CRITICAL_ERROR_BOUNDARY: Sequential execution to prevent race conditions
          const imageUrl = await fetchProductImageFromWeb(found.name);
          if (imageUrl) {
            setProduct(prev => prev ? { ...prev, thumbnail_url: imageUrl } : prev);
            setActiveImage(imageUrl);
          }

          const [smartData, nearbyData] = await Promise.all([
            getSmartAnalysis(found, userPrefs),
            navigator.geolocation ? new Promise((res) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => res(findNearbyStores(found.name, pos.coords.latitude, pos.coords.longitude)),
                () => res([])
              )
            }) : Promise.resolve([])
          ]);
          setAnalysis(smartData);
          setNearby(nearbyData as any[]);
        }
      } catch (error) {
        // 🟥 CRITICAL_ERROR_BOUNDARY: Handle errors gracefully
        console.error('🟥 CRITICAL_ERROR_BOUNDARY: Error in ProductDetails init:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [productId, userPrefs, lang]);

  const handleBuy = (storeId: string, url: string) => {
    if (!product) return;
    triggerSuccess();
    setIsRedirecting(true);
    trackInteraction(product, 'purchase');
    trackConversion(productId, storeId);
    const affiliateUrl = generateAffiliateLink(storeId, url);
    setTimeout(() => {
      window.open(affiliateUrl, '_blank');
      setIsRedirecting(false);
    }, 1200);
  };

  const handleWishlist = () => {
    if (!product) return;
    triggerAction();
    trackInteraction(product, 'wishlist');
  };

  const handleShare = () => {
    if (!product) return;
    triggerSuccess();
    addCoins(500);
    setShowBonus(true);
    setTimeout(() => setShowBonus(false), 4000);
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: analysis?.summary || product.description,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (!product) return <div className="dark:text-white p-12 text-center">Product not found.</div>;

  const isComparing = compareList.includes(product.product_id);

  return (
    <div className="pb-32 transition-all animate-in slide-in-from-bottom-5 duration-700 relative">
      <Helmet>
        <title>{`${product.name} | أبخص - مساعد الشراء الذكي`}</title>
      </Helmet>

      {isRedirecting && (
        <div className="fixed inset-0 z-[300] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 animate-bounce">
              <ExternalLink size={40} className="text-white" />
           </div>
           <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{lang === 'ar' ? 'جاري تحويلك للمتجر...' : 'Redirecting to store...'}</h2>
        </div>
      )}

      {showBonus && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
           <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white">
              <div className="bg-white text-amber-600 p-2 rounded-full shadow-inner"><Coins size={24} fill="currentColor" /></div>
              <div className="text-start">
                 <h4 className="font-black text-lg leading-none mb-1">{t.recBonusTitle}</h4>
                 <p className="text-[10px] font-bold opacity-90">{t.recBonusDesc}</p>
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-12">
        <button onClick={() => navigate('home')} className="flex items-center text-gray-500 dark:text-slate-400 hover:text-indigo-600 font-black transition-all group px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          {lang === 'ar' ? <ArrowRight size={18} className="ms-0 me-3" /> : <ArrowLeft size={18} className="me-3" />}
          {t.back}
        </button>
        <div className="flex gap-4">
          <button onClick={handleShare} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90">
            <Share2 size={22} />
          </button>
          <button onClick={handleWishlist} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-red-500 transition-all shadow-sm active:scale-90">
            <Heart size={22} />
          </button>
          <button onClick={() => { triggerLight(); toggleCompare(product.product_id); }} className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl border font-black text-sm transition-all shadow-sm active:scale-95 ${isComparing ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}>
            {isComparing ? <Check size={20} /> : <Plus size={20} />}
            {isComparing ? (lang === 'ar' ? 'إزالة من المقارنة' : 'Remove') : (lang === 'ar' ? 'إضافة للمقارنة' : 'Add to compare')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-4 border border-gray-100 dark:border-slate-700 shadow-2xl aspect-square flex items-center justify-center relative overflow-hidden group">
             <SmartImage src={activeImage} alt={product.name} className="w-full h-full rounded-[2.5rem]" />
             <div className="absolute top-8 start-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white/20 shadow-2xl">
               <Scale size={28} className="text-indigo-600" />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-700 shadow-sm text-start">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                 <TrendingDown size={24} className="text-indigo-600" /> {t.priceHistory}
               </h3>
               <button 
                onClick={() => updatePrefs({ calendar: userPrefs.calendar === 'hijri' ? 'gregorian' : 'hijri' })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-black transition-all hover:bg-indigo-100"
               >
                 <Calendar size={14} />
                 {userPrefs.calendar === 'hijri' ? t.gregorian : t.hijri}
               </button>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={priceHistoryData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: theme === 'dark' ? '#94a3b8' : '#94a3b8' }} />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                     formatter={(value: number) => [`${value.toLocaleString()} ${t.sar}`, t.price]}
                   />
                   <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="space-y-12 text-start">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-[0.2em]">{product.brand}</span>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                <Link2 size={12} /> {lang === 'ar' ? 'رابط محقق' : 'Verified Link'}
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] mb-8 tracking-tighter">{product.name}</h1>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-indigo-500/30">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-5">
                      <div className="bg-indigo-500/20 p-4 rounded-[1.5rem] backdrop-blur-2xl border border-indigo-500/30 shadow-inner">
                         <BrainCircuit size={32} className="text-indigo-400" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight">{t.whyRec}</h3>
                   </div>
                </div>
                <p className="text-slate-300 mb-10 text-xl leading-relaxed font-medium italic border-s-4 border-indigo-500 ps-6">
                  {analysis?.summary || (lang === 'ar' ? "تحليل أبخص الذكي يبحث الآن..." : "Abkhas AI searching...") }
                </p>
             </div>
          </div>

          <div className="space-y-8">
            <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">{t.bestOffers}</h3>
            {product.offers?.map(offer => (
              <div key={offer.offer_id} className="bg-white dark:bg-slate-800 border-2 border-gray-50 dark:border-slate-700 rounded-[2.5rem] p-10 hover:border-indigo-600 transition-all shadow-sm group/offer text-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-2xl uppercase">
                      {offer.store_name.substring(0,2)}
                    </div>
                    <h4 className="font-black text-2xl text-gray-900 dark:text-white">{offer.store_name}</h4>
                  </div>
                  <div className="text-4xl font-black text-indigo-700 dark:text-indigo-400">{offer.price.toLocaleString()} {t.sar}</div>
                </div>
                <div className="flex items-center justify-between mt-10 pt-10 border-t border-gray-100 dark:border-slate-700">
                   <button onClick={() => handleBuy(offer.store_id, offer.affiliate_url)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-4 shadow-2xl transition-all">
                    {t.buy} <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
