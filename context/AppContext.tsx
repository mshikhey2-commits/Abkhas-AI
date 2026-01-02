
import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { UserPreferences, Language, Theme, LoyaltyRank, InteractionType, Product } from '../types';

interface AppContextType {
  currentPage: string;
  pageParams: any;
  lang: Language;
  theme: Theme;
  userPrefs: UserPreferences;
  compareList: string[];
  isPending: boolean;
  navigate: (page: string, params?: any) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  updatePrefs: (prefs: Partial<UserPreferences>) => void;
  toggleCompare: (productId: string) => void;
  addCoins: (amount: number) => void;
  trackInteraction: (product: Product, type: InteractionType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [compareList, setCompareList] = useState<string[]>([]);
  
  // Load initial state from local storage or defaults
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('abkhas_user_prefs');
    if (saved) return JSON.parse(saved);
    
    return {
      preferred_categories: ['phones'],
      budget_range: { min: 2000, max: 5500 },
      preferred_brands: ['Apple', 'Samsung'],
      priority: 'balanced',
      use_case: 'camera',
      language: 'ar',
      theme: 'light',
      calendar: 'gregorian',
      subscription: 'free',
      interactions: [],
      loyalty: {
        points: 1250,
        rank: 'Shopper',
        next_rank_points: 5000,
        daily_streak: 4,
        missions: [
          { id: '1', title: 'قارن بين 3 أجهزة اليوم', points: 100, completed: false, icon: 'Scale' },
          { id: '2', title: 'ابحث عن منتج بالصورة', points: 150, completed: true, icon: 'Camera' },
          { id: '3', title: 'شارك ترشيح أبخص مع صديق', points: 500, completed: false, icon: 'Share' }
        ]
      }
    };
  });

  // 🟥 CRITICAL_ERROR_BOUNDARY: Debounce localStorage writes to prevent excessive updates
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      localStorage.setItem('abkhas_user_prefs', JSON.stringify(userPrefs));
    }, 500); // Wait 500ms before saving
    
    return () => clearTimeout(debounceTimer);
  }, [userPrefs]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const navigate = (page: string, params: any = {}) => {
    startTransition(() => {
      setCurrentPage(page);
      setPageParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const updatePrefs = (newPrefs: Partial<UserPreferences>) => setUserPrefs(prev => ({ ...prev, ...newPrefs }));

  const toggleCompare = (productId: string) => {
    setCompareList(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : prev.length < 3 ? [...prev, productId] : prev
    );
  };

  const trackInteraction = (product: Product, type: InteractionType) => {
    setUserPrefs(prev => {
      const newInteractions = [
        ...prev.interactions,
        {
          productId: product.product_id,
          brand: product.brand,
          category: product.category,
          type,
          timestamp: Date.now()
        }
      ].slice(-100); // Keep last 100 interactions
      return { ...prev, interactions: newInteractions };
    });
  };

  const addCoins = (amount: number) => {
    setUserPrefs(prev => {
      if (!prev.loyalty) return prev;
      const newPoints = prev.loyalty.points + amount;
      
      let newRank: LoyaltyRank = prev.loyalty.rank;
      let nextPoints = prev.loyalty.next_rank_points;
      
      if (newPoints >= 15000) {
        newRank = 'Abkhas';
        nextPoints = 50000;
      } else if (newPoints >= 5000) {
        newRank = 'Expert';
        nextPoints = 15000;
      }

      return {
        ...prev,
        loyalty: {
          ...prev.loyalty,
          points: newPoints,
          rank: newRank,
          next_rank_points: nextPoints
        }
      };
    });
  };

  return (
    <AppContext.Provider value={{
      currentPage, pageParams, lang, theme, userPrefs, compareList, isPending,
      navigate, toggleLang, toggleTheme, updatePrefs, toggleCompare, addCoins, trackInteraction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
