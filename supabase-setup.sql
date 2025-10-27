-- راه‌اندازی دیتابیس Supabase
-- این اسکریپت را در SQL Editor پنل Supabase اجرا کنید

-- 1. جدول پروفایل کاربران
CREATE TABLE IF NOT EXISTS public.betting_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_bets INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  wrong_predictions INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0
);

-- Enable RLS on betting_users
ALTER TABLE public.betting_users ENABLE ROW LEVEL SECURITY;

-- 2. جدول شرط‌بندی‌ها
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.betting_users(id) ON DELETE CASCADE NOT NULL,
  match_day INTEGER NOT NULL,
  match_index INTEGER NOT NULL,
  team1_index INTEGER NOT NULL,
  team2_index INTEGER NOT NULL,
  predicted_winner INTEGER, -- NULL برای مساوی، شماره تیم برای برنده
  actual_winner INTEGER, -- NULL تا زمانی که نتیجه مشخص نشود
  is_correct BOOLEAN, -- NULL تا زمانی که نتیجه مشخص نشود
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_day, match_index) -- هر کاربر فقط یک بار برای هر مسابقه
);

-- Enable RLS on bets
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies برای betting_users

-- همه می‌توانند لیست کاربران را ببینند
CREATE POLICY "Anyone can view betting users"
  ON public.betting_users FOR SELECT
  USING (true);

-- فقط کاربر خودش می‌تواند پروفایلش را بسازد
CREATE POLICY "Users can insert their own profile"
  ON public.betting_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- فقط کاربر خودش می‌تواند پروفایلش را بروزرسانی کند
CREATE POLICY "Users can update their own profile"
  ON public.betting_users FOR UPDATE
  USING (auth.uid() = id);

-- 4. RLS Policies برای bets

-- همه می‌توانند لیست شرط‌بندی‌ها را ببینند
CREATE POLICY "Anyone can view bets"
  ON public.bets FOR SELECT
  USING (true);

-- کاربران فقط می‌توانند شرط‌بندی خودشان را ثبت کنند
CREATE POLICY "Users can insert their own bets"
  ON public.bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- کاربران نمی‌توانند شرط‌بندی‌های خود را ویرایش کنند (فقط ادمین)
-- این policy را فقط در صورت نیاز اضافه کنید

-- 5. Function برای بروزرسانی خودکار امتیازات
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
BEGIN
  -- محاسبه مجدد همه آمارها از جدول bets
  UPDATE public.betting_users
  SET 
    total_bets = (
      SELECT COUNT(*)
      FROM public.bets
      WHERE user_id = NEW.user_id AND is_correct IS NOT NULL
    ),
    correct_predictions = (
      SELECT COUNT(*)
      FROM public.bets
      WHERE user_id = NEW.user_id AND is_correct = true
    ),
    wrong_predictions = (
      SELECT COUNT(*)
      FROM public.bets
      WHERE user_id = NEW.user_id AND is_correct = false
    ),
    score = (
      SELECT 
        COALESCE((COUNT(*) FILTER (WHERE is_correct = true) * 3) - 
        (COUNT(*) FILTER (WHERE is_correct = false) * 1), 0)
      FROM public.bets
      WHERE user_id = NEW.user_id AND is_correct IS NOT NULL
    )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger برای بروزرسانی امتیاز
CREATE TRIGGER update_score_on_bet_result
  AFTER UPDATE ON public.bets
  FOR EACH ROW
  WHEN (OLD.is_correct IS DISTINCT FROM NEW.is_correct)
  EXECUTE FUNCTION update_user_score();

-- 7. Index برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match ON public.bets(match_day, match_index);
CREATE INDEX IF NOT EXISTS idx_betting_users_score ON public.betting_users(score DESC);

-- 8. View برای لیدربورد
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  display_name,
  total_bets,
  correct_predictions,
  wrong_predictions,
  score,
  RANK() OVER (ORDER BY score DESC) as rank
FROM public.betting_users
WHERE total_bets > 0
ORDER BY score DESC;

-- تمام! ✅
