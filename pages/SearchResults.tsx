
import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Product, UserPreferences, Language } from '../types';
import ProductCard from '../components/ProductCard';
import { calculateProductScore } from '../services/scoring';
import { SlidersHorizontal, ChevronDown, Search as SearchIcon, Info } from 'lucide-react';
import { ProductCardSkeleton } from '../components/Skeletons';
import { translations } from '../translations';
import { calculateMatchScore } from '../utils/searchUtils';

interface SearchResultsProps {
  query: string;
  onNavigate: (page: string, params?: any) => void;
  userPrefs: UserPreferences;
  lang: Language;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onNavigate, userPrefs, lang }) => {
  const [results, setResults] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('score');
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    const filterAndScore = async () => {
      // 🟥 CRITICAL_ERROR_BOUNDARY: Monitor search filtering and scoring
      try {
        setIsLoading(true);
        // Artificial delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Calculate relevance based on fuzzy search
        const scoredResults = MOCK_PRODUCTS.map(p => {
          const textMatchScore = calculateMatchScore(query, p);
          const preferenceScore = calculateProductScore(p, userPrefs);
          
          // Final score is a weighted combination of text relevance and AI preference
          // We only include products that have at least some text relevance (> 0.2)
          return {
            ...p,
            relevance: textMatchScore,
            score: preferenceScore,
            combinedScore: (textMatchScore * 0.7) + (preferenceScore * 0.3)
          };
        }).filter(p => p.relevance > 0.15);

        // Sorting logic
        if (sortBy === 'score') {
          scoredResults.sort((a, b) => b.combinedScore - a.combinedScore);
        } else if (sortBy === 'price_asc') {
          scoredResults.sort((a, b) => (a.offers?.[0]?.price || 0) - (b.offers?.[0]?.price || 0));
        } else if (sortBy === 'rating') {
          scoredResults.sort((a, b) => (b.offers?.[0]?.rating_average || 0) - (a.offers?.[0]?.rating_average || 0));
        }

        setResults(scoredResults);
      } catch (error) {
        // 🟥 CRITICAL_ERROR_BOUNDARY: Handle search errors
        console.error('🟥 CRITICAL_ERROR_BOUNDARY: Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    filterAndScore();
  }, [query, sortBy, userPrefs]);

  const hasFuzzyResults = results.length > 0 && results.every(r => (r as any).relevance < 0.9);

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12 animate-in fade-in duration-500">
      <aside className="w-full md:w-64 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white tracking-tight">{t.filterTitle}</h3>
            <SlidersHorizontal size={18} className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 block mb-2 uppercase tracking-wider">{t.brand}</label>
              <div className="space-y-2">
                {['Apple', 'Samsung', 'Google', 'Nothing'].map(brand => (
                  <label key={brand} className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded-lg border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                    <span className="mx-2 text-sm font-bold text-gray-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 dark:border-slate-700">
              <label className="text-xs font-black text-gray-400 block mb-2 uppercase tracking-wider">{t.budget}</label>
              <input type="range" min="1000" max="6000" step="100" className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-black">
                <span>1,000</span>
                <span>6,000+</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-start">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {lang === 'ar' ? 'نتائج البحث عن: ' : 'Search results for: '} 
              <span className="text-indigo-600 font-black italic">"{query}"</span>
              {!isLoading && <span className="text-gray-400 text-sm font-bold mx-3">({results.length})</span>}
            </h2>
            {hasFuzzyResults && !isLoading && (
              <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 mt-1 uppercase tracking-widest">
                <Info size={12} /> {lang === 'ar' ? 'أبخص يتوقع أنك تقصد هذه النتائج رغم الخطأ الإملائي' : 'Abkhas matched these results despite potential typos'}
              </p>
            )}
          </div>

          <div className="relative inline-block text-right">
            <select 
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl ps-10 pe-12 py-2.5 text-xs font-black text-gray-700 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">{t.compatibility}</option>
              <option value="price_asc">{t.cheapest}</option>
              <option value="rating">{t.topRated}</option>
            </select>
            <ChevronDown size={14} className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <ProductCardSkeleton key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map(product => (
              <div key={product.product_id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ProductCard 
                  product={product} 
                  lang={lang}
                  onClick={(id) => onNavigate('product', { id })} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-16 text-center border border-dashed border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-[2rem] mb-6 shadow-inner">
              <SearchIcon size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{t.noResult}</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
              {lang === 'ar' ? 'أبخص ما لقى شيء يطابق بحثك، جرب تبحث بكلمات أبسط أو عدل الميزانية.' : 'Abkhas couldn\'t find a match. Try simpler keywords or adjust your filters.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
