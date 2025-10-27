/**
 * اسکریپت بروزرسانی مستقیم امتیازات کاربران
 * 
 * این اسکریپت امتیازات همه کاربران را مستقیماً محاسبه و بروزرسانی می‌کند
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

async function recalculateAllScores() {
  console.log('🚀 شروع محاسبه مجدد امتیازات...\n');

  // 1. دریافت همه کاربران
  console.log('📥 دریافت لیست کاربران...');
  const { data: users, error: usersError } = await supabase
    .from('betting_users')
    .select('*');

  if (usersError) {
    console.error('❌ خطا در دریافت کاربران:', usersError.message);
    return;
  }

  console.log(`✅ ${users.length} کاربر یافت شد\n`);

  // 2. دریافت همه پیش‌بینی‌ها
  console.log('📥 دریافت پیش‌بینی‌ها...');
  const { data: allBets, error: betsError } = await supabase
    .from('bets')
    .select('*');

  if (betsError) {
    console.error('❌ خطا در دریافت پیش‌بینی‌ها:', betsError.message);
    return;
  }

  console.log(`✅ ${allBets.length} پیش‌بینی یافت شد\n`);

  // 3. محاسبه امتیاز هر کاربر
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 محاسبه امتیازات:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let updatedCount = 0;

  for (const user of users) {
    // پیدا کردن پیش‌بینی‌های این کاربر
    const userBets = allBets.filter(bet => bet.user_id === user.id);
    
    // فقط پیش‌بینی‌هایی که نتیجه مشخص شده
    const processedBets = userBets.filter(bet => bet.is_correct !== null);
    
    const totalBets = processedBets.length;
    const correctPredictions = processedBets.filter(bet => bet.is_correct === true).length;
    const wrongPredictions = processedBets.filter(bet => bet.is_correct === false).length;
    const score = (correctPredictions * 3) - (wrongPredictions * 1);

    // بروزرسانی امتیازات کاربر
    const { error: updateError } = await supabase
      .from('betting_users')
      .update({
        total_bets: totalBets,
        correct_predictions: correctPredictions,
        wrong_predictions: wrongPredictions,
        score: score
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`❌ خطا در بروزرسانی کاربر ${user.display_name}:`, updateError.message);
    } else {
      const emoji = score > 0 ? '🟢' : score < 0 ? '🔴' : '⚪';
      console.log(`${emoji} ${user.display_name}: ${totalBets} بازی، ${correctPredictions} درست، ${wrongPredictions} اشتباه → امتیاز: ${score}`);
      updatedCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ خلاصه نتایج:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${updatedCount} کاربر بروزرسانی شد`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 امتیازات همه کاربران بروزرسانی شد!');
  console.log('💡 حالا صفحه را رفرش کنید و به تب لیدربورد بروید');
}

recalculateAllScores().catch(console.error);
