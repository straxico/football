/**
 * اسکریپت بروزرسانی تابع SQL در Supabase
 * 
 * این اسکریپت تابع update_user_score را در دیتابیس بروزرسانی می‌کند
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطا: متغیرهای محیطی Supabase یافت نشد');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSQLFunction() {
  console.log('🚀 شروع بروزرسانی تابع SQL...\n');

  const sqlCommands = [
    // حذف تابع قدیمی
    `DROP FUNCTION IF EXISTS update_user_score() CASCADE;`,
    
    // ایجاد تابع جدید
    `CREATE OR REPLACE FUNCTION update_user_score()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;`,

    // دوباره ایجاد Trigger
    `DROP TRIGGER IF EXISTS update_score_on_bet_result ON public.bets;`,
    
    `CREATE TRIGGER update_score_on_bet_result
  AFTER UPDATE ON public.bets
  FOR EACH ROW
  WHEN (OLD.is_correct IS DISTINCT FROM NEW.is_correct)
  EXECUTE FUNCTION update_user_score();`
  ];

  for (const sql of sqlCommands) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        console.error('❌ خطا:', error.message);
      } else {
        console.log('✅ دستور SQL با موفقیت اجرا شد');
      }
    } catch (error) {
      console.error('❌ خطا:', error.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  توجه: این روش با ANON_KEY کار نمی‌کند!');
  console.log('📝 لطفاً دستورات SQL را مستقیماً در پنل Supabase اجرا کنید');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updateSQLFunction().catch(console.error);
