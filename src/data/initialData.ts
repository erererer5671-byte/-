/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Club, Player, Scout, CalendarWeek, GameState, Tactics } from '../types';

const FIRST_NAMES = [
  'Harry', 'Marcus', 'Bukayo', 'Declan', 'Kevin', 'Erling', 'Trent', 'Virgil', 'Mohamed', 'Bruno',
  'Bernardo', 'Jack', 'Phil', 'John', 'Luke', 'Reece', 'Mason', 'Jude', 'Conor', 'Raheem',
  'Callum', 'Ollie', 'Harvey', 'Curtis', 'Dominic', 'James', 'Jordan', 'Ben', 'Aaron', 'Kieran',
  'Nick', 'Kyle', 'Nathan', 'Tyrone', 'Jacob', 'Jarrod', 'Danny', 'Christian', 'Ivan', 'David',
  'Emiliano', 'Alisson', 'Ederson', 'Casemiro', 'Gabriel', 'Kai', 'Gabriel', 'Declan', 'Martin', 'William'
];

const LAST_NAMES = [
  'Kane', 'Rashford', 'Saka', 'Rice', 'De Bruyne', 'Haaland', 'Alexander-Arnold', 'van Dijk', 'Salah', 'Fernandes',
  'Silva', 'Grealish', 'Foden', 'Stones', 'Shaw', 'James', 'Mount', 'Bellingham', 'Gallagher', 'Sterling',
  'Wilson', 'Watkins', 'Elliott', 'Jones', 'Calvert-Lewin', 'Maddison', 'Henderson', 'Chilwell', 'Ramsdale', 'Trippier',
  'Pope', 'Walker', 'Ake', 'Mings', 'Ramsey', 'Bowen', 'Ings', 'Eriksen', 'Toney', 'Raya',
  'Martinez', 'Becker', 'Moraes', 'Casemiro', 'Jesus', 'Havertz', 'Martinelli', 'Maguire', 'Odegaard', 'Saliba'
];

const NATIONALITIES = [
  'England', 'Scotland', 'Wales', 'Ireland', 'Brazil', 'Argentina', 'France',
  'Spain', 'Portugal', 'Germany', 'Netherlands', 'Belgium', 'Norway', 'Egypt'
];

// Helper to generate a realistic random-looking name using indexes deterministically or randomly
function generatePlayerName(seed: number): string {
  const fIdx = (seed * 7 + 13) % FIRST_NAMES.length;
  const lIdx = (seed * 11 + 23) % LAST_NAMES.length;
  return `${FIRST_NAMES[fIdx]} ${LAST_NAMES[lIdx]}`;
}

function generateNationality(seed: number): string {
  return NATIONALITIES[(seed * 13 + 7) % NATIONALITIES.length];
}

// Generate an individual player with realistic rating, age, value, and wages
export function createPlayer(
  id: string,
  name: string,
  position: 'GK' | 'DEF' | 'MID' | 'ATT',
  targetRating: number,
  age: number,
  nationality: string
): Player {
  // Add slight variance to rating
  const rating = Math.max(50, Math.min(99, targetRating));
  
  // Decide potential based on age and rating
  let potentialMultiplier = 1;
  if (age <= 21) {
    potentialMultiplier = 1.15 + (Math.random() * 0.1);
  } else if (age <= 25) {
    potentialMultiplier = 1.05 + (Math.random() * 0.05);
  } else if (age <= 28) {
    potentialMultiplier = 1.01 + (Math.random() * 0.02);
  }
  
  const potential = Math.max(rating, Math.min(99, Math.round(rating * potentialMultiplier)));

  // Calculate market value in £ Millions based on rating, potential, and age
  // High ratings scale exponentially. Younger players with high potential are worth much more.
  const ageFactor = age < 23 ? 1.4 : age > 30 ? 0.6 : 1.0;
  const potentialFactor = 1.0 + ((potential - rating) * 0.05);
  const baseValue = Math.pow(Math.max(1, rating - 48), 2.3) * 0.012; 
  let value = Math.max(0.1, Math.round(baseValue * ageFactor * potentialFactor * 10) / 10);
  
  // Cap and smooth value
  if (value > 150) value = 150 - (Math.random() * 10);
  value = Math.round(value * 10) / 10;

  // Weekly wage in Thousands of £ based on player's value and rating
  // E.g., a £50M player gets around £100k - £180k/week
  let wage = Math.round((Math.pow(rating - 50, 1.8) * 0.1 + value * 2) * 10) / 10;
  wage = Math.max(1.5, Math.min(350, Math.round(wage)));

  return {
    id,
    name,
    age,
    nationality,
    position,
    rating,
    potential,
    value,
    wage,
    fitness: 100,
    morale: 85 + Math.floor(Math.random() * 15),
    form: 6 + Math.floor(Math.random() * 4),
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    squadStatus: 'Reserve' // will be overwritten during squad assignment
  };
}

export const INITIAL_CLUBS: Club[] = [
  {
    id: `c1`,
    name: 'Manchester Athletic',
    shortName: 'MNA',
    rating: 83,
    budget: 95.0, // Millions £
    prestige: 86,
    logoBg: 'bg-red-600',
    logoTextColor: 'text-white',
    stadiumCapacity: 74000,
    infrastructure: { academy: 2, training: 2, stadium: 3, scouting: 2 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false, // can select as user
  },
  {
    id: `c2`,
    name: 'Merseyside FC',
    shortName: 'MER',
    rating: 84,
    budget: 80.0,
    prestige: 88,
    logoBg: 'bg-red-800',
    logoTextColor: 'text-white',
    stadiumCapacity: 54000,
    infrastructure: { academy: 3, training: 3, stadium: 2, scouting: 2 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c3`,
    name: 'Manchester Citizens',
    shortName: 'MCI',
    rating: 87,
    budget: 150.0,
    prestige: 92,
    logoBg: 'bg-sky-450 border border-sky-300',
    logoTextColor: 'text-cyan-900',
    stadiumCapacity: 55000,
    infrastructure: { academy: 4, training: 4, stadium: 3, scouting: 3 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c4`,
    name: 'North London Arsenal',
    shortName: 'NLA',
    rating: 83,
    budget: 85.0,
    prestige: 84,
    logoBg: 'bg-red-550 border border-red-700',
    logoTextColor: 'text-white',
    stadiumCapacity: 60000,
    infrastructure: { academy: 3, training: 3, stadium: 3, scouting: 2 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c5`,
    name: 'West London Blues',
    shortName: 'WLB',
    rating: 81,
    budget: 120.0,
    prestige: 81,
    logoBg: 'bg-blue-800',
    logoTextColor: 'text-white',
    stadiumCapacity: 40000,
    infrastructure: { academy: 3, training: 2, stadium: 2, scouting: 3 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c6`,
    name: 'Newcastle Shields',
    shortName: 'NEW',
    rating: 80,
    budget: 105.0,
    prestige: 78,
    logoBg: 'bg-neutral-900 border-2 border-neutral-700',
    logoTextColor: 'text-white',
    stadiumCapacity: 52000,
    infrastructure: { academy: 1, training: 2, stadium: 3, scouting: 2 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c7`,
    name: 'Birmingham Lions',
    shortName: 'BIM',
    rating: 79,
    budget: 45.0,
    prestige: 76,
    logoBg: 'bg-teal-950 border border-amber-600',
    logoTextColor: 'text-amber-500',
    stadiumCapacity: 42000,
    infrastructure: { academy: 2, training: 2, stadium: 2, scouting: 1 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c8`,
    name: 'Leicester Foxes',
    shortName: 'LEI',
    rating: 74,
    budget: 22.0,
    prestige: 72,
    logoBg: 'bg-blue-600',
    logoTextColor: 'text-yellow-400',
    stadiumCapacity: 32000,
    infrastructure: { academy: 2, training: 1, stadium: 1, scouting: 1 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c9`,
    name: 'Southampton Anchors',
    shortName: 'SOU',
    rating: 72,
    budget: 18.0,
    prestige: 69,
    logoBg: 'bg-red-500 border border-neutral-300',
    logoTextColor: 'text-white',
    stadiumCapacity: 32000,
    infrastructure: { academy: 2, training: 1, stadium: 1, scouting: 1 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  },
  {
    id: `c10`,
    name: 'Yorkshire Whites',
    shortName: 'YRK',
    rating: 73,
    budget: 15.0,
    prestige: 70,
    logoBg: 'bg-white border-2 border-yellow-500',
    logoTextColor: 'text-blue-900',
    stadiumCapacity: 38000,
    infrastructure: { academy: 1, training: 2, stadium: 1, scouting: 1 },
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isUser: false,
  }
];

export const INITIAL_SCOUTS: Scout[] = [
  {
    id: 's1',
    name: 'Arthur Pendelton',
    rating: 2,
    region: 'Domestic',
    cost: 0.25,
    isHired: false,
    searchDaysLeft: 0,
    foundPlayers: []
  },
  {
    id: 's2',
    name: 'Sven Lindstrom',
    rating: 3,
    region: 'Europe',
    cost: 0.6,
    isHired: false,
    searchDaysLeft: 0,
    foundPlayers: []
  },
  {
    id: 's3',
    name: 'Carlos Estigarribia',
    rating: 4,
    region: 'South America',
    cost: 1.2,
    isHired: false,
    searchDaysLeft: 0,
    foundPlayers: []
  },
  {
    id: 's4',
    name: 'Kofi Ankrah',
    rating: 3,
    region: 'Africa',
    cost: 0.5,
    isHired: false,
    searchDaysLeft: 0,
    foundPlayers: []
  },
  {
    id: 's5',
    name: 'Morihiro Tanaka',
    rating: 5,
    region: 'Asia',
    cost: 2.0,
    isHired: false,
    searchDaysLeft: 0,
    foundPlayers: []
  }
];

// Helper to generate squad players for each club
function generateSquad(clubId: string, baseRating: number, clubIndex: number): Player[] {
  const squad: Player[] = [];
  let idCounter = 1;

  const positions: Array<{ pos: 'GK' | 'DEF' | 'MID' | 'ATT'; count: number }> = [
    { pos: 'GK', count: 2 },
    { pos: 'DEF', count: 6 },
    { pos: 'MID', count: 6 },
    { pos: 'ATT', count: 5 },
  ];

  let seedIndex = clubIndex * 37;

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      seedIndex++;
      const name = generatePlayerName(seedIndex);
      const nationality = generateNationality(seedIndex);
      
      // Determine individual rating with variety
      let ratingOffset = Math.floor(Math.sin(seedIndex) * 7); 
      // Starting material gets slightly higher boost, reserves get lower
      const isStart = i < Math.ceil(count / 2) + 1;
      ratingOffset += isStart ? 3 : -4;
      
      const rating = Math.max(50, Math.min(99, baseRating + ratingOffset));
      
      // Age distribution
      const ageDist = seedIndex % 3;
      let age = 25; // median
      if (ageDist === 0) {
        age = 18 + (seedIndex % 5); // young talent
      } else if (ageDist === 1) {
        age = 23 + (seedIndex % 6); // prime
      } else {
        age = 29 + (seedIndex % 6); // veteran
      }

      const p = createPlayer(
        `${clubId}_p_${idCounter++}`,
        name,
        pos,
        rating,
        age,
        nationality
      );

      // Assign squads
      if (pos === 'GK') {
        p.squadStatus = i === 0 ? 'Starting' : 'Sub';
      } else if (pos === 'DEF') {
        p.squadStatus = i < 4 ? 'Starting' : i < 5 ? 'Sub' : 'Reserve';
      } else if (pos === 'MID') {
        p.squadStatus = i < 3 ? 'Starting' : i < 5 ? 'Sub' : 'Reserve';
      } else if (pos === 'ATT') {
        p.squadStatus = i < 3 ? 'Starting' : i < 4 ? 'Sub' : 'Reserve';
      }

      squad.push(p);
    }
  });

  return squad;
}

// Generate the league match schedule (Round Robin for 10 teams = 18 matchdays)
// Plus inserting a dedicated Winter Transfer Window with break or match weeks
export function generateCalendar(): CalendarWeek[] {
  const calendar: CalendarWeek[] = [];
  const totalWeeks = 20; // 18 matches, 2 break weeks for winter transfer negotiations

  const dateStart = new Date(2026, 7, 15); // Start mid-August 2026

  for (let i = 1; i <= totalWeeks; i++) {
    const d = new Date(dateStart);
    d.setDate(d.getDate() + (i - 1) * 7);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Weeks 8, 9, 10 are Winter Transfer Window heights! Free transfer time!
    // Let's open winter transfer window from Weeks 8 to 11
    const isWinterOpen = i >= 8 && i <= 12;

    // We can have 18 actual matches. Weeks 9 & 10 has NO matches (Winter break/negotiations peak!).
    let isMatchday = true;
    let matchIndex = i;
    if (i === 9 || i === 10) {
      isMatchday = false;
    } else if (i > 10) {
      matchIndex = i - 2;
    }

    calendar.push({
      weekNumber: i,
      date: dateStr,
      opponentId: null, // will be paired system-wide
      isMatchday,
      isWinterWindowOpen: isWinterOpen
    });
  }

  return calendar;
}

// Match pairings generator (Single Round-Robin is 9 rounds, Double is 18 rounds)
// We'll generate matchups using the circle method for round robin
export function assignMatchups(clubs: Club[], calendar: CalendarWeek[]): CalendarWeek[] {
  const updatedCalendar = [...calendar];
  const clubIds = clubs.map(c => c.id);
  const n = clubIds.length; // 10 teams

  // Generate 18 round pairings
  const rounds: Array<Array<{ home: string; away: string }>> = [];

  // Home-Away Circle Method
  for (let r = 0; r < (n - 1) * 2; r++) {
    const roundMatchups: Array<{ home: string; away: string }> = [];
    const isSecondHalf = r >= n - 1;
    const actualRound = r % (n - 1);

    for (let i = 0; i < n / 2; i++) {
      let homeIdx = (actualRound + i) % (n - 1);
      let awayIdx = (actualRound + n - 1 - i) % (n - 1);

      if (i === 0) {
        awayIdx = n - 1;
      }

      // Swap home/away for the second half of the season
      let home = clubIds[homeIdx];
      let away = clubIds[awayIdx];

      if (r % 2 === 1) {
        // Alternating to balance home games
        const temp = home;
        home = away;
        away = temp;
      }

      if (isSecondHalf) {
        // Swap for second leg
        const temp = home;
        home = away;
        away = temp;
      }

      roundMatchups.push({ home, away });
    }
    rounds.push(roundMatchups);
  }

  // Assign user's opponent for each matchday week
  const userClub = clubs.find(c => c.isUser) || clubs[0];
  const userClubId = userClub.id;

  let roundCounter = 0;
  for (let i = 0; i < updatedCalendar.length; i++) {
    const week = updatedCalendar[i];
    if (week.isMatchday) {
      const currentRoundMatchups = rounds[roundCounter];
      const userMatch = currentRoundMatchups.find(m => m.home === userClubId || m.away === userClubId);
      if (userMatch) {
        const oppId = userMatch.home === userClubId ? userMatch.away : userMatch.home;
        week.opponentId = oppId;
      }
      roundCounter++;
    }
  }

  // We should also attach all matchday fixture data for simulated clubs, but
  // to save memory we can simulate non-user matches instantly on "Next Week" button click!
  return updatedCalendar;
}

// Full Initial Game State Generator
export function generateInitialState(userClubId: string): GameState {
  // Mark User Club
  const clubs = INITIAL_CLUBS.map(club => ({
    ...club,
    isUser: club.id === userClubId,
    budget: club.id === userClubId ? club.budget + 10.0 : club.budget // Give user an initial boost!
  }));

  const userClub = clubs.find(c => c.id === userClubId)!;

  // Generate rosters
  const playersByClub: Record<string, Player[]> = {};
  clubs.forEach((club, index) => {
    playersByClub[club.id] = generateSquad(club.id, club.rating, index);
  });

  // Assign unique IDs to free agents and generate them
  const freeAgents: Player[] = [];
  for (let i = 0; i < 15; i++) {
    const rating = 65 + Math.floor(Math.random() * 15); // ratings 65 - 80
    const age = 19 + Math.floor(Math.random() * 13);
    const posOptions: Array<'GK' | 'DEF' | 'MID' | 'ATT'> = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'];
    const pos = posOptions[i % posOptions.length];
    const name = generatePlayerName(i + 200);
    const nationality = generateNationality(i + 200);
    const agent = createPlayer(`free_p_${i}`, name, pos, rating, age, nationality);
    agent.squadStatus = 'Reserve';
    // Free agents usually accept cheaper wages
    agent.wage = Math.max(1.0, Math.round(agent.wage * 0.7));
    agent.value = Math.max(0.1, Math.round(agent.value * 0.8 * 10) / 10);
    freeAgents.push(agent);
  }
  playersByClub['free_agents'] = freeAgents;

  // Set up calendar
  let calendar = generateCalendar();
  calendar = assignMatchups(clubs, calendar);

  // Set up default user tactics with top players
  const userSquad = playersByClub[userClubId];
  const startingGK = userSquad.find(p => p.position === 'GK' && p.squadStatus === 'Starting') || userSquad.find(p => p.position === 'GK')!;
  const highestRatedDef = userSquad.filter(p => p.position === 'DEF').sort((a, b) => b.rating - a.rating)[0];
  const highestRatedMid = userSquad.filter(p => p.position === 'MID').sort((a, b) => b.rating - a.rating)[0];

  const tactics: Tactics = {
    formation: '4-3-3',
    style: 'Balanced',
    mentality: 'Balanced',
    captainId: highestRatedDef ? highestRatedDef.id : userSquad[0].id,
    penaltyTakerId: highestRatedMid ? highestRatedMid.id : userSquad[0].id,
    freekickTakerId: highestRatedMid ? highestRatedMid.id : userSquad[0].id,
  };

  return {
    currentWeekIndex: 0,
    userClubId,
    clubs,
    playersByClub,
    scouts: INITIAL_SCOUTS,
    tactics,
    leagueTable: [...clubs].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)),
    calendar,
    transferHistory: []
  };
}

// Generate matches fixtures schedule index lookup for advanced background league simulation
export function getFixturesForRound(clubs: Club[], roundIndex: number): Array<{ homeId: string; awayId: string }> {
  const clubIds = clubs.map(c => c.id);
  const n = clubIds.length;
  const roundMatchups: Array<{ homeId: string; awayId: string }> = [];

  const isSecondHalf = roundIndex >= n - 1;
  const actualRound = roundIndex % (n - 1);

  for (let i = 0; i < n / 2; i++) {
    let homeIdx = (actualRound + i) % (n - 1);
    let awayIdx = (actualRound + n - 1 - i) % (n - 1);

    if (i === 0) {
      awayIdx = n - 1;
    }

    let home = clubIds[homeIdx];
    let away = clubIds[awayIdx];

    if (roundIndex % 2 === 1) {
      const temp = home;
      home = away;
      away = temp;
    }

    if (isSecondHalf) {
      const temp = home;
      home = away;
      away = temp;
    }

    roundMatchups.push({ homeId: home, awayId: away });
  }

  return roundMatchups;
}
