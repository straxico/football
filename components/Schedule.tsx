import React from 'react';
import type { Schedule, Group } from '../types';

interface ScheduleProps {
  schedule: Schedule;
  groups: Group[];
  onScoreChange: (dayIndex: number, matchIndex: number, teamIndex: 0 | 1, score: number) => void;
}

const ScheduleComponent: React.FC<ScheduleProps> = ({ schedule, groups, onScoreChange }) => {
  const getPlayerNames = (groupIndex: number) => {
    if (!groups[groupIndex]) return 'گروه نامشخص';
    return groups[groupIndex].map(user => user.name).join(' و ');
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-3xl">📅</span>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          برنامه مسابقات
        </h2>
      </div>
      
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
                const [score1, score2] = match.score;

                const isPlayed = score1 !== null && score2 !== null;
                const winner1 = isPlayed && score1 > score2;
                const winner2 = isPlayed && score2 > score1;
                const isDraw = isPlayed && score1 === score2;

                return (
                  <li key={matchIndex} className="bg-gradient-to-r from-slate-600/40 to-slate-700/40 p-5 rounded-xl hover:shadow-lg transition-all duration-300 border border-slate-600/30">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Team 1 */}
                      <div className={`flex-1 w-full sm:w-auto text-center sm:text-right transition-all duration-300 ${winner1 ? 'transform scale-105' : ''}`}>
                        <div className="flex items-center justify-center sm:justify-end gap-3">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              {winner1 && <span className="text-2xl animate-bounce">🏆</span>}
                              <p className={`text-lg font-bold ${winner1 ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-white'}`}>
                                گروه {group1Index + 1}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">
                              {getPlayerNames(group1Index)}
                            </p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {group1Index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Score Inputs */}
                      <div className="flex items-center gap-3 bg-slate-800/70 rounded-xl p-3 shadow-inner">
                        <input
                          type="number"
                          min="0"
                          value={score1 ?? ''}
                          onChange={(e) => onScoreChange(dayIndex, matchIndex, 0, e.target.valueAsNumber)}
                          className={`w-14 h-14 text-center text-xl font-bold bg-slate-700 border-2 rounded-lg outline-none transition-all duration-300 ${
                            winner1 
                              ? 'border-green-500 text-green-400 shadow-lg shadow-green-500/30' 
                              : isDraw
                              ? 'border-yellow-500 text-yellow-400'
                              : 'border-slate-500 text-white focus:border-blue-400 hover:border-blue-300'
                          }`}
                          placeholder="-"
                          aria-label={`Score for Group ${group1Index + 1}`}
                        />
                        <span className="text-2xl font-black text-gray-400">VS</span>
                        <input
                          type="number"
                          min="0"
                          value={score2 ?? ''}
                          onChange={(e) => onScoreChange(dayIndex, matchIndex, 1, e.target.valueAsNumber)}
                          className={`w-14 h-14 text-center text-xl font-bold bg-slate-700 border-2 rounded-lg outline-none transition-all duration-300 ${
                            winner2 
                              ? 'border-green-500 text-green-400 shadow-lg shadow-green-500/30' 
                              : isDraw
                              ? 'border-yellow-500 text-yellow-400'
                              : 'border-slate-500 text-white focus:border-blue-400 hover:border-blue-300'
                          }`}
                          placeholder="-"
                          aria-label={`Score for Group ${group2Index + 1}`}
                        />
                      </div>

                      {/* Team 2 */}
                      <div className={`flex-1 w-full sm:w-auto text-center sm:text-left transition-all duration-300 ${winner2 ? 'transform scale-105' : ''}`}>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {group2Index + 1}
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <p className={`text-lg font-bold ${winner2 ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-white'}`}>
                                گروه {group2Index + 1}
                              </p>
                              {winner2 && <span className="text-2xl animate-bounce">🏆</span>}
                            </div>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">
                              {getPlayerNames(group2Index)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Match Status */}
                    {isPlayed && (
                      <div className="mt-3 pt-3 border-t border-slate-600/50 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                          isDraw 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {isDraw ? '🤝 مساوی' : '✅ انجام شده'}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
        <p className="text-gray-400 text-sm">
          تعداد کل روزهای مسابقه: <span className="font-bold text-purple-400">{schedule.length}</span>
        </p>
      </div>
    </div>
  );
};

export default ScheduleComponent;