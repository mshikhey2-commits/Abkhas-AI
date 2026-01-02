import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, X } from 'lucide-react';

export const SessionWarning: React.FC = () => {
  const [show, setShow] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(5);

  useEffect(() => {
    const handleWarning = (event: Event) => {
      const customEvent = event as CustomEvent;
      setMinutesRemaining(customEvent.detail?.minutesRemaining || 5);
      setShow(true);
    };

    window.addEventListener('sessionWarning', handleWarning);
    return () => window.removeEventListener('sessionWarning', handleWarning);
  }, []);

  if (!show) return null;

  const handleExtendSession = () => {
    // Trigger activity to reset timeout
    window.dispatchEvent(new MouseEvent('click'));
    setShow(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl border border-orange-300 overflow-hidden">
        {/* Header */}
        <div className="bg-black/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">تحذير انتهاء الجلسة</h3>
              <p className="text-sm text-white/80">Session Timeout Warning</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-white mb-4">
            سيتم تسجيل خروجك بسبب عدم النشاط.
          </p>

          {/* Timer Display */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm">الوقت المتبقي:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white animate-spin" />
                <span className="text-2xl font-bold text-white">
                  {minutesRemaining}:00
                </span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${(minutesRemaining / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExtendSession}
              className="flex-1 bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-white/90 transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              متابعة الجلسة
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('currentUser');
                window.location.href = '/';
              }}
              className="flex-1 bg-black/30 text-white font-bold py-2 px-4 rounded-lg hover:bg-black/40 transition-all duration-200"
            >
              تسجيل خروج
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SessionWarning;
