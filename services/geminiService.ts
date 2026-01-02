
import { GoogleGenAI } from "@google/genai";
import { Product, UserPreferences } from "../types";

/**
 * Utility to pause execution for a given duration.
 */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Executes a function with exponential backoff retry logic specifically for 429 errors.
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit reached (429). Retrying in ${backoff}ms... (${retries} retries left)`);
      await delay(backoff);
      return callWithRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
}

/**
 * fetchProductImageFromWeb - محرك البحث عن الصور الواقعية
 * يستخدم بحث قوقل لجلب روابط الصور الرسمية من المتاجر السعودية
 */
export async function fetchProductImageFromWeb(productName: string): Promise<string | null> {
  const cacheKey = `abkhas_real_img_${productName.replace(/\s+/g, '_').toLowerCase()}`;
  
  // 1. التحقق من الذاكرة المحلية (الديمومة)
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find the official, high-resolution direct image URL for the product: "${productName}". 
        Look into official stores in Saudi Arabia like Jarir Bookstore, Noon, Amazon.sa, or the official brand website. 
        Return ONLY the direct URL of the image file (ending in .jpg, .png, or .webp). Do not include any text, just the link.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
    });

    const imageUrl = response.text?.trim();
    
    // التأكد من أن النتيجة هي رابط صالح
    if (imageUrl && imageUrl.startsWith('http')) {
      localStorage.setItem(cacheKey, imageUrl);
      return imageUrl;
    }

    // إذا فشل البحث عن رابط، نلجأ للتوليد كخيار احتياطي (Fallback)
    return await generateProductVisual(productName);
  } catch (error) {
    console.error("Searching for real image failed after retries:", error);
    return await generateProductVisual(productName);
  }
}

/**
 * generateProductVisual - محرك احتياطي لتوليد الصور في حال عدم توفر رابط مباشر
 */
export async function generateProductVisual(productName: string): Promise<string | null> {
  const cacheKey = `abkhas_gen_img_${productName.replace(/\s+/g, '_').toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Professional high-end studio product photography of ${productName}, clean white background, commercial lighting, 8k resolution.`;
    
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = `data:image/png;base64,${part.inlineData.data}`;
        localStorage.setItem(cacheKey, base64Data);
        return base64Data;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed after retries:", error);
    return null;
  }
}

export async function getBatchRecommendationExplanations(products: Product[], prefs: UserPreferences): Promise<Record<string, {reasons: string[], pro_tip: string}>> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `أنت "أبخص" خبير السوق السعودي. التفضيلات: ميزانية ${prefs.budget_range.max}، استخدام ${prefs.use_case}. 
    لكل منتج من: ${products.map(p => p.name).join(', ')}، قدم 5 أسباب تقنية عميقة ومقنعة لماذا يناسب هذا المستخدم، بالإضافة إلى "نصيحة أبخص" (pro_tip).
    النتيجة JSON: {"product_id": {"reasons": [".."], "pro_tip": ".."}}`;

    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Batch recommendations failed after retries:", error);
    return {};
  }
}

export async function getSmartAnalysis(product: Product, prefs: UserPreferences) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `حلل ${product.name} لمستخدم سعودي بميزانية ${prefs.budget_range.max}. النتيجة JSON: {"summary": "..", "points": [".."], "thinking": "..", "score": 0.95, "pro_tip": "..", "groundingSources": [{"title": "..", "url": ".."}]}`;
    
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
    });
    
    const data = JSON.parse(response.text || "{}");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = chunks.map((chunk: any) => ({
      title: chunk.web?.title || "رابط خارجي",
      url: chunk.web?.uri
    })).filter((s: any) => s.url);

    return { ...data, groundingSources };
  } catch (error) {
    console.error("Smart analysis failed after retries:", error);
    return { summary: "أبخص ينصح بهذا كخيار متوازن.", points: ["متوافق مع ميزانيتك."], groundingSources: [] };
  }
}

export async function askAbkhas(question: string, prefs: UserPreferences): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت "أبخص". سؤال السائل: ${question}`,
        config: { tools: [{ googleSearch: {} }] }
      });
    });
    return result.text || 'أبخص مشغول حالياً.';
  } catch (error) { 
    console.error("Chat failed after retries:", error);
    return 'أبخص مشغول حالياً بسبب ضغط الطلبات.'; 
  }
}

export async function identifyProductFromImage(base64Image: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "ما هو موديل هذا الجهاز؟" },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      });
    });
    return response.text?.trim() || null;
  } catch (error) { 
    console.error("Visual identification failed after retries:", error);
    return null; 
  }
}

export async function findNearbyStores(productName: string, latitude: number, longitude: number) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find physical stores in Saudi Arabia that sell ${productName} near my coordinates.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude,
                longitude
              }
            }
          }
        },
      });
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        uri: chunk.maps.uri
      }));
  } catch (error) {
    console.error("Maps grounding error after retries:", error);
    return [];
  }
}
