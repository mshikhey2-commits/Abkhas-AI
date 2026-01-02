import React, { useState, useEffect } from 'react';
import { Lock, Mail, Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { use2FA } from '../services/twoFactorAuth';

interface TwoFactorPageProps {
  email: string;
  onVerified: (token: string) => void;
  language?: 'ar' | 'en';
}

export const TwoFactorPage: React.FC<TwoFactorPageProps> = ({
  email,
  onVerified,
  language = 'en'
}) => {
  const isArabic = language === 'ar';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [resendLoading, setResendLoading] = useState(false);

  const twoFA = use2FA();

  useEffect(() => {
    // Get OTP status
    const status = twoFA.getStatus(email);
    if (status.exists) {
      setTimeRemaining(status.expiresIn || 0);
      setAttemptsRemaining(status.attemptsRemaining || 3);
    }
  }, [email]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError(isArabic ? 'أدخل الرمز الكامل' : 'Please enter the complete code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await twoFA.verify(email, code);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (result.token) {
            onVerified(result.token);
          }
        }, 1000);
      } else {
        setError(result.message);
        setCode('');
        // Update attempts
        const status = twoFA.getStatus(email);
        setAttemptsRemaining(status.attemptsRemaining || 3);
      }
    } catch (err) {
      setError(isArabic ? 'حدث خطأ. حاول مرة أخرى' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setCode('');

    try {
      const result = await twoFA.generateAndSend(email);
      if (result.success) {
        setTimeRemaining(result.expiresIn || 10);
        setAttemptsRemaining(3);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(isArabic ? 'فشل إعادة الإرسال' : 'Resend failed');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {isArabic ? 'تم التحقق بنجاح!' : 'Verification Successful!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري تسجيل الدخول...' : 'Logging you in...'}
          </p>
          <div className="mt-8 animate-spin">
            <Loader className="w-6 h-6 text-green-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
          <div className="flex justify-center mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {isArabic ? 'التحقق الثنائي' : 'Two-Factor Auth'}
          </h1>
          <p className="text-blue-100">
            {isArabic ? 'أدخل الرمز المرسل إلى بريدك' : 'Enter the code sent to your email'}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleVerify} className="px-8 py-8">
          {/* Email Display */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isArabic ? 'رمز أرسل إلى:' : 'Code sent to:'}
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{email}</p>
            </div>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              {isArabic ? 'رمز التحقق' : 'Verification Code'}
            </label>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              placeholder={isArabic ? '000000' : '000000'}
              className="w-full px-4 py-3 text-2xl tracking-widest text-center font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
            />
          </div>

          {/* Timer */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {isArabic ? 'الرمز ينتهي في:' : 'Code expires in:'}
              </p>
              <p className="text-xs">{timeRemaining > 0 ? `${timeRemaining} ثانية` : 'Expired'}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">{error}</p>
                {attemptsRemaining > 0 && (
                  <p className="text-xs mt-1">
                    {isArabic ? `محاولات متبقية: ${attemptsRemaining}` : `Attempts remaining: ${attemptsRemaining}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isArabic ? 'جاري التحقق...' : 'Verifying...'}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                {isArabic ? 'تحقق' : 'Verify'}
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || timeRemaining > 0}
            className="w-full mt-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin inline mr-2" />
                {isArabic ? 'جاري الإرسال...' : 'Sending...'}
              </>
            ) : (
              isArabic ? 'إعادة إرسال الرمز' : 'Resend Code'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-slate-700/50 text-center text-xs text-gray-600 dark:text-gray-400">
          {isArabic ? 'لم تستقبل الرمز؟ تحقق من مجلد البريد المزعج' : "Didn't receive it? Check your spam folder"}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorPage;
