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
      const pot1Users = shuffleArray(users.filter(u => u.pot === 1));
      const pot2Users = shuffleArray(users.filter(u => u.pot === 2));
      
      const newGroups: Group[] = [];
      const maxLen = Math.max(pot1Users.length, pot2Users.length);

      for (let i = 0; i < maxLen; i++) {
        const group: Group = [];
        if (pot1Users[i]) {
            group.push(pot1Users[i]);
        }
        if (pot2Users[i]) {
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
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 pb-2">
            سیستم قرعه کشی گروهی
          </h1>
          <p className="text-gray-400 mt-2 text-base sm:text-lg">ایجاد گروه و برنامه ریزی مسابقات لیگ فوتبال دستی</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <UserList users={users} onUpdateUser={handleUpdateUser} isLoading={isLoading} apiKey={apiKey} />
          </div>
          <div className="lg:col-span-3 flex flex-col items-center justify-start space-y-8">
             <div className="w-full max-w-lg flex flex-col space-y-4">

                <div className="w-full flex space-x-4">
                     <button onClick={loadData} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-sky-500/40 transition-all duration-200">
                        بارگذاری داده‌ها از سرور
                    </button>
                </div>
                
                <details className="bg-slate-800 rounded-xl p-4 w-full">
                    <summary className="font-semibold text-teal-300 cursor-pointer">
                        پنل مدیریت
                    </summary>
                    <div className="mt-4 space-y-4">
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400">برای مشاهده دکمه‌های مدیریت، کلید X-Master-Key خود را از سایت JSONBin.io وارد کنید.</p>
                          <input
                              type="password"
                              placeholder="کلید API مدیر (X-Master-Key)"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="w-full bg-slate-700 text-white p-2 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                          />
                        </div>

                        {apiKey && (
                           <div className="pt-4 border-t border-slate-700 space-y-4">
                                <button
                                    onClick={handleCreateGroups}
                                    disabled={isGrouping || users.length === 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
                                >
                                    {isGrouping ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>در حال گروه بندی...</span>
                                    </div>
                                    ) : (
                                    '✨ ایجاد گروه و جدول بازی'
                                    )}
                                </button>
                                <button onClick={handleSaveOnline} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-green-500/40 transition-all duration-200">
                                    ذخیره آنلاین
                                </button>
                            </div>
                        )}
                    </div>
                </details>
            </div>
            <div className="w-full">
               <GroupList groups={groups} />
            </div>
             {schedule.length > 0 && (
              <div className="w-full">
                <ScheduleComponent schedule={schedule} groups={groups} onScoreChange={handleScoreChange} />
              </div>
            )}
            {teamStats.length > 0 && (
                <div className="w-full">
                    <ResultsTable stats={teamStats} />
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;