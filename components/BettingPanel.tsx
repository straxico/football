import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Bet } from '../lib/supabase';
import type { Schedule, Group } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface BettingPanelProps {
  schedule: Schedule;
  groups: Group[];
}

const BettingPanel: React.FC<BettingPanelProps> = ({ schedule, groups }) => {
  const { bettingUser } = useAuth();
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (bettingUser) {
      loadUserBets();
    }
  }, [bettingUser]);

  const loadUserBets = async () => {
    if (!bettingUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', bettingUser.id);

      if (error) throw error;
      setUserBets(data || []);
    } catch (error) {
      console.error('Error loading bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserBet = (dayIndex: number, matchIndex: number) => {
    return userBets.find(
      (bet) => bet.match_day === dayIndex && bet.match_index === matchIndex
    );
  };

  const handlePlaceBet = async (
    dayIndex: number,
    matchIndex: number,
    team1Index: number,
    team2Index: number,
    predictedWinner: number | null
  ) => {
    if (!bettingUser) return;

    setSaving(true);
    setNotification(null);
    try {
      const existingBet = getUserBet(dayIndex, matchIndex);

      if (existingBet) {
        // بروزرسانی شرط موجود
        const { error } = await supabase
          .from('bets')
          .update({ predicted_winner: predictedWinner })
          .eq('id', existingBet.id);

        if (error) throw error;
        
        // بروزرسانی state محلی
        setUserBets(prev => 
          prev.map(bet => 
            bet.id === existingBet.id 
              ? { ...bet, predicted_winner: predictedWinner } 
              : bet
          )
        );
        
        setNotification('✅ پیش‌بینی شما به‌روزرسانی شد');
      } else {
        // ثبت شرط جدید
        const { data, error } = await supabase.from('bets').insert([
          {
            user_id: bettingUser.id,
            match_day: dayIndex,
            match_index: matchIndex,
            team1_index: team1Index,
            team2_index: team2Index,
            predicted_winner: predictedWinner,
          },
        ])
        .select()
        .single();

        if (error) throw error;
        
        // اضافه کردن به state محلی
        if (data) {
          setUserBets(prev => [...prev, data]);
        }
        
        setNotification('✅ پیش‌بینی شما ثبت شد');
      }
      
      // پاک کردن نوتیفیکیشن بعد از 3 ثانیه
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error('Error placing bet:', error);
      setNotification('❌ خطا در ثبت پیش‌بینی');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getPlayerNames = (groupIndex: number) => {
    if (!groups[groupIndex]) return 'گروه نامشخص';
    return groups[groupIndex].map((user) => user.name).join(' و ');
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">در حال بارگذاری پیش‌بینی‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-3xl">🎯</span>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
          پیش‌بینی نتایج
        </h2>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-4 animate-fade-in">
          <div className={`p-4 rounded-xl text-center font-bold ${
            notification.includes('❌') 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {notification}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-slate-600">
              <span className="text-2xl">📆</span>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                روز {dayIndex + 1}
              </h3>
            </div>

            <ul className="space-y-4">
              {day.map((match, matchIndex) => {
                const [group1Index, group2Index] = match.teams;
                const userBet = getUserBet(dayIndex, matchIndex);
                const [score1, score2] = match.score;
                const isMatchFinished = score1 !== null && score2 !== null;

                return (
                  <li key={matchIndex} className="bg-gradient-to-r from-slate-600/40 to-slate-700/40 p-5 rounded-xl border border-slate-600/30">
                    <div className="flex flex-col gap-4">
                      {/* Match Info */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex-1 text-right">
                          <p className="text-lg font-bold">گروه {group1Index + 1}</p>
                          <p className="text-xs text-gray-400 truncate">{getPlayerNames(group1Index)}</p>
                        </div>

                        <div className="mx-4 text-2xl font-black text-gray-400">VS</div>

                        <div className="flex-1 text-left">
                          <p className="text-lg font-bold">گروه {group2Index + 1}</p>
                          <p className="text-xs text-gray-400 truncate">{getPlayerNames(group2Index)}</p>
                        </div>
                      </div>

                      {/* Betting Buttons */}
                      {!isMatchFinished ? (
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => handlePlaceBet(dayIndex, matchIndex, group1Index, group2Index, group1Index)}
                            disabled={saving}
                            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                              userBet?.predicted_winner === group1Index
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-2xl">🏆</span>
                              {userBet?.predicted_winner === group1Index && <span className="text-sm">✅ انتخاب شده</span>}
                              {(!userBet || userBet?.predicted_winner !== group1Index) && <span>گروه {group1Index + 1}</span>}
                              {userBet?.predicted_winner === group1Index && <span>گروه {group1Index + 1}</span>}
                            </div>
                          </button>

                          <button
                            onClick={() => handlePlaceBet(dayIndex, matchIndex, group1Index, group2Index, group2Index)}
                            disabled={saving}
                            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                              userBet?.predicted_winner === group2Index
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-2xl">🏆</span>
                              {userBet?.predicted_winner === group2Index && <span className="text-sm">✅ انتخاب شده</span>}
                              {(!userBet || userBet?.predicted_winner !== group2Index) && <span>گروه {group2Index + 1}</span>}
                              {userBet?.predicted_winner === group2Index && <span>گروه {group2Index + 1}</span>}
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* نمایش نتیجه بازی */}
                          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-4">
                              <span className={`text-xl font-bold ${score1 > score2 ? 'text-green-400' : 'text-gray-400'}`}>
                                گروه {group1Index + 1}: {score1}
                              </span>
                              <span className="text-gray-500">-</span>
                              <span className={`text-xl font-bold ${score2 > score1 ? 'text-green-400' : 'text-gray-400'}`}>
                                گروه {group2Index + 1}: {score2}
                              </span>
                            </div>
                          </div>
                          
                          {/* نمایش وضعیت پیش‌بینی */}
                          <div className="text-center">
                            {userBet ? (
                              <div>
                                {userBet.is_correct !== null ? (
                                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                                    userBet.is_correct
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {userBet.is_correct ? (
                                      <>
                                        <span className="text-2xl">🎉</span>
                                        <span>پیش‌بینی درست! +3 امتیاز</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-2xl">😢</span>
                                        <span>پیش‌بینی اشتباه! -1 امتیاز</span>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    <span>⏳</span>
                                    <span>در حال محاسبه...</span>
                                  </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                  پیش‌بینی شما: گروه {userBet.predicted_winner !== null ? userBet.predicted_winner + 1 : '؟'}
                                </p>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                <span>🚫</span>
                                <span>پیش‌بینی نکرده‌اید</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📅</div>
          <p className="text-gray-400 text-lg">هنوز بازی‌ای برای پیش‌بینی وجود ندارد</p>
        </div>
      )}
    </div>
  );
};

export default BettingPanel;
