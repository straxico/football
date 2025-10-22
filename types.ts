export interface User {
  id: number;
  name: string;
  initials?: string;
  pot: number;
}

export type Group = User[];

// A match now stores the teams (by index in the groups array) and their scores.
export interface Match {
  teams: [number, number];
  score: [number | null, number | null];
}

export type Day = Match[];
export type Schedule = Day[];

export interface TeamStats {
  rank: number;
  groupIndex: number;
  teamName: string;
  players: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}