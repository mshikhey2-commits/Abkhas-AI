
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { MOCK_PRODUCTS } from '../constants';
import { ArrowRight, Trophy, Cpu, Camera, Battery, Smartphone, Trash2 } from 'lucide-react';

const ComparePage: React.FC = () => {
  const { compareList, toggleCompare, lang, navigate } = useAppContext();
  const t = translations[lang];

  const products = useMemo(() => 
    compareList.map(id => MOCK_PRODUCTS.find(p => p.product_id === id)).filter(Boolean),
  [compareList]);

  if (products.length === 0) {
    navigate('home');
    return null;
  }

  const getWinner = (key: 'ram_gb' | 'camera_mp' | 'battery_mah' | 'price') => {
    if (products.length < 2) return null;
    if (key === 'price') {
      const prices = products.map(p => p!.offers?.[0]?.price || Infinity);
      const min = Math.min(...prices);
      return products.find(p => p!.offers?.[0]?.price === min)?.product_id;
    }
    const values = products.map(p => p!.key_specs[key] || 0);
    const max = Math.max(...values);
    return products.find(p => p!.key_specs[key] === max)?.product_id;
  };

  return (
    <div className="pb-24">
      <button 
        onClick={() => navigate('home')}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors group"
      >
        <ArrowRight size={18} className={`${lang === 'ar' ? 'ml-2' : 'mr-2 rotate-180'} group-hover:-translate-x-1 transition-transform`} />
        {t.back}
      </button>

      <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-8">{t.comparisonMatrix}</h1>

      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-tr-3xl"></th>
              {products.map(p => (
                <th key={p!.product_id} className="p-4 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                  <div className="relative group">
                    <button 
                      onClick={() => toggleCompare(p!.product_id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <img src={p!.thumbnail_url} alt={p!.name} className="w-24 h-24 mx-auto object-contain mb-2" />
                    <p className="text-xs font-black dark:text-white line-clamp-2">{p!.name}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {/* Price Row */}
            <tr className="bg-white dark:bg-slate-800">
              <td className="p-6 font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <Smartphone size={18} /> {t.price}
              </td>
              {products.map(p => {
                const isWinner = getWinner('price') === p!.product_id;
                return (
                  <td key={p!.product_id} className={`p-6 text-center font-black ${isWinner ? 'text-green-600' : 'dark:text-white'}`}>
                    {p!.offers?.[0]?.price.toLocaleString()} {t.sar}
                    {isWinner && <div className="text-[10px] text-green-500 flex items-center justify-center gap-1 mt-1"><Trophy size={10} /> {t.winner}</div>}
                  </td>
                );
              })}
            </tr>
            {/* Camera Row */}
            <tr className="bg-gray-50/50 dark:bg-slate-900/20">
              <td className="p-6 font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <Camera size={18} /> {t.camera}
              </td>
              {products.map(p => {
                const isWinner = getWinner('camera_mp') === p!.product_id;
                return (
                  <td key={p!.product_id} className={`p-6 text-center font-bold ${isWinner ? 'text-indigo-600' : 'dark:text-slate-300'}`}>
                    {p!.key_specs.camera_mp} MP
                    {isWinner && <div className="text-[10px] text-indigo-500 flex items-center justify-center gap-1 mt-1"><Trophy size={10} /> {t.winner}</div>}
                  </td>
                );
              })}
            </tr>
            {/* Performance Row */}
            <tr className="bg-white dark:bg-slate-800">
              <td className="p-6 font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <Cpu size={18} /> {t.performance}
              </td>
              {products.map(p => {
                const isWinner = getWinner('ram_gb') === p!.product_id;
                return (
                  <td key={p!.product_id} className={`p-6 text-center font-bold ${isWinner ? 'text-indigo-600' : 'dark:text-slate-300'}`}>
                    {p!.key_specs.ram_gb} GB RAM
                    {isWinner && <div className="text-[10px] text-indigo-500 flex items-center justify-center gap-1 mt-1"><Trophy size={10} /> {t.winner}</div>}
                  </td>
                );
              })}
            </tr>
            {/* Battery Row */}
            <tr className="bg-gray-50/50 dark:bg-slate-900/20">
              <td className="p-6 font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <Battery size={18} /> {t.battery}
              </td>
              {products.map(p => {
                const isWinner = getWinner('battery_mah') === p!.product_id;
                return (
                  <td key={p!.product_id} className={`p-6 text-center font-bold ${isWinner ? 'text-indigo-600' : 'dark:text-slate-300'}`}>
                    {p!.key_specs.battery_mah} mAh
                    {isWinner && <div className="text-[10px] text-indigo-500 flex items-center justify-center gap-1 mt-1"><Trophy size={10} /> {t.winner}</div>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
