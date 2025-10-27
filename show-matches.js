/**
 * نمایش برنامه بازی‌های تمام شده
 */

const BIN_ID = '68f8bc5543b1c97be97800c8';

async function showFinishedMatches() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`);
    const data = await response.json();
    const schedule = data.record.schedule;

    console.log('🏆 بازی‌های تمام شده:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    schedule.forEach((day, dayIndex) => {
      day.forEach((match, matchIndex) => {
        const [score1, score2] = match.score;
        
        if (score1 !== null && score2 !== null) {
          const [team1, team2] = match.teams;
          const winner = score1 > score2 ? team1 : score2 > score1 ? team2 : null;
          
          console.log(`📅 روز ${dayIndex + 1} - بازی ${matchIndex + 1}:`);
          console.log(`   گروه ${team1 + 1} vs گروه ${team2 + 1}`);
          console.log(`   نتیجه: ${score1} - ${score2}`);
          console.log(`   برنده: ${winner !== null ? `گروه ${winner + 1} (index: ${winner})` : 'مساوی'}`);
          console.log(`   💾 SQL: match_day = ${dayIndex}, match_index = ${matchIndex}, actual_winner = ${winner}`);
          console.log('');
        }
      });
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('خطا:', error.message);
  }
}

showFinishedMatches();
