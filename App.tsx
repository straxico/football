import React, { useState, useCallback, useEffect } from 'react';
import UserList from './components/UserList';
import GroupList from './components/GroupList';
import ScheduleComponent from './components/Schedule';
import ResultsTable from './components/ResultsTable';
import type { User, Group, Schedule, Match, TeamStats } from './types';

// Hardcoded Bin ID for public access
const BIN_ID = '68f8bc5543b1c97be97800c8';

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function generateSchedule(groups: Group[]): Schedule {
  const numGroups = groups.length;
  if (numGroups < 2) {
    return [];
  }

  const allMatches: Match[] = [];
  for (let i = 0; i < numGroups; i++) {
    for (let j = i + 1; j < numGroups; j++) {
      allMatches.push({ teams: [i, j], score: [null, null] });
    }
  }

  const shuffledMatches = shuffleArray(allMatches);

  const schedule: Schedule = [];
  const gamesPerDay = 2;
  for (let i = 0; i < shuffledMatches.length; i += gamesPerDay) {
    schedule.push(shuffledMatches.slice(i, i + gamesPerDay));
  }

  return schedule;
}


const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [schedule, setSchedule] = useState<Schedule>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [isGrouping, setIsGrouping] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`);
        if (!response.ok) {
           if (response.status === 404) {
             alert("مخزن آنلاین داده یافت نشد. پس از انجام قرعه کشی، داده‌ها را ذخیره کنید تا مخزن ایجاد شود.");
             return;
           }
           const errorData = await response.json();
           throw new Error(`خطا در ارتباط با سرور: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        const record = data.record;

        if (!record || Object.keys(record).length === 0) {
            console.log("Online data bin is empty, starting fresh.");
            setUsers([]);
            setGroups([]);
            setSchedule([]);
            return;
        }
        
        if (record.users && Array.isArray(record.users) && record.groups && Array.isArray(record.groups) && record.schedule && Array.isArray(record.schedule)) {
            setUsers(record.users);
            setGroups(record.groups);
            setSchedule(record.schedule);
            console.log("Data successfully loaded from server.");
        } else {
            alert("داده‌های بارگذاری شده از سرور ناقص یا نامعتبر است.");
        }
    } catch (error) {
        console.error("Failed to load data online:", error);
        alert(`خطا در بارگذاری آنلاین: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  useEffect(() => {
    if (groups.length === 0) {
        setTeamStats([]);
        return;
    }

    const stats: Omit<TeamStats, 'rank'>[] = groups.map((group, index) => ({
        groupIndex: index,
        teamName: `گروه ${index + 1}`,
        players: group.map(u => u.name).join(' و '),
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
    }));

    schedule.forEach(day => {
        day.forEach(match => {
            const { teams, score } = match;
            const [team1Index, team2Index] = teams;
            const [score1, score2] = score;

            if (score1 !== null && score2 !== null) {
                const team1Stats = stats.find(s => s.groupIndex === team1Index);
                const team2Stats = stats.find(s => s.groupIndex === team2Index);

                if (team1Stats && team2Stats) {
                    team1Stats.played++;
                    team2Stats.played++;
                    team1Stats.goalsFor += score1;
                    team2Stats.goalsFor += score2;
                    team1Stats.goalsAgainst += score2;
                    team2Stats.goalsAgainst += score1;
                    team1Stats.goalDifference = team1Stats.goalsFor - team1Stats.goalsAgainst;
                    team2Stats.goalDifference = team2Stats.goalsFor - team2Stats.goalsAgainst;

                    if (score1 > score2) {
                        team1Stats.wins++;
                        team2Stats.losses++;
                        team1Stats.points += 3;
                    } else if (score2 > score1) {
                        team2Stats.wins++;
                        team1Stats.losses++;
                        team2Stats.points += 3;
                    } else {
                        team1Stats.draws++;
                        team2Stats.draws++;
                        team1Stats.points += 1;
                        team2Stats.points += 1;
                    }
                }
            }
        });
    });
    
    stats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
    });

    setTeamStats(stats.map((stat, index) => ({ ...stat, rank: index + 1 })));

  }, [schedule, groups]);


  const handleCreateGroups = useCallback(() => {
    setIsGrouping(true);
    setGroups([]);
    setSchedule([]);

    setTimeout(() => {
      const pot1Users = shuffleArray<User>(users.filter(u => u.pot === 1));
      const pot2Users = shuffleArray<User>(users.filter(u => u.pot === 2));
      
      const newGroups: Group[] = [];
      const maxLen = Math.max(pot1Users.length, pot2Users.length);

      for (let i = 0; i < maxLen; i++) {
        const group: Group = [];
        if (i < pot1Users.length && pot1Users[i]) {
            group.push(pot1Users[i]);
        }
        if (i < pot2Users.length && pot2Users[i]) {
            group.push(pot2Users[i]);
        }
        if (group.length > 0) {
            newGroups.push(group);
        }
      }

      setGroups(newGroups);

      if (newGroups.length > 1) {
        const newSchedule = generateSchedule(newGroups);
        setSchedule(newSchedule);
      }

      setIsGrouping(false);
    }, 1000); 
  }, [users]);

  const handleScoreChange = (dayIndex: number, matchIndex: number, teamIndex: 0 | 1, newScore: number) => {
    setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule)); // Deep copy
        const match = newSchedule[dayIndex][matchIndex];
        match.score[teamIndex] = isNaN(newScore) || newScore < 0 ? null : newScore;
        return newSchedule;
    });
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
  };


  const handleSaveOnline = async () => {
    if (!apiKey) {
        alert("لطفا کلید API مدیر (X-Master-Key) را وارد کنید.");
        return;
    }
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey,
                'X-Bin-Versioning': 'false' // To prevent creating new versions on each save
            },
            body: JSON.stringify({ users, groups, schedule })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`خطا در ارتباط با سرور: ${errorData.message || response.statusText}`);
        }
        alert("داده‌ها با موفقیت به صورت آنلاین ذخیره شد.");
    } catch (error) {
        console.error("Failed to save data online:", error);
        alert(`خطا در ذخیره سازی آنلاین: ${error.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 blur-3xl"></div>
          <div className="relative">
            <div className="inline-block mb-4">
              <div className="text-6xl mb-2">⚽</div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 pb-2 mb-3 animate-gradient">
              سیستم قرعه کشی فوتبال
            </h1>
            <p className="text-gray-400 mt-2 text-base sm:text-lg font-medium">مدیریت حرفه‌ای مسابقات لیگ دستی</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Sidebar - User List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <UserList users={users} onUpdateUser={handleUpdateUser} isLoading={isLoading} apiKey={apiKey} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 flex flex-col items-center justify-start space-y-6 order-1 lg:order-2">
            {/* Control Panel */}
            <div className="w-full flex flex-col space-y-4">
              <div className="w-full flex space-x-4 space-x-reverse">
                <button 
                  onClick={loadData} 
                  className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-sky-500/40 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  <span className="text-xl">🔄</span>
                  <span>بارگذاری از سرور</span>
                </button>
              </div>
              
              <details className="bg-gradient-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm rounded-xl p-5 w-full border border-slate-700/50 shadow-xl">
                <summary className="font-bold text-teal-300 cursor-pointer flex items-center gap-2 hover:text-teal-200 transition-colors">
                  <span className="text-xl">⚙️</span>
                  <span>پنل مدیریت</span>
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 bg-slate-900/50 p-3 rounded-lg border-r-4 border-blue-500">
                      💡 برای دسترسی به امکانات مدیریتی، کلید API خود را وارد کنید
                    </p>
                    <input
                      type="password"
                      placeholder="🔑 کلید API مدیر (X-Master-Key)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-900 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-500"
                    />
                  </div>

                  {apiKey && (
                    <div className="pt-4 border-t border-slate-700 space-y-3">
                      <button
                        onClick={handleCreateGroups}
                        disabled={isGrouping || users.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-900 disabled:to-blue-900 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300/50"
                      >
                        {isGrouping ? (
                          <div className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>در حال قرعه کشی...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">🎲</span>
                            <span>شروع قرعه کشی</span>
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={handleSaveOnline} 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-green-500/40 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <span className="text-xl">💾</span>
                        <span>ذخیره آنلاین</span>
                      </button>
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Results Table - Priority #1 */}
            {teamStats.length > 0 && (
              <div className="w-full animate-fade-in">
                <ResultsTable stats={teamStats} />
              </div>
            )}

            {/* Groups - Priority #2 */}
            <div className="w-full">
              <GroupList groups={groups} />
            </div>

            {/* Schedule - Priority #3 */}
            {schedule.length > 0 && (
              <div className="w-full">
                <ScheduleComponent schedule={schedule} groups={groups} onScoreChange={handleScoreChange} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;