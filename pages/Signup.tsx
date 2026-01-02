import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ChevronRight, Smartphone, User, Shield, Zap } from 'lucide-react';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';
import { registerWithEmail, registerWithPhone, validateEmail, validateSaudiPhone } from '../services/authService';

interface SignupPageProps {
  lang: 'ar' | 'en';
}

type SignupMethod = 'email' | 'phone';

interface PasswordStrength {
  level: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score <= 1) level = 'weak';
  else if (score === 2) level = 'fair';
  else if (score === 3) level = 'good';
  else level = 'strong';

  return { level, score };
};

const Signup: React.FC<SignupPageProps> = ({ lang }) => {
  const { navigate } = useAppContext();
  const t = translations[lang];

  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const getStrengthColor = () => {
    switch (passwordStrength.level) {
      case 'weak':
        return 'bg-red-500 dark:bg-red-600';
      case 'fair':
        return 'bg-orange-500 dark:bg-orange-600';
      case 'good':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'strong':
        return 'bg-green-500 dark:bg-green-600';
    }
  };

  const getStrengthText = () => {
    const strengthText = {
      weak: lang === 'ar' ? 'ضعيفة' : 'Weak',
      fair: lang === 'ar' ? 'معقولة' : 'Fair',
      good: lang === 'ar' ? 'جيدة' : 'Good',
      strong: lang === 'ar' ? 'قوية' : 'Strong'
    };
    return strengthText[passwordStrength.level];
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return lang === 'ar' ? 'يرجى إدخال اسمك' : 'Please enter your name';
    }

    if (signupMethod === 'email') {
      if (!email) {
        return lang === 'ar' ? 'يرجى إدخال بريدك الإلكتروني' : 'Please enter your email';
      }
      if (!validateEmail(email)) {
        return lang === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
      }
    } else {
      if (!phone) {
        return lang === 'ar' ? 'يرجى إدخال رقم جوالك' : 'Please enter your phone number';
      }
      if (!validateSaudiPhone(phone)) {
        return lang === 'ar' ? 'رقم جوال سعودي غير صحيح' : 'Invalid Saudi phone number';
      }
    }

    if (!password) {
      return lang === 'ar' ? 'يرجى إدخال كلمة مرور' : 'Please enter a password';
    }

    if (password.length < 8) {
      return lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      return lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    if (!agreeTerms) {
      return lang === 'ar' ? 'يجب قبول الشروط والأحكام' : 'You must accept the terms and conditions';
    }

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (signupMethod === 'email') {
        response = await registerWithEmail(email.trim(), password, name.trim());
      } else {
        response = await registerWithPhone(phone.trim(), password, name.trim());
      }

      if (response.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setAgreeTerms(false);

        // Navigate to home after successful signup
        setTimeout(() => {
          navigate('home');
        }, 1500);
      } else {
        setError(response.message || (lang === 'ar' ? 'فشل التسجيل' : 'Signup failed'));
      }
    } catch (err) {
      setError(lang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-3xl mb-6 group">
            <Zap className="w-8 h-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            {lang === 'ar' ? 'انضم إلى ملايين المتسوقين الذكيين' : 'Join millions of smart shoppers'}
          </p>
        </div>

        {/* Method Selector */}
        <div className="flex gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => {
              setSignupMethod('email');
              setError('');
            }}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm transition-all ${
              signupMethod === 'email'
                ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-200/20 dark:shadow-green-900/30'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-green-300 dark:hover:border-green-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Mail size={18} />
              <span>{lang === 'ar' ? 'البريد' : 'Email'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setSignupMethod('phone');
              setError('');
            }}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm transition-all ${
              signupMethod === 'phone'
                ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-200/20 dark:shadow-green-900/30'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-green-300 dark:hover:border-green-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={18} />
              <span>{lang === 'ar' ? 'الجوال' : 'Phone'}</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Name Input */}
          <div className="relative">
            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
              {lang === 'ar' ? 'الاسم' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'John Doe'}
                className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Email Input */}
          {signupMethod === 'email' && (
            <div className="relative">
              <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'you@example.com' : 'you@example.com'}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* Phone Input */}
          {signupMethod === 'phone' && (
            <div className="relative">
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
                  className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all font-semibold"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {lang === 'ar' ? '✓ صيغ مقبولة: 05XXXXXXXX, 0501234567, 966501234567' : '✓ Accepted formats: 05XXXXXXXX, 0501234567, 966501234567'}
              </p>
            </div>
          )}

          {/* Password Input */}
          <div className="relative">
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
                className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-12 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-4 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-gray-600 dark:text-slate-300">{getStrengthText()}</span>
                </div>
                <ul className="text-xs text-gray-500 dark:text-slate-400 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                    ✓ {lang === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
                  </li>
                  <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                    ✓ {lang === 'ar' ? 'أحرف كبيرة وصغيرة' : 'Uppercase and lowercase'}
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                    ✓ {lang === 'ar' ? 'أرقام' : 'Numbers'}
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400'}>
                    {lang === 'ar' ? '(اختياري) رموز خاصة' : '(Optional) Special characters'}
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-[0.1em]">
              {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative">
              <Lock className="absolute start-4 top-4 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang === 'ar' ? '••••••••' : '••••••••'}
                className="w-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl ps-12 pe-12 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute end-4 top-4 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {lang === 'ar' ? '✗ كلمات المرور غير متطابقة' : '✗ Passwords do not match'}
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {lang === 'ar' ? '✓ كلمات المرور متطابقة' : '✓ Passwords match'}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 rounded-lg mt-0.5 cursor-pointer accent-green-600"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-slate-300 cursor-pointer leading-relaxed">
              {lang === 'ar' ? (
                <>
                  أوافق على <span className="font-black text-blue-600 dark:text-blue-400">الشروط والأحكام</span> و<span className="font-black text-blue-600 dark:text-blue-400">سياسة الخصوصية</span>
                </>
              ) : (
                <>
                  I agree to the <span className="font-black text-blue-600 dark:text-blue-400">Terms & Conditions</span> and <span className="font-black text-blue-600 dark:text-blue-400">Privacy Policy</span>
                </>
              )}
            </label>
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
                {lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!'}
              </p>
            </div>
          )}

          {/* Signup Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-600 dark:hover:bg-green-500 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-green-200/30 dark:shadow-green-900/30 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <span>{lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}</span>
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-300 font-semibold">
            {lang === 'ar' ? 'هل لديك حساب؟' : 'Already have an account?'}
            <button
              onClick={() => navigate('login')}
              className="text-green-600 dark:text-green-400 font-black ms-2 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              {lang === 'ar' ? 'دخول' : 'Login'}
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

export default Signup;
