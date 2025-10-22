import React from 'react';
import type { TeamStats } from '../types';

interface ResultsTableProps {
  stats: TeamStats[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ stats }) => {
  const headers = [
    { key: 'rank', label: '#', className: 'w-8 text-center' },
    { key: 'team', label: 'تیم', className: 'text-right flex-grow' },
    { key: 'played', label: 'B', className: 'w-10 text-center' },
    { key: 'wins', label: ' برد', className: 'w-10 text-center' },
    { key: 'draws', label: 'م', className: 'w-10 text-center' },
    { key: 'losses', label: 'با', className: 'w-10 text-center' },
    { key: 'gf', label: 'زده', className: 'w-10 text-center' },
    { key: 'ga', label: 'خ', className: 'w-10 text-center' },
    { key: 'gd', label: 'ت', className: 'w-10 text-center' },
    { key: 'points', label: 'امتیاز', className: 'w-12 text-center font-bold' },
  ];

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">جدول نتایج</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left text-gray-300">
          <thead className="text-xs text-teal-300 uppercase bg-slate-700/50">
            <tr>
              {headers.map(h => (
                <th key={h.key} scope="col" className={`px-4 py-3 ${h.className}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((team, index) => (
              <tr key={team.groupIndex} className="border-b border-slate-700 hover:bg-slate-700/40">
                <td className="px-4 py-3 text-center font-medium">{team.rank}</td>
                <td className="px-4 py-3 text-right">
                  <div className="font-bold text-white">{team.teamName}</div>
                  <div className="text-xs text-gray-400 truncate max-w-xs">{team.players}</div>
                </td>
                <td className="px-4 py-3 text-center">{team.played}</td>
                <td className="px-4 py-3 text-center text-green-400">{team.wins}</td>
                <td className="px-4 py-3 text-center text-yellow-400">{team.draws}</td>
                <td className="px-4 py-3 text-center text-red-400">{team.losses}</td>
                <td className="px-4 py-3 text-center">{team.goalsFor}</td>
                <td className="px-4 py-3 text-center">{team.goalsAgainst}</td>
                <td className="px-4 py-3 text-center font-medium">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                <td className="px-4 py-3 text-center font-bold text-white">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
