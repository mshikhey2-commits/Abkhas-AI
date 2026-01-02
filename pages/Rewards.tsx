
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Trophy, Coins, Flame, CheckCircle2, 
  Gift, ArrowUpRight, Crown, Star, 
  Sparkles, BarChart3, Share2, Camera, Scale, ShieldCheck, Zap
} from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

const Rewards: React.FC = () => {
  const { lang, userPrefs, navigate } = useAppContext();
  const t = translations[lang];
  const { trigger } = useHaptics();
  const loyalty = userPrefs.loyalty!;
  const [selectedRankDisplay, setSelectedRankDisplay] = useState(loyalty.rank);

  const missions = loyalty.missions;
  const progress = (loyalty.points / loyalty.next_rank_points) * 100;

  const iconMap: any = {
    Scale: <Scale size={20} />,
    Camera: <Camera size={20} />,
    Share: <Share2 size={20} />
  };

  const ranks = [
    { id: 'Shopper', name: t.shopper, desc: t.shopperDesc, min: 0, icon: <Trophy size={20} />, perks: t.perksShopper },
    { id: 'Expert', name: t.expert, desc: t.expertDesc, min: 5000, icon: <Zap size={20} />, perks: t.perksExpert },
    { id: 'Abkhas', name: t.abkhas, desc: t.abkhasDesc, min: 15000, icon: <Crown size={20} />, perks: t.perksAbkhas }
  ];

  const currentSelectedRank = ranks.find(r => r.id === selectedRankDisplay) || ranks[0];

  const giftCards = [
    { name: t.giftCardJarir, points: 5000, color: 'bg-red-500' },
    { name: t.giftCardAmazon, points: 10000, color: 'bg-amber-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Hero Stats Card */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl mb-12">
        <div className="absolute top-0 end-0 p-12 opacity-10 pointer-events-none rotate-12">
           <Trophy size={400} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-start">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full mb-8 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-400/20">
              <Crown size={14} className="fill-current" />
              {t[loyalty.rank.toLowerCase() as keyof typeof t]}
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
              {t.loyaltyTitle}
            </h1>
            <p className="text-indigo-200 text-lg font-medium opacity-80 max-w-md">
              اكسب النقاط مع كل خطوة توفير تقوم بها واستبدلها بهدايا حقيقية من شركائنا.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10">
            <div className="flex justify-between items-end mb-8">
               <div className="text-start">
                  <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{t.abkhasCoins}</div>
                  <div className="text-5xl font-black flex items-center gap-3">
                     <Coins size={36} className="text-amber-400 fill-amber-400" />
                     {loyalty.points.toLocaleString()}
                  </div>
               </div>
               <div className="text-end">
                  <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{t.dailyStreak}</div>
                  <div className="text-3xl font-black flex items-center gap-2 justify-end text-orange-400">
                     <Flame size={24} className="fill-current" />
                     {loyalty.daily_streak} {lang === 'ar' ? 'أيام' : 'Days'}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest text-indigo-200">
                  <span>{t[loyalty.rank.toLowerCase() as keyof typeof t]}</span>
                  <span>{t.nextRank}: {loyalty.rank === 'Shopper' ? t.expert : t.abkhas}</span>
               </div>
               <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
               </div>
               <div className="text-center text-[10px] font-bold text-indigo-300">
                  {loyalty.next_rank_points - loyalty.points} {t.pointsNeeded}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranks Definitions */}
      <section className="mb-20">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 text-start">{lang === 'ar' ? 'نظام الرتب' : 'Rank System'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {ranks.map(r => (
             <button 
                key={r.id} 
                onClick={() => { trigger('light'); setSelectedRankDisplay(r.id as any); }}
                className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden text-start group ${selectedRankDisplay === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-indigo-200'}`}
             >
                {loyalty.rank === r.id && <div className={`absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedRankDisplay === r.id ? 'text-white' : 'text-indigo-600'}`}>{lang === 'ar' ? 'رتبتك الحالية' : 'Current'}</div>}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${selectedRankDisplay === r.id ? 'bg-white text-indigo-600' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 group-hover:text-indigo-600'}`}>
                   {r.icon}
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">{r.name}</h3>
                <p className={`text-sm mb-6 font-medium ${selectedRankDisplay === r.id ? 'text-indigo-100' : 'text-gray-500'}`}>{r.desc}</p>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedRankDisplay === r.id ? 'text-white/50' : 'text-gray-400'}`}>Min Points: {r.min.toLocaleString()}</div>
             </button>
           ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                <Sparkles size={28} className="text-indigo-600" />
                {t.missionsTitle}
             </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-start">
            {missions.map((m) => (
              <div key={m.id} className={`flex items-center p-6 rounded-[2rem] border transition-all ${m.completed ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50 opacity-70' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-indigo-200 shadow-sm'}`}>
                <div className={`p-4 rounded-2xl ms-0 me-6 ${m.completed ? 'bg-green-500 text-white' : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600'}`}>
                  {m.completed ? <CheckCircle2 size={24} /> : iconMap[m.icon]}
                </div>
                <div className="flex-1">
                  <h4 className={`font-black text-lg mb-1 ${m.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-800 dark:text-white'}`}>{m.title}</h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Coins size={12} className="text-amber-500" /> +{m.points} {t.abkhasCoins}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm text-start">
             <div className="flex items-center gap-3 mb-8">
                <BarChart3 size={24} className="text-indigo-600" />
                <h3 className="font-black text-xl text-gray-800 dark:text-white">{lang === 'ar' ? 'نشاطك الأسبوعي' : 'Weekly Activity'}</h3>
             </div>
             <div className="h-40 flex items-end justify-between gap-4 px-4">
                {[45, 80, 55, 95, 30, 60, 75].map((h, i) => (
                  <div key={i} className="flex-1 group relative">
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h*10} pts
                     </div>
                     <div className={`w-full rounded-t-xl transition-all duration-700 cursor-pointer ${i === 3 ? 'bg-indigo-600 shadow-lg' : 'bg-indigo-100 dark:bg-slate-700 hover:bg-indigo-200'}`} style={{ height: `${h}%` }}></div>
                  </div>
                ))}
             </div>
             <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
             </div>
          </div>
        </div>

        <div className="space-y-8 text-start">
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Star size={24} /></div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.rankPerks}</h2>
          </div>

          {/* Detailed Rank Perks Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8">
             <Star size={100} className="absolute -bottom-10 -end-10 text-white/10 rotate-12" />
             <h4 className="font-black text-2xl mb-6 flex items-center gap-3">
                {currentSelectedRank.icon} {currentSelectedRank.name}
             </h4>
             <ul className="space-y-4 relative z-10">
                {currentSelectedRank.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-3 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/20 transition-all">
                    <ShieldCheck size={20} className="text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold leading-tight">{perk}</span>
                  </li>
                ))}
             </ul>
             
             {loyalty.rank !== selectedRankDisplay && (
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                   <p className="text-xs font-black uppercase tracking-widest text-indigo-100 opacity-80">
                      {/* FIX: Corrected unintentional comparison by adding parentheses around ternary logic to correctly resolve the target rank ID */}
                      {progress < 100 ? `${t.nextRank}: ${ranks.find(r => r.id === (loyalty.rank === 'Shopper' ? 'Expert' : 'Abkhas'))?.name}` : 'Max Rank Reached'}
                   </p>
                </div>
             )}
          </div>

          <div className="flex items-center gap-4 mb-4">
             <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Gift size={24} /></div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.redeemTitle}</h2>
          </div>

          <div className="space-y-4">
             {giftCards.map((card, i) => (
               <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-2 h-full ${card.color}`}></div>
                  <div className="flex flex-col items-center text-center">
                     <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-white text-2xl font-black shadow-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                        {card.name.substring(0, 1)}
                     </div>
                     <h4 className="font-black text-xl text-gray-800 dark:text-white mb-2">{card.name}</h4>
                     <div className="flex items-center gap-2 mb-6">
                        <Coins size={16} className="text-amber-500 fill-amber-500" />
                        <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{card.points.toLocaleString()}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.abkhasCoins}</span>
                     </div>
                     <button disabled={loyalty.points < card.points} className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${loyalty.points >= card.points ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                        {loyalty.points >= card.points ? (lang === 'ar' ? 'استبدال الآن' : 'Redeem Now') : (lang === 'ar' ? 'رصيد غير كافٍ' : 'Low Balance')}
                        {loyalty.points >= card.points && <ArrowUpRight size={18} />}
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

export default Rewards;
