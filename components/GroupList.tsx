import React from 'react';
import type { Group } from '../types';

interface GroupListProps {
  groups: Group[];
}

const GroupList: React.FC<GroupListProps> = ({ groups }) => {
  if (groups.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] border border-slate-700/50 backdrop-blur-sm">
        <div className="text-6xl mb-4 animate-bounce">🎲</div>
        <p className="text-gray-400 text-lg text-center max-w-md">
          آماده شروع قرعه کشی؟ روی دکمه بالا کلیک کنید!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-3xl">👥</span>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          گروه‌های قرعه کشی
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group, index) => (
          <div 
            key={index} 
            className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 border border-slate-600/30 group overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Group badge */}
            <div className="relative mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <span className="text-2xl font-black text-white">{index + 1}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300 mb-4">
              گروه {index + 1}
            </h3>
            
            <ul className="space-y-3 relative">
              {group.map((user) => (
                <li 
                  key={user.id} 
                  className="flex items-center justify-center gap-3 text-white text-base bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.initials}
                  </span>
                  <span className="font-semibold">{user.name}</span>
                </li>
              ))}
              {group.length === 1 && (
                <li className="text-gray-400 text-sm italic bg-slate-900/30 rounded-lg p-2">
                  (تک نفره)
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
        <p className="text-gray-400 text-sm">
          تعداد کل گروه‌ها: <span className="font-bold text-teal-400">{groups.length}</span>
        </p>
      </div>
    </div>
  );
};

export default GroupList;