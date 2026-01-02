# 📱 دليل نشر Abkhas على App Store و Google Play Store

## 🎯 المتطلبات الأساسية

### للـ iOS (Apple App Store)
```
✅ جهاز Mac بنظام macOS 11+
✅ حساب Apple Developer (99$ سنوياً)
✅ Xcode 13+
✅ iOS 14.0+ كـ minimum target
✅ شهادات توقيع Apple
```

### للـ Android (Google Play Store)
```
✅ حساب Google Play Developer (25$ مرة واحدة)
✅ Android SDK
✅ Gradle
✅ JDK 11+
✅ مفتاح توقيع KeyStore
```

---

## 📋 Checklist قبل النشر

### 1. التحضيرات العامة
```
☐ نسخة الإصدار: v1.0.0
☐ Build number: 1
☐ App name: أبخص - مساعد الشراء الذكي
☐ Bundle ID: com.abkhas.app
☐ Minimum OS: iOS 14 / Android 8
☐ Target OS: iOS 17+ / Android 14+
```

### 2. الملفات والأيقونات
```
☐ App Icon: 1024x1024 px (لـ iOS و Android)
☐ Launch Screen: 1242x2208 px
☐ Screenshots: 1170x2532 px (iPhone)
☐ Screenshots: 1080x1920 px (Android)
☐ Privacy Policy: نص شامل
☐ Terms of Service: نص شامل
☐ Support Email: support@abkhas.app
```

### 3. الأمان والخصوصية
```
☐ HTTPS فقط للـ API calls
☐ Privacy Policy نشر
☐ Data collection disclosure
☐ GDPR compliance
☐ Child safety (COPPA if needed)
☐ Permission justification
```

### 4. الأداء والاختبار
```
☐ اختبار على جهاز فعلي iOS
☐ اختبار على جهاز فعلي Android
☐ اختبار الأداء (< 3 ثواني تحميل)
☐ اختبار البطارية (< 10% per hour)
☐ اختبار الذاكرة (< 200MB)
☐ اختبار الشبكة (بطيء و سريع)
```

---

## 🔧 الإعدادات التقنية

### 1. ملف vite.config.ts (محسّن للموبايل)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // تصغير الملفات للموبايل
    minify: 'terser',
    // تقسيم chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['lucide-react', 'recharts'],
        }
      }
    },
    // تحسين الحجم
    cssCodeSplit: true,
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
      }
    }
  },
  // للـ PWA
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify('1.0.0')
  }
})
```

### 2. ملف package.json (محدث)

```json
{
  "name": "abkhas-ai-shopping-assistant",
  "version": "1.0.0",
  "type": "module",
  "description": "أبخص - مساعد الشراء الذكي في السعودية",
  "homepage": "https://abkhas.app",
  "bugs": {
    "url": "https://support.abkhas.app"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-helmet-async": "^1.3.0",
    "lucide-react": "0.460.0",
    "recharts": "2.13.0",
    "@google/genai": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "~5.8.2",
    "vite": "6.2.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

---

## 📱 إعدادات iOS (Apple)

### 1. App Store Connect Setup

```
1. انتقل إلى: https://appstoreconnect.apple.com
2. انقر: "My Apps" → "+"
3. اختر: "New App"
4. ملء المعلومات:
   - Platform: iOS
   - App Name: أبخص
   - Bundle ID: com.abkhas.app
   - SKU: ABKHAS_001
   - Access Rights: Full Access
```

### 2. متطلبات App Store

```
الحد الأدنى:
✅ App Icon: 1024x1024 (JPEG or PNG)
✅ 2 Screenshots بحد أدنى (1170x2532)
✅ Description: 170 حرف
✅ Keywords: 100 حرف
✅ Support URL: https://support.abkhas.app
✅ Privacy Policy URL: https://abkhas.app/privacy

معلومات الإصدار:
✅ Version: 1.0.0
✅ Build: 1
✅ Release Notes: ملخص الميزات

تفاصيل التصنيف:
✅ Category: Shopping
✅ Age Rating: 4+
✅ Content rights: Developer owns content
```

### 3. البناء لـ iOS

```bash
# تثبيت Xcode build tools
sudo xcode-select --install

# بناء للـ iOS (يتطلب React Native أو Capacitor)
npm run build
# ثم يتم تحويل الـ web build إلى native iOS

# باستخدام Capacitor (الأفضل):
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap build ios
```

---

## 🤖 إعدادات Android (Google)

### 1. Google Play Console Setup

```
1. انتقل إلى: https://play.google.com/console
2. انقر: "Create App"
3. ملء المعلومات:
   - App Name: أبخص
   - Default Language: العربية
   - App Type: Application
   - Category: Shopping
   - Content Rating: Everyone
```

### 2. متطلبات Google Play

```
الحد الأدنى:
✅ App Icon: 512x512 (PNG 32-bit)
✅ 3 Screenshots بحد أدنى (1080x1920)
✅ Feature Graphic: 1024x500
✅ Description: 4000 حرف
✅ Short Description: 80 حرف
✅ Privacy Policy URL: https://abkhas.app/privacy

معلومات الإصدار:
✅ Version Name: 1.0.0
✅ Version Code: 1
✅ What's New: ملخص الميزات (300 حرف)

Content Rating:
✅ Target Age: 3+
✅ Content Descriptors: none
```

### 3. إنشاء مفتاح التوقيع

```bash
# إنشاء KeyStore جديد
keytool -genkey -v -keystore abkhas-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias abkhas-key \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Abkhas, O=Abkhas Inc, L=Riyadh, ST=Riyadh, C=SA"

# حفظ البيانات بأمان!
```

### 4. البناء لـ Android

```bash
# باستخدام Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap build android

# أو باستخدام React Native CLI
npx react-native init Abkhas --template
npm run android -- --release
```

---

## 🎨 إعدادات الـ Branding

### الألوان والأنماط:
```
الألوان الأساسية:
- Primary: #002D9C (أزرق داكن)
- Secondary: #1E90FF (أزرق فاتح)
- Accent: #FF9500 (برتقالي)

الخطوط:
- عنوان: "Tajawal" أو "Cairo" (للعربية)
- بدن النص: "Segoe UI" أو "Inter"

الأيقونات:
- استخدم Lucide React أو Material Icons
- 24px/32px للـ UI icons
- 1024px للـ App icon
```

---

## 🔐 الأمان والخصوصية

### ملف Privacy Policy (نموذج):

```markdown
# سياسة الخصوصية - أبخص

## البيانات المجمعة:
1. بيانات الجهاز (معرف فريد، نسخة iOS/Android)
2. بيانات الاستخدام (الميزات المستخدمة)
3. بيانات الموقع (مع الموافقة)
4. بيانات المنتجات المشاهدة

## الاستخدام:
- تحسين الخدمة والتوصيات
- تحليل الأداء
- منع الغش

## المشاركة:
- لا نشارك البيانات مع أطراف ثالثة
- استثناء: خدمات التحليل (Google Analytics)

## الأمان:
- تشفير HTTPS لجميع البيانات
- لا نخزن البيانات الحساسة محلياً

## الحقوق:
- يمكن حذف البيانات بطلب
- يمكن تصدير البيانات
```

---

## 📊 الاختبار قبل النشر

### 1. اختبارات الأداء

```bash
# بناء الـ production
npm run build:prod

# فحص حجم الملفات
npm ls

# اختبار الأداء
npm run test:coverage
```

**معايير النجاح:**
- ✅ حجم التطبيق < 50MB
- ✅ وقت التحميل < 3 ثواني
- ✅ استهلاك الذاكرة < 200MB
- ✅ استهلاك البطارية < 10% per hour

### 2. اختبارات الأمان

```bash
# فحص الثغرات
npm audit

# فحص التبعيات
npm ls --all

# حذف console logs من الإنتاج
# (بالفعل في vite.config.ts)
```

### 3. اختبارات التوافقية

```
iOS:
☐ iPhone 12 (6.1")
☐ iPhone 12 Pro Max (6.7")
☐ iPhone SE (4.7")
☐ iPad (12.9")

Android:
☐ Samsung Galaxy S20
☐ Google Pixel 6
☐ OnePlus 9
☐ Xiaomi 11
```

---

## 📈 خريطة الطريق بعد النشر

### الأسبوع الأول:
- ✅ مراقبة الـ crashes والأخطاء
- ✅ قراءة التقييمات والملاحظات
- ✅ إصلاح أي bugs عاجل

### الشهر الأول:
- ✅ تحسين الأداء حسب البيانات
- ✅ إضافة ميزات مطلوبة
- ✅ الإصدار 1.1 مع تحسينات

### الربع الأول:
- ✅ توسع لدول عربية أخرى
- ✅ دعم لغات إضافية
- ✅ تحسينات UI/UX

---

## 💰 التكاليف الموقع

| البند | التكلفة | الملاحظات |
|------|--------|----------|
| **Apple Developer** | $99/سنة | مطلوب |
| **Google Play** | $25 | مرة واحدة |
| **Domain** | $10-15/سنة | abkhas.app |
| **Privacy Policy** | $0 | محرر نصوص |
| **SSL Certificate** | $0-200/سنة | Let's Encrypt مجاني |
| **الإجمالي سنوياً** | **$110-215** | استثمار قليل |

---

## ✅ قائمة النشر النهائية

```
قبل الضغط على "Submit":

☐ Version number صحيح (1.0.0)
☐ Build number صحيح (1)
☐ Privacy Policy URL نشيط
☐ App screenshots مرفوعة (بحد أدنى 2-3)
☐ App icon مرفوع (1024x1024)
☐ Description كامل ومنسق
☐ Keywords مناسبة
☐ Content rating صحيح
☐ Permissions معرّفة
☐ اختبار على جهاز حقيقي ✓

☐ Release Notes محدثة
☐ Support contact معرّف
☐ لا console errors في الإنتاج
☐ لا warnings من المحقق
☐ جميع الروابط تعمل
☐ اللغة العربية تعمل صحيح
☐ الوضع الليلي يعمل
☐ الشاشات المختلفة متوافقة
☐ الأداء مقبول
☐ البيانات الحساسة آمنة
```

---

## 🎯 الخطوات النهائية

### 1. بناء الإصدار الأخير:
```bash
npm run build:prod
npm run test:coverage
npm run type-check
```

### 2. تحميل على المتاجر:
- App Store Connect → ثم Upload
- Google Play Console → ثم Upload

### 3. الانتظار للموافقة:
- iOS: 24-48 ساعة عادة
- Android: 2-4 ساعات عادة

### 4. الإعلان والتسويق:
- Tweet عن الإطلاق
- Instagram story
- إرسال بريد للمهتمين
- اطلب reviews و ratings

---

**حالة الجاهزية:** ✅ **جاهز للنشر**
**التاريخ:** 25 ديسمبر 2025
**الإصدار:** 1.0.0
