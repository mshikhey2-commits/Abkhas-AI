
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type CalendarType = 'gregorian' | 'hijri';
export type SubscriptionTier = 'free' | 'pro' | 'business';
export type LoyaltyRank = 'Shopper' | 'Expert' | 'Abkhas';
export type InteractionType = 'view' | 'click' | 'wishlist' | 'purchase';

export interface Interaction {
  productId: string;
  brand: string;
  category: string;
  type: InteractionType;
  timestamp: number;
}

export interface LoyaltyMission {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  icon: string;
}

export interface LoyaltyStatus {
  points: number;
  rank: LoyaltyRank;
  next_rank_points: number;
  daily_streak: number;
  missions: LoyaltyMission[];
}

export interface KeySpecs {
  storage_gb: number;
  ram_gb: number;
  camera_mp: number;
  battery_mah: number;
  screen_size_inch: number;
  refresh_rate_hz?: number;
  width_mm?: number;
  height_mm?: number;
}

export interface Coupon {
  code: string;
  discount_text: string;
  estimated_value?: number;
}

export interface Offer {
  offer_id: string;
  store_id: string;
  store_name: string;
  price: number;
  currency: string;
  shipping_cost: number;
  estimated_delivery_days: number;
  return_policy: string;
  rating_average: number;
  rating_count: number;
  affiliate_url: string;
  coupons?: Coupon[];
  bnpl_available?: boolean;
  is_verified?: boolean; // مؤشر جودة المتجر
}

export interface Product {
  product_id: string;
  category: string;
  name: string;
  brand: string;
  thumbnail_url: string;
  images?: string[];
  description?: string;
  tags: string[];
  key_specs: KeySpecs;
  best_offer?: Partial<Offer>;
  offers?: Offer[];
  score?: number;
  trust_score?: number; // سكور الجودة والموثوقية
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'launched';
  votes: number;
  category: 'AI' | 'Stores' | 'UX';
  isVoted?: boolean;
}

export interface UserPreferences {
  preferred_categories: string[];
  budget_range: { min: number; max: number };
  preferred_brands: string[];
  priority: 'price' | 'quality' | 'balanced';
  use_case: 'gaming' | 'camera' | 'everyday';
  language: Language;
  theme: Theme;
  calendar: CalendarType;
  subscription: SubscriptionTier;
  loyalty?: LoyaltyStatus;
  interactions: Interaction[];
}

export interface RecommendationResponse {
  product: Product;
  score: number;
  why_this: string[];
  pro_tip?: string;
  confidence?: number; // مستوى يقين الذكاء الاصطناعي
}
