// Advanced Data Validation Service
// Ensures data quality and consistency across the application

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  storeLink: string;
  store: string;
  rating?: number;
  reviewCount?: number;
  currency?: string;
  coupon?: number;
  shipping?: number;
  lastUpdated?: Date;
  category?: string;
  description?: string;
  image?: string;
  inStock?: boolean;
}

// Price validation
export const validatePrice = (
  price: unknown,
  minPrice: number = 0,
  maxPrice: number = 1000000
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof price !== "number") {
    errors.push("Price must be a number");
    return { valid: false, errors, warnings };
  }

  if (price <= minPrice) {
    errors.push(`Price must be greater than ${minPrice}`);
  }

  if (price > maxPrice) {
    errors.push(`Price cannot exceed ${maxPrice}`);
  }

  if (!Number.isFinite(price)) {
    errors.push("Price must be a finite number");
  }

  if (price > 100000) {
    warnings.push("Price is unusually high");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Rating validation
export const validateRating = (
  rating: unknown,
  reviewCount: unknown = 0
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof rating !== "number") {
    errors.push("Rating must be a number");
    return { valid: false, errors, warnings };
  }

  if (rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  if (typeof reviewCount === "number" && reviewCount < 5 && rating < 2) {
    warnings.push("Low rating with few reviews - data may be unreliable");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// URL validation
export const validateUrl = (url: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof url !== "string") {
    errors.push("URL must be a string");
    return { valid: false, errors, warnings };
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    errors.push("URL must start with http:// or https://");
  }

  try {
    new URL(url);
  } catch {
    errors.push("Invalid URL format");
  }

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    warnings.push("URL appears to be a local development URL");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Coupon validation
export const validateCoupon = (
  coupon: unknown,
  maxValue: number = 10000
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (coupon === undefined || coupon === null) {
    return { valid: true, errors, warnings };
  }

  if (typeof coupon !== "number") {
    errors.push("Coupon value must be a number");
    return { valid: false, errors, warnings };
  }

  if (coupon < 0) {
    errors.push("Coupon value cannot be negative");
  }

  if (coupon > maxValue) {
    errors.push(`Coupon value cannot exceed ${maxValue}`);
  }

  if (coupon === 0) {
    warnings.push("Coupon value is zero");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Complete product validation
export const validateProduct = (product: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!product || typeof product !== "object") {
    errors.push("Product must be an object");
    return { valid: false, errors, warnings };
  }

  const p = product as Record<string, unknown>;

  // Validate required fields
  if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string");
  }

  if (!p.price || typeof p.price !== "number") {
    errors.push("Product price is required and must be a number");
  } else {
    const priceValidation = validatePrice(p.price);
    errors.push(...priceValidation.errors);
    warnings.push(...priceValidation.warnings);
  }

  if (!p.storeLink || typeof p.storeLink !== "string") {
    errors.push("Store link is required");
  } else {
    const urlValidation = validateUrl(p.storeLink);
    errors.push(...urlValidation.errors);
    warnings.push(...urlValidation.warnings);
  }

  if (!p.store || typeof p.store !== "string") {
    errors.push("Store name is required");
  }

  // Validate optional fields
  if (p.rating !== undefined) {
    const ratingValidation = validateRating(p.rating, p.reviewCount);
    errors.push(...ratingValidation.errors);
    warnings.push(...ratingValidation.warnings);
  }

  if (p.coupon !== undefined) {
    const couponValidation = validateCoupon(p.coupon);
    errors.push(...couponValidation.errors);
    warnings.push(...couponValidation.warnings);

    if (typeof p.coupon === "number" && typeof p.price === "number" && p.coupon > p.price) {
      errors.push("Coupon value cannot exceed product price");
    }
  }

  if (p.lastUpdated !== undefined && !(p.lastUpdated instanceof Date)) {
    warnings.push("lastUpdated should be a Date object");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Data freshness check
export const isDataFresh = (
  lastUpdated: Date | unknown,
  maxAgeHours: number = 6
): boolean => {
  if (!(lastUpdated instanceof Date)) {
    return false;
  }

  const now = new Date();
  const ageMs = now.getTime() - lastUpdated.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  return ageHours <= maxAgeHours;
};

// Filter bad deals
export const filterBadDeals = (products: Product[]): Product[] => {
  return products.filter((product) => {
    // Validate product data
    const validation = validateProduct(product);
    if (!validation.valid) {
      return false;
    }

    // Check data freshness
    if (product.lastUpdated && !isDataFresh(product.lastUpdated)) {
      return false;
    }

    // Check stock status
    if (product.inStock === false) {
      return false;
    }

    // Filter low-quality products
    if (
      product.rating !== undefined &&
      product.rating < 2 &&
      (product.reviewCount ?? 0) < 5
    ) {
      return false;
    }

    return true;
  });
};

// Batch validation
export const validateProductBatch = (
  products: unknown[]
): { valid: Product[]; invalid: Array<{ data: unknown; errors: string[] }> } => {
  const valid: Product[] = [];
  const invalid: Array<{ data: unknown; errors: string[] }> = [];

  for (const product of products) {
    const validation = validateProduct(product);
    if (validation.valid) {
      valid.push(product as Product);
    } else {
      invalid.push({
        data: product,
        errors: validation.errors,
      });
    }
  }

  return { valid, invalid };
};

export default {
  validatePrice,
  validateRating,
  validateUrl,
  validateCoupon,
  validateProduct,
  isDataFresh,
  filterBadDeals,
  validateProductBatch,
};
