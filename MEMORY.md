# Project Memory & Step Log – YUKIES AI Shopping Companion

> این فایل حافظه دائمی پروژه است و در هر گام (Step) به‌صورت خودکار آپدیت می‌شود تا تمام تصمیمات، وضعیت فعلی، معماری و گام‌های بعدی کاملاً شفاف و قابل پیگیری باشند.

---

## وضعیت کلی پروژه (Current State)
- **نام محصول:** YUKIES AI Shopping Companion & Support Assistant (`yukies.at`)
- **فاز فعلی:** **Step 5 – بهبود تجربه تست مستقیم چت با هوش مصنوعی + اتصال و Push به مخزن گیت‌هاب (`Tab-Deal/Yukies-AI-Assistance`)**
- **مدل هوش مصنوعی انتخابی:** **Google Gemini (`gemini-2.5-flash`)** با استفاده از آخرین نسخه SDK رسمی (`google-genai 3.1.0`)
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

### Step 5: باز شدن خودکار ویجت چت برای تست راحت‌تر + ارسال پروژه به گیت‌هاب (تکمیل‌شده)
- باز شدن خودکار پنجره چت هوش مصنوعی به محض ورود به `http://127.0.0.1:8000` (`default-open="true"`).
- افزودن دکمه آبی **«Als Kundin an KI senden (تست پیام مشتری به هوش مصنوعی)»** در داخل پنل ادمین (`http://127.0.0.1:8000/admin`) تا حتی از داخل پنل ادمین هم بتوان مستقیماً با هوش مصنوعی چت کرد و پاسخ AI را دید.
- راه‌اندازی Git و Push کدهای پروژه (بدون `.env` و `.venv`) به ریپازیتوری `https://github.com/Tab-Deal/Yukies-AI-Assistance`.
