# 🔧 راهنمای رفع مشکلات رایج

## ❌ خطای: "must be owner of table users"

### علت:
شما نمی‌توانید جدول `auth.users` را تغییر دهید چون متعلق به سیستم Supabase است.

### راه حل:
✅ فایل `supabase-setup.sql` را دوباره دریافت کنید (آپدیت شده است)
✅ خط `ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;` حذف شده است

---

## ❌ خطای: "relation already exists"

### علت:
جداول قبلاً ایجاد شده‌اند.

### راه حل:
**گزینه 1: حذف و اجرای مجدد**
```sql
-- در SQL Editor اجرا کنید
DROP TABLE IF EXISTS public.bets CASCADE;
DROP TABLE IF EXISTS public.betting_users CASCADE;
DROP VIEW IF EXISTS public.leaderboard CASCADE;
DROP FUNCTION IF EXISTS update_user_score CASCADE;

-- بعد اسکریپت اصلی را اجرا کنید
```

**گزینه 2: ادامه دادن**
اگر جداول درست ایجاد شده‌اند، این خطا مشکلی ندارد.

---

## ❌ خطای: "Invalid API key"

### علت:
مقادیر `.env` اشتباه است یا وجود ندارد.

### راه حل:
1. فایل `.env` را در ریشه پروژه بسازید
2. از Dashboard Supabase، Settings > API بروید
3. مقادیر زیر را کپی کنید:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```
4. سرور را restart کنید: `npm run dev`

---

## ❌ خطای: "Email not confirmed"

### علت:
Supabase منتظر تأیید ایمیل است.

### راه حل:
**گزینه 1: غیرفعال کردن تأیید (برای توسعه)**
1. Dashboard > Authentication > Providers
2. Email را انتخاب کنید
3. "Confirm email" را خاموش کنید
4. Save کنید

**گزینه 2: تأیید ایمیل**
ایمیل خود را چک کنید و لینک تأیید را کلیک کنید.

---

## ❌ خطای: "row-level security policy"

### علت:
Policy های RLS به درستی تنظیم نشده‌اند.

### راه حل:
اسکریپت `supabase-setup.sql` را دوباره به طور کامل اجرا کنید.

---

## ❌ پیش‌بینی ثبت نمی‌شود

### بررسی‌های لازم:
1. آیا وارد شده‌اید؟
2. Console مرورگر را باز کنید (F12) و خطاها را ببینید
3. آیا جدول `bets` ایجاد شده؟
   - Dashboard > Table Editor > bets را چک کنید

### راه حل:
```sql
-- بررسی RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bets';

-- باید 2 policy ببینید:
-- - Anyone can view bets
-- - Users can insert their own bets
```

---

## ❌ امتیازات بروزرسانی نمی‌شوند

### بررسی‌های لازم:
1. آیا Trigger ایجاد شده؟
2. آیا نتیجه بازی وارد شده؟

### راه حل:
```sql
-- بررسی وجود trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'update_score_on_bet_result';

-- اگر وجود نداشت، دوباره ایجاد کنید:
CREATE TRIGGER update_score_on_bet_result
  AFTER UPDATE ON public.bets
  FOR EACH ROW
  WHEN (OLD.is_correct IS DISTINCT FROM NEW.is_correct)
  EXECUTE FUNCTION update_user_score();
```

---

## ❌ لیدربورد خالی است

### علت:
1. هنوز کسی پیش‌بینی نکرده
2. نتایج بازی‌ها وارد نشده‌اند

### بررسی:
```sql
-- چک کردن تعداد پیش‌بینی‌ها
SELECT COUNT(*) FROM public.bets;

-- چک کردن کاربران
SELECT * FROM public.betting_users;

-- چک کردن view
SELECT * FROM public.leaderboard;
```

---

## ❌ خطای CORS

### علت:
Supabase URL اشتباه است یا دامنه شما مجاز نیست.

### راه حل:
1. مقدار `VITE_SUPABASE_URL` را چک کنید
2. در Dashboard > Settings > API > URL Configuration
3. مطمئن شوید `localhost` در لیست مجاز است

---

## 🔍 دیباگ عمومی

### بررسی اتصال به Supabase:
```javascript
// در Console مرورگر امتحان کنید:
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### بررسی وضعیت Authentication:
```javascript
// در Console:
const { data } = await supabase.auth.getSession();
console.log(data);
```

### بررسی جداول:
Dashboard > Table Editor > بررسی کنید که همه جداول وجود دارند:
- ✅ betting_users
- ✅ bets

---

## 📞 کمک بیشتر

اگر مشکل شما حل نشد:

1. Console مرورگر (F12) را باز کنید
2. پیام خطا را کپی کنید
3. در [Supabase Discord](https://discord.supabase.com) بپرسید
4. یا در [GitHub Issues](https://github.com/supabase/supabase/issues) جستجو کنید

---

## ✅ چک لیست نهایی

قبل از اینکه بگویید کار نمی‌کند:

- [ ] پروژه Supabase ایجاد شده؟
- [ ] اسکریپت SQL اجرا شده؟ (بدون خطا)
- [ ] فایل `.env` ایجاد و پر شده؟
- [ ] سرور restart شده؟ (`npm run dev`)
- [ ] ثبت‌نام کرده‌اید؟
- [ ] وارد شده‌اید؟
- [ ] Console مرورگر را چک کرده‌اید؟

اگر همه ✅ هستند و باز کار نمی‌کند، خطای دقیق را بفرستید! 🔍
