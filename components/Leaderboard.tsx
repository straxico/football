import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { BettingUser } from '../lib/supabase';

interface LeaderboardEntry extends BettingUser {
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [bottomUsers, setBottomUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    
    // بروزرسانی هر 30 ثانیه
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('betting_users')
        .select('*')
        .gt('total_bets', 0)
        .order('score', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // اضافه کردن رتبه
        const rankedData = data.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        // بهترین‌ها (5 نفر اول)
        setTopUsers(rankedData.slice(0, 5));

        // بدترین‌ها (5 نفر آخر)
        if (rankedData.length > 5) {
          setBottomUsers(rankedData.slice(-5).reverse());
        } else {
          setBottomUsers([]);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number, isTop: boolean) => {
    if (!isTop) return 'from-red-600/20 to-red-700/20 border-red-600/40';
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/40';
    if (rank === 3) return 'from-orange-600/20 to-orange-700/20 border-orange-600/40';
    return 'from-blue-600/20 to-blue-700/20 border-blue-600/40';
  };

  const UserCard: React.FC<{ user: LeaderboardEntry; isTop: boolean }> = ({ user, isTop }) => {
    const accuracy = user.total_bets > 0 
      ? Math.round((user.correct_predictions / user.total_bets) * 100) 
      : 0;

    return (
      <div className={`bg-gradient-to-r ${getRankColor(user.rank, isTop)} rounded-xl p-4 border-r-4 hover:scale-105 transition-all duration-200`}>
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="text-3xl font-black w-12 text-center">
            {getRankBadge(user.rank)}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{user.display_name}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <span className="text-green-400">✅</span>
                {user.correct_predictions}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-400">❌</span>
                {user.wrong_predictions}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-400">📊</span>
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className={`text-2xl font-black ${isTop ? 'text-green-400' : 'text-red-400'}`}>
              {user.score > 0 ? '+' : ''}{user.score}
            </div>
            <div className="text-xs text-gray-400">امتیاز</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">در حال بارگذاری لیدربورد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Predictors */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-3xl">🏆</span>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            بهترین پیش‌بینی‌کنندگان
          </h2>
        </div>

        {topUsers.length > 0 ? (
          <div className="space-y-3">
            {topUsers.map((user) => (
              <UserCard key={user.id} user={user} isTop={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">👥</div>
            <p className="text-gray-400 text-lg">هنوز پیش‌بینی‌ای ثبت نشده است</p>
          </div>
        )}
      </div>

      {/* Bottom Predictors */}
      {bottomUsers.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-3xl">😅</span>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
              نیاز به بهبود دارند
            </h2>
          </div>

          <div className="space-y-3">
            {bottomUsers.map((user) => (
              <UserCard key={user.id} user={user} isTop={false} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/30">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✅</span>
            <span>پیش‌بینی درست: +3 امتیاز</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">❌</span>
            <span>پیش‌بینی اشتباه: -1 امتیاز</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">📊</span>
            <span>درصد موفقیت</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>💡</span>
            <span>توجه: در هر بازی باید یک برنده انتخاب کنید (مساوی نداریم)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
