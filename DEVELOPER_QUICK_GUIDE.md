# 🚀 دليل سريع للمطورين - Abkhas Code Quality

## ⚡ بدء سريع - 2 دقيقة

### ما يجب تتذكره:

#### 1️⃣ المؤشرات الحرجة 🟥
```typescript
// عندما تقوم بـ async operations:
try {
  // 🟥 CRITICAL_ERROR_BOUNDARY: Monitor race conditions
  const data = await fetchData();
} catch (error) {
  console.error('🟥 CRITICAL_ERROR_BOUNDARY:', error);
}

// عندما تضيف useState جديد:
// 🟥 CRITICAL_STATE_CONSOLIDATION: Check if this can be combined
const [state, setState] = useState({...});
```

#### 2️⃣ استخدام الـ Utilities الجديدة ✅
```typescript
// بدلاً من:
const [isLoading, setIsLoading] = useState(false);
trigger('success'); // ❌ مباشر

// استخدم:
const feedback = useInteractionFeedback();
feedback.onSuccess(); // ✅ consolidated

// بدلاً من:
const reader = new FileReader(); // ❌ كود معقد
reader.readAsDataURL(file);

// استخدم:
const base64 = await readFileAsBase64(file); // ✅ utility
const { isValid, errorMessage } = validateFile(file); // ✅ شامل
```

---

## 📚 المراجع السريعة

### Hooks الجديدة
```typescript
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

const feedback = useInteractionFeedback();
feedback.onSuccess();      // ✅ شراء، مشاركة، تصويت
feedback.onAction();       // ✅ click، toggle
feedback.onLight();        // ✅ زر صغير
feedback.onWarning();      // ✅ تحذير
feedback.onError();        // ✅ خطأ
feedback.onBatch();        // ✅ تأكيدات متعددة
```

### Utils الجديدة
```typescript
import { 
  readFileAsBase64,
  readFileAsDataURL,
  validateEntity,
  validateFile,
  validateFileType,
  validateFileSize
} from '@/utils/validationUtils';

// قراءة الملف
const base64 = await readFileAsBase64(file);
const dataUrl = await readFileAsDataURL(file);

// التحقق من الملف
const { isValid, errorMessage } = validateFile(file, {
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxSizeInMB: 10
});

// التحقق من الـ entity
if (!validateEntity(product, ['id', 'name'])) return;
```

---

## ✋ ما لا تفعله

### ❌ لا تفعل:
```typescript
// 1. لا تستخدم trigger مباشر
trigger('success');

// 2. لا تستخدم setState في حلقة
for (item of items) {
  setState(prev => {...}); // ❌ Race conditions
}

// 3. لا تستخدم وقت null check
if (!product) return; // ❌ يتكرر

// 4. لا تضيف 7 useState
const [a, setA] = useState();
const [b, setB] = useState();
// ... x7 ❌

// 5. لا تستخدم localStorage بدون debounce
useEffect(() => {
  localStorage.setItem(...); // ❌ كل update
}, [deps]);
```

### ✅ افعل بدلاً من ذلك:
```typescript
// 1. استخدم helper
const feedback = useInteractionFeedback();
feedback.onSuccess();

// 2. استخدم sequential
const result = await fetchData();
setState(result);

// 3. استخدم utility
if (!validateEntity(product)) return;

// 4. استخدم state object
const [state, setState] = useState({
  a: '', b: '', c: '', // ... جميع fields
});

// 5. استخدم debounce
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem(...); // ✅ كل 500ms
  }, 500);
  return () => clearTimeout(timer);
}, [deps]);
```

---

## 🐛 Debugging المشاكل الشائعة

### مشكلة 1: Multiple Re-renders
```javascript
// في console:
let renderCount = 0;
const OriginalComponent = YourComponent;
export default function (props) {
  renderCount++;
  console.log('Render #' + renderCount);
  return <OriginalComponent {...props} />;
}
// عدد يجب أن يكون منخفض
```

### مشكلة 2: Race Conditions
```javascript
// لاحظ الترتيب في Network tab
// يجب أن يكون Response 1 ثم Response 2
// وليس عكس ذلك
```

### مشكلة 3: localStorage Thrashing
```javascript
let writeCount = 0;
const orig = localStorage.setItem;
localStorage.setItem = function(...args) {
  writeCount++;
  return orig.apply(this, args);
};
// عدد يجب أن يكون منخفض جداً (< 5 per minute)
```

### مشكلة 4: Type Errors
```bash
# في terminal:
npm run type-check
# يجب أن تكون النتيجة: ✅ No errors
```

---

## 📋 Checklist قبل الـ Commit

```bash
# قبل أن تعمل git commit:

☐ 1. لا توجد 🟥 CRITICAL markers جديدة
☐ 2. جميع المتغيرات لها types واضح
☐ 3. لا توجد أكواد مكررة
☐ 4. جميع API calls في try-catch
☐ 5. استخدمت useInteractionFeedback و validationUtils حيث أمكن
☐ 6. اختبرت في console (no errors)
☐ 7. اختبرت performance (DevTools)
☐ 8. الكود يمر من linter

# جاهز للـ commit! ✅
```

---

## 🎯 أمثلة عملية

### مثال 1: صفحة جديدة مع Feedback
```typescript
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

export const MyPage = () => {
  const feedback = useInteractionFeedback();
  
  const handleClick = async () => {
    try {
      // 🟥 CRITICAL_ERROR_BOUNDARY: Monitor operation
      feedback.onAction(); // Light feedback
      const result = await doSomething();
      feedback.onSuccess(); // Success feedback
    } catch (error) {
      console.error('🟥 CRITICAL_ERROR_BOUNDARY:', error);
      feedback.onError(); // Error feedback
    }
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### مثال 2: File Upload مع Validation
```typescript
import { readFileAsBase64, validateFile } from '@/utils/validationUtils';

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // 🟥 CRITICAL_ERROR_BOUNDARY: Validate before processing
  const validation = validateFile(file);
  if (!validation.isValid) {
    alert(validation.errorMessage);
    return;
  }

  try {
    const base64 = await readFileAsBase64(file);
    await sendToServer(base64);
  } catch (error) {
    console.error('🟥 CRITICAL_ERROR_BOUNDARY:', error);
  }
};
```

### مثال 3: Consolidated State
```typescript
// 🟥 CRITICAL_STATE_CONSOLIDATION: Single state object
const [state, setState] = useState({
  isLoading: false,
  error: null as string | null,
  data: null as Data | null,
  selectedId: '',
});

// Helper setters
const setIsLoading = (loading: boolean) => 
  setState(prev => ({ ...prev, isLoading: loading }));
const setError = (error: string | null) => 
  setState(prev => ({ ...prev, error }));
const setData = (data: Data) => 
  setState(prev => ({ ...prev, data }));
const setSelectedId = (id: string) => 
  setState(prev => ({ ...prev, selectedId: id }));
```

---

## 🔍 موارد إضافية

| الملف | الوصف | الاستخدام |
|-----|-------|---------|
| `CODE_AUDIT_REPORT.md` | تقرير شامل | مراجعة المشاكل المكتشفة |
| `IMPLEMENTATION_UPDATES.md` | تفاصيل التحديثات | فهم التغييرات |
| `TESTING_GUIDE.md` | دليل الاختبار | اختبار الميزات |
| `AUDIT_FINAL_SUMMARY.md` | الملخص النهائي | نظرة عامة كاملة |

---

## ❓ الأسئلة الشائعة

### س: هل أستخدم useInteractionFeedback في كل مكان؟
**ج:** نعم، لأي interaction يحتاج feedback (button click, toggle, etc.)

### س: ماذا لو احتجت validation مختلف؟
**ج:** أضف دالة جديدة في `validationUtils.ts` وأعد استخدامها

### س: هل يمكن إضافة state جديد؟
**ج:** فقط إذا لم تستطع إضافته للـ state object الموجود

### س: كيف أتابع CRITICAL markers؟
**ج:** ابحث عن 🟥 في الكود، يجب ألا تزيد عن 9 مواقع

### س: ماذا أفعل عند مشكلة أداء؟
**ج:** ابدأ بـ DevTools Performance، ابحث عن unnecessary re-renders

---

## 📞 الدعم

- **مشاكل Type:** راجع صفحة TypeScript في VS Code
- **مشاكل Performance:** استخدم Chrome DevTools
- **مشاكل Logic:** استخدم debugger في VS Code
- **أسئلة Abkhas:** راجع `README.md` و `SUMMARY.md`

---

**تم آخر تحديث:** 2025
**النسخة:** 1.0
**الحالة:** ✅ نشط وجاهز للاستخدام
