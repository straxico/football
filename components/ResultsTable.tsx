import React from 'react';
import type { TeamStats } from '../types';

interface ResultsTableProps {
  stats: TeamStats[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ stats }) => {
  const headers = [
    { key: 'rank', label: 'رتبه', className: 'w-12 text-center', icon: '🏆' },
    { key: 'team', label: 'تیم', className: 'text-right flex-grow', icon: '⚽' },
    { key: 'played', label: 'بازی', className: 'w-14 text-center', icon: '🎮' },
    { key: 'wins', label: 'برد', className: 'w-12 text-center', icon: '✅' },
    { key: 'draws', label: 'مساوی', className: 'w-14 text-center', icon: '🤝' },
    { key: 'losses', label: 'باخت', className: 'w-14 text-center', icon: '❌' },
    { key: 'gf', label: 'گل زده', className: 'w-14 text-center', icon: '⚡' },
    { key: 'ga', label: 'گل خورده', className: 'w-16 text-center', icon: '🛡️' },
    { key: 'gd', label: 'تفاضل', className: 'w-14 text-center', icon: '📊' },
    { key: 'points', label: 'امتیاز', className: 'w-16 text-center font-bold', icon: '⭐' },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/40';
    if (rank === 3) return 'from-orange-600/20 to-orange-700/20 border-orange-600/40';
    return 'from-slate-800/50 to-slate-700/50 border-slate-700/30';
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
          جدول رده‌بندی
        </h2>
        <span className="text-3xl">🏆</span>
      </div>
      
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="text-xs text-teal-300 uppercase bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0">
            <tr className="border-b-2 border-teal-500/30">
              {headers.map(h => (
                <th key={h.key} scope="col" className={`px-3 py-4 ${h.className} font-bold`}>
                  <div className="flex items-center justify-center gap-1">
                    <span className="hidden sm:inline">{h.icon}</span>
                    <span>{h.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((team, index) => (
              <tr 
                key={team.groupIndex} 
                className={`border-b border-slate-700/50 hover:bg-slate-700/40 transition-all duration-200 bg-gradient-to-r ${getRankColor(team.rank)} border-r-4`}
              >
                <td className="px-3 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold">{getRankBadge(team.rank)}</span>
                  </div>
                </td>
                <td className="px-3 py-4 text-right">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {team.groupIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base">{team.teamName}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{team.players}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 font-semibold text-white">
                    {team.played}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-600/30 text-green-300 font-bold">
                    {team.wins}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-600/30 text-yellow-300 font-bold">
                    {team.draws}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-600/30 text-red-300 font-bold">
                    {team.losses}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="font-semibold text-emerald-400">{team.goalsFor}</span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="font-semibold text-rose-400">{team.goalsAgainst}</span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className={`font-bold ${team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 font-black text-white text-lg shadow-lg">
                    {team.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600/50"></span>
          <span>برد = 3 امتیاز</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-600/50"></span>
          <span>مساوی = 1 امتیاز</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600/50"></span>
          <span>باخت = 0 امتیاز</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
