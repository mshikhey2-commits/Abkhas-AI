export const useHaptics = () => {
  const trigger = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (!navigator.vibrate) return;

    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'error':
        navigator.vibrate([50, 50, 50]);
        break;
    }
  };

  return { trigger };
};