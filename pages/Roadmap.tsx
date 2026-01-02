
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Rocket, 
  Clock, 
  CheckCircle2, 
  ChevronUp, 
  MessageSquarePlus, 
  BrainCircuit, 
  Store, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { RoadmapItem } from '../types';

const INITIAL_ROADMAP: RoadmapItem[] = [
  {
    id: 'r1',
    title: 'توسع لفئة اللابتوبات',
    description: 'إضافة محرك تحليل مواصفات اللابتوبات ومقارنة الأسعار بين جرير وأمازون.',
    status: 'in-progress',
    votes: 1240,
    category: 'Stores'
  },
  {
    id: 'r2',
    title: 'رادار العروض اللحظي',
    description: 'تنبيهات فورية بخصومات "الفلاش سيل" في المتاجر السعودية الكبرى.',
    status: 'planned',
    votes: 850,
    category: 'AI'
  },
  {
    id: 'r3',
    title: 'التعرف الصوتي المتقدم',
    description: 'إمكانية مقارنة المنتجات عبر الأوامر الصوتية باللهجة السعودية.',
    status: 'planned',
    votes: 420,
    category: 'UX'
  },
  {
    id: 'r4',
    title: 'مقارنة قطع الأثاث',
    description: 'دعم متاجر الأثاث الكبرى مثل ايكيا وهوم سنتر مع مقارنة المقاسات.',
    status: 'planned',
    votes: 2100,
    category: 'Stores'
  },
  {
    id: 'r5',
    title: 'محرك البحث البصري 2.0',
    description: 'تحسين دقة التعرف على موديلات الجوالات من خلال صورة الكاميرا.',
    status: 'launched',
    votes: 3500,
    category: 'AI'
  },
  {
    id: 'r6',
    title: 'تحدي ذكاء أبخص',
    description: 'ميزة تفاعلية لتدريب عقل أبخص وزيادة دقة التوصيات.',
    status: 'launched',
    votes: 1800,
    category: 'UX'
  }
];

const Roadmap: React.FC = () => {
  const { lang, navigate } = useAppContext();
  const t = translations[lang];
  const { trigger } = useHaptics();
  const [items, setItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP);

  const handleVote = (id: string) => {
    // 🟥 CRITICAL_STATE_CONSOLIDATION: Consolidated vote feedback
    setItems(prev => prev.map(item => {
      if (item.id === id && !item.isVoted) {
        trigger('success');
        return { ...item, votes: item.votes + 1, isVoted: true };
      }
      return item;
    }));
  };

  const getCategoryIcon = (cat: RoadmapItem['category']) => {
    switch (cat) {
      case 'AI': return <BrainCircuit size={14} />;
      case 'Stores': return <Store size={14} />;
      case 'UX': return <Zap size={14} />;
    }
  };

  // Fixed component typing to explicitly accept React component attributes like 'key'
  const RoadmapCard: React.FC<{ item: RoadmapItem }> = ({ item }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-[2rem] p-6 border transition-all flex flex-col h-full relative group ${item.isVoted ? 'border-indigo-600 shadow-lg' : 'border-gray-100 dark:border-slate-700 hover:border-indigo-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
          item.category === 'AI' ? 'bg-purple-50 text-purple-600' : 
          item.category === 'Stores' ? 'bg-amber-50 text-amber-600' : 
          'bg-indigo-50 text-indigo-600'
        }`}>
          {getCategoryIcon(item.category)}
          {item.category}
        </span>
        {item.status !== 'launched' && (
          <button 
            onClick={() => handleVote(item.id)}
            disabled={item.isVoted}
            className={`flex flex-col items-center gap-0.5 transition-all ${item.isVoted ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}
          >
            <ChevronUp size={24} className={`${item.isVoted ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
            <span className="text-xs font-black">{item.votes.toLocaleString()}</span>
          </button>
        )}
      </div>

      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">{item.title}</h3>
      <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-6 flex-grow leading-relaxed">
        {item.description}
      </p>

      {item.status === 'launched' && (
        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
           <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
             <CheckCircle2 size={14} /> {t.launched}
           </span>
           <span className="text-[10px] font-black text-gray-400">
             {item.votes.toLocaleString()} {lang === 'ar' ? 'مؤيد' : 'Supporters'}
           </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => navigate('home')} className="flex items-center text-gray-500 hover:text-indigo-600 font-black transition-all group">
          <ArrowRight size={20} className={`${lang === 'ar' ? 'ms-0 me-2' : 'me-2 rotate-180'}`} />
          {t.back}
        </button>
        <button className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
          <MessageSquarePlus size={20} />
          {t.suggestFeature}
        </button>
      </div>

      <div className="text-center mb-20">
         <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] text-indigo-600 mb-6">
            <Rocket size={48} />
         </div>
         <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">{t.roadmapTitle}</h1>
         <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
           {t.roadmapSub}
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-start">
        {/* Planned Column */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2 mb-8">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Clock size={20} /></div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.planned}</h2>
           </div>
           <div className="space-y-6">
              {items.filter(i => i.status === 'planned').map(item => <RoadmapCard key={item.id} item={item} />)}
           </div>
        </section>

        {/* In Progress Column */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2 mb-8">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Zap size={20} /></div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.inProgress}</h2>
           </div>
           <div className="space-y-6">
              {items.filter(i => i.status === 'in-progress').map(item => <RoadmapCard key={item.id} item={item} />)}
           </div>
        </section>

        {/* Launched Column */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2 mb-8">
              <div className="p-2 bg-green-50 rounded-xl text-green-600"><CheckCircle2 size={20} /></div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.launched}</h2>
           </div>
           <div className="space-y-6 opacity-80">
              {items.filter(i => i.status === 'launched').map(item => <RoadmapCard key={item.id} item={item} />)}
           </div>
        </section>
      </div>

      <div className="mt-24 p-12 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm text-center">
         <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
           {lang === 'ar' ? 'صوتك يصنع الفرق' : 'Your Vote Matters'}
         </h3>
         <p className="text-gray-500 font-medium max-w-xl mx-auto">
           {lang === 'ar' ? 'كل تصويت يساعدنا في تحديد أولويات التطوير. شاركنا الميزات اللي تتمنى تشوفها في "أبخص".' : 'Every vote helps us prioritize what to build next. Tell us which features you want to see most.'}
         </p>
      </div>
    </div>
  );
};

export default Roadmap;
