import { describe, it, expect } from 'vitest';

// Mock validation functions
const validatePrice = (price: number): { valid: boolean; error?: string } => {
  if (typeof price !== 'number') return { valid: false, error: 'Price must be a number' };
  if (price <= 0) return { valid: false, error: 'Price must be greater than 0' };
  if (price > 1000000) return { valid: false, error: 'Price exceeds maximum allowed' };
  return { valid: true };
};

const validateRating = (rating: number, reviewCount: number): { valid: boolean; error?: string } => {
  if (typeof rating !== 'number') return { valid: false, error: 'Rating must be a number' };
  if (rating < 1 || rating > 5) return { valid: false, error: 'Rating must be between 1 and 5' };
  if (typeof reviewCount !== 'number') return { valid: false, error: 'Review count must be a number' };
  if (reviewCount < 0) return { valid: false, error: 'Review count cannot be negative' };
  return { valid: true };
};

const validateProductData = (product: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!product.name || typeof product.name !== 'string') {
    errors.push('Product name is required');
  }

  if (!product.storeLink || typeof product.storeLink !== 'string') {
    errors.push('Store link is required');
  } else if (!product.storeLink.startsWith('http')) {
    errors.push('Store link must be a valid URL');
  }

  const priceValidation = validatePrice(product.price);
  if (!priceValidation.valid) errors.push(priceValidation.error!);

  if (product.rating !== undefined) {
    const ratingValidation = validateRating(product.rating, product.reviewCount || 0);
    if (!ratingValidation.valid) errors.push(ratingValidation.error!);
  }

  if (product.coupon !== undefined && product.coupon > product.price) {
    errors.push('Coupon value cannot exceed product price');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const validateCoupon = (couponCode: string, couponValue: number): { valid: boolean; error?: string } => {
  if (!couponCode || couponCode.trim().length === 0) {
    return { valid: false, error: 'Coupon code cannot be empty' };
  }

  if (couponValue <= 0 || couponValue > 10000) {
    return { valid: false, error: 'Coupon value must be between 0 and 10000' };
  }

  return { valid: true };
};

const isDataFresh = (lastUpdated: Date, maxAgeHours: number = 6): boolean => {
  const now = new Date();
  const ageMs = now.getTime() - lastUpdated.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours <= maxAgeHours;
};

const filterBadDeals = (products: any[]): any[] => {
  return products.filter(product => {
    // Remove deals with missing critical data
    if (!product.price || !product.storeLink) return false;

    // Remove deals with suspicious prices (too high or too low)
    if (product.price <= 0 || product.price > 1000000) return false;

    // Remove deals with poor ratings and low review count
    if (product.rating && product.rating < 2 && (product.reviewCount || 0) < 5) return false;

    // Remove expired deals
    if (product.lastUpdated) {
      if (!isDataFresh(new Date(product.lastUpdated))) return false;
    }

    return true;
  });
};

describe('Data Validation', () => {
  describe('TC-VALIDATION-001: Price Validation', () => {
    it('should validate correct prices', () => {
      const result = validatePrice(100);
      expect(result.valid).toBe(true);
    });

    it('should reject zero price', () => {
      const result = validatePrice(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price must be greater than 0');
    });

    it('should reject negative price', () => {
      const result = validatePrice(-50);
      expect(result.valid).toBe(false);
    });

    it('should reject non-numeric price', () => {
      const result = validatePrice('100' as any);
      expect(result.valid).toBe(false);
    });

    it('should reject price exceeding maximum', () => {
      const result = validatePrice(1000001);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price exceeds maximum allowed');
    });

    it('should accept maximum valid price', () => {
      const result = validatePrice(1000000);
      expect(result.valid).toBe(true);
    });
  });

  describe('TC-VALIDATION-002: Rating Validation', () => {
    it('should validate correct rating', () => {
      const result = validateRating(4.5, 100);
      expect(result.valid).toBe(true);
    });

    it('should validate edge case ratings', () => {
      expect(validateRating(1, 0).valid).toBe(true);
      expect(validateRating(5, 1000).valid).toBe(true);
    });

    it('should reject rating below 1', () => {
      const result = validateRating(0.5, 100);
      expect(result.valid).toBe(false);
    });

    it('should reject rating above 5', () => {
      const result = validateRating(6, 100);
      expect(result.valid).toBe(false);
    });

    it('should reject negative review count', () => {
      const result = validateRating(4, -1);
      expect(result.valid).toBe(false);
    });
  });

  describe('TC-VALIDATION-003: Product Data Validation', () => {
    it('should validate complete product', () => {
      const product = {
        name: 'iPhone 15',
        storeLink: 'https://amazon.com/product',
        price: 999,
        rating: 4.5,
        reviewCount: 100,
      };

      const result = validateProductData(product);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing name', () => {
      const product = {
        storeLink: 'https://amazon.com/product',
        price: 999,
      };

      const result = validateProductData(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should catch invalid URL', () => {
      const product = {
        name: 'iPhone 15',
        storeLink: 'not-a-url',
        price: 999,
      };

      const result = validateProductData(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('URL'))).toBe(true);
    });

    it('should catch multiple errors', () => {
      const product = {
        name: '',
        storeLink: 'invalid',
        price: -50,
      };

      const result = validateProductData(product);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('TC-VALIDATION-004: Coupon Validation', () => {
    it('should validate correct coupon', () => {
      const result = validateCoupon('SAVE20', 500);
      expect(result.valid).toBe(true);
    });

    it('should reject empty coupon code', () => {
      const result = validateCoupon('', 500);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid coupon value', () => {
      expect(validateCoupon('CODE', 0).valid).toBe(false);
      expect(validateCoupon('CODE', -100).valid).toBe(false);
      expect(validateCoupon('CODE', 10001).valid).toBe(false);
    });
  });

  describe('TC-VALIDATION-005: Data Freshness', () => {
    it('should accept fresh data', () => {
      const now = new Date();
      const fresh = isDataFresh(now, 6);
      expect(fresh).toBe(true);
    });

    it('should reject old data', () => {
      const old = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const fresh = isDataFresh(old, 6);
      expect(fresh).toBe(false);
    });

    it('should check boundaries', () => {
      const almostOld = new Date(Date.now() - 6 * 60 * 60 * 1000 - 1000); // 6h + 1s
      expect(isDataFresh(almostOld, 6)).toBe(false);
    });
  });

  describe('TC-VALIDATION-006: Bad Deal Filtering', () => {
    it('should filter products with missing price', () => {
      const products = [
        { name: 'Product 1', storeLink: 'https://test.com', rating: 4 },
        { name: 'Product 2', price: 100, storeLink: 'https://test.com', rating: 4 },
      ];

      const filtered = filterBadDeals(products);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Product 2');
    });

    it('should filter invalid prices', () => {
      const products = [
        { name: 'Product 1', price: -50, storeLink: 'https://test.com' },
        { name: 'Product 2', price: 100, storeLink: 'https://test.com' },
      ];

      const filtered = filterBadDeals(products);
      expect(filtered).toHaveLength(1);
    });

    it('should filter low-rated products with few reviews', () => {
      const products = [
        { name: 'Bad Product', price: 100, storeLink: 'https://test.com', rating: 1.5, reviewCount: 2 },
        { name: 'Good Product', price: 100, storeLink: 'https://test.com', rating: 4, reviewCount: 10 },
      ];

      const filtered = filterBadDeals(products);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Good Product');
    });

    it('should filter expired data', () => {
      const old = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const products = [
        { name: 'Old', price: 100, storeLink: 'https://test.com', lastUpdated: old },
        { name: 'New', price: 100, storeLink: 'https://test.com', lastUpdated: new Date() },
      ];

      const filtered = filterBadDeals(products);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('New');
    });
  });
});
