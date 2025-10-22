import React from 'react';
import type { Schedule, Group } from '../types';

interface ScheduleProps {
  schedule: Schedule;
  // FIX: Corrected type from Group (a single array of users) to Group[] (an array of groups)
  // to match the data passed from the App component.
  groups: Group[];
  onScoreChange: (dayIndex: number, matchIndex: number, teamIndex: 0 | 1, score: number) => void;
}

const ScheduleComponent: React.FC<ScheduleProps> = ({ schedule, groups, onScoreChange }) => {
  const getPlayerNames = (groupIndex: number) => {
    if (!groups[groupIndex]) return 'گروه نامشخص';
    return groups[groupIndex].map(user => user.name).join(' و ');
  };

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">جدول بازی‌ها</h2>
      <div className="space-y-6">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 border-b border-slate-600 pb-2">
              روز {dayIndex + 1}
            </h3>
            <ul className="space-y-4">
              {day.map((match, matchIndex) => {
                const [group1Index, group2Index] = match.teams;
                const [score1, score2] = match.score;

                const isPlayed = score1 !== null && score2 !== null;
                const winner1 = isPlayed && score1 > score2;
                const winner2 = isPlayed && score2 > score1;

                return (
                  <li key={matchIndex} className="bg-slate-600/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-white">
                        {/* Team 1 */}
                        <div className={`flex-1 text-right ${winner1 ? 'font-bold text-green-400' : ''}`}>
                            <p className="text-base">گروه {group1Index + 1}</p>
                            <p className="text-xs text-gray-300 truncate">{getPlayerNames(group1Index)}</p>
                        </div>

                        <div className="flex items-center mx-2 w-24 justify-center">
                            <input
                                type="number"
                                min="0"
                                value={score1 ?? ''}
                                onChange={(e) => onScoreChange(dayIndex, matchIndex, 0, e.target.valueAsNumber)}
                                className={`w-10 text-center bg-slate-700 border-2 rounded-md py-1 ${winner1 ? 'border-green-500' : 'border-slate-500 focus:border-blue-400'} outline-none transition-colors`}
                                aria-label={`Score for Group ${group1Index + 1}`}
                            />
                            <span className="mx-2 text-gray-400">-</span>
                            <input
                                type="number"
                                min="0"
                                value={score2 ?? ''}
                                onChange={(e) => onScoreChange(dayIndex, matchIndex, 1, e.target.valueAsNumber)}
                                className={`w-10 text-center bg-slate-700 border-2 rounded-md py-1 ${winner2 ? 'border-green-500' : 'border-slate-500 focus:border-blue-400'} outline-none transition-colors`}
                                aria-label={`Score for Group ${group2Index + 1}`}
                            />
                        </div>

                        {/* Team 2 */}
                        <div className={`flex-1 text-left ${winner2 ? 'font-bold text-green-400' : ''}`}>
                            <p className="text-base">گروه {group2Index + 1}</p>
                            <p className="text-xs text-gray-300 truncate">{getPlayerNames(group2Index)}</p>
                        </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleComponent;