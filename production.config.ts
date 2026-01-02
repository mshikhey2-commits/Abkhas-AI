# 🚀 ملف الإعدادات الإنتاجية - production.config.ts

/**
 * إعدادات الإنتاج الكاملة لنشر Abkhas على App Store و Google Play
 * هذا الملف يحتوي على جميع الإعدادات الأمنية والأداء
 */

export const productionConfig = {
  // ==========================================
  // معلومات التطبيق الأساسية
  // ==========================================
  app: {
    name: 'أبخص - مساعد الشراء الذكي',
    englishName: 'Abkhas - Smart Shopping Assistant',
    version: '1.0.0',
    buildNumber: 1,
    bundleId: {
      ios: 'com.abkhas.app',
      android: 'com.abkhas.app'
    },
    description: 'مساعدك الذكي الذي يحلل آلاف المتاجر لضمان أفضل صفقة في السوق السعودي',
    website: 'https://abkhas.app',
    supportEmail: 'support@abkhas.app'
  },

  // ==========================================
  // الحد الأدنى من الإصدارات المدعومة
  // ==========================================
  minimumOS: {
    ios: '14.0',
    android: '8.0' // API Level 26
  },

  // الهدف من الإصدارات
  targetOS: {
    ios: '17.0',
    android: '14.0' // API Level 34
  },

  // ==========================================
  // معلومات الجهات المسؤولة
  // ==========================================
  developer: {
    name: 'Abkhas Inc',
    website: 'https://abkhas.app',
    supportUrl: 'https://support.abkhas.app',
    privacyPolicyUrl: 'https://abkhas.app/privacy',
    termsOfServiceUrl: 'https://abkhas.app/terms',
    email: 'support@abkhas.app',
    phone: '+966-XX-XXXX-XXXX'
  },

  // ==========================================
  // الإعدادات الأمنية
  // ==========================================
  security: {
    // تشفير HTTPS فقط
    enforceHttps: true,
    
    // رؤوس الأمان
    securityHeaders: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' https://trusted.cdn.com"
    },

    // CORS
    corsAllowedOrigins: [
      'https://abkhas.app',
      'https://app.abkhas.app'
    ],

    // تشفير البيانات
    encryptionEnabled: true,
    encryptionAlgorithm: 'AES-256-GCM',

    // مفاتيح API
    apiKeys: {
      gemini: process.env.VITE_GEMINI_API_KEY,
      google: process.env.VITE_GOOGLE_API_KEY,
      analytics: process.env.VITE_ANALYTICS_KEY
    },

    // حماية من الهجمات
    rateLimit: {
      enabled: true,
      requestsPerMinute: 100,
      requestsPerHour: 5000
    }
  },

  // ==========================================
  // إعدادات الأداء والبناء
  // ==========================================
  performance: {
    // تقليل الملفات
    minification: {
      js: true,
      css: true,
      html: true
    },

    // ضغط الصور
    imageOptimization: {
      format: 'webp', // مع fallback لـ PNG/JPG
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 80
    },

    // تقسيم الكود
    codeSpitting: {
      vendor: ['react', 'react-dom'],
      ui: ['lucide-react', 'recharts'],
      utils: ['utils/*']
    },

    // حدود الحجم
    maxBundleSize: {
      js: '500KB',
      css: '100KB',
      images: '2MB',
      total: '50MB'
    },

    // إزالة البيانات غير الضرورية
    removeConsole: true,
    removeSourceMaps: true,
    removeDebugInfo: true,

    // التخزين المؤقت
    caching: {
      enabled: true,
      ttl: 86400, // 24 ساعات
      maxSize: '100MB'
    }
  },

  // ==========================================
  // إعدادات الخصوصية
  // ==========================================
  privacy: {
    // البيانات المجمعة
    dataCollection: {
      analyticsEnabled: true,
      crashReportingEnabled: true,
      userBehaviorTracking: true,
      locationTracking: false, // تحتاج موافقة صريحة
      deviceIdentifier: true
    },

    // المشاركة مع أطراف ثالثة
    thirdParties: [
      {
        name: 'Google Analytics',
        purpose: 'تحليل الأداء والاستخدام',
        dataProcessed: ['user_id', 'events', 'device_info'],
        privacyPolicy: 'https://policies.google.com/privacy'
      },
      {
        name: 'Firebase',
        purpose: 'الإشعارات والتحليلات',
        dataProcessed: ['push_tokens', 'app_events'],
        privacyPolicy: 'https://firebase.google.com/support/privacy'
      }
    ],

    // GDPR و CCPA Compliance
    compliance: {
      gdprCompliant: true,
      ccpaCompliant: true,
      childSafetyCompliant: true, // COPPA
      
      // الحقوق
      userRights: {
        dataAccess: true,
        dataPortability: true,
        dataDelete: true,
        optOut: true
      }
    },

    // فترات الاحتفاظ بالبيانات
    dataRetention: {
      analyticsData: '90 days',
      userPreferences: '1 year',
      interactionHistory: '6 months',
      crashReports: '30 days'
    }
  },

  // ==========================================
  // الأذونات المطلوبة
  // ==========================================
  permissions: {
    ios: [
      {
        name: 'NSLocationWhenInUseUsageDescription',
        reason: 'لإيجاد متاجر قريبة منك',
        type: 'optional'
      },
      {
        name: 'NSCameraUsageDescription',
        reason: 'للبحث البصري عن المنتجات',
        type: 'optional'
      },
      {
        name: 'NSPhotoLibraryUsageDescription',
        reason: 'لتحميل صور المنتجات',
        type: 'optional'
      },
      {
        name: 'NSCalendarsUsageDescription',
        reason: 'لتنبيهات الأسعار',
        type: 'optional'
      }
    ],

    android: [
      {
        name: 'ACCESS_COARSE_LOCATION',
        reason: 'لإيجاد متاجر قريبة',
        type: 'optional'
      },
      {
        name: 'CAMERA',
        reason: 'للبحث البصري',
        type: 'optional'
      },
      {
        name: 'READ_EXTERNAL_STORAGE',
        reason: 'لتحميل الصور',
        type: 'optional'
      },
      {
        name: 'INTERNET',
        reason: 'للاتصال بالخوادم',
        type: 'required'
      }
    ]
  },

  // ==========================================
  // إعدادات التحليلات والمراقبة
  // ==========================================
  analytics: {
    // Google Analytics
    googleAnalyticsId: process.env.VITE_GA_ID,
    
    // Firebase
    firebaseConfig: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: 'abkhas.firebaseapp.com',
      projectId: 'abkhas-app',
      storageBucket: 'abkhas-app.appspot.com',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    },

    // الأحداث المتتبعة
    trackedEvents: [
      'app_open',
      'app_close',
      'search_performed',
      'product_viewed',
      'product_compared',
      'product_purchased',
      'user_signed_up',
      'user_logged_in',
      'app_crash',
      'api_error'
    ],

    // مراقبة الأخطاء
    errorTracking: {
      enabled: true,
      service: 'Sentry', // أو Firebase Crashlytics
      sampleRate: 1.0, // 100%
      attachStackTrace: true,
      captureLocalVariables: false // للأمان
    }
  },

  // ==========================================
  // إعدادات المتاجر
  // ==========================================
  storeMetadata: {
    // الفئات
    categories: {
      ios: 'Shopping',
      android: 'Shopping'
    },

    // التصنيف العمري
    ageRating: {
      ios: '4+',
      android: 'PEGI 3'
    },

    // الكلمات الرئيسية
    keywords: [
      'تسوق',
      'مقارنة أسعار',
      'متاجر سعودية',
      'توصيات ذكية',
      'عروض',
      'خصومات',
      'شراء ذكي'
    ],

    // لقطات الشاشة (التوصيات)
    screenshots: {
      count: 5,
      sizes: {
        ios: '1170x2532',
        android: '1080x1920'
      },
      contentSuggestions: [
        'صورة لشاشة البحث',
        'مقارنة المنتجات',
        'التوصيات الذكية',
        'تتبع الأسعار',
        'مكافآت ولوياليتي'
      ]
    }
  },

  // ==========================================
  // إعدادات الإشعارات
  // ==========================================
  notifications: {
    enabled: true,
    pushService: 'Firebase Cloud Messaging',
    userPermissionRequired: true,
    
    notificationTypes: [
      'price_drop',        // انخفاض السعر
      'product_available', // توفر المنتج
      'special_offer',     // عروض خاصة
      'loyalty_reward'     // مكافآت لوياليتي
    ]
  },

  // ==========================================
  // إعدادات الدعم والتحديثات
  // ==========================================
  support: {
    // قنوات الدعم
    channels: {
      email: 'support@abkhas.app',
      whatsapp: '+966-XX-XXXX-XXXX',
      twitter: '@abkhas_app',
      instagram: '@abkhas_app',
      website: 'https://support.abkhas.app'
    },

    // سياسة التحديثات
    updatePolicy: {
      checkForUpdates: true,
      updateFrequency: 'weekly',
      forcedUpdateVersion: '1.5.0', // نسخة معينة تُجبر على التحديث
      releaseNotesUrl: 'https://abkhas.app/releases'
    },

    // معلومات الدعم
    supportInfo: {
      responseTime: '24 hours',
      language: 'Arabic and English',
      faqUrl: 'https://support.abkhas.app/faq'
    }
  },

  // ==========================================
  // متغيرات البيئة الإنتاجية
  // ==========================================
  environment: {
    apiBaseUrl: 'https://api.abkhas.app',
    cdnUrl: 'https://cdn.abkhas.app',
    websiteUrl: 'https://abkhas.app',
    environment: 'production',
    debugMode: false,
    loggingLevel: 'error' // فقط الأخطاء
  },

  // ==========================================
  // معايير قبول التطبيق
  // ==========================================
  acceptanceCriteria: {
    minimumRating: 4.0,
    maxCrashRate: 0.1, // 0.1%
    maxErrorRate: 0.5,  // 0.5%
    performanceTargets: {
      appStartTime: '< 3 seconds',
      pageLoadTime: '< 2 seconds',
      apiResponseTime: '< 1 second',
      memoryUsage: '< 200MB',
      batteryDrain: '< 10% per hour'
    }
  }
};

export default productionConfig;
