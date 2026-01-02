
import React from 'react';
import { Product, Language } from '../types';
import { Star, Cpu, Camera, Battery, Zap, CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, TrendingDown } from 'lucide-react';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';
import SmartImage from './SmartImage';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
  lang: Language;
  aiReasons?: string[];
  isExplaining?: boolean;
}

interface SpecItemProps {
  icon: React.ReactNode;
  value: string | number;
}

const SpecItem: React.FC<SpecItemProps> = ({ icon, value }) => (
  <div className="flex flex-col items-center bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800">
    {icon}
    <span className="text-[10px] font-black text-gray-700 dark:text-slate-300">{value}</span>
  </div>
);

const BadgeBase: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-white font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/10 ${className}`}>
    {children}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, lang, aiReasons, isExplaining }) => {
  const { trackInteraction } = useAppContext();
  const bestOffer = product.offers?.[0];
  const t = translations[lang];

  const handleCardClick = () => {
    trackInteraction(product, 'click');
    onClick(product.product_id);
  };

  const isHighlyRecommended = (product.score || 0) >= 0.85;
  const hasAIReasons = aiReasons && aiReasons.length > 0;

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 dark:border-slate-700/50 flex flex-col h-full relative"
    >
      {/* Badges Section */}
      <div className="absolute top-5 start-5 z-30 flex flex-col gap-2">
        {/* Match Score Badge */}
        {product.score && (
          <div className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] px-4 py-2 rounded-2xl shadow-xl shadow-indigo-200/20 flex items-center gap-2 border border-white/20 animate-in fade-in zoom-in duration-700 font-black">
            <Zap size={14} className="fill-current text-yellow-300" />
            <span>{Math.round(product.score * 100)}% {t.matchScore}</span>
          </div>
        )}
        {/* Best Value Badge */}
        {isHighlyRecommended && (
          <BadgeBase className="bg-amber-500/90 backdrop-blur-md text-[9px]">
            <TrendingDown size={12} />
            <span>{t.bestValueBadge}</span>
          </BadgeBase>
        )}
      </div>

      {/* Verified Badge */}
      {bestOffer?.is_verified && (
        <div className="absolute top-5 end-5 z-30">
          <BadgeBase className="bg-green-500/90 backdrop-blur-md text-[9px]">
            <ShieldCheck size={14} />
            <span>{t.verifiedBadge}</span>
          </BadgeBase>
        </div>
      )}

      {/* Product Image Section */}
      <div className="relative pt-[90%] bg-gray-50/50 dark:bg-slate-900/20 overflow-hidden">
        <SmartImage 
          src={product.thumbnail_url} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full p-8 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* AI Insight Box - Glassmorphism */}
        {hasAIReasons && (
          <div className="absolute bottom-4 inset-x-4 z-20 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-4 rounded-[1.8rem] shadow-2xl shadow-black/5 ring-1 ring-black/5">
              {/* AI Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-1.5 rounded-xl shrink-0 shadow-lg shadow-indigo-200">
                    <Zap size={12} className="text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">
                    {lang === 'ar' ? 'تحليل أبخص الذكي' : 'Abkhas Smart Logic'}
                  </span>
                </div>
                <div className="text-[8px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">
                  {t.confidenceHigh}
                </div>
              </div>
              
              {/* Reasons List */}
              <ul className="space-y-1.5">
                {aiReasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className={`flex items-start gap-2 ${isExplaining && reason.includes('...') ? 'animate-pulse' : ''}`}>
                    <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1 leading-snug">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow text-start">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-black tracking-[0.2em]">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-lg">
            <Star size={10} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">{bestOffer?.rating_average}</span>
          </div>
        </div>
        
        <h3 className="font-black text-gray-800 dark:text-white text-base mb-5 h-12 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SpecItem icon={<Cpu size={16} className="text-indigo-500 mb-1" />} value={`${product.key_specs.ram_gb}GB`} />
          <SpecItem icon={<Camera size={16} className="text-indigo-500 mb-1" />} value={`${product.key_specs.camera_mp}MP`} />
          <SpecItem icon={<Battery size={16} className="text-indigo-500 mb-1" />} value={product.key_specs.battery_mah} />
        </div>

        {/* Footer: Price & Action */}
        <div className="mt-auto pt-5 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex flex-col flex-1">
            <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {t.totalValue}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                {(bestOffer?.price || 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{t.sar}</span>
            </div>
            {/* Free Shipping Badge */}
            {bestOffer?.shipping_cost === 0 && (
              <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase mt-1">
                + {t.freeShipping}
              </span>
            )}
          </div>
          
          {/* Arrow Button */}
          <div className="p-3 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-300 shadow-sm active:scale-90">
            {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
