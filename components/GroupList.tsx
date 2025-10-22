
import React from 'react';
import type { Group } from '../types';

interface GroupListProps {
  groups: Group[];
}

const GroupList: React.FC<GroupListProps> = ({ groups }) => {
  if (groups.length === 0) {
    return (
        <div className="w-full bg-slate-800 rounded-xl shadow-lg p-8 flex items-center justify-center h-full min-h-[300px]">
            <p className="text-gray-400 text-lg">برای شروع قرعه کشی، روی دکمه بالا کلیک کنید.</p>
        </div>
    );
  }

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">گروه‌های ایجاد شده</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group, index) => (
          <div key={index} className="bg-slate-700 rounded-lg p-5 text-center transform hover:scale-105 transition-transform duration-300 shadow-md">
            <h3 className="text-xl font-bold text-blue-300 mb-4">گروه {index + 1}</h3>
            <ul className="space-y-3">
              {group.map((user) => (
                <li key={user.id} className="flex items-center justify-center space-x-3 text-white text-base">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.initials}
                    </span>
                  )}
                  <span>{user.name}</span>
                </li>
              ))}
              {group.length === 1 && <li className="text-gray-400 text-sm">(تنها)</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
