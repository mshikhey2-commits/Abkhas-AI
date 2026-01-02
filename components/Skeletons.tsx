
import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="pt-[100%] bg-gray-100 dark:bg-slate-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-2 w-1/4 bg-gray-200 dark:bg-slate-600 rounded"></div>
      <div className="h-4 w-full bg-gray-200 dark:bg-slate-600 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-600 rounded"></div>
      <div className="pt-4 flex items-baseline gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-slate-600 rounded"></div>
        <div className="h-3 w-8 bg-gray-200 dark:bg-slate-600 rounded"></div>
      </div>
    </div>
  </div>
);

export const HomeSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Hero Skeleton */}
    <div className="h-64 md:h-80 bg-gray-200 dark:bg-slate-700 rounded-3xl"></div>
    
    {/* Categories Skeleton */}
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
        ))}
      </div>
    </div>

    {/* Recommendations Skeleton */}
    <div className="space-y-4">
      <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <ProductCardSkeleton />
            <div className="h-20 bg-gray-100 dark:bg-slate-700/50 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-3xl"></div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-3xl mt-8"></div>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="h-32 bg-gray-100 dark:bg-slate-700 rounded-3xl"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl"></div>)}
        </div>
      </div>
    </div>
  </div>
);
