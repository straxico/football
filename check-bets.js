/**
 * اسکریپت بررسی وضعیت پیش‌بینی‌ها
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBets() {
  console.log('🔍 بررسی وضعیت پیش‌بینی‌ها...\n');

  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ خطا:', error.message);
    return;
  }

  console.log(`📊 ${bets.length} پیش‌بینی اخیر:\n`);

  for (const bet of bets) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 ID: ${bet.id.substring(0, 8)}...`);
    console.log(`👤 User ID: ${bet.user_id ? bet.user_id.substring(0, 8) + '...' : 'NULL'}`);
    console.log(`⚽ بازی: روز ${bet.match_day + 1} - مسابقه ${bet.match_index + 1}`);
    console.log(`🎯 پیش‌بینی: گروه ${bet.predicted_winner !== null ? bet.predicted_winner + 1 : '؟'}`);
    console.log(`✅ برنده واقعی: ${bet.actual_winner !== null ? 'گروه ' + (bet.actual_winner + 1) : 'هنوز مشخص نشده'}`);
    console.log(`📊 نتیجه: ${bet.is_correct === null ? '⏳ در حال بررسی' : bet.is_correct ? '✅ درست' : '❌ اشتباه'}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // بررسی کاربران
  const { data: users } = await supabase
    .from('betting_users')
    .select('*')
    .limit(5);

  console.log('👥 نمونه کاربران:\n');
  for (const user of users) {
    console.log(`🆔 ${user.id.substring(0, 8)}... - ${user.display_name}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // شمارش پیش‌بینی‌های هر وضعیت
  const { data: allBets } = await supabase
    .from('bets')
    .select('is_correct');

  const processed = allBets.filter(b => b.is_correct !== null).length;
  const pending = allBets.filter(b => b.is_correct === null).length;
  const correct = allBets.filter(b => b.is_correct === true).length;
  const wrong = allBets.filter(b => b.is_correct === false).length;

  console.log('📊 آمار کلی:');
  console.log(`✅ پردازش شده: ${processed}`);
  console.log(`   ├─ ✅ درست: ${correct}`);
  console.log(`   └─ ❌ اشتباه: ${wrong}`);
  console.log(`⏳ در انتظار: ${pending}`);
}

checkBets().catch(console.error);
