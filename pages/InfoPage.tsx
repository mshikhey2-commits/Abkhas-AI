
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { 
  ArrowRight, ShieldCheck, FileText, Info as InfoIcon, Target, 
  Lightbulb, Zap, Globe, Lock, Eye, ShoppingCart, AlertCircle, 
  Mail, Phone, MapPin, Send, MessageSquare, Twitter, Instagram, Youtube, MessageCircle
} from 'lucide-react';

interface InfoPageProps {
  type: 'about' | 'privacy' | 'terms' | 'contact';
}

const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  const { lang, navigate } = useAppContext();
  const t = translations[lang];
  const [formSent, setFormSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  const content = {
    about: {
      title: t.aboutUs,
      icon: <InfoIcon size={32} className="text-indigo-600" />,
      text: lang === 'ar' ? (
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><Zap className="text-indigo-600" size={20} /></div>
              قصة "أبخص" وفلسفتنا
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-slate-300 text-start">
              كلمة "أبخص" في اللهجة السعودية تعني الشخص الأكثر خبرة ودراية بالأمور. ومن هنا استلهمنا اسم تطبيقنا؛ لنكون الخبير الذي يثق به المتسوق السعودي قبل اتخاذ أي قرار شرائي. نحن فريق من المهندسين والمحللين السعوديين نؤمن بأن الذكاء الاصطناعي يجب أن يسخر لخدمة جودة حياة المواطن وتوفير ماله.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-700 p-8 rounded-[2rem] border border-indigo-100 dark:border-slate-600 shadow-sm">
              <Target className="text-indigo-600 mb-4" size={32} />
              <h3 className="font-black text-xl mb-3">رؤيتنا 2030</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">نسعى لأن نكون المحرك الأول للتجارة الإلكترونية الذكية في المنطقة، ممتثلين لأعلى معايير الرقمنة والابتكار التي تدعمها رؤية المملكة، لتعزيز اقتصاد رقمي قوي وشفاف.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-700 p-8 rounded-[2rem] border border-blue-100 dark:border-slate-600 shadow-sm">
              <Lightbulb className="text-blue-600 mb-4" size={32} />
              <h3 className="font-black text-xl mb-3">محرك أبخص الذكي</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">نستخدم تقنيات Google Gemini 3 المتطورة التي لا تكتفي بمقارنة السعر، بل تحلل "قيمة المنتج" الحقيقية بناءً على الضمان، الوكيل، سرعة التوصيل، وتجارب المستخدمين الحية.</p>
            </div>
          </div>

          <section className="p-10 bg-indigo-600 rounded-[2.5rem] text-white overflow-hidden relative text-start">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-6">لماذا يثق بنا الآلاف؟</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "استقلالية تامة", desc: "نحن لا نتبع لأي متجر، حيادنا هو سر قوتنا." },
                  { title: "بيانات لحظية", desc: "أسعارنا تتحدث كل دقيقة لضمان العرض الأفضل." },
                  { title: "دعم محلي", desc: "نفهم السوق السعودي وتفاصيل الضمان والوكلاء." },
                  { title: "أمان البيانات", desc: "خصوصيتك اولوية لنا ومشفرة بأحدث التقنيات." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <h4 className="font-black mb-2">{item.title}</h4>
                    <p className="text-xs opacity-80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <Zap size={200} className="absolute -bottom-10 -left-10 text-white/5 rotate-12" />
          </section>
        </div>
      ) : (
        <div className="space-y-10 text-start">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><Zap className="text-indigo-600" size={20} /></div>
              The Abkhas Story
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-slate-300">
              The word "Abkhas" in Saudi dialect means "the one who knows best." We inspired our name from this concept to be the expert every Saudi shopper trusts. We are a team of Saudi engineers dedicated to harnessing AI to improve citizens' quality of life and save their money.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-700 p-8 rounded-[2rem] border border-indigo-100 dark:border-slate-600 shadow-sm">
              <Target className="text-indigo-600 mb-4" size={32} />
              <h3 className="font-black text-xl mb-3">Vision 2030</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">We aim to be the first driver of smart e-commerce in the region, complying with the highest standards of digitalization supported by the Saudi Vision.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-700 p-8 rounded-[2rem] border border-blue-100 dark:border-slate-600 shadow-sm">
              <Lightbulb className="text-blue-600 mb-4" size={32} />
              <h3 className="font-black text-xl mb-3">Abkhas AI Engine</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">Using Google Gemini 3 tech, we don't just compare prices; we analyze "Product Value" based on warranty, agents, and live user experiences.</p>
            </div>
          </div>
        </div>
      )
    },
    contact: {
      title: t.contactUs,
      icon: <MessageSquare size={32} className="text-indigo-600" />,
      text: (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center hover:-translate-y-2 transition-transform">
               <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4"><Mail size={24} /></div>
               <h4 className="font-black mb-2">{t.emailUs}</h4>
               <p className="text-xs text-gray-500">support@abkhas.sa</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center hover:-translate-y-2 transition-transform">
               <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4"><MessageCircle size={24} /></div>
               <h4 className="font-black mb-2">{t.callUs}</h4>
               <p className="text-xs text-gray-500" dir="ltr">+966 800 123 4567</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center hover:-translate-y-2 transition-transform">
               <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4"><MapPin size={24} /></div>
               <h4 className="font-black mb-2">{t.location}</h4>
               <p className="text-xs text-gray-500">{lang === 'ar' ? 'جدة، المملكة العربية السعودية' : 'Jeddah, Saudi Arabia'}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-700">
             {!formSent ? (
               <form onSubmit={handleSend} className="space-y-6 text-start">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                      <input required type="text" className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input required type="email" className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t.messageSubject}</label>
                    <input required type="text" className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t.messageText}</label>
                    <textarea required rows={5} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95">
                    {t.sendMessage} <Send size={20} />
                  </button>
               </form>
             ) : (
               <div className="text-center py-10 animate-in zoom-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={40} /></div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{lang === 'ar' ? 'تم استلام رسالتك!' : 'Message Received!'}</h3>
                  <p className="text-gray-500">{lang === 'ar' ? 'سنقوم بالرد عليك خلال أقل من 24 ساعة.' : 'We will respond within 24 hours.'}</p>
               </div>
             )}
          </div>
        </div>
      )
    },
    privacy: {
      title: t.privacyPolicy,
      icon: <ShieldCheck size={32} className="text-green-600" />,
      text: lang === 'ar' ? (
        <div className="space-y-8 text-start">
          <p className="italic text-gray-500">آخر تحديث: ديسمبر 2024</p>
          <section className="space-y-4">
             <h2 className="text-xl font-bold flex items-center gap-2"><Eye className="text-green-600" /> شفافية البيانات</h2>
             <p className="text-gray-600 dark:text-slate-300">في "أبخص"، لا نجمع إلا ما نحتاجه لنخدمك بشكل أفضل. بيانات تفضيلاتك (مثل نوع الجوال المفضل أو الميزانية) نستخدمها لتخصيص نتائج البحث، ولا نشاركها مع أي طرف إعلاني خارجي.</p>
          </section>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800">
             <h4 className="font-black mb-4 flex items-center gap-2"><Lock size={18} className="text-indigo-600" /> التزامنا الأمني</h4>
             <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex gap-2">✓ جميع الصور التي ترفعها للبحث البصري تُحذف فور التعرف على المنتج.</li>
                <li className="flex gap-2">✓ نستخدم بروتوكول TLS 1.3 لتشفير جميع الاتصالات.</li>
                <li className="flex gap-2">✓ يمكنك تصفير جميع بياناتك من ملفك الشخصي بضغطة زر واحدة.</li>
             </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-8 text-start">
          <p className="italic text-gray-500">Last Updated: Dec 2024</p>
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Eye className="text-green-600" /> Data Transparency</h2>
            <p>At Abkhas, we only collect what we need to serve you better. Your preference data (budget, brands) is used only to personalize search results and is never shared with external advertisers.</p>
          </section>
        </div>
      )
    },
    terms: {
      title: t.termsOfService,
      icon: <FileText size={32} className="text-orange-600" />,
      text: lang === 'ar' ? (
        <div className="space-y-8 text-start">
          <section className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-3xl border border-orange-100 dark:border-orange-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertCircle className="text-orange-600" /> إخلاء مسؤولية هام</h2>
            <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-400">
              "أبخص" هو محرك ذكاء اصطناعي للبحث والمقارنة فقط. نحن لسنا متجراً، ولا نقوم بعمليات البيع أو الشحن. العقد القانوني لعملية الشراء يتم بينك وبين المتجر الذي يتم توجيهك إليه (مثل جرير، أمازون، إلخ). أي مشكلة تتعلق بجودة المنتج أو الشحن يجب مراجعة المتجر البائع فيها.
            </p>
          </section>
          <section>
             <h2 className="text-xl font-bold mb-4">روابط الأفلييت (Affiliate)</h2>
             <p className="text-gray-600 dark:text-slate-300">للحفاظ على استمرارية الخدمة مجانية، قد نحصل على عمولة بسيطة عند شرائك عبر الروابط الموجودة في التطبيق. هذه العمولة لا تزيد من سعر المنتج عليك إطلاقاً، بل تدفعها المتاجر لنا كرسوم تسويق.</p>
          </section>
        </div>
      ) : (
        <div className="space-y-8 text-start">
          <section className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-3xl border border-orange-100 dark:border-orange-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertCircle className="text-orange-600" /> Important Disclaimer</h2>
            <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-400">
              Abkhas is an AI search and comparison engine only. We are not a store, and we do not handle sales or shipping. The legal contract for purchase is between you and the redirected store (e.g., Jarir, Amazon).
            </p>
          </section>
        </div>
      )
    }
  };

  const activeContent = content[type] || content.about;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <button 
        onClick={() => navigate('home')}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors group"
      >
        <ArrowRight size={18} className={`${lang === 'ar' ? 'ml-2' : 'mr-2 rotate-180'} group-hover:-translate-x-1 transition-transform`} />
        {t.back}
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-14 shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           {activeContent.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl shadow-inner">
              {activeContent.icon}
            </div>
            <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
              {activeContent.title}
            </h1>
          </div>

          <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 leading-relaxed text-lg">
            {activeContent.text}
          </div>
        </div>
      </div>

      <div className="mt-16 pt-12 border-t border-gray-100 dark:border-slate-800 text-center">
        <div className="flex justify-center gap-6 mb-8">
           <a href="#" className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 hover:text-blue-500 transition-all shadow-sm"><Twitter size={20} /></a>
           <a href="#" className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 hover:text-pink-500 transition-all shadow-sm"><Instagram size={20} /></a>
           <a href="#" className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 hover:text-red-600 transition-all shadow-sm"><Youtube size={20} /></a>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">&copy; 2025 Abkhas AI. Made with 🇸🇦 in Jeddah</p>
      </div>
    </div>
  );
};

export default InfoPage;
