
import React from 'react';
import type { User } from '../types';

interface UserListItemProps {
  user: User;
}

// Helper component defined outside the main component to prevent re-renders.
const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  return (
    <li className="flex items-center p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors duration-200">
      <div className="relative shrink-0 mr-4">
        {user.avatar ? (
          <img className="w-14 h-14 rounded-full object-cover" src={user.avatar} alt={user.name} />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {user.initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-base truncate">{user.name}</h3>
        <p className={`${user.online ? 'text-blue-400' : 'text-gray-400'} text-sm`}>{user.status}</p>
      </div>
      <div className="text-yellow-400 text-2xl ml-3">
        👍
      </div>
    </li>
  );
};

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-4">
      <h2 className="text-2xl font-bold text-white mb-4 px-3">شرکت کنندگان</h2>
      <ul className="space-y-1 max-h-[75vh] overflow-y-auto">
        {users.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default UserList;
