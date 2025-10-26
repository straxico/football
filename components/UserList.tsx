import React, { useState } from 'react';
import type { User } from '../types';

interface UserListItemProps {
  user: User;
  onUpdateUser: (user: User) => void;
  apiKey: string;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onUpdateUser, apiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedPot, setEditedPot] = useState(user.pot);

  const handleSave = () => {
    onUpdateUser({ ...user, name: editedName.trim(), pot: editedPot });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedPot(user.pot);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="flex flex-col p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl transition-all duration-200 space-y-3 border border-blue-500/30 shadow-lg">
        <div className="flex items-center w-full gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user.initials}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-slate-900 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-blue-400 outline-none transition-colors"
              placeholder="نام شرکت کننده"
            />
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm font-semibold">گلدان:</label>
              <select
                value={editedPot}
                onChange={(e) => setEditedPot(Number(e.target.value))}
                className="bg-slate-900 text-white p-2 rounded-lg border-2 border-slate-600 focus:border-blue-400 outline-none transition-colors cursor-pointer"
              >
                <option value={1}>۱</option>
                <option value={2}>۲</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={handleCancel} 
            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105"
          >
            لغو
          </button>
          <button 
            onClick={handleSave} 
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
          >
            ✅ ذخیره
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center p-3 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-600/30">
      <div className="relative shrink-0 ml-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-base font-bold shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-200">
          {user.initials}
        </div>
        {user.pot === 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
            ⭐
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-base truncate group-hover:text-blue-300 transition-colors">
          {user.name}
        </h3>
        <p className="text-xs text-gray-500">گلدان {user.pot}</p>
      </div>
      {apiKey && (
        <button 
          onClick={() => setIsEditing(true)} 
          className="text-gray-500 hover:text-blue-400 text-xl p-2 rounded-full hover:bg-slate-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label={`Edit ${user.name}`}
        >
          ✏️
        </button>
      )}
    </li>
  );
};

interface UserListProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  isLoading: boolean;
  apiKey: string;
}

const UserList: React.FC<UserListProps> = ({ users, onUpdateUser, isLoading, apiKey }) => {
  const pot1Users = users.filter(u => u.pot === 1);
  const pot2Users = users.filter(u => u.pot === 2);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-700/50 backdrop-blur-sm sticky top-4">
      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="text-2xl">👥</span>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          شرکت کنندگان
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400 text-center">در حال بارگذاری...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <span className="text-6xl opacity-50">📋</span>
          <p className="text-gray-400 text-center px-4">
            هیچ شرکت‌کننده‌ای یافت نشد
          </p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {/* Pot 1 */}
          <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 border border-slate-600/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-600/50">
              <span className="text-xl">⭐</span>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                گلدان اول
              </h3>
              <span className="ml-auto bg-slate-900/50 px-3 py-1 rounded-full text-xs font-bold text-yellow-400">
                {pot1Users.length}
              </span>
            </div>
            <ul className="space-y-2">
              {pot1Users.length > 0 ? (
                pot1Users.map((user) => (
                  <UserListItem key={user.id} user={user} onUpdateUser={onUpdateUser} apiKey={apiKey} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">هیچ بازیکنی در این گلدان نیست</p>
              )}
            </ul>
          </div>

          {/* Pot 2 */}
          <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 border border-slate-600/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-600/50">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                گلدان دوم
              </h3>
              <span className="ml-auto bg-slate-900/50 px-3 py-1 rounded-full text-xs font-bold text-blue-400">
                {pot2Users.length}
              </span>
            </div>
            <ul className="space-y-2">
              {pot2Users.length > 0 ? (
                pot2Users.map((user) => (
                  <UserListItem key={user.id} user={user} onUpdateUser={onUpdateUser} apiKey={apiKey} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">هیچ بازیکنی در این گلدان نیست</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;