// Image Optimization Service
// Handles lazy loading, responsive images, and WebP conversion

export interface ImageOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  srcSet?: string;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate responsive image srcset
export const generateSrcSet = (imagePath: string, widths: number[] = [320, 640, 1280, 1920]): string => {
  return widths
    .map((width) => {
      const url = new URL(imagePath, window.location.href);
      url.searchParams.append('w', width.toString());
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
};

// Get appropriate image size for device
export const getImageSizeForDevice = (): number => {
  const width = window.innerWidth;
  
  if (width <= 640) return 320;
  if (width <= 1024) return 640;
  if (width <= 1536) return 1280;
  return 1920;
};

// Optimize image with lazy loading
export const createOptimizedImage = (options: ImageOptions): HTMLImageElement => {
  const img = document.createElement('img');
  
  // Basic attributes
  img.alt = options.alt;
  if (options.className) img.className = options.className;
  if (options.width) img.width = options.width;
  if (options.height) img.height = options.height;
  
  // Lazy loading
  img.loading = options.loading || 'lazy';
  
  // Responsive images
  if (options.srcSet) {
    img.srcSet = options.srcSet;
  }
  if (options.sizes) {
    img.sizes = options.sizes;
  }
  
  // Source image
  img.src = options.src;
  
  // Event listeners
  if (options.onLoad) {
    img.onload = options.onLoad;
  }
  if (options.onError) {
    img.onerror = options.onError;
  }
  
  return img;
};

// Convert image to WebP with fallback
export const getWebPImage = (imagePath: string): string => {
  // Check if WebP is supported
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  const isWebPSupported = canvas.toDataURL('image/webp').includes('webp');
  
  if (isWebPSupported) {
    return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return imagePath;
};

// Image preloading
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch preload images
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

// Blur hash decoder (for placeholder generation)
export const generatePlaceholder = (color: string = '#cccccc'): string => {
  // Generate a simple placeholder SVG
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='${encodeURIComponent(color)}' width='200' height='200'/%3E%3C/svg%3E`;
};

// Progressive image loading
export const lazyLoadImage = (
  element: HTMLImageElement,
  highResSrc: string,
  onLoad?: () => void
): void => {
  if (!element) return;

  // Create a new image element to preload
  const img = new Image();
  img.onload = () => {
    element.src = highResSrc;
    element.classList.add('loaded');
    if (onLoad) onLoad();
  };
  
  // Set data attribute for lazy loading
  element.setAttribute('data-src', highResSrc);
  
  // Start loading
  img.src = highResSrc;
};

// Image quality optimization based on connection
export const getOptimalImageQuality = (): 'low' | 'medium' | 'high' => {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) {
    return 'high';
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection.effectiveType;

  if (effectiveType === '4g') {
    return 'high';
  } else if (effectiveType === '3g') {
    return 'medium';
  } else {
    return 'low';
  }
};

// Get image URL with quality parameter
export const getImageWithQuality = (imagePath: string, quality?: 'low' | 'medium' | 'high'): string => {
  const qual = quality || getOptimalImageQuality();
  const qualityMap = { low: 60, medium: 75, high: 90 };
  
  const url = new URL(imagePath, window.location.href);
  url.searchParams.append('q', qualityMap[qual].toString());
  
  return url.toString();
};

// Intersection Observer for image lazy loading
export const setupImageLazyLoading = (): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img: HTMLImageElement) => {
      img.src = img.getAttribute('data-src') || '';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        const srcSet = img.getAttribute('data-srcset');
        
        if (src) img.src = src;
        if (srcSet) img.srcSet = srcSet;
        
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    observer.observe(img);
  });
};

// Image format detection and serving
export const getOptimalImageFormat = (imagePath: string): string => {
  const webpSupported = document.createElement('canvas').toDataURL('image/webp').includes('webp');
  
  if (webpSupported && imagePath.match(/\.(jpg|jpeg|png)$/i)) {
    return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return imagePath;
};

// Batch optimize images
export const optimizeImageBatch = (
  imagePaths: string[],
  quality?: 'low' | 'medium' | 'high'
): string[] => {
  return imagePaths.map((path) => {
    const withQuality = getImageWithQuality(path, quality);
    return getOptimalImageFormat(withQuality);
  });
};

export default {
  generateSrcSet,
  getImageSizeForDevice,
  createOptimizedImage,
  getWebPImage,
  preloadImage,
  preloadImages,
  generatePlaceholder,
  lazyLoadImage,
  getOptimalImageQuality,
  getImageWithQuality,
  setupImageLazyLoading,
  getOptimalImageFormat,
  optimizeImageBatch,
};
