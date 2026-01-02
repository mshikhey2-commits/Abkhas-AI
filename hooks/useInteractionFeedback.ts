import { useHaptics } from './useHaptics';

/**
 * 🟥 CRITICAL_STATE_CONSOLIDATION: Consolidated Haptics Feedback Hook
 * 
 * Centralized interaction feedback patterns to prevent code duplication
 * and ensure consistent feedback across the app.
 * 
 * Usage:
 * const feedback = useInteractionFeedback();
 * feedback.onSuccess(); // triggered on successful action
 * feedback.onWarning(); // triggered on warnings
 * feedback.onError();   // triggered on errors
 */

export const useInteractionFeedback = () => {
  const { trigger } = useHaptics();

  return {
    /**
     * Success feedback (e.g., purchase, share, vote)
     * Pattern: Strong vibration + light haptic
     */
    onSuccess: () => trigger('success'),

    /**
     * Action feedback (e.g., click, toggle, interaction)
     * Pattern: Medium vibration
     */
    onAction: () => trigger('medium'),

    /**
     * Light feedback (e.g., button press, toggle compare)
     * Pattern: Light vibration
     */
    onLight: () => trigger('light'),

    /**
     * Warning feedback (e.g., file selection, visual search start)
     * Pattern: Medium vibration for user awareness
     */
    onWarning: () => trigger('medium'),

    /**
     * Error feedback (e.g., failed search, error)
     * Pattern: Repeated medium vibration
     */
    onError: () => {
      trigger('medium');
      setTimeout(() => trigger('medium'), 150);
    },

    /**
     * Batch feedback for multiple confirmations
     * Pattern: Triple light vibrations
     */
    onBatch: () => {
      trigger('light');
      setTimeout(() => trigger('light'), 100);
      setTimeout(() => trigger('light'), 200);
    },
  };
};
