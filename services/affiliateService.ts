
/**
 * AffiliateService - Abkhas Engine
 * يقوم هذا المحرك بربط الروابط بمنصات الأفلييت المشهورة في السعودية
 * (ArabClicks, Linkwise, DCMnetwork)
 */

interface AffiliateConfig {
  jarir_id: string;
  noon_id: string;
  amazon_id: string;
  extra_id: string;
}

// هذه المعرفات يتم جلبها من لوحة تحكم الأفلييت الخاصة بك
const MY_AFFILIATE_IDS: AffiliateConfig = {
  jarir_id: "abkhas_jarir_2025",
  noon_id: "Z392", // كود الخصم أو المعرف
  amazon_id: "abkhas07-21",
  extra_id: "ex_abkhas_99"
};

export const generateAffiliateLink = (storeId: string, originalUrl: string): string => {
  switch (storeId.toLowerCase()) {
    case 'jarir':
      // مثال للربط مع ArabClicks لجرير
      return `https://search.arabclicks.com/click-jrfk9k-12345678?url=${encodeURIComponent(originalUrl)}&subid=${MY_AFFILIATE_IDS.jarir_id}`;
    
    case 'noon':
      // نون غالباً تعتمد على كود خصم ثابت أو روابط Linkwise
      return `${originalUrl}?ref=${MY_AFFILIATE_IDS.noon_id}`;
    
    case 'amazon':
      // نظام أمازون المباشر
      return `${originalUrl}&tag=${MY_AFFILIATE_IDS.amazon_id}`;
    
    case 'extra':
      return `https://extra.com/affiliate?link=${encodeURIComponent(originalUrl)}&source=${MY_AFFILIATE_IDS.extra_id}`;
    
    default:
      return originalUrl;
  }
};

export const trackConversion = (productId: string, storeName: string) => {
  console.log(`[REVENUE_TRACK] User clicked on ${productId} for store ${storeName}`);
  // هنا يتم إرسال الحدث لـ Google Analytics أو Pixel لضمان تتبع العمولة
};
