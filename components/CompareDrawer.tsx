
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { X, ArrowLeftRight, Smartphone } from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';

const CompareDrawer: React.FC = () => {
  const { compareList, toggleCompare, lang, navigate } = useAppContext();
  const t = translations[lang];

  if (compareList.length === 0) return null;

  const selectedProducts = compareList.map(id => MOCK_PRODUCTS.find(p => p.product_id === id)).filter(Boolean);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-700 p-4 animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden md:flex items-center gap-2 text-indigo-600 font-bold">
            <ArrowLeftRight size={20} />
            <span className="text-sm">{t.compare} ({compareList.length}/3)</span>
          </div>
          <div className="flex -space-x-reverse space-x-2">
            {selectedProducts.map(p => (
              <div key={p?.product_id} className="relative group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 p-1">
                  <img src={p?.thumbnail_url} alt={p?.name} className="w-full h-full object-contain" />
                </div>
                <button 
                  onClick={() => toggleCompare(p!.product_id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {compareList.length < 3 && (
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-300">
                <Smartphone size={20} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('compare')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
          >
            {t.compareNow}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
