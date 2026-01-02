import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSessionTimeout = () => {
  const { user } = useAppContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    if (user) {
      // Warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        const warningShown = sessionStorage.getItem('sessionWarningShown');
        if (!warningShown) {
          sessionStorage.setItem('sessionWarningShown', 'true');
          // Show warning notification (will be caught by UI)
          window.dispatchEvent(
            new CustomEvent('sessionWarning', {
              detail: { minutesRemaining: 5 }
            })
          );
        }
      }, TIMEOUT_DURATION - WARNING_TIME);

      // Logout timeout
      timeoutRef.current = setTimeout(() => {
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        window.location.href = '/?logout=true&reason=timeout';
      }, TIMEOUT_DURATION);

      // Store last activity time
      sessionStorage.setItem('lastActivity', Date.now().toString());
    }
  };

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Set initial timeouts
    resetTimeout();

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Clear warning flag on new activity
      sessionStorage.removeItem('sessionWarningShown');
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user]);

  return null;
};
