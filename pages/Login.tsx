import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';
import { loginWithEmail, loginWithPhone } from '../services/authService';

interface LoginPageProps {
  lang: 'ar' | 'en';
}

type LoginMethod = 'email' | 'phone';

const LoginPage: React.FC<LoginPageProps> = ({ lang }) => {
  const { navigate } = useAppContext();
  const t = translations[lang];

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      let response;

      if (loginMethod === 'email') {
        if (!email || !password) {
          setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
          setIsLoading(false);
          return;
        }
        response = await loginWithEmail(email.trim(), password);
      } else {
        if (!phone || !password) {
          setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
          setIsLoading(false);
          return;
        }
        response = await loginWithPhone(phone.trim(), password);
      }

      if (response.success) {
        setSuccess(true);
        setEmail('');
        setPhone('');
        setPassword('');
        
        // Navigate to home after successful login
        setTimeout(() => {
          navigate('home');
        }, 1500);
      } else {
        // Show specific error for account lockout
        setError(response.message || (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
      }
    } catch (err) {
      setError(lang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl mb-6 group">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            {lang === 'ar' ? 'استمتع بتجربة التسوق الذكية' : 'Enjoy smart shopping'}
          </p>
        </div>

        {/* Method Selector */}
        <div className="flex gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => {
              setLoginMethod('email');
              setError('');
            }}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm transition-all ${
              loginMethod === 'email'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200/20 dark:shadow-indigo-900/30'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Mail size={18} />
              <span>{lang === 'ar' ? 'البريد' : 'Email'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setLoginMethod('phone');
              setError('');
            }}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm transition-all ${
              loginMethod === 'phone'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200/20 dark:shadow-indigo-900/30'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={18} />
              <span>{lang === 'ar' ? 'الجوال' : 'Phone'}</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-in">
          {/* Email Input */}
          {loginMethod === 'email' && (
            <div className="relative group">
              <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'you@example.com'}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* Phone Input */}
          {loginMethod === 'phone' && (
            <div className="relative group">
              <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
                {lang === 'ar' ? 'رقم الجوال السعودي' : 'Saudi Phone Number'}
              </label>
              <div className="relative">
                <Smartphone className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === 'ar' ? '05XXXXXXXX أو 966XXXXXXXX' : '05XXXXXXXX'}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-semibold"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {lang === 'ar' ? '✓ صيغ مقبولة: 05XXXXXXXX, 0501234567, 966501234567' : '✓ Accepted formats: 05XXXXXXXX, 0501234567, 966501234567'}
              </p>
            </div>
          )}

          {/* Password Input */}
          <div className="relative group">
            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'ar' ? '••••••••' : '••••••••'}
                className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-12 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-4 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 font-semibold text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
                {lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!'}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/30 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
              </>
            ) : (
              <>
                <span>{lang === 'ar' ? 'دخول' : 'Login'}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-semibold">
              {lang === 'ar' ? 'أو' : 'or'}
            </span>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-300 font-semibold">
            {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
            <button
              onClick={() => navigate('signup')}
              className="text-indigo-600 dark:text-indigo-400 font-black ms-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {lang === 'ar' ? 'سجل الآن' : 'Sign up now'}
            </button>
          </p>
        </div>

        {/* Back Home */}
        <button
          onClick={() => navigate('home')}
          className="w-full mt-6 text-gray-600 dark:text-slate-400 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-semibold"
        >
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
