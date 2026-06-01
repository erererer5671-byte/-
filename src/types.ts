/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  rating: number;
  potential: number;
  value: number; // in Millions of £ (e.g. 12.5)
  wage: number; // in thousands of £ per week (e.g. 45)
  fitness: number; // 0-100
  morale: number; // 0-100
  form: number; // 1-10
  goals: number;
  assists: number;
  cleanSheets: number;
  matchesPlayed: number;
  squadStatus: 'Starting' | 'Sub' | 'Reserve';
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  budget: number; // in Millions of £
  prestige: number; // 1-100
  logoBg: string; // Tailwind color e.g., 'bg-red-600'
  logoTextColor: string; // Tailwind text color e.g., 'text-white'
  stadiumCapacity: number;
  // Infrastructure Levels (1 to 5)
  infrastructure: {
    academy: number;
    training: number;
    stadium: number;
    scouting: number;
  };
  // League Statistics
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  isUser: boolean;
}

export interface Scout {
  id: string;
  name: string;
  rating: number; // 1-5
  region: 'Domestic' | 'Europe' | 'South America' | 'Africa' | 'Asia';
  cost: number; // In £ millions to hire/employ
  isHired: boolean;
  searchDaysLeft: number; // 0 means idle, >0 means searching
  foundPlayers: Player[];
}

export type FormationType = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2';
export type TacticalStyle = 'Balanced' | 'Tiki-Taka' | 'Counter-Attack' | 'Gegenpress' | 'Park the Bus';
export type TeamMentality = 'Defensive' | 'Cautious' | 'Balanced' | 'Attacking' | 'All-Out Attack';

export interface Tactics {
  formation: FormationType;
  style: TacticalStyle;
  mentality: TeamMentality;
  captainId: string;
  penaltyTakerId: string;
  freekickTakerId: string;
}

export interface MatchStats {
  shots: number;
  shotsOnTarget: number;
  possession: number; // percent e.g. 52
  fouls: number;
  yellows: number;
  reds: number;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'SHOOT' | 'MISS' | 'SAVE' | 'FOUL' | 'YELLOW' | 'RED' | 'KICKOFF' | 'COMMENTARY' | 'PITCH_EVENT';
  text: string;
  player1Name?: string;
  player2Name?: string;
  side: 'home' | 'away' | 'system';
}

export interface Match {
  id: string;
  homeClub: Club;
  awayClub: Club;
  homeScore: number;
  awayScore: number;
  played: boolean;
  minute: number;
  live: boolean;
  stats: {
    home: MatchStats;
    away: MatchStats;
  };
  events: MatchEvent[];
}

export interface CalendarWeek {
  weekNumber: number;
  date: string;
  opponentId: string | null; // Null if no match (e.g. transfer window only or break)
  isMatchday: boolean;
  isWinterWindowOpen: boolean;
}

export interface GameState {
  currentWeekIndex: number;
  userClubId: string;
  clubs: Club[];
  playersByClub: Record<string, Player[]>; // key: clubId, or 'free_agents' or 'scout_pool'
  scouts: Scout[];
  tactics: Tactics;
  leagueTable: Club[];
  calendar: CalendarWeek[];
  transferHistory: TransferRecord[];
}

export interface TransferRecord {
  id: string;
  playerName: string;
  fromClubName: string;
  toClubName: string;
  fee: number; // millions
  wage: number; // thousands
  date: string;
}
