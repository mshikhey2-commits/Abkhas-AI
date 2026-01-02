
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className = "", lazy = true }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    if (src) {
      setStatus('loading');
      setCurrentSrc(src);
    } else {
      setStatus('error');
    }
  }, [src]);

  const handleLoad = () => setStatus('loaded');
  const handleError = () => setStatus('error');

  return (
    <div className={`relative overflow-hidden bg-gray-50 dark:bg-slate-900/40 flex items-center justify-center ${className}`}>
      {/* Shimmer Placeholder */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center animate-shimmer">
          <ImageIcon size={48} className="text-gray-200 dark:text-slate-700 opacity-50" />
          <div className="mt-4 flex items-center gap-2">
            <RefreshCw size={14} className="text-indigo-500 animate-spin" />
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              جاري التحميل...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-800">
          <AlertCircle size={32} className="text-red-400/50 mb-2" />
          <span className="text-[10px] font-bold text-gray-400">فشل تحميل الصورة</span>
        </div>
      )}

      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? "lazy" : "eager"}
          className={`w-full h-full object-contain transition-all duration-700 ${status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        />
      ) : (
        <div className="p-8 text-gray-200 dark:text-slate-700">
           <ImageIcon size={64} />
        </div>
      )}
    </div>
  );
};

export default SmartImage;
