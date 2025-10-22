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
      <li className="flex flex-col p-3 bg-slate-700 rounded-lg transition-colors duration-200 space-y-3">
        <div className="flex items-center w-full space-x-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
              {user.initials}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-slate-600 text-white p-2 rounded border border-slate-500 focus:border-blue-400 outline-none"
              placeholder="نام شرکت کننده"
            />
            <div className="flex items-center space-x-2">
              <label className="text-gray-300 text-sm">گلدان:</label>
              <select
                value={editedPot}
                onChange={(e) => setEditedPot(Number(e.target.value))}
                className="bg-slate-600 text-white p-1 rounded border border-slate-500 focus:border-blue-400 outline-none"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={handleCancel} className="px-4 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm font-semibold transition-colors">لغو</button>
          <button onClick={handleSave} className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors">ذخیره</button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors duration-200">
      <div className="relative shrink-0 mr-4">
        <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {user.initials}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-base truncate">{user.name}</h3>
      </div>
      {apiKey && (
        <button 
          onClick={() => setIsEditing(true)} 
          className="text-gray-400 hover:text-white text-2xl ml-3 p-2 rounded-full hover:bg-slate-600 transition-colors"
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
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-4">
      <h2 className="text-2xl font-bold text-white mb-4 px-3">شرکت کنندگان</h2>
      {isLoading ? (
        <p className="text-gray-400 text-center py-8">در حال بارگذاری شرکت کنندگان از سرور...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-center py-8">هیچ شرکت‌کننده‌ای یافت نشد. می‌توانید داده‌ها را ذخیره یا از سرور بارگذاری کنید.</p>
      ) : (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-teal-300 mb-2 px-3 border-b border-slate-700 pb-2">گلدان ۱</h3>
            <ul className="space-y-1 mt-2">
              {pot1Users.length > 0 ? (
                pot1Users.map((user) => (
                  <UserListItem key={user.id} user={user} onUpdateUser={onUpdateUser} apiKey={apiKey} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">هیچ بازیکنی در این گلدان نیست.</p>
              )}
            </ul>
          </div>
           <div>
            <h3 className="text-lg font-semibold text-teal-300 mb-2 px-3 border-b border-slate-700 pb-2">گلدان ۲</h3>
            <ul className="space-y-1 mt-2">
               {pot2Users.length > 0 ? (
                pot2Users.map((user) => (
                  <UserListItem key={user.id} user={user} onUpdateUser={onUpdateUser} apiKey={apiKey} />
                ))
               ) : (
                <p className="text-gray-500 text-center py-4 text-sm">هیچ بازیکنی در این گلدان نیست.</p>
               )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;