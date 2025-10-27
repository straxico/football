-- اسکریپت تصحیح امتیازات - اجرا در SQL Editor پنل Supabase
-- این اسکریپت را کپی کنید و در SQL Editor اجرا کنید

-- ✅ گام 1: اجازه بروزرسانی is_correct و actual_winner برای همه
-- (فقط برای زمانی که نتایج بازی‌ها را وارد می‌کنید)

CREATE POLICY "Anyone can update match results" 
  ON public.bets FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ✅ گام 2: بروزرسانی نتایج همه بازی‌های تمام شده

-- روز 1 - بازی 1: گروه 1 vs گروه 2 (9-10) → برنده: گروه 2 (index: 1)
UPDATE public.bets SET actual_winner = 1, is_correct = (predicted_winner = 1) WHERE match_day = 0 AND match_index = 0;

-- روز 1 - بازی 2: گروه 4 vs گروه 6 (2-10) → برنده: گروه 6 (index: 5)
UPDATE public.bets SET actual_winner = 5, is_correct = (predicted_winner = 5) WHERE match_day = 0 AND match_index = 1;

-- روز 2 - بازی 1: گروه 4 vs گروه 5 (4-10) → برنده: گروه 5 (index: 4)
UPDATE public.bets SET actual_winner = 4, is_correct = (predicted_winner = 4) WHERE match_day = 1 AND match_index = 0;

-- روز 2 - بازی 2: گروه 1 vs گروه 3 (10-3) → برنده: گروه 1 (index: 0)
UPDATE public.bets SET actual_winner = 0, is_correct = (predicted_winner = 0) WHERE match_day = 1 AND match_index = 1;

-- روز 3 - بازی 2: گروه 2 vs گروه 5 (10-7) → برنده: گروه 2 (index: 1)
UPDATE public.bets SET actual_winner = 1, is_correct = (predicted_winner = 1) WHERE match_day = 2 AND match_index = 1;

-- روز 4 - بازی 1: گروه 3 vs گروه 4 (6-10) → برنده: گروه 4 (index: 3)
UPDATE public.bets SET actual_winner = 3, is_correct = (predicted_winner = 3) WHERE match_day = 3 AND match_index = 0;

-- روز 4 - بازی 2: گروه 2 vs گروه 4 (10-8) → برنده: گروه 2 (index: 1)
UPDATE public.bets SET actual_winner = 1, is_correct = (predicted_winner = 1) WHERE match_day = 3 AND match_index = 1;

-- روز 5 - بازی 1: گروه 1 vs گروه 5 (10-6) → برنده: گروه 1 (index: 0)
UPDATE public.bets SET actual_winner = 0, is_correct = (predicted_winner = 0) WHERE match_day = 4 AND match_index = 0;

-- روز 6 - بازی 1: گروه 2 vs گروه 3 (10-8) → برنده: گروه 2 (index: 1)
UPDATE public.bets SET actual_winner = 1, is_correct = (predicted_winner = 1) WHERE match_day = 5 AND match_index = 0;

-- ✅ گام 3: محاسبه و بروزرسانی امتیازات همه کاربران
UPDATE public.betting_users
SET 
  total_bets = (
    SELECT COUNT(*)
    FROM public.bets
    WHERE user_id = betting_users.id AND is_correct IS NOT NULL
  ),
  correct_predictions = (
    SELECT COUNT(*)
    FROM public.bets
    WHERE user_id = betting_users.id AND is_correct = true
  ),
  wrong_predictions = (
    SELECT COUNT(*)
    FROM public.bets
    WHERE user_id = betting_users.id AND is_correct = false
  ),
  score = (
    SELECT 
      COALESCE((COUNT(*) FILTER (WHERE is_correct = true) * 3) - 
      (COUNT(*) FILTER (WHERE is_correct = false) * 1), 0)
    FROM public.bets
    WHERE user_id = betting_users.id AND is_correct IS NOT NULL
  );

-- ✅ نمایش لیدربورد برای تست
SELECT 
  display_name,
  total_bets,
  correct_predictions,
  wrong_predictions,
  score
FROM public.betting_users
WHERE total_bets > 0
ORDER BY score DESC;

-- 🎉 تمام! حالا صفحه را رفرش کنید
