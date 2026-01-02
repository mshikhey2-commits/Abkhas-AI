
import { Product, Offer } from './types';

// Official Abkhas Logo as SVG Data URI
export const APP_LOGO_SVG = `data:image/svg+xml;utf8,<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="512" height="512" rx="120" fill="url(%23grad1)"/>
<defs>
<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:%23002D9C;stop-opacity:1" />
<stop offset="100%" style="stop-color:%231E90FF;stop-opacity:1" />
</linearGradient>
</defs>
<rect x="116" y="116" width="280" height="280" rx="60" fill="white"/>
<path d="M166 260C166 237.909 183.909 220 206 220C228.091 220 246 237.909 246 260" stroke="%23002D9C" stroke-width="24" stroke-linecap="round"/>
<path d="M266 260C266 237.909 283.909 220 306 220C328.091 220 346 237.909 346 260" stroke="%23002D9C" stroke-width="24" stroke-linecap="round"/>
<path d="M80 80C80 80 120 100 130 140M80 80C80 80 100 120 140 130" stroke="%2300BFFF" stroke-width="12" stroke-linecap="round"/>
<circle cx="80" cy="80" r="10" fill="%2300BFFF"/>
<path d="M432 432C432 432 392 412 382 372M432 432C432 432 412 392 372 382" stroke="%2300BFFF" stroke-width="12" stroke-linecap="round"/>
<circle cx="432" cy="432" r="10" fill="%2300BFFF"/>
</svg>`;

export const MOCK_PRODUCTS: Product[] = [
  {
    product_id: "iphone-15-pro-max",
    category: "phones",
    name: "Apple iPhone 15 Pro Max 256GB",
    brand: "Apple",
    thumbnail_url: "https://picsum.photos/seed/iphone15/400/400",
    images: ["https://picsum.photos/seed/iphone15/600/600"],
    description: "أحدث هاتف من آبل مع معالج A17 Pro وكاميرا احترافية وتصميم تيتانيوم.",
    tags: ["camera", "battery", "flagship", "ios"],
    key_specs: {
      storage_gb: 256,
      ram_gb: 8,
      camera_mp: 48,
      battery_mah: 4441,
      screen_size_inch: 6.7,
      refresh_rate_hz: 120
    },
    offers: [
      {
        offer_id: "off-1",
        store_id: "jarir",
        store_name: "جرير",
        price: 5299,
        currency: "SAR",
        shipping_cost: 0,
        estimated_delivery_days: 1,
        return_policy: "15 يوم استرجاع",
        rating_average: 4.8,
        rating_count: 1200,
        affiliate_url: "#",
        is_verified: true,
        coupons: [{ code: "JRR10", discount_text: "10% خصم إضافي", estimated_value: 100 }]
      },
      {
        offer_id: "off-2",
        store_id: "amazon",
        store_name: "أمازون السعودية",
        price: 4999,
        currency: "SAR",
        shipping_cost: 12,
        estimated_delivery_days: 2,
        return_policy: "30 يوم استرجاع",
        rating_average: 4.7,
        rating_count: 3500,
        affiliate_url: "#",
        is_verified: true
      }
    ]
  },
  {
    product_id: "samsung-s24-ultra",
    category: "phones",
    name: "Samsung Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    thumbnail_url: "https://picsum.photos/seed/s24ultra/400/400",
    tags: ["gaming", "camera", "flagship", "android"],
    key_specs: {
      storage_gb: 512,
      ram_gb: 12,
      camera_mp: 200,
      battery_mah: 5000,
      screen_size_inch: 6.8,
      refresh_rate_hz: 120
    },
    offers: [
      {
        offer_id: "off-4",
        store_id: "amazon",
        store_name: "أمازون السعودية",
        price: 4500,
        currency: "SAR",
        shipping_cost: 0,
        estimated_delivery_days: 2,
        return_policy: "30 يوم",
        rating_average: 4.9,
        rating_count: 2100,
        affiliate_url: "#",
        is_verified: true
      }
    ]
  }
];
