/**
 * اسکریپت تصحیح امتیازات
 * 
 * این اسکریپت:
 * 1. تمام بازی‌های تمام شده را از JSONBin می‌خواند
 * 2. تمام پیش‌بینی‌های کاربران را بررسی می‌کند
 * 3. برای هر پیش‌بینی که نتیجه‌اش مشخص است اما امتیازش محاسبه نشده:
 *    - is_correct و actual_winner را بروزرسانی می‌کند
 *    - امتیازات کاربر را محاسبه می‌کند
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// بارگذاری متغیرهای محیطی
dotenv.config();

const BIN_ID = '68f8bc5543b1c97be97800c8';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطا: متغیرهای محیطی Supabase یافت نشد');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadScheduleFromJsonBin() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`);
    if (!response.ok) {
      throw new Error(`خطا در دریافت داده‌ها: ${response.statusText}`);
    }
    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('❌ خطا در بارگذاری برنامه بازی‌ها:', error.message);
    return null;
  }
}

async function fixScores() {
  console.log('🚀 شروع تصحیح امتیازات...\n');

  // 1. بارگذاری برنامه بازی‌ها
  console.log('📥 بارگذاری برنامه بازی‌ها از JSONBin...');
  const data = await loadScheduleFromJsonBin();
  
  if (!data || !data.schedule) {
    console.error('❌ داده‌های بازی یافت نشد');
    return;
  }

  const schedule = data.schedule;
  console.log(`✅ ${schedule.length} روز بازی یافت شد\n`);

  // 2. دریافت تمام پیش‌بینی‌ها
  console.log('📥 دریافت پیش‌بینی‌های کاربران...');
  const { data: allBets, error: betsError } = await supabase
    .from('bets')
    .select('*');

  if (betsError) {
    console.error('❌ خطا در دریافت پیش‌بینی‌ها:', betsError.message);
    return;
  }

  console.log(`✅ ${allBets.length} پیش‌بینی یافت شد\n`);

  let updatedCount = 0;
  let alreadyProcessedCount = 0;
  let noResultCount = 0;

  // 3. بررسی هر پیش‌بینی
  for (const bet of allBets) {
    const { match_day, match_index, predicted_winner, is_correct } = bet;

    // اگر قبلاً پردازش شده، رد کن
    if (is_correct !== null) {
      alreadyProcessedCount++;
      continue;
    }

    // پیدا کردن بازی در برنامه
    if (!schedule[match_day] || !schedule[match_day][match_index]) {
      console.warn(`⚠️  بازی ${match_day}-${match_index} در برنامه یافت نشد`);
      continue;
    }

    const match = schedule[match_day][match_index];
    const [score1, score2] = match.score;

    // اگر نتیجه هنوز مشخص نشده، رد کن
    if (score1 === null || score2 === null) {
      noResultCount++;
      continue;
    }

    // محاسبه برنده واقعی
    const [team1Index, team2Index] = match.teams;
    const actualWinner = score1 > score2 ? team1Index : score2 > score1 ? team2Index : null;

    // بررسی صحت پیش‌بینی
    const isCorrect = predicted_winner === actualWinner;

    // بروزرسانی پیش‌بینی
    const { error: updateError } = await supabase
      .from('bets')
      .update({
        actual_winner: actualWinner,
        is_correct: isCorrect
      })
      .eq('id', bet.id);

    if (updateError) {
      console.error(`❌ خطا در بروزرسانی پیش‌بینی ${bet.id}:`, updateError.message);
    } else {
      updatedCount++;
      const resultEmoji = isCorrect ? '✅' : '❌';
      console.log(`${resultEmoji} بازی روز ${match_day + 1}-${match_index + 1}: ${isCorrect ? 'درست' : 'اشتباه'} (${score1}-${score2})`);
    }
  }

  // 4. خلاصه نتایج
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 خلاصه نتایج:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ بروزرسانی شده: ${updatedCount}`);
  console.log(`⏭️  قبلاً پردازش شده: ${alreadyProcessedCount}`);
  console.log(`⏳ منتظر نتیجه: ${noResultCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (updatedCount > 0) {
    console.log('🎉 امتیازات کاربران به صورت خودکار بروزرسانی شدند!');
    
    // 5. محاسبه و نمایش امتیازات کاربران
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 محاسبه امتیازات کاربران:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data: users } = await supabase
      .from('betting_users')
      .select('*');

    for (const user of users) {
      const userBets = allBets.filter(b => b.user_id === user.id && b.is_correct !== null);
      const correct = userBets.filter(b => b.is_correct === true).length;
      const wrong = userBets.filter(b => b.is_correct === false).length;
      const score = (correct * 3) - (wrong * 1);

      if (userBets.length > 0) {
        // بروزرسانی امتیازات کاربر
        await supabase
          .from('betting_users')
          .update({
            total_bets: userBets.length,
            correct_predictions: correct,
            wrong_predictions: wrong,
            score: score
          })
          .eq('id', user.id);

        const emoji = score > 0 ? '🟢' : score < 0 ? '🔴' : '⚪';
        console.log(`${emoji} ${user.display_name}: ${userBets.length} بازی → +${correct} -${wrong} = ${score} امتیاز`);
      }
    }

    console.log('\n💡 صفحه را رفرش کنید تا تغییرات را ببینید.');
  } else {
    console.log('ℹ️  نیازی به بروزرسانی نبود.');
  }
}

// اجرای اسکریپت
fixScores().catch(console.error);
