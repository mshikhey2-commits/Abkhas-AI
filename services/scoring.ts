
import { Product, UserPreferences, Offer, Interaction, KeySpecs, InteractionType } from '../types';

const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  purchase: 1.0,
  wishlist: 0.7,
  click: 0.3,
  view: 0.1,
};

const RECENCY_DECAY_FACTOR = 0.1;

/**
 * حساب التكلفة الإجمالية (السعر + الشحن - الكوبون)
 */
function calculateNetPrice(offer: Offer): number {
  const couponValue = offer.coupons?.[0]?.estimated_value || 0;
  return offer.price + offer.shipping_cost - couponValue;
}

function calculatePriceScore(price: number, budget: { min: number; max: number }): number {
  if (price <= budget.min) return 1.0;
  if (price > budget.max * 1.2) return 0.0; // استبعاد المنتجات خارج الميزانية بشكل كبير
  
  const range = budget.max - budget.min;
  return Math.max(0.1, 1.0 - ((price - budget.min) / (range || 1)) * 0.7);
}

function calculateSpecScore(specs: KeySpecs, useCase: UserPreferences['use_case']): number {
  switch (useCase) {
    case 'gaming':
      const ramScore = specs.ram_gb >= 12 ? 1.0 : (specs.ram_gb >= 8 ? 0.6 : 0.3);
      const refreshScore = specs.refresh_rate_hz && specs.refresh_rate_hz >= 120 ? 1.0 : 0.4;
      return (ramScore * 0.7) + (refreshScore * 0.3);
    case 'camera':
      if (specs.camera_mp >= 100) return 1.0;
      if (specs.camera_mp >= 48) return 0.8;
      return 0.4;
    default:
      return specs.battery_mah >= 5000 ? 1.0 : (specs.battery_mah >= 4000 ? 0.7 : 0.4);
  }
}

/**
 * حساب سكور الموثوقية (Trust Score)
 */
function calculateTrustScore(offer: Offer): number {
  const ratingQuality = offer.rating_average / 5;
  const ratingConfidence = Math.min(offer.rating_count / 500, 1.0);
  const verificationBonus = offer.is_verified ? 0.2 : 0;
  
  return Math.min(1.0, (ratingQuality * 0.6) + (ratingConfidence * 0.2) + verificationBonus);
}

function calculateBehaviorScore(interactions: Interaction[], product: Product): number {
  if (!interactions || interactions.length === 0) return 0.5;
  const now = Date.now();
  let affinity = 0;
  let totalWeight = 0;

  interactions.forEach(interaction => {
    const daysSince = (now - interaction.timestamp) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.exp(-RECENCY_DECAY_FACTOR * daysSince);
    const weight = (INTERACTION_WEIGHTS[interaction.type] || 0.1) * timeDecay;
    
    if (interaction.brand === product.brand) affinity += weight;
    if (interaction.category === product.category) affinity += weight * 0.5;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.min(1.0, 0.5 + (affinity / totalWeight)) : 0.5;
}

export function calculateProductScore(product: Product, prefs: UserPreferences): number {
  if (!product.offers || product.offers.length === 0) return 0;

  // اختيار أفضل عرض بناءً على التكلفة الإجمالية والموثوقية
  const bestOffer = product.offers.reduce((prev, curr) => {
    const prevNet = calculateNetPrice(prev);
    const currNet = calculateNetPrice(curr);
    return (currNet < prevNet) ? curr : prev;
  }, product.offers[0]);
  
  let w_price = 0.35;
  let w_specs = 0.25;
  let w_trust = 0.20; // جودة المتجر والتقييمات
  let w_behavior = 0.20;

  if (prefs.priority === 'price') {
    w_price = 0.6; w_trust = 0.1; w_specs = 0.1; w_behavior = 0.2;
  } else if (prefs.priority === 'quality') {
    w_price = 0.1; w_specs = 0.5; w_trust = 0.25; w_behavior = 0.15;
  }

  const s_price = calculatePriceScore(calculateNetPrice(bestOffer), prefs.budget_range);
  const s_specs = calculateSpecScore(product.key_specs, prefs.use_case);
  const s_trust = calculateTrustScore(bestOffer);
  const s_behavior = calculateBehaviorScore(prefs.interactions, product);

  const finalScore = (w_price * s_price) + (w_specs * s_specs) + (w_trust * s_trust) + (w_behavior * s_behavior);
  
  return Math.round(finalScore * 100) / 100;
}
