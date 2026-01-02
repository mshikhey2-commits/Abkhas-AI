# 🚀 دليل البناء والنشر النهائي - Build & Deployment Guide

## المحتويات
- [البيئة المطلوبة](#البيئة-المطلوبة)
- [بناء الإصدار الإنتاجي](#بناء-الإصدار-الإنتاجي)
- [بناء تطبيق iOS](#بناء-تطبيق-ios)
- [بناء تطبيق Android](#بناء-تطبيق-android)
- [الاختبار والتحقق](#الاختبار-والتحقق)
- [النشر على المتاجر](#النشر-على-المتاجر)
- [المراقبة بعد النشر](#المراقبة-بعد-النشر)

---

## البيئة المطلوبة

### 1. **Node.js و npm**
```bash
# التحقق من الإصدار
node --version  # يجب أن يكون >= 18.x
npm --version   # يجب أن يكون >= 9.x

# تحديث npm إذا لزم الأمر
npm install -g npm@latest
```

### 2. **متطلبات iOS (macOS فقط)**
```bash
# تثبيت Xcode
xcode-select --install

# التحقق من التثبيت
xcode-select -p

# تثبيت CocoaPods
sudo gem install cocoapods

# تثبيت Capacitor CLI
npm install -g @capacitor/cli
```

### 3. **متطلبات Android**
```bash
# تثبيت Android SDK (عبر Android Studio)
# أو استخدم Homebrew على Mac
brew install android-sdk
brew install android-ndk
brew install gradle

# تعيين متغيرات البيئة
export ANDROID_SDK_ROOT=~/Library/Android/sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
```

### 4. **متغيرات البيئة**
```bash
# إنشاء ملف .env.production
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://api.abkhas.app
VITE_GEMINI_API_KEY=your-key-here
VITE_GOOGLE_API_KEY=your-key-here
VITE_FIREBASE_API_KEY=your-key-here
VITE_GA_ID=your-ga-id-here
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
EOF
```

---

## بناء الإصدار الإنتاجي

### Step 1: تحضير البيئة
```bash
# الدخول إلى المجلد
cd "/Users/mo/Desktop/ABKHAS AI"

# تثبيت الاعتماديات
npm install --legacy-peer-deps

# التحقق من الأخطاء
npm run build

# اختبار الإنتاج محلياً
npm run preview
```

### Step 2: التحسينات الإنتاجية
```bash
# تحسين الحزم
npm run build -- --minify

# تحليل حجم الحزمة
npm install -g vite-plugin-visualizer
npm run build -- --analyze
```

### Step 3: اختبار الأداء
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://localhost:5173 --chrome-flags="--headless"

# WebPageTest
# زيارة https://www.webpagetest.org وتحميل الموقع الخاص بك
```

---

## بناء تطبيق iOS

### خطوة 1: إنشاء مشروع Capacitor
```bash
# تثبيت Capacitor
npm install @capacitor/core @capacitor/cli

# إنشاء مشروع iOS
npx cap add ios

# بناء الويب
npm run build

# نسخ الملفات للـ iOS
npx cap sync ios
npx cap copy ios
```

### خطوة 2: فتح Xcode
```bash
# فتح مشروع Xcode
npx cap open ios

# أو يدويياً
open ios/App/App.xcworkspace
```

### خطوة 3: إعداد التوقيع
1. اختر "App" في الشريط الجانبي
2. انتقل إلى **Signing & Capabilities**
3. اختر فريقك (Apple Developer Team)
4. تحديث Bundle ID إلى `com.abkhas.app`
5. تفعيل Capabilities:
   - Camera (للبحث البصري)
   - Location (للمتاجر القريبة)
   - Calendar (للتنبيهات)
   - HealthKit (للتكامل المستقبلي)

### خطوة 4: بناء الإصدار
```bash
# طريقة 1: عبر Xcode
# Product → Scheme → Edit Scheme
# اختر "Release"
# Product → Build

# طريقة 2: عبر سطر الأوامر
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/App.xcarchive \
  archive

# التحقق من الإصدار
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ios/exportOptions.plist \
  -exportPath build/ipa
```

### خطوة 5: اختبار TestFlight
```bash
# تحميل على TestFlight (من Xcode)
# Organizer → Archives → Upload to App Store
```

---

## بناء تطبيق Android

### خطوة 1: إنشاء مشروع Capacitor
```bash
# إضافة Android
npx cap add android

# بناء الويب وتزامنه
npm run build
npx cap sync android
npx cap copy android
```

### خطوة 2: إعداد مفتاح التوقيع
```bash
# إنشاء keystore
keytool -genkey -v \
  -keystore ~/abkhas.keystore \
  -keyalias abkhas \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -storepass your-password \
  -keypass your-password \
  -dname "CN=Abkhas Inc, O=Abkhas, C=SA"

# اختبار المفتاح
keytool -list -v -keystore ~/abkhas.keystore
```

### خطوة 3: إعدادات Android Studio
```bash
# فتح مشروع Android
open android/

# أو من سطر الأوامر
cd android
./gradlew clean
./gradlew build
```

### خطوة 4: بناء APK أو AAB
```bash
# AAB (الطريقة الحديثة، مطلوبة للـ Google Play)
./gradlew bundleRelease \
  -Pabkhas.signing.key.store.file=~/abkhas.keystore \
  -Pabkhas.signing.key.store.password=your-password \
  -Pabkhas.signing.key.alias=abkhas \
  -Pabkhas.signing.key.password=your-password

# APK (للاختبار)
./gradlew assembleRelease \
  -Pabkhas.signing.key.store.file=~/abkhas.keystore \
  -Pabkhas.signing.key.store.password=your-password \
  -Pabkhas.signing.key.alias=abkhas \
  -Pabkhas.signing.key.password=your-password
```

### خطوة 5: التحقق من الحزمة
```bash
# فحص AAB
bundletool build-apks \
  --bundle=android/app/release/app.aab \
  --output=test.apks \
  --ks=~/abkhas.keystore

# فحص APK
aapt dump badging android/app/release/app-release.apk
```

---

## الاختبار والتحقق

### اختبارات الأداء
```bash
# قياس وقت البدء
adb logcat -c
adb logcat | grep "ActivityManager:"

# قياس استخدام الذاكرة
adb shell dumpsys meminfo com.abkhas.app

# قياس استهلاك البطارية
adb shell dumpsys batterystats com.abkhas.app
```

### اختبارات الوظيفة
```bash
# اختبار على جهاز فعلي
# iOS: اختر جهازك في Xcode واضغط Run
# Android: اختر جهازك في Android Studio واضغط Run

# اختبار على محاكي
# iOS: xcrun simctl list -> xcrun simctl boot <device>
# Android: emulator -avd <device_name>
```

### اختبارات الأمان
```bash
# فحص الأذونات
adb shell pm list permissions -u | grep "com.abkhas"

# فحص API غير المشفرة
adb logcat | grep "cleartext"

# فحص معرفات المستخدمين الحساسة
adb logcat | grep -i "token\|password\|api_key"
```

### اختبارات التوافقية
```bash
# قائمة الأجهزة الشهيرة التي يجب اختبارها:

## iOS
- iPhone 15 Pro Max
- iPhone 15
- iPhone SE (3rd generation)
- iPad (10th generation)

## Android
- Samsung Galaxy S24 Ultra (Android 14)
- Google Pixel 9 Pro (Android 14)
- OnePlus 12 (Android 14)
- Xiaomi 14 (Android 14)
- Samsung Galaxy A54 (Android 13) - ميزانية منخفضة
- Samsung Galaxy S10 (Android 12) - جهاز قديم
```

---

## النشر على المتاجر

### نشر iOS على App Store

#### 1. تسجيل الحساب
```
1. اذهب إلى https://developer.apple.com
2. انقر على "Account"
3. سجل الدخول بـ Apple ID
4. ادفع رسم العضوية ($99/سنة)
```

#### 2. إعداد App Store Connect
```
1. اذهب إلى https://appstoreconnect.apple.com
2. انقر على "My Apps"
3. اضغط على "+"
4. اختر "New App"
5. ملأ البيانات:
   - Name: أبخص
   - Platform: iOS
   - Primary Language: Arabic
   - Bundle ID: com.abkhas.app
```

#### 3. إضافة البيانات الوصفية
```
1. App Information:
   - Category: Shopping
   - Subcategory: Shopping (optional)

2. Pricing and Availability:
   - Price: Free
   - Regions: جميع المناطق المدعومة

3. App Description:
   - Subtitle: مساعد الشراء الذكي
   - Description: النص الوصفي الكامل بالعربية والإنجليزية

4. Keywords:
   - تسوق, مقارنة أسعار, عروض, خصومات

5. Support URL:
   - https://support.abkhas.app

6. Privacy Policy:
   - https://abkhas.app/privacy
```

#### 4. البناء والتحميل
```bash
# من Xcode
# Product → Archive
# Organizer → Distribute App

# أو من سطر الأوامر
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist exportOptions.plist \
  -exportPath ipa

# altool للتحميل
xcrun altool --upload-app \
  -f "ipa/Abkhas.ipa" \
  -t ios \
  -u "your-apple-id@example.com" \
  -p "your-app-specific-password" \
  --output-format xml
```

#### 5. المراجعة والموافقة
```
الوقت المتوقع: 24-48 ساعة
الفحوصات الشائعة:
- الأداء والثبات
- الخصوصية والأمان
- الامتثال لإرشادات App Store
- جودة التصميم
```

### نشر Android على Google Play

#### 1. إنشاء حساب
```
1. اذهب إلى https://play.google.com/apps/publish
2. انقر على "Create app"
3. ادفع رسم التسجيل ($25 مرة واحدة فقط)
```

#### 2. إعداد متجر Google Play
```
1. App details:
   - App name: أبخص
   - Default language: Arabic
   - App category: Shopping

2. App description:
   - Short description (80 حرف)
   - Full description (4000 حرف)
   - Screenshots: 5 صور بحجم 1080x1920

3. Graphics:
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Hero image: 1024x500 PNG (اختياري)

4. Contact details:
   - Email: support@abkhas.app
   - Website: https://abkhas.app
   - Privacy policy: https://abkhas.app/privacy
```

#### 3. تحميل AAB
```bash
# من Google Play Console
# Release → Production
# Create new release
# Upload your AAB file

# أو من سطر الأوامر
gcloud auth login
gcloud play releases create \
  --package-name=com.abkhas.app \
  --release-name="1.0.0" \
  --bundle=android/app/release/app.aab \
  --track=internal

# للإصدار للعموم
gcloud play releases create \
  --package-name=com.abkhas.app \
  --release-name="1.0.0" \
  --bundle=android/app/release/app.aab \
  --track=production
```

#### 4. المراجعة والموافقة
```
الوقت المتوقع: 2-4 ساعات (عادة)
الفحوصات الشائعة:
- الأداء والأمان
- الخصوصية والامتثال
- جودة المتجر
```

---

## المراقبة بعد النشر

### المقاييس الرئيسية المراد متابعتها
```javascript
// Firebase Analytics Events
analytics.logEvent('app_launched', {
  build_number: 1,
  app_version: '1.0.0',
  platform: 'ios' // أو 'android'
});

analytics.logEvent('user_signup', {
  signup_method: 'email'
});

analytics.logEvent('search_performed', {
  search_query: query,
  results_count: results.length
});

analytics.logEvent('product_viewed', {
  product_id: productId,
  price: price
});

analytics.logEvent('comparison_made', {
  products_count: count
});
```

### Google Play Console Dashboard
```
متابعة:
1. Ratings & reviews (التقييمات والتعليقات)
2. Crashes & ANRs (الأعطال والتحميل)
3. User acquisition (اكتساب المستخدمين)
4. Retention (الاحتفاظ بالمستخدمين)
5. Revenue (إذا كان تطبيق مدفوع)
```

### App Store Connect Dashboard
```
متابعة:
1. Sales & Trends (المبيعات والاتجاهات)
2. Crashes (الأعطال)
3. Performance (الأداء)
4. Reviews (التعليقات)
5. Ratings (التقييمات)
```

### Crash Reporting
```javascript
// Firebase Crashlytics
import { initializeApp } from 'firebase/app';
import { initializeCrashlytics } from 'firebase/crashlytics';

const app = initializeApp(firebaseConfig);
const crashlytics = initializeCrashlytics(app);

// تسجيل الأخطاء يدويياً
try {
  // code
} catch (error) {
  crashlytics.recordError(error);
}
```

### محراقبة الأداء
```javascript
// Firebase Performance Monitoring
import { initializePerformance } from 'firebase/performance';

const perf = initializePerformance(app);

// قياس أوقات محددة
const trace = perf.trace('page_load');
trace.start();
// your code
trace.stop();

// المقاييس المهمة:
// - Page Load Time: < 2 seconds
// - API Response Time: < 1 second
// - Memory Usage: < 200MB
// - Battery Drain: < 10% per hour
```

---

## تحديث التطبيق

### إصدار تحديث جديد
```bash
# تحديث رقم الإصدار
npm version minor  # 1.0.0 → 1.1.0
# أو
npm version patch  # 1.0.0 → 1.0.1

# بناء الإصدار الجديد
npm run build

# إعادة البناء للمنصات
npx cap sync ios
npx cap sync android
```

### توزيع التحديث
```
iOS (App Store Connect):
1. الإصدار الجديد يحتاج مراجعة كاملة
2. الوقت: 24-48 ساعة
3. التحديث يتم تلقائياً للمستخدمين

Android (Google Play):
1. يمكن الإصدار كـ staged rollout
2. ابدأ بـ 5% من المستخدمين
3. زد النسبة تدريجياً (10%, 25%, 50%, 100%)
4. التحديث يتم تلقائياً
```

---

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### مشكلة: Xcode build فشل
```bash
# التنظيف والإعادة
rm -rf ~/Library/Developer/Xcode/DerivedData
npx cap sync ios
npx cap open ios
# ثم من Xcode: Product → Clean Build Folder
```

#### مشكلة: Android build فشل
```bash
# التنظيف
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
npx cap sync android
```

#### مشكلة: App rejected من App Store
```
الأسباب الشائعة:
1. مشاكل الأداء (التعطل أو البطء)
2. قضايا الخصوصية (استخدام البيانات بدون موافقة)
3. انتهاك إرشادات التصميم
4. رسائل خطأ غير واضحة

الحل: اقرأ ملاحظات المراجعة بعناية وأعد التقديم
```

#### مشكلة: App rejected من Google Play
```
الأسباب الشائعة:
1. سياسة الخصوصية غير واضحة
2. تطلب أذونات غير ضرورية
3. الإعلانات العدوانية

الحل: اقرأ رسالة الرفض وأصحح المشكلة
```

---

## Checklist النشر النهائي

```
قبل النشر:
☐ جميع الاختبارات تمرت بنجاح
☐ عدم وجود TypeScript errors
☐ عدم وجود console errors/warnings
☐ اختبار على جهاز فعلي (iOS و Android)
☐ اختبار التطبيق بدون إنترنت
☐ اختبار الأداء (حمل 3G)
☐ اختبار على أجهزة قديمة
☐ تحديث رقم الإصدار
☐ إنشاء نسخة احتياطية من المفاتيح
☐ استعراض سياسة الخصوصية

النشر:
☐ تحميل على App Store Connect
☐ تحميل على Google Play Console
☐ ملأ جميع البيانات الوصفية
☐ التحقق من الصور والوصفات
☐ تقديم للمراجعة

بعد النشر:
☐ مراقبة التقييمات والتعليقات
☐ مراقبة معدل الأعطال
☐ مراقبة الأداء
☐ الرد على المشاكل بسرعة
☐ تخطيط التحديثات التالية
```

---

## الموارد المفيدة

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [Firebase Console](https://console.firebase.google.com/)
- [Fastlane (Automation Tool)](https://fastlane.tools/)

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0
**الحالة:** جاهز للنشر ✅
