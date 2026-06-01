/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, Club, Player, Scout, CalendarWeek, TransferRecord } from './types';
import { generateInitialState, INITIAL_CLUBS, getFixturesForRound, createPlayer } from './data/initialData';
import ClubDashboard from './components/ClubDashboard';
import TacticsScreen from './components/TacticsScreen';
import TransfersScreen from './components/TransfersScreen';
import InfrastructureScreen from './components/InfrastructureScreen';
import MatchSimulation from './components/MatchSimulation';
import GameDesignDocument from './components/GameDesignDocument';
import { Trophy, Calendar, Users, Landmark, Heart, Shield, Settings, Mail, Star, Gamepad2, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  content: string;
  category: 'BOARD' | 'SCOUT' | 'YOUTH' | 'SYSTEM';
  date: string;
}

export default function App() {
  // Global Mode: GDD vs Simulator
  const [globalMode, setGlobalMode] = useState<'gdd' | 'game'>('gdd');

  // Campaign Setup screen vs main game
  const [selectedSetupClubId, setSelectedSetupClubId] = useState<string>('c1');
  const [campaignStarted, setCampaignStarted] = useState<boolean>(false);

  // Core Game State
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Router View Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tactics' | 'transfers' | 'infrastructure' | 'match'>('dashboard');

  // Interactive inbox msgs
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);

  // Academy selection pool prospects
  const [academyProspects, setAcademyProspects] = useState<Player[]>([]);

  // Incoming offer bids on users reserves
  const [incomingBids, setIncomingBids] = useState<Array<{ id: string; player: Player; offerFee: number; fromClub: Club }>>([]);

  // Setup Campaign Initialization
  const handleStartCampaign = () => {
    const initialState = generateInitialState(selectedSetupClubId);
    setGameState(initialState);
    setCampaignStarted(true);
    setActiveTab('dashboard');

    // Welcome email package
    const selClub = INITIAL_CLUBS.find(c => c.id === selectedSetupClubId)!;
    setInboxMessages([
      {
        id: 'msg_1',
        sender: 'Chairman & Board of Directors',
        subject: `Welcome to ${selClub.name}!`,
        content: `Greetings Manager,\n\nWe are absolutely delighted to welcome you to the club. The Board expectations for this campaign are simple: achieve stable competitive results, develop our Youth Academy pipeline, and strengthen the roster through the upcoming winter transfer window. Your initial stadium ticket revenues and scouting networks are configured. Good luck!\n\nSincerely,\nClub Executive Committee`,
        category: 'BOARD',
        date: 'Week 1 Office'
      }
    ]);

    // Initial Academy Prospects
    const initialPros = [
      createPlayer('youth_idx_base_1', 'James Sterling', 'MID', 56, 17, 'England'),
      createPlayer('youth_idx_base_2', 'Mason Henderson', 'ATT', 58, 16, 'Scotland')
    ];
    // Override potential range to make them exciting prospects
    initialPros[0].potential = 86;
    initialPros[1].potential = 84;
    setAcademyProspects(initialPros);
  };

  // Skip / Progress Calendar turn Week Action
  const handleNextWeekTurn = () => {
    if (!gameState) return;

    const { currentWeekIndex, calendar, clubs, playersByClub } = gameState;
    const nextWeekIdx = currentWeekIndex + 1;

    if (nextWeekIdx >= calendar.length) {
      alert("The season campaign has ended! Check the final championship standing table of your management campaign.");
      return;
    }

    const currentWeekObj = calendar[currentWeekIndex];

    // 1. Simulate all other league fixtures for this round instantly
    let updatedClubs = [...gameState.clubs];
    if (currentWeekObj.isMatchday) {
      const fixtures = getFixturesForRound(clubs, currentWeekIndex);
      
      fixtures.forEach(fixture => {
        // Skip user's game as they must play manually via Match simulation!
        const userInGame = fixture.homeId === gameState.userClubId || fixture.awayId === gameState.userClubId;
        if (userInGame) return;

        const home = updatedClubs.find(c => c.id === fixture.homeId)!;
        const away = updatedClubs.find(c => c.id === fixture.awayId)!;

        // Ratings-influenced simulation math
        const ratingDiff = home.rating - away.rating;
        const homeGoals = Math.round(Math.max(0, 1.25 + ratingDiff * 0.05 + (Math.random() * 2 - 1)));
        const awayGoals = Math.round(Math.max(0, 0.95 - ratingDiff * 0.05 + (Math.random() * 1.8 - 0.9)));

        // Update stats
        home.played += 1;
        away.played += 1;
        home.goalsFor += homeGoals;
        home.goalsAgainst += awayGoals;
        away.goalsFor += awayGoals;
        away.goalsAgainst += homeGoals;

        if (homeGoals > awayGoals) {
          home.won += 1;
          home.points += 3;
          away.lost += 1;
        } else if (homeGoals === awayGoals) {
          home.drawn += 1;
          home.points += 1;
          away.drawn += 1;
          away.points += 1;
        } else {
          away.won += 1;
          away.points += 3;
          home.lost += 1;
        }
      });
    }

    // 2. Decrement Scouts timers & update discoveries
    const updatedScouts = gameState.scouts.map(scout => {
      if (scout.isHired && scout.searchDaysLeft > 0) {
        const nextDays = scout.searchDaysLeft - 1;
        
        if (nextDays === 0) {
          // Scout completed search! Discover 3 custom, high-potential stars
          const discovered: Player[] = [];
          for (let i = 0; i < 3; i++) {
            const starId = `discovered_${scout.id}_${i}_${Math.floor(Math.random() * 100)}`;
            const ratingRange = 64 + scout.rating * 3; // Lvl 5 scout gets rating 79 stars
            const targetRat = ratingRange + Math.floor(Math.random() * 6 - 3);
            const age = 17 + Math.floor(Math.random() * 5); // 17-21 young gems
            
            const p = createPlayer(
              starId,
              `Scouted Jewel ${i + 1}`,
              'MID', // default position overwritten later or scout choice or positional
              targetRat,
              age,
              scout.region === 'Domestic' ? 'England' : scout.region === 'Europe' ? 'Spain' : 'Brazil'
            );
            
            p.potential = Math.min(99, targetRat + 10 + Math.floor(Math.random() * 8)); // secure potential premium
            discovered.push(p);
          }

          // Trigger email alert
          const scoutMessage: InboxMessage = {
            id: `msg_scout_${Date.now()}`,
            sender: `${scout.name} (Scout)`,
            subject: `Scouting sweeps completed in ${scout.region}!`,
            content: `Manager,\n\nWe have completed our specialized search for targets in ${scout.region}. We discovered several incredible talents in our database showing high potential. Go to the Scouting tab within transfers to review the reports before rival teams intercept them!`,
            category: 'SCOUT',
            date: `Week ${calendar[nextWeekIdx].weekNumber} Urgent`
          };
          setInboxMessages(prev => [scoutMessage, ...prev]);

          return { ...scout, searchDaysLeft: 0, foundPlayers: discovered };
        }
        return { ...scout, searchDaysLeft: nextDays };
      }
      return scout;
    });

    // 3. Recover player fitness based on facility upgrades
    const userClubObj = updatedClubs.find(c => c.id === gameState.userClubId)!;
    const recoveryFactor = userClubObj.infrastructure.training * 4 + 10; // Level 5 recovers 30 fitness per week!

    const updatedPlayersByClub = { ...gameState.playersByClub };
    updatedPlayersByClub[gameState.userClubId] = (playersByClub[gameState.userClubId] || []).map(p => {
      if (p.squadStatus !== 'Starting') {
        return { ...p, fitness: Math.min(100, Math.round(p.fitness + recoveryFactor)) };
      }
      return p;
    });

    // 4. Random Youth Academy prospect emergence
    const academyLevel = userClubObj.infrastructure.academy;
    const academySpawnChance = 0.2 + academyLevel * 0.1; // Lvl 5 academy has 70% spawn rate per week!
    
    if (Math.random() < academySpawnChance) {
      const pIdx = academyProspects.length + 1;
      const age = 16 + Math.floor(Math.random() * 3); // 16 - 18
      const posArr: Array<'GK' | 'DEF' | 'MID' | 'ATT'> = ['GK', 'DEF', 'MID', 'ATT'];
      const pos = posArr[Math.floor(Math.random() * posArr.length)];
      
      const rating = 53 + academyLevel * 3 + Math.floor(Math.random() * 4); // level 5 yields initial rating ~68 to 72!
      const potential = Math.max(rating + 10, 80 + Math.floor(Math.random() * 16)); // Potential 80 to 96!

      const newProspect = createPlayer(`youth_${pIdx}_${Date.now()}`, `Academy Kid #${pIdx}`, pos, rating, age, 'England');
      newProspect.potential = Math.min(99, potential);
      newProspect.squadStatus = 'Reserve';

      setAcademyProspects(prev => [...prev, newProspect]);

      // Inbox message
      setInboxMessages(prev => [{
        id: `msg_youth_${Date.now()}`,
        sender: 'Youth Academy Director',
        subject: 'Breakthrough Youth Prospect spotted!',
        content: `Manager,\n\nOur instructors report a promising young ${pos} has graduated from our Academy under our current youth infrastructure development networks. Check the Youth Academy tab immediately to recruit them for free!`,
        category: 'YOUTH',
        date: `Week ${calendar[nextWeekIdx].weekNumber}`
      }, ...prev]);
    }

    // 5. Random incoming purchase proposals for users reserve players during Winter Transfer Window
    const isWinterOpen = calendar[nextWeekIdx].isWinterWindowOpen;
    if (isWinterOpen && Math.random() < 0.45) { // 45% bid generation rate under open window
      const userReserves = updatedPlayersByClub[gameState.userClubId].filter(p => p.squadStatus === 'Reserve');
      if (userReserves.length > 0) {
        const targetPlayer = userReserves[Math.floor(Math.random() * userReserves.length)];
        const bidsOfferingClub = updatedClubs.filter(c => c.id !== gameState.userClubId && c.rating >= targetPlayer.rating - 5);
        
        if (bidsOfferingClub.length > 0) {
          const offerClub = bidsOfferingClub[Math.floor(Math.random() * bidsOfferingClub.length)];
          // bid offer runs between 0.9x and 1.35x value
          const bidFee = Math.round(targetPlayer.value * (0.9 + Math.random() * 0.45) * 10) / 10;

          const freshBid = {
            id: `bid_${Date.now()}`,
            player: targetPlayer,
            offerFee: Math.max(0.2, bidFee),
            fromClub: offerClub
          };

          setIncomingBids(prev => [...prev, freshBid]);

          // Mail alert
          setInboxMessages(prev => [{
            id: `msg_bid_${Date.now()}`,
            sender: 'Club Chief Negotiator',
            subject: `Official Bid Proposal: ${targetPlayer.name}`,
            content: `Dear Manager,\n\nWe have received an official transfer purchase offer from ${offerClub.name} for our reserve player ${targetPlayer.name}.\n\nThey are offering a solid £${freshBid.offerFee.toFixed(1)}M for an immediate transfer. Visit the Transfer Offers tab and review terms to either Cash In or decline.`,
            category: 'BOARD',
            date: `Week ${calendar[nextWeekIdx].weekNumber} Action`
          }, ...prev]);
        }
      }
    }

    // 6. Refresh state
    const sortedLeagueTable = [...updatedClubs].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdB = b.goalsFor - b.goalsAgainst;
      const gdA = a.goalsFor - a.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });

    setGameState({
      ...gameState,
      currentWeekIndex: nextWeekIdx,
      clubs: updatedClubs,
      scouts: updatedScouts,
      leagueTable: sortedLeagueTable,
      playersByClub: updatedPlayersByClub
    });

    setActiveTab('dashboard');
  };

  // Match completion trigger callback
  const handleMatchSimulationOutcome = (outcome: {
    userScore: number;
    opponentScore: number;
    pointsGained: number;
    revenueGained: number;
    squadPlayersUpdates: Player[];
  }) => {
    if (!gameState) return;

    const { userClubId, currentWeekIndex, clubs, calendar } = gameState;
    const opponentId = calendar[currentWeekIndex].opponentId!;

    // 1. Update stats of user club and opponent club in-state
    const updatedClubs = clubs.map(club => {
      if (club.id === userClubId) {
        return {
          ...club,
          played: club.played + 1,
          won: club.won + (outcome.userScore > outcome.opponentScore ? 1 : 0),
          drawn: club.drawn + (outcome.userScore === outcome.opponentScore ? 1 : 0),
          lost: club.lost + (outcome.userScore < outcome.opponentScore ? 1 : 0),
          goalsFor: club.goalsFor + outcome.userScore,
          goalsAgainst: club.goalsAgainst + outcome.opponentScore,
          points: club.points + outcome.pointsGained,
          budget: Math.round((club.budget + outcome.revenueGained) * 10) / 10
        };
      }
      if (club.id === opponentId) {
        return {
          ...club,
          played: club.played + 1,
          won: club.won + (outcome.opponentScore > outcome.userScore ? 1 : 0),
          drawn: club.drawn + (outcome.userScore === outcome.opponentScore ? 1 : 0),
          lost: club.lost + (outcome.opponentScore < outcome.userScore ? 1 : 0),
          goalsFor: club.goalsFor + outcome.opponentScore,
          goalsAgainst: club.goalsAgainst + outcome.userScore,
          points: club.points + (outcome.opponentScore > outcome.userScore ? 3 : outcome.opponentScore === outcome.userScore ? 1 : 0)
        };
      }
      return club;
    });

    // 2. Map squad rating upgrades
    const updatedPlayersByClub = { ...gameState.playersByClub };
    updatedPlayersByClub[userClubId] = outcome.squadPlayersUpdates;

    // 3. Clear simulation screen and progress week
    const sortedLeagueTable = [...updatedClubs].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdB = b.goalsFor - b.goalsAgainst;
      const gdA = a.goalsFor - a.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });

    setGameState({
      ...gameState,
      clubs: updatedClubs,
      leagueTable: sortedLeagueTable,
      playersByClub: updatedPlayersByClub
    });

    setInboxMessages(prev => [{
      id: `m_rec_${Date.now()}`,
      sender: 'League Board Press',
      subject: `Matchday Review VS ${clubs.find(c => c.id === opponentId)?.name}`,
      content: `Manager,\n\nYour matchday ended in a scoreline of ${outcome.userScore} - ${outcome.opponentScore}.\n\nYou secured £${outcome.revenueGained.toFixed(2)}M in home stadium gate earnings. Proceed to the next week immediately using the Command Headquarters button!`,
      category: 'SYSTEM',
      date: `Week ${calendar[currentWeekIndex].weekNumber}`
    }, ...prev]);

    setActiveTab('dashboard');
  };

  // General state helper: Buy & Sign player
  const handleAddPlayerToUserClub = (player: Player, fee: number) => {
    if (!gameState) return;

    const { userClubId, playersByClub, clubs, transferHistory } = gameState;
    const userClubObj = clubs.find(c => c.id === userClubId)!;

    // Subtract fee from budget
    const updatedClubs = clubs.map(c => {
      if (c.id === userClubId) {
        return { ...c, budget: Math.max(0, Math.round((c.budget - fee) * 10) / 10) };
      }
      return c;
    });

    const targetRoster = [...(playersByClub[userClubId] || [])];
    
    // Add player to roster as reserve
    const signedPlayer: Player = {
      ...player,
      squadStatus: 'Reserve',
      id: `user_p_${player.id}_${Date.now()}` // generate unique user scope ID
    };
    targetRoster.push(signedPlayer);

    const updatedPlayersByClub = { ...playersByClub };
    updatedPlayersByClub[userClubId] = targetRoster;

    // Remove from free agents or original club lists if signed
    if (playersByClub['free_agents']) {
      updatedPlayersByClub['free_agents'] = playersByClub['free_agents'].filter(p => p.id !== player.id);
    }
    
    // Check if was scout found player, clear it so they look purchased
    gameState.scouts.forEach(s => {
      s.foundPlayers = s.foundPlayers.filter(p => p.id !== player.id);
    });

    // Archive transaction history log
    const tRec: TransferRecord = {
      id: `t_rec_${Date.now()}`,
      playerName: player.name,
      fromClubName: fee === 0 ? 'Free Agency' : 'Rival Club division',
      toClubName: userClubObj.name,
      fee,
      wage: player.wage,
      date: `Week ${gameState.currentWeekIndex + 1}`
    };

    setGameState({
      ...gameState,
      clubs: updatedClubs,
      playersByClub: updatedPlayersByClub,
      transferHistory: [tRec, ...transferHistory]
    });
  };

  // State helper: Sell Player (Accepting Incoming AI Bids)
  const handleAcceptIncomingBid = (bidId: string, playerId: string, fee: number) => {
    if (!gameState) return;

    const { userClubId, playersByClub, clubs, transferHistory } = gameState;
    const userClubObj = clubs.find(c => c.id === userClubId)!;
    const targetPlayer = playersByClub[userClubId].find(p => p.id === playerId)!;
    const activeBidObj = incomingBids.find(b => b.id === bidId)!;

    // Increment budget
    const updatedClubs = clubs.map(c => {
      if (c.id === userClubId) {
        return { ...c, budget: Math.round((c.budget + fee) * 10) / 10 };
      }
      return c;
    });

    // Remove from user squad
    const updatedPlayersByClub = { ...playersByClub };
    updatedPlayersByClub[userClubId] = playersByClub[userClubId].filter(p => p.id !== playerId);

    // Filter bid list
    setIncomingBids(prev => prev.filter(b => b.id !== bidId));

    // Archive transaction history log
    const tRec: TransferRecord = {
      id: `t_rec_s_${Date.now()}`,
      playerName: targetPlayer.name,
      fromClubName: userClubObj.name,
      toClubName: activeBidObj.fromClub.name,
      fee,
      wage: targetPlayer.wage,
      date: `Week ${gameState.currentWeekIndex + 1}`
    };

    setInboxMessages(prev => [{
      id: `msg_sold_${Date.now()}`,
      sender: 'Transfer Registrar Office',
      subject: `Sold Deal Finalized: ${targetPlayer.name}`,
      content: `Successful transaction! ${targetPlayer.name} has completed medical examinations and signed terms with ${activeBidObj.fromClub.name}.\n\nTransfer proceeds of £${fee.toFixed(1)}M have been credited safely to your capital balance!`,
      category: 'BOARD',
      date: `Week ${gameState.currentWeekIndex + 1}`
    }, ...prev]);

    setGameState({
      ...gameState,
      clubs: updatedClubs,
      playersByClub: updatedPlayersByClub,
      transferHistory: [tRec, ...transferHistory]
    });
  };

  const handleRejectIncomingBid = (bidId: string) => {
    setIncomingBids(prev => prev.filter(b => b.id !== bidId));
  };

  // State helper: Hire Scout Action
  const handleHireScout = (scoutId: string) => {
    if (!gameState) return;
    const updatedScouts = gameState.scouts.map(s => {
      if (s.id === scoutId) return { ...s, isHired: true };
      return s;
    });
    setGameState({ ...gameState, scouts: updatedScouts });
  };

  // State helper: Start Scout search assignment
  const handleStartScoutSearch = (scoutId: string, position: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    if (!gameState) return;
    const updatedScouts = gameState.scouts.map(s => {
      if (s.id === scoutId) {
        // Higher scouting facility cuts down the weeks required!
        const userClubObj = gameState.clubs.find(c => c.id === gameState.userClubId)!;
        const duration = Math.max(1, 3 - Math.floor(userClubObj.infrastructure.scouting / 2.5)); // duration 1 or 2 turns
        return { ...s, searchDaysLeft: duration, foundPlayers: [] };
      }
      return s;
    });
    setGameState({ ...gameState, scouts: updatedScouts });
  };

  // State helper: Upgrade Infra categories
  const handleUpgradeInfrastructure = (category: 'academy' | 'training' | 'stadium' | 'scouting', cost: number) => {
    if (!gameState) return;

    const { userClubId, clubs } = gameState;

    const updatedClubs = clubs.map(club => {
      if (club.id === userClubId) {
        const nextLvl = club.infrastructure[category] + 1;
        
        // compute optional stadium seat boosts if stadium upgraded
        let capacity = club.stadiumCapacity;
        if (category === 'stadium') {
          const capAdd = nextLvl === 2 ? 5000 : nextLvl === 3 ? 10000 : nextLvl === 4 ? 15000 : 25000;
          capacity += capAdd;
        }

        return {
          ...club,
          budget: Math.round((club.budget - cost) * 10) / 10,
          stadiumCapacity: capacity,
          infrastructure: {
            ...club.infrastructure,
            [category]: nextLvl
          }
        };
      }
      return club;
    });

    setInboxMessages(prev => [{
      id: `msg_upgrade_${Date.now()}`,
      sender: 'Stadium Stadium Manager',
      subject: `Upgraded Completed: Lvl ${updatedClubs.find(c => c.id === userClubId)!.infrastructure[category]} ${category.toUpperCase()}`,
      content: `Manager,\n\nWe are pleased to report the capital investments into our ${category} facilities have been completed on schedule.\n\nThe operations benefits are active immediately. Proceed with season progression to monitor output parameters!`,
      category: 'BOARD',
      date: `Week ${gameState.currentWeekIndex + 1}`
    }, ...prev]);

    setGameState({
      ...gameState,
      clubs: updatedClubs
    });
  };

  // Academy: Sign Youth candidate directly
  const handleSignAcademyProspect = (prospect: Player) => {
    if (!gameState) return;

    const { userClubId, playersByClub, transferHistory, clubs } = gameState;
    const userClubObj = clubs.find(c => c.id === userClubId)!;

    const updatedRoster = [...(playersByClub[userClubId] || [])];
    
    // Sign prospect
    const signedProspect = {
      ...prospect,
      id: `youth_signed_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      squadStatus: 'Reserve' as const
    };
    updatedRoster.push(signedProspect);

    const updatedPlayersByClub = { ...playersByClub };
    updatedPlayersByClub[userClubId] = updatedRoster;

    setAcademyProspects(prev => prev.filter(p => p.id !== prospect.id));

    const tRec: TransferRecord = {
      id: `t_rec_ac_${Date.now()}`,
      playerName: prospect.name,
      fromClubName: 'Youth Farm Academy',
      toClubName: userClubObj.name,
      fee: 0,
      wage: prospect.wage,
      date: `Week ${gameState.currentWeekIndex + 1}`
    };

    setInboxMessages(prev => [{
      id: `msg_signed_y_${Date.now()}`,
      sender: 'Youth Academy Coordinator',
      subject: `Graduated Prospect: ${prospect.name} signed!`,
      content: `Congratulations! ${prospect.name} has graduated from our youth development files and joined the senior team squad of ${userClubObj.name}.\n\nThey have been placed on the Reserve list at a cost of £${prospect.wage}k / wk standard rookie salaries.`,
      category: 'YOUTH',
      date: `Week ${gameState.currentWeekIndex + 1}`
    }, ...prev]);

    setGameState({
      ...gameState,
      playersByClub: updatedPlayersByClub,
      transferHistory: [tRec, ...transferHistory]
    });
  };

  const handleRejectAcademyProspect = (prospectId: string) => {
    setAcademyProspects(prev => prev.filter(p => p.id !== prospectId));
  };

  // Tactics helper: update settings
  const handleUpdateTactics = (newTactics: typeof gameState.tactics) => {
    if (!gameState) return;
    setGameState({ ...gameState, tactics: newTactics });
  };

  // Squad swaps starting vs bench
  const handleSwapPlayers = (playerAId: string, playerBId: string) => {
    if (!gameState) return;
    const targetRoster = [...gameState.playersByClub[gameState.userClubId]];
    
    const pAIndex = targetRoster.findIndex(x => x.id === playerAId);
    const pBIndex = targetRoster.findIndex(x => x.id === playerBId);
    
    if (pAIndex !== -1 && pBIndex !== -1) {
      const pAStatus = targetRoster[pAIndex].squadStatus;
      const pBStatus = targetRoster[pBIndex].squadStatus;
      
      targetRoster[pAIndex].squadStatus = pBStatus;
      targetRoster[pBIndex].squadStatus = pAStatus;
    }

    const updatedPlayersByClub = { ...gameState.playersByClub };
    updatedPlayersByClub[gameState.userClubId] = targetRoster;

    setGameState({ ...gameState, playersByClub: updatedPlayersByClub });
  };

  // Set individual status (not swap)
  const handleUpdateSquadStatus = (playerId: string, nextStatus: 'Starting' | 'Sub' | 'Reserve') => {
    if (!gameState) return;
    const targetRoster = [...gameState.playersByClub[gameState.userClubId]];
    const pIndex = targetRoster.findIndex(x => x.id === playerId);
    if (pIndex !== -1) {
      targetRoster[pIndex].squadStatus = nextStatus;
    }
    const updatedPlayersByClub = { ...gameState.playersByClub };
    updatedPlayersByClub[gameState.userClubId] = targetRoster;
    setGameState({ ...gameState, playersByClub: updatedPlayersByClub });
  };

  const handleUpdateBudgetDirect = (amount: number) => {
    if (!gameState) return;
    const { userClubId, clubs } = gameState;
    const updatedClubs = clubs.map(c => {
      if (c.id === userClubId) {
        return { ...c, budget: Math.round((c.budget + amount) * 10) / 10 };
      }
      return c;
    });
    setGameState({ ...gameState, clubs: updatedClubs });
  };

  // SETUP SCREEN DISPLAY RENDERING
  if (globalMode === 'gdd') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-4 md:p-8 selection:bg-emerald-500 selection:text-zinc-950">
        
        {/* Simple compact banner above GDD for switching */}
        <div className="max-w-7xl w-full mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-2xl gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl">
              <BookOpen className="w-5 h-5 text-emerald-450 font-black" />
            </span>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-tight">قاعة تخطيط استوديو الألعاب (Next-Gen Football Studio)</h2>
              <p className="text-[9px] text-zinc-500 font-mono">Status: Design Space Engaged | Lead Game Designer Working Environment</p>
            </div>
          </div>
          <button
            onClick={() => {
              setGlobalMode('game');
              if (!gameState || !campaignStarted) {
                // Initialize default club to let them skip setup if preferred
                handleStartCampaign();
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1"
          >
            تشغيل طور محاكاة مهنة المدرب 🎮
          </button>
        </div>

        <GameDesignDocument
          onBackToGame={() => {
            setGlobalMode('game');
            if (!gameState || !campaignStarted) {
              handleStartCampaign();
            }
          }}
          userClubName={gameState ? gameState.clubs.find(c => c.id === gameState.userClubId)?.name : "ريد بول لايبزيغ"}
          userClubBudget={gameState ? gameState.clubs.find(c => c.id === gameState.userClubId)?.budget : 120}
        />
      </div>
    );
  }

  if (!campaignStarted || !gameState) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500">
        
        {/* Visual Launcher Splash header */}
        <div className="max-w-4xl w-full text-center space-y-4 mb-8">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest inline-block animate-pulse">
            Championship Manager v1.6
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
            FOOTBALL MANAGEMENT PRO
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Choose your starting club franchise, arrange custom tactics, manage premium scouts through the winter window, and upgrade your stadium fields to secure champions trophies!
          </p>
        </div>

        {/* Club Selectors */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {INITIAL_CLUBS.map(cl => {
            const isSelected = selectedSetupClubId === cl.id;
            return (
              <div
                key={cl.id}
                id={`setup-club-card-${cl.id}`}
                onClick={() => setSelectedSetupClubId(cl.id)}
                className={`border rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-4 transition ${
                  isSelected
                    ? 'bg-zinc-900 border-emerald-550 shadow-2xl scale-[1.02] ring-1 ring-emerald-500/50'
                    : 'bg-zinc-900/60 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${cl.logoBg}`}>
                      {cl.shortName}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">EST. Budget</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">£{cl.budget}M</strong>
                    </div>
                  </div>

                  <h3 className="font-black text-white mt-4 text-base">{cl.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-xs ${i < Math.floor(cl.rating / 15) ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                    ))}
                    <span className="text-zinc-400 text-xs ml-1">Rating OVR: {cl.rating}</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 space-y-1 text-xs text-zinc-400 font-medium">
                  <div className="flex justify-between">
                    <span>Academy:</span>
                    <strong className="text-white">Lvl {cl.infrastructure.academy}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stadium seats:</span>
                    <strong className="text-white">{cl.stadiumCapacity.toLocaleString()} seats</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action setup buttons */}
        <div className="mb-12">
          <button
            id="btn-setup-launch"
            onClick={handleStartCampaign}
            className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black px-12 py-4 rounded-xl text-sm transition shadow-lg shrink-0 tracking-widest uppercase flex items-center gap-2"
          >
            Launch Team Campaign <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>
        </div>

      </div>
    );
  }

  // Active game contexts
  const userClub = gameState.clubs.find(c => c.id === gameState.userClubId)!;
  const userSquad = gameState.playersByClub[gameState.userClubId] || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${userClub.logoBg}`}>
              {userClub.shortName}
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white flex items-center gap-1.5 uppercase">
                {userClub.name} <span className="text-[10px] bg-zinc-800 text-emerald-405 px-1.5 rounded">MANAGER</span>
              </h1>
              <p className="text-[11px] text-zinc-400">Headquarters Arena Office</p>
            </div>
          </div>

          {/* Primary View Action Router Links Bar */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setGlobalMode('gdd')}
              className="px-3 py-1.5 mr-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-emerald-950/45 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-455" /> وثيقة التصميم (GDD)
            </button>
            <button
              id="router-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-405 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              id="router-tactics"
              onClick={() => setActiveTab('tactics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'tactics' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-405 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Tactics Pitch
            </button>
            <button
              id="router-transfers"
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'transfers' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-405 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" /> Winter Window
            </button>
            <button
              id="router-infrastructure"
              onClick={() => setActiveTab('infrastructure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'infrastructure' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-405 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Academy & Facilities
            </button>
          </nav>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-6 pb-24">
        
        {/* VIEW 1: CLUB MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <ClubDashboard
            gameState={gameState}
            onNextWeek={handleNextWeekTurn}
            inboxMessages={inboxMessages}
            onSetViewTab={(tgt) => setActiveTab(tgt)}
          />
        )}

        {/* VIEW 2: TEAM CONFIG STRATEGY TACTICS FIELD */}
        {activeTab === 'tactics' && (
          <TacticsScreen
            players={userSquad}
            tactics={gameState.tactics}
            onUpdateTactics={handleUpdateTactics}
            onUpdateSquadStatus={handleUpdateSquadStatus}
            onSwapPlayers={handleSwapPlayers}
          />
        )}

        {/* VIEW 3: SCOUTS AND TRANSFER DEALS MARKET */}
        {activeTab === 'transfers' && (
          <TransfersScreen
            gameState={gameState}
            onUpdateBudget={handleUpdateBudgetDirect}
            onAddPlayerToUserClub={handleAddPlayerToUserClub}
            onHireScout={handleHireScout}
            onStartScoutSearch={handleStartScoutSearch}
            onAcceptIncomingBid={handleAcceptIncomingBid}
            onRejectIncomingBid={handleRejectIncomingBid}
            incomingBids={incomingBids}
          />
        )}

        {/* VIEW 4: OPERATIONS & YOUTH DEVE ACADEMY */}
        {activeTab === 'infrastructure' && (
          <InfrastructureScreen
            gameState={gameState}
            onUpgradeInfrastructure={handleUpgradeInfrastructure}
            academyProspects={academyProspects}
            onSignAcademyProspect={handleSignAcademyProspect}
            onRejectAcademyProspect={handleRejectAcademyProspect}
          />
        )}

        {/* VIEW 5: MATCH ENGINE ENVIRONMENT OVERVIEW */}
        {activeTab === 'match' && (
          (() => {
            const currentWeekObj = gameState.calendar[gameState.currentWeekIndex];
            const opponentId = currentWeekObj.opponentId!;
            const opponentClub = gameState.clubs.find(c => c.id === opponentId)!;
            const opponentSquad = gameState.playersByClub[opponentId] || [];

            return (
              <MatchSimulation
                userClub={userClub}
                opponentClub={opponentClub}
                userSquad={userSquad}
                opponentSquad={opponentSquad}
                tactics={gameState.tactics}
                onMatchComplete={handleMatchSimulationOutcome}
                onCloseMatchScreen={() => setActiveTab('dashboard')}
              />
            );
          })()
        )}

      </main>

      {/* COMPACT STICKY BOTTOM TIMELINE CONTROLS */}
      {activeTab !== 'match' && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-40 backdrop-blur-md shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs">
            {/* Timeline status info */}
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-emerald-450 shrink-0" />
              <span>Current Session: <strong className="text-white">Week {gameState.calendar[gameState.currentWeekIndex].weekNumber} of {gameState.calendar.length}</strong></span>
              <span className="text-zinc-[450]">({gameState.calendar[gameState.currentWeekIndex].date})</span>
            </div>

            {/* Next week trigger */}
            <div className="flex items-center gap-3">
              {gameState.calendar[gameState.currentWeekIndex].isMatchday && gameState.calendar[gameState.currentWeekIndex].opponentId ? (
                <div className="text-[11px] text-zinc-400 italic">
                  * Finish match vs <strong>{gameState.clubs.find(c => c.id === gameState.calendar[gameState.currentWeekIndex].opponentId)?.name}</strong> to progress week terms.
                </div>
              ) : (
                <button
                  id="btn-footer-next-week"
                  onClick={handleNextWeekTurn}
                  className="bg-zinc-800 hover:bg-zinc-750 text-white font-black px-6 py-2.5 rounded-lg border border-zinc-700 transition uppercase tracking-wider shadow"
                >
                  Skip to Next Week Turn ➔
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credit footer bar */}
      <footer className="bg-zinc-950 py-6 text-center text-[11px] text-neutral-600 border-t border-zinc-900 mt-auto">
        &copy; 2026 Football Management Pro. All Rights Reserved. Fully offline compatible.
      </footer>

    </div>
  );
}
