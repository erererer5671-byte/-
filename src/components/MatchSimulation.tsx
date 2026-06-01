/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Club, Player, Match, MatchEvent, MatchStats, Tactics } from '../types';
import { 
  Swords, Shield, Zap, RefreshCw, AlertCircle, Play, FastForward, CheckCircle, Ticket, UserCheck, BarChart3, Radio, ArrowLeftRight 
} from 'lucide-react';

interface MatchSimulationProps {
  userClub: Club;
  opponentClub: Club;
  userSquad: Player[];
  opponentSquad: Player[];
  tactics: Tactics;
  onMatchComplete: (result: {
    userScore: number;
    opponentScore: number;
    pointsGained: number;
    revenueGained: number;
    squadPlayersUpdates: Player[];
  }) => void;
  onCloseMatchScreen: () => void;
}

export default function MatchSimulation({
  userClub,
  opponentClub,
  userSquad,
  opponentSquad,
  tactics,
  onMatchComplete,
  onCloseMatchScreen,
}: MatchSimulationProps) {
  // Simulator statuses: 'PRE' | 'LIVE' | 'POST'
  const [matchPhase, setMatchPhase] = useState<'PRE' | 'LIVE' | 'POST'>('PRE');

  // Live match counters
  const [testMinute, setTestMinute] = useState<number>(0);
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [liveTacticsMentality, setLiveTacticsMentality] = useState<typeof tactics.mentality>(tactics.mentality);
  const [commentaryLog, setCommentaryLog] = useState<MatchEvent[]>([]);
  const [simSpeed, setSimSpeed] = useState<'NORMAL' | 'FAST' | 'INSTANT'>('FAST');

  // Live Statistics
  const [userStats, setUserStats] = useState<MatchStats>({ shots: 0, shotsOnTarget: 0, possession: 50, fouls: 0, yellows: 0, reds: 0 });
  const [oppStats, setOppStats] = useState<MatchStats>({ shots: 0, shotsOnTarget: 0, possession: 50, fouls: 0, yellows: 0, reds: 0 });

  // In-Match Subs control
  const [activeUserSquad, setActiveUserSquad] = useState<Player[]>([...userSquad]);
  const [selectedInGamePlayer, setSelectedInGamePlayer] = useState<Player | null>(null);

  // References for timing the gameplay loop
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Home vs Away context
  // To keep it simple, assume the user is the Home club for ticket finances!
  const ticketRevenueMultiplier = userClub.infrastructure.stadium * 0.45 + 1.0;
  const ticketPayout = Math.min(
    userClub.stadiumCapacity * (userClub.infrastructure.stadium * 15 + userClub.prestige * 8) * 0.000001,
    userClub.stadiumCapacity * 0.000035 // cap
  );

  // Prep active lineups
  const startingXI = activeUserSquad.filter(p => p.squadStatus === 'Starting');
  const activeSubs = activeUserSquad.filter(p => p.squadStatus === 'Sub');

  // Pre-match stats sum
  const userTeamOVR = Math.round(startingXI.reduce((sum, p) => sum + p.rating, 0) / 11);
  const oppStartingXI = opponentSquad.filter(p => p.squadStatus === 'Starting').slice(0, 11);
  const oppTeamOVR = Math.round(oppStartingXI.reduce((sum, p) => sum + p.rating, 0) / 11) || opponentClub.rating;

  // Substitutions during play
  const triggerInGameSubstitution = (subPlayer: Player) => {
    if (!selectedInGamePlayer) return;
    
    // Swap roles on current match roster
    const updated = activeUserSquad.map(p => {
      if (p.id === selectedInGamePlayer.id) {
        return { ...p, squadStatus: 'Sub' as const };
      }
      if (p.id === subPlayer.id) {
        return { ...p, squadStatus: 'Starting' as const };
      }
      return p;
    });

    setActiveUserSquad(updated);
    
    // Log swap commentary event
    const event: MatchEvent = {
      minute: testMinute,
      type: 'COMMENTARY',
      side: 'home',
      text: `🔄 SUB: ${subPlayer.name} replaces ${selectedInGamePlayer.name} on the pitch.`
    };
    setCommentaryLog(prev => [event, ...prev]);
    setSelectedInGamePlayer(null);
  };

  // Kickoff live sim initialization
  const startMatchSim = () => {
    setMatchPhase('LIVE');
    setTestMinute(0);
    setUserScore(0);
    setOppScore(0);

    const initialEvent: MatchEvent = {
      minute: 0,
      type: 'KICKOFF',
      side: 'system',
      text: `⚽ Referee blows the whistle! Kickoff under beautiful stadium lights between ${userClub.name} (${userTeamOVR} OVR) and ${opponentClub.name} (${oppTeamOVR} OVR).`
    };
    setCommentaryLog([initialEvent]);
  };

  const handleInstantSim = () => {
    setSimSpeed('INSTANT');
    if (matchPhase === 'PRE') {
      startMatchSim();
    }
  };

  // Live match simulator ticks
  useEffect(() => {
    if (matchPhase !== 'LIVE') return;

    if (testMinute >= 90) {
      clearInterval(simTimerRef.current!);
      setMatchPhase('POST');
      return;
    }

    // Tick delay based on selected speed
    const tickDelay = simSpeed === 'NORMAL' ? 1200 : simSpeed === 'FAST' ? 450 : 1;

    simTimerRef.current = setTimeout(() => {
      setTestMinute(prevMin => {
        const nextMin = prevMin + Math.floor(Math.random() * 4) + 1;
        const boundedMin = Math.min(90, nextMin);

        // Core match algorithm: Deciding possession balances & chances
        runCoreSimulationTick(boundedMin);

        return boundedMin;
      });
    }, tickDelay);

    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [matchPhase, testMinute, simSpeed, liveTacticsMentality]);

  // Core calculations during turns
  const runCoreSimulationTick = (minute: number) => {
    // Mentality influence modifier
    let userAttackModifier = 1.0;
    let oppAttackModifier = 1.0;

    if (liveTacticsMentality === 'All-Out Attack') userAttackModifier = 1.6;
    else if (liveTacticsMentality === 'Attacking') userAttackModifier = 1.35;
    else if (liveTacticsMentality === 'Defensive') { userAttackModifier = 0.75; oppAttackModifier = 0.8; }
    else if (liveTacticsMentality === 'Park the Bus') { userAttackModifier = 0.4; oppAttackModifier = 0.55; }

    // Standard overall ratios comparison
    const ratingDiff = userTeamOVR - oppTeamOVR;
    const baseHomeFactor = 1.1; // home field advantage
    const userChanceWeight = (50 + ratingDiff * 1.5) * baseHomeFactor * userAttackModifier;
    const oppChanceWeight = (50 - ratingDiff * 1.5) * oppAttackModifier;

    const totalWeight = userChanceWeight + oppChanceWeight;
    const userProbability = userChanceWeight / totalWeight;

    // Decay player fitness slightly over time
    setActiveUserSquad(prev => prev.map(p => {
      if (p.squadStatus === 'Starting') {
        const decay = Math.random() * 0.4 + 0.1;
        return { ...p, fitness: Math.max(30, Math.round((p.fitness - decay) * 10) / 10) };
      }
      return p;
    }));

    // Trigger action checks on each turn (roughly 15% random chance)
    const actionTriggerChance = 0.16;
    if (Math.random() < actionTriggerChance) {
      const isUserAttack = Math.random() < userProbability;
      
      // Update possession statistics dynamically
      const dynamicPossession = Math.round(userProbability * 100 + (Math.random() * 8 - 4));
      setUserStats(prev => ({ ...prev, possession: Math.min(75, Math.max(25, dynamicPossession)) }));
      setOppStats(prev => ({ ...prev, possession: Math.min(75, Math.max(25, 100 - dynamicPossession)) }));

      if (isUserAttack) {
        generateUserOffensiveOpportunity(minute);
      } else {
        generateOpponentOffensiveOpportunity(minute);
      }
    }

    // Minor random events (fouls/commentaries)
    const commentaryChance = 0.08;
    if (Math.random() < commentaryChance && minute < 90) {
      // Award random fouls
      const isUserFoul = Math.random() > 0.5;
      const offender = isUserFoul 
        ? startingXI[Math.floor(Math.random() * startingXI.length)]
        : oppStartingXI[Math.floor(Math.random() * oppStartingXI.length)];

      if (offender) {
        const isYellow = Math.random() < 0.25;
        if (isUserFoul) {
          setUserStats(prev => ({ 
            ...prev, 
            fouls: prev.fouls + 1,
            yellows: isYellow ? prev.yellows + 1 : prev.yellows
          }));
        } else {
          setOppStats(prev => ({ 
            ...prev, 
            fouls: prev.fouls + 1,
            yellows: isYellow ? prev.yellows + 1 : prev.yellows
          }));
        }

        const commentaryText = isYellow 
          ? `🟨 YELLOW CARD! ${offender.name} receives a booking from the referee after a reckless tackle.`
          : `🛑 Foul by ${offender.name}. The referee halts play and issues a firm warning.`;

        const foulEvent: MatchEvent = {
          minute,
          type: isYellow ? 'YELLOW' : 'FOUL',
          side: isUserFoul ? 'home' : 'away',
          text: commentaryText,
          player1Name: offender.name
        };

        setCommentaryLog(prev => [foulEvent, ...prev]);
      }
    }
  };

  // USER offensive scoring event simulation
  const generateUserOffensiveOpportunity = (minute: number) => {
    setUserStats(prev => ({ ...prev, shots: prev.shots + 1 }));

    // Pick active attacker/midfielder
    const offensivePlayers = startingXI.filter(p => p.position === 'ATT' || p.position === 'MID');
    const keyPlayer = offensivePlayers[Math.floor(Math.random() * offensivePlayers.length)] || startingXI[0];

    // Assist player find
    const helpers = startingXI.filter(p => p.id !== keyPlayer.id);
    const assistPlayer = helpers[Math.floor(Math.random() * helpers.length)];

    // Shot accuracy depends on rating & team mentality
    const targetThreshold = 0.45 + (keyPlayer.rating - oppTeamOVR) * 0.015;
    const isShotOnTarget = Math.random() < targetThreshold;

    if (isShotOnTarget) {
      setUserStats(prev => ({ ...prev, shotsOnTarget: prev.shotsOnTarget + 1 }));

      // Opponent goalkeeper defense check
      const oppGK = opponentSquad.find(p => p.position === 'GK') || { rating: 75 };
      const goalProbability = 0.35 + (keyPlayer.rating - oppGK.rating) * 0.02;

      const isGoal = Math.random() < goalProbability;

      if (isGoal) {
        setUserScore(prev => prev + 1);
        
        // Log individual goal scorer metrics
        const updatedUserSquad = activeUserSquad.map(p => {
          if (p.id === keyPlayer.id) return { ...p, goals: p.goals + 1 };
          if (assistPlayer && p.id === assistPlayer.id) return { ...p, assists: p.assists + 1 };
          return p;
        });
        setActiveUserSquad(updatedUserSquad);

        const goalTexts = [
          `⚽ GOAL!!! ${keyPlayer.name} unleashes an absolute screamer into the top corner! Stunning play set up by ${assistPlayer?.name || 'midfield buildup'}.`,
          `⚽ GOAL!!! ${keyPlayer.name} breaks past the defender and coolly slots it past the keeper! Assist to ${assistPlayer?.name || 'fine teamwork'}.`,
          `⚽ GOAL!!! ${keyPlayer.name} rises highest inside the penalty box and heads it into the net! Beautiful cross from ${assistPlayer?.name || 'the wing'}.`
        ];

        setCommentaryLog(prev => [{
          minute,
          type: 'GOAL',
          side: 'home',
          text: goalTexts[Math.floor(Math.random() * goalTexts.length)],
          player1Name: keyPlayer.name,
          player2Name: assistPlayer?.name
        }, ...prev]);
      } else {
        // SAVED
        setCommentaryLog(prev => [{
          minute,
          type: 'SAVE',
          side: 'away',
          text: `🧤 GREAT SAVE! ${keyPlayer.name} shoots low, but the opposition goalkeeper makes an athletic diving stop.`,
          player1Name: keyPlayer.name
        }, ...prev]);
      }
    } else {
      // MISSED
      setCommentaryLog(prev => [{
        minute,
        type: 'MISS',
        side: 'home',
        text: `❌ CHANCE MISSED! ${keyPlayer.name} finds space on the edge of the area but fires his shot wide of the post.`,
        player1Name: keyPlayer.name
      }, ...prev]);
    }
  };

  // OPPONENT offensive scoring event simulation
  const generateOpponentOffensiveOpportunity = (minute: number) => {
    setOppStats(prev => ({ ...prev, shots: prev.shots + 1 }));

    const oppAttackers = oppStartingXI.filter(p => p.position === 'ATT' || p.position === 'MID');
    const oppPlayer = oppAttackers[Math.floor(Math.random() * oppAttackers.length)] || oppStartingXI[0];

    const targetThreshold = 0.45 + (opponentClub.rating - userTeamOVR) * 0.015;
    const isShotOnTarget = Math.random() < targetThreshold;

    if (isShotOnTarget) {
      setOppStats(prev => ({ ...prev, shotsOnTarget: prev.shotsOnTarget + 1 }));

      const userGK = startingXI.find(p => p.position === 'GK') || { rating: 70, id: '' };
      const goalProbability = 0.35 + (opponentClub.rating - userGK.rating) * 0.02;

      const isGoal = Math.random() < goalProbability;

      if (isGoal) {
        setOppScore(prev => prev + 1);

        setCommentaryLog(prev => [{
          minute,
          type: 'GOAL',
          side: 'away',
          text: `⚡ GOAL for ${opponentClub.name}! ${oppPlayer.name} escapes attention in the box and slams it home!`,
          player1Name: oppPlayer.name
        }, ...prev]);
      } else {
        // SAVED by our GK
        const updatedGKLog = activeUserSquad.map(p => {
          if (p.id === userGK.id && p.position === 'GK') return { ...p, cleanSheets: p.cleanSheets + 1 }; // track saves or clean-sheet potential
          return p;
        });
        // We'll calculate actual clean-sheet on matchday complete but let user GK look active
        setCommentaryLog(prev => [{
          minute,
          type: 'SAVE',
          side: 'home',
          text: `🧤 FINE GOALKEEPING! ${userGK.name || 'Our keeper'} stands tall and beats away a powerful strike from ${oppPlayer.name}.`,
          player1Name: userGK.name
        }, ...prev]);
      }
    } else {
      setCommentaryLog(prev => [{
        minute,
        type: 'MISS',
        side: 'away',
        text: `💨 CLOSE! ${oppPlayer.name} attempts a curler from distance, but it sails just over the crossbar.`,
        player1Name: oppPlayer.name
      }, ...prev]);
    }
  };

  // Submit and archive completed match results
  const finalizeMatch = () => {
    let pointsGained = 0;
    if (userScore > oppScore) pointsGained = 3;
    else if (userScore === oppScore) pointsGained = 1;

    // Apply player ratings experience points/moral boosts
    const finalizedRosters = activeUserSquad.map(p => {
      if (p.squadStatus === 'Starting') {
        const ratingGrowChance = Math.random() < 0.22; // 22% rate-growth chance per played game for starters
        const nextRating = ratingGrowChance && p.rating < p.potential ? p.rating + 1 : p.rating;
        const rewardMorale = userScore > oppScore ? Math.min(100, p.morale + 10) : userScore === oppScore ? p.morale : Math.max(30, p.morale - 8);
        return {
          ...p,
          rating: nextRating,
          morale: rewardMorale,
          matchesPlayed: p.matchesPlayed + 1,
          cleanSheets: (p.position === 'GK' || p.position === 'DEF') && oppScore === 0 ? p.cleanSheets + 1 : p.cleanSheets
        };
      } else {
        // Bench players/resting recover fitness!
        return {
          ...p,
          fitness: Math.min(100, p.fitness + 15),
          morale: Math.min(100, p.morale + 2)
        };
      }
    });

    onMatchComplete({
      userScore,
      opponentScore: oppScore,
      pointsGained,
      revenueGained: ticketPayout,
      squadPlayersUpdates: finalizedRosters
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-zinc-105">
      
      {/* HEADER BANNER - COMPARISONS */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* User Club */}
        <div className="flex items-center gap-4 text-center md:text-left w-full md:w-1/3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg border border-white/10 ${userClub.logoBg}`}>
            {userClub.shortName}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">{userClub.name}</h3>
            <span className="text-xs text-zinc-400 font-medium">Home • Squad: {userTeamOVR} OVR</span>
          </div>
        </div>

        {/* Dynamic score board */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3">
          <div className="bg-zinc-850 py-1 px-3.5 rounded-full border border-zinc-750 text-[10px] font-bold text-emerald-450 uppercase tracking-widest">
            {matchPhase === 'PRE' ? 'PRE-MATCH' : matchPhase === 'LIVE' ? `LIVE • ${testMinute}'` : 'FULL-TIME'}
          </div>
          
          <div className="flex items-center gap-6 mt-2.5">
            <span className="text-4xl font-black text-white pr-2">{userScore}</span>
            <span className="text-zinc-650 text-xl font-bold">:</span>
            <span className="text-4xl font-black text-white pl-2">{oppScore}</span>
          </div>

          {matchPhase === 'LIVE' && (
            /* Speed Controller */
            <div className="flex gap-2.5 mt-4 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {(['NORMAL', 'FAST', 'INSTANT'] as const).map(sp => (
                <button
                  key={sp}
                  id={`btn-speed-${sp}`}
                  onClick={() => setSimSpeed(sp)}
                  className={`text-[9px] font-black px-2 py-1 rounded transition uppercase tracking-wide ${
                    simSpeed === sp 
                      ? 'bg-emerald-505 text-zinc-950 font-black shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rival Club */}
        <div className="flex items-center gap-4 text-center md:text-right flex-row-reverse md:flex-row justify-end w-full md:w-1/3">
          <div className="text-center md:text-right">
            <h3 className="font-extrabold text-base text-white">{opponentClub.name}</h3>
            <span className="text-xs text-zinc-400 font-medium">Away • Squad: {oppTeamOVR} OVR</span>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg border border-white/10 ${opponentClub.logoBg}`}>
            {opponentClub.shortName}
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE INTERACTIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
        
        {/* PRE-MATCH CONTROLS AND LINEUPS */}
        {matchPhase === 'PRE' && (
          <div className="lg:col-span-12 flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Strategy Info Box */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-zinc-400">
              <div>
                <strong className="text-white block mb-1">Pre-Match Tactics:</strong>
                Formation: {tactics.formation} <br />
                Style: {tactics.style} <br />
                Primary Captain: {startingXI.find(p => p.id === tactics.captainId)?.name || 'Default'}
              </div>
              <div className="border-l border-zinc-800 md:pl-5">
                <strong className="text-white block mb-1">Match Ticket Forecasts:</strong>
                Expansion factor: x{ticketRevenueMultiplier.toFixed(1)} <br />
                Projected Match Proceeds: <strong className="text-emerald-400">£{ticketPayout.toFixed(2)}M</strong>
              </div>
              <div className="border-l border-zinc-800 md:pl-5 flex flex-col justify-center">
                <button
                  id="btn-kickoff"
                  onClick={startMatchSim}
                  className="w-full bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-zinc-950" /> Kick Off Match
                </button>
                <button
                  id="btn-instant-sim"
                  onClick={handleInstantSim}
                  className="w-full mt-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-extrabold py-2 rounded-lg text-xs transition border border-zinc-700 flex items-center justify-center gap-1.5"
                >
                  <FastForward className="w-3.5 h-3.5" /> Instant Sim
                </button>
              </div>
            </div>

            {/* Lineup comparison grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-855 border border-zinc-800 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Your Starting Lineup ({startingXI.length})</h4>
                <div className="space-y-1 text-xs">
                  {startingXI.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-zinc-800 last:border-0 text-zinc-300">
                      <span>{i + 1}. <strong className="text-white">{p.name}</strong> ({p.position})</span>
                      <strong className="text-emerald-405">{p.rating} OVR</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-855 border border-zinc-800 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Opponent Squad Preview</h4>
                <div className="space-y-1 text-xs">
                  {oppStartingXI.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-zinc-850 last:border-0 text-zinc-400">
                      <span>{i + 1}. {p.name} ({p.position})</span>
                      <strong>{p.rating} OVR</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE COMMENTARY AND STATS */}
        {matchPhase === 'LIVE' && (
          <>
            {/* Live Tactics & Subs Dashboard - Left 4 cols */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
              
              {/* Dynamic live sliders */}
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-450 animate-pulse" /> Live In-Match Tactics
                </h4>
                <label className="text-[10px] uppercase font-bold text-zinc-450">Change Team Mentality</label>
                <div className="grid grid-cols-5 gap-1 mt-1.5">
                  {(['Defensive', 'Cautious', 'Balanced', 'Attacking', 'All-Out Attack'] as const).map(ment => (
                    <button
                      key={ment}
                      id={`btn-live-ment-${ment}`}
                      onClick={() => setLiveTacticsMentality(ment)}
                      className={`text-[9px] uppercase font-bold tracking-tight py-1 rounded transition ${
                        liveTacticsMentality === ment 
                          ? 'bg-amber-450 text-zinc-950 font-black' 
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {ment.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Match Subs list */}
              <div className="mt-3 flex flex-col gap-2.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-455" /> Manager Substitutions
                </h4>
                <p className="text-[10px] text-zinc-450 leading-relaxed">Swap tired players to inject physical energy. (Select on-pitch player first, then choose backup).</p>
                
                {/* Selected target player for sub */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs">
                  <div className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Active Pitch Selection:</div>
                  {selectedInGamePlayer ? (
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        <strong className="text-white">{selectedInGamePlayer.name}</strong> 
                        <span className="text-zinc-450 hover:text-white ml-1 font-semibold uppercase font-mono text-[9px]">({selectedInGamePlayer.position})</span>
                      </div>
                      <span className="text-emerald-400 font-bold">Fit: {selectedInGamePlayer.fitness}%</span>
                    </div>
                  ) : (
                    <div className="text-zinc-500 italic mt-1">Click a fatigued starter below...</div>
                  )}
                </div>

                {/* Sub pool starters */}
                <div className="space-y-3.5 mt-1.5 max-h-[300px] overflow-y-auto pr-1">
                  <div>
                    <h5 className="text-[10px] font-bold text-zinc-450 mb-1.5">ACTIVE PITCH STARTERS</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {startingXI.map(p => {
                        const isChosen = selectedInGamePlayer?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            id={`live-player-${p.id}`}
                            onClick={() => setSelectedInGamePlayer(p)}
                            className={`flex justify-between items-center text-xs p-2 rounded cursor-pointer transition ${
                              isChosen 
                                ? 'bg-indigo-950 border border-indigo-400' 
                                : 'bg-zinc-900 hover:bg-zinc-850 hover:text-white'
                            }`}
                          >
                            <span>{p.name} ({p.position})</span>
                            <span className={`font-mono text-[10px] font-bold ${p.fitness < 65 ? 'text-red-405' : 'text-zinc-400'}`}>
                              {p.fitness}% OVR {p.rating}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedInGamePlayer && (
                    <div>
                      <h5 className="text-[10px] font-bold text-amber-500 mb-1.5 uppercase">CHOOSE GAME REPLACEMENT BENCH</h5>
                      <div className="grid grid-cols-1 gap-1">
                        {activeSubs.map(p => (
                          <button
                            key={p.id}
                            id={`live-sub-btn-${p.id}`}
                            onClick={() => triggerInGameSubstitution(p)}
                            className="text-left w-full text-xs p-2 rounded bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 hover:border hover:border-emerald-500/30 transition flex justify-between"
                          >
                            <span>{p.name} ({p.position})</span>
                            <strong className="text-emerald-400">Fit: {p.fitness}% OVR {p.rating}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Commentary and Stats Board - Right 7 cols */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Dynamic stats widget */}
              <div className="bg-zinc-855 border border-zinc-800 p-4 rounded-xl grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-extrabold text-[#7e8494] uppercase text-[10px] tracking-wide mb-1">Shots (Target)</div>
                  <strong className="text-white text-base font-bold">{userStats.shots} ({userStats.shotsOnTarget})</strong>
                </div>
                <div className="border-x border-zinc-800 px-2">
                  <div className="font-extrabold text-[#7e8494] uppercase text-[10px] tracking-wide mb-1">Ball Possession</div>
                  <strong className="text-white text-base font-bold">{userStats.possession}% : {oppStats.possession}%</strong>
                </div>
                <div>
                  <div className="font-extrabold text-[#7e8494] uppercase text-[10px] tracking-wide mb-1">Fouls (Cards)</div>
                  <strong className="text-white text-base font-bold">{userStats.fouls} ({userStats.yellows}🟨)</strong>
                </div>
              </div>

              {/* Terminal live action reports */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col gap-2 h-[340px] overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 text-red-500 animate-pulse" /> LIVE RADIO COMMENTARY BROADCAST
                </span>
                
                <div id="live-commentary-feed" className="flex-1 overflow-y-auto pr-1 space-y-3 mt-2 font-mono scroll-smooth">
                  {commentaryLog.map((evt, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs p-2.5 roundedLeading-relaxed animate-in slide-in-from-top-1 ${
                        evt.type === 'GOAL' ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' :
                        evt.type === 'YELLOW' ? 'bg-yellow-950/30 border border-yellow-600/30 text-yellow-300' :
                        'bg-zinc-900/50 border border-zinc-850 text-zinc-305'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {evt.minute}'
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500">
                          {evt.type}
                        </span>
                      </div>
                      <p className="leading-normal">{evt.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* POST-MATCH HIGHLIGHTS REPORT */}
        {matchPhase === 'POST' && (
          <div className="lg:col-span-12 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            <div className="bg-zinc-950 border border-zinc-805 p-6 rounded-2xl text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="font-black text-2xl text-white">MATCHDAY ENDED!</h3>
                <p className="text-zinc-400 text-xs mt-1">Full-Time Whistle Blown. Here is the sports review report.</p>
              </div>

              <div className="flex justify-center items-center gap-8 py-3.5 max-w-md mx-auto bg-zinc-855 rounded-xl border border-zinc-800">
                <div className="text-center">
                  <p className="text-xs text-zinc-405">Goal Score</p>
                  <p className="text-4xl font-extrabold text-white mt-0.5">{userScore} - {oppScore}</p>
                  <span className={`text-[10px] font-bold uppercase ${userScore > oppScore ? 'text-emerald-405' : userScore === oppScore ? 'text-zinc-405' : 'text-red-405'}`}>
                    {userScore > oppScore ? 'Victory! (+3 Pts)' : userScore === oppScore ? 'Draw (+1 Pt)' : 'Defeat (0 Pts)'}
                  </span>
                </div>

                <div className="h-10 w-[1px] bg-zinc-800" />

                <div className="text-left py-1 text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Ticket className="w-4 h-4" /> Ticket Sales Proceeds: +£{ticketPayout.toFixed(2)}M
                  </div>
                  <div className="text-[10px] text-zinc-450 leading-tight">
                    Stadium seats filled multiplying standard prestige pricing models.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-return-hq"
                  onClick={finalizeMatch}
                  className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wide transition shadow"
                >
                  Return to Headquarters / Finalize Turn
                </button>
              </div>
            </div>

            {/* Individual player ratings of the match */}
            <div className="bg-zinc-855 border border-zinc-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Your Player Ratings / Squad Updates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {startingXI.map(p => {
                  const playerOvrChange = p.rating < p.potential && Math.random() < 0.25; // display visual indicator
                  return (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block">{p.name}</strong>
                        <span className="text-zinc-450 font-mono text-[10px] uppercase">
                          Goals: {p.goals} • Assists: {p.assists}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-405 block font-bold">{p.rating} OVR</span>
                        <span className="text-zinc-[450] text-[10px]">Fit: {Math.round(p.fitness)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
