# Project Memory & Step Log – YUKIES AI Shopping Companion

> این فایل حافظه دائمی پروژه است و در هر گام (Step) به‌صورت خودکار آپدیت می‌شود تا تمام تصمیمات، وضعیت فعلی، معماری و گام‌های بعدی کاملاً شفاف و قابل پیگیری باشند.

---

## وضعیت کلی پروژه (Current State)
- **نام محصول:** YUKIES AI Shopping Companion & Support Assistant (`yukies.at`)
- **فاز فعلی:** **Step 6 – رفع خطای ریجن مدل در Google Cloud (`gemini-3-flash-preview`) و قرار دادن باکس چت مستقیم در بالای صفحه اصلی (`http://127.0.0.1:8000`)**
- **مدل هوش مصنوعی انتخابی:** **Google Gemini (`gemini-3-flash-preview`)** روی Google Cloud Vertex AI Express (`europe-west1`) با SDK رسمی (`google-genai 3.1.0`)
- **پلتفرم فروشگاه:** Shopify (قالب **Dawn 7.0**) – اجرا در محیط ایزوله محلی (Local Sandbox)
- **زبان‌ها:** معماری ۴ زبانه (`DE`, `EN`, `FR`, `IT`) | فاز ۱ فعال: آلمانی (`DE`) و انگلیسی (`EN`)

---

## تاریخچه گام‌ها (Step-by-Step History)

### Step 1: بازبینی PRD اولیه و تعیین مرزهای محصول (تکمیل‌شده)
- تغییر ماهیت بات به **«دستیار راهنمای خرید و رابط پشتیبانی غیرعملیاتی (Read-Only / Non-Actionable)»**.
- حذف کامل عملیات افزودن/حذف سبد خرید، ساخت Checkout، ساخت اکانت و تولید کد تخفیف.
- الزام به تشخیص خودکار مشتری لاگین‌شده در Shopify و نمایش فرم اجباری **(نام + ایمیل + تیک رضایت‌نامه GDPR/DSG اتریش)** برای کاربران مهمان.
- ذخیره‌سازی تمام چت‌ها تحت یک `user_id` یکتا طبق قوانین اتریش (DSG) و اتحادیه اروپا (GDPR).

### Step 2: بررسی دیتای واقعی `yukies.at`، شیت گوگل و انتقال Knowledge Base (تکمیل‌شده)
- بررسی خط‌به‌خط ۱۹ فایل دانشی تاییدشده توسط Silvia Ragucci (`yukies_kb 2` نسخه ۱.۱ مورخ ۹ نوامبر ۲۰۲۶) و مقایسه با شیت خام گوگل (۶ نوامبر ۲۰۲۶).
- تایید اولویت مطلق قوانین آرایشی-بهداشتی ([09_formulierungen.md](file:///Users/mr.naeimi/Documents/AI%20Assisstance%20Chat%20bot/knowledge_base/09_formulierungen.md)) بر متن‌های قدیمی سایت.
- انتقال هر ۱۹ فایل به پوشه [knowledge_base/](file:///Users/mr.naeimi/Documents/AI%20Assisstance%20Chat%20bot/knowledge_base/README.md) و نهایی‌سازی سند قراردادی [PRD.md](file:///Users/mr.naeimi/Documents/AI%20Assisstance%20Chat%20bot/PRD.md).

### Step 3: تنظیم کلید ابری Google Cloud Gemini و نهایی‌سازی معماری ایزوله (تکمیل‌شده)
- دریافت کلید `Gemini platform API` از کنسول Google Cloud پروژه `yukies-ai-assistance` (منطبق با GDPR).
- تصمیم به اجرای صددرصد ایزوله در محیط محلی (Local Sandbox) بدون هیچ‌گونه دستکاری یا نصب اپ روی فروشگاه زنده `yukies.at` در مرحله توسعه.

### Step 4: پیاده‌سازی کامل بک‌اند، گاردریل ۳ لایه، ویجت Shadow DOM و پنل Live Chat (تکمیل‌شده)
- پیاده‌سازی کامل بک‌اند FastAPI، دیتابیس منطبق با GDPR/DSG اتریش، گاردریل ۳ لایه، ویجت Shadow DOM، شبیه‌ساز فروشگاه و پنل Live Chat سیلویا و باربارا.
- اجرای کامل تست‌های خودکار `pytest` (`5/5 passed`).

### Step 5: اتصال پروژه به ریپازیتوری گیت‌هاب (تکمیل‌شده)
- راه‌اندازی Git و Push کدهای پروژه (بدون `.env` و `.venv`) به ریپازیتوری `https://github.com/Tab-Deal/Yukies-AI-Assistance`.

### Step 6: رفع باگ مدل ریجن اروپا (`gemini-3-flash-preview`) و چیدمان ۲ ستونه چت در صفحه اصلی (تکمیل‌شده)
- **علت تکرار پاسخ ثابت در تست قبلی:** کلید ابری Google Cloud (`AQ.Ab8RN6...`) در ریجن اروپا (`europe-west1`) مدل `gemini-2.5-flash` را `404 NOT_FOUND` می‌داد و سیستم روی پیام پیش‌فرض Fallback می‌رفت. با تست مستقیم روی Google Cloud مشخص شد مدل فعال روی این پروژه **`gemini-3-flash-preview`** است. مدل به `gemini-3-flash-preview` تغییر یافت و سرور ری‌استارت شد؛ اکنون به هر سوالی پاسخ هوشمند و دقیق می‌دهد.
- **علت دیده نشدن باکس چت در صفحه اصلی (`http://127.0.0.1:8000`):** قبلاً ویجت به صورت دکمه شناور در پایین صفحه بود که در کادر مرورگر دیده نمی‌شد. اکنون صفحه اصلی به صورت **۲ ستونه (سمت چپ محصولات و سناریوها، سمت راست بالای صفحه پنجره بزرگ و همیشه باز چت هوش مصنوعی)** طراحی شد تا بلافاصله جلوی چشم باشد.
