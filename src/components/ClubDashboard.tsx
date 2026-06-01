/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Club, Player, GameState, CalendarWeek } from '../types';
import { 
  Trophy, Calendar, Mail, FileText, ArrowUpRight, TrendingUp, Users, ArrowRight, ShieldCheck, Landmark, Flame, BellRing 
} from 'lucide-react';

interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  content: string;
  category: 'BOARD' | 'SCOUT' | 'YOUTH' | 'SYSTEM';
  date: string;
}

interface ClubDashboardProps {
  gameState: GameState;
  onNextWeek: () => void;
  inboxMessages: InboxMessage[];
  onSetViewTab: (tab: 'dashboard' | 'tactics' | 'transfers' | 'infrastructure' | 'match') => void;
}

export default function ClubDashboard({
  gameState,
  onNextWeek,
  inboxMessages,
  onSetViewTab,
}: ClubDashboardProps) {
  const { clubs, leagueTable, calendar, currentWeekIndex, userClubId, playersByClub } = gameState;
  const userClub = clubs.find(c => c.id === userClubId)!;
  const userPlayers = playersByClub[userClubId] || [];
  const currentWeekObj = calendar[currentWeekIndex];

  const [activeTab, setActiveTab] = useState<'hq' | 'squad'>('hq');

  // Find next opponent
  const nextOpponent = currentWeekObj.opponentId 
    ? clubs.find(c => c.id === currentWeekObj.opponentId) 
    : null;

  // Render position labels nicely
  const getBadgeColor = (pos: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    switch (pos) {
      case 'GK': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DEF': return 'bg-blue-500/10 text-blue-405 border border-blue-500/20';
      case 'MID': return 'bg-emerald-500/10 text-emerald-405 border border-emerald-500/20';
      case 'ATT': return 'bg-red-500/10 text-red-405 border border-red-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top statistics overview bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-450 uppercase tracking-widest font-mono">League Club</span>
          <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5 justify-between">
            {userClub.name}
            <span className={`w-3 h-3 rounded-full ${userClub.logoBg}`} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-450 uppercase tracking-widest font-mono">Transfer Funds</span>
          <div className="text-base font-black text-white mt-1">£{userClub.budget.toFixed(1)}M</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-450 uppercase tracking-widest font-mono">Weekly Wage Bill</span>
          <div className="text-base font-bold text-zinc-150 mt-1">
            £{userPlayers.reduce((sum, p) => sum + p.wage, 0).toLocaleString()}k / wk
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-455 uppercase tracking-widest font-mono">Current Timeline</span>
          <div className="text-base font-extrabold text-white mt-1 flex justify-between items-center">
            Week {currentWeekObj.weekNumber} / {calendar.length}
            {currentWeekObj.isWinterWindowOpen && (
              <span className="text-[9px] bg-sky-505 text-zinc-950 font-black px-1.5 rounded animate-bounce">
                Winter Window
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex justify-between items-center bg-zinc-950 border border-zinc-850 p-1 rounded-xl">
        <div className="flex gap-2">
          <button
            id="tab-view-hq"
            onClick={() => setActiveTab('hq')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
              activeTab === 'hq'
                ? 'bg-zinc-850 text-white shadow'
                : 'text-zinc-455 hover:text-white'
            }`}
          >
            Manager Office
          </button>
          
          <button
            id="tab-view-squad"
            onClick={() => setActiveTab('squad')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
              activeTab === 'squad'
                ? 'bg-zinc-850 text-white shadow'
                : 'text-zinc-455 hover:text-white'
            }`}
          >
            Squad Members ({userPlayers.length})
          </button>
        </div>

        {/* Next Matchday Fast Control */}
        {nextOpponent ? (
          <button
            id="btn-play-matchday"
            onClick={() => onSetViewTab('match')}
            className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black text-xs px-4 py-2 rounded-lg transition tracking-wide uppercase flex items-center gap-1.5 shadow"
          >
            Play Matchday <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-next-week-skip"
            onClick={onNextWeek}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition uppercase tracking-wide flex items-center gap-1"
          >
            Next Week
          </button>
        )}
      </div>

      {activeTab === 'hq' ? (
        /* HQ EXECUTIVE WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Standing Table - Left side (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* INBOX EMAILS BOARD */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-450" /> CEO & Scout Communications Inbox
              </h3>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {inboxMessages.map(msg => (
                  <div key={msg.id} className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1.5 transition hover:border-zinc-700 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                        msg.category === 'BOARD' ? 'bg-red-500/10 text-red-405' :
                        msg.category === 'SCOUT' ? 'bg-sky-500/10 text-sky-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {msg.category}
                      </span>
                      <span className="text-[10px] text-zinc-500">{msg.date}</span>
                    </div>
                    <div className="font-extrabold text-sm text-white mt-1">{msg.subject}</div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAGUE TABLE STANDINGS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-405" /> Championship Table Standings
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-855 text-[10px] uppercase tracking-wider text-zinc-450 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-3 font-semibold">Pos</th>
                      <th className="py-3 px-3 font-semibold">Team Name</th>
                      <th className="py-3 px-3 font-semibold text-center">Pld</th>
                      <th className="py-3 px-3 font-semibold text-center">W</th>
                      <th className="py-3 px-3 font-semibold text-center">D</th>
                      <th className="py-3 px-3 font-semibold text-center">L</th>
                      <th className="py-3 px-3 font-semibold text-center">GD</th>
                      <th className="py-3 px-3 font-semibold text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueTable.map((cl, idx) => {
                      const isUser = cl.id === userClubId;
                      return (
                        <tr 
                          key={cl.id} 
                          className={`border-b border-zinc-850 last:border-0 hover:bg-zinc-850/50 transition ${
                            isUser ? 'bg-emerald-950/20 font-extrabold border-l-4 border-l-emerald-500' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3 flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${cl.logoBg}`} />
                            <span className={isUser ? "text-white" : "text-zinc-200"}>{cl.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">{cl.played}</td>
                          <td className="py-3 px-3 text-center font-mono">{cl.won}</td>
                          <td className="py-3 px-3 text-center font-mono">{cl.drawn}</td>
                          <td className="py-3 px-3 text-center font-mono">{cl.lost}</td>
                          <td className={`py-3 px-3 text-center font-mono ${cl.goalsFor - cl.goalsAgainst >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {cl.goalsFor - cl.goalsAgainst}
                          </td>
                          <td className={`py-3 px-3 text-center font-black ${isUser ? 'text-emerald-400' : 'text-white'}`}>{cl.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Opponent Card & Fixture List - Right side (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* NEXT MATCH CARD */}
            {nextOpponent ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
                
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 font-bold block">Next Up Matchday</span>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-col items-center gap-1.5 w-[42%] text-center">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow ${userClub.logoBg}`}>
                        {userClub.shortName}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-full">{userClub.shortName}</span>
                    </div>

                    <div className="text-xs bg-zinc-850 py-1.5 px-3 rounded-xl border border-zinc-750 font-bold font-mono">VS</div>

                    <div className="flex flex-col items-center gap-1.5 w-[42%] text-center">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow ${nextOpponent.logoBg}`}>
                        {nextOpponent.shortName}
                      </div>
                      <span className="text-xs font-bold text-zinc-300 truncate max-w-full">{nextOpponent.name}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 mt-2 text-[11px] text-zinc-400 leading-normal space-y-1">
                  <div>🏆 Opponent OVR Rating: <strong className="text-white">{Math.round(nextOpponent.rating)}</strong></div>
                  <div>🏟 Capacity: {userClub.stadiumCapacity.toLocaleString()} (Guaranteed Matchday Proceeds)</div>
                </div>

                <button
                  id="btn-play-matchday-2"
                  onClick={() => onSetViewTab('match')}
                  className="w-full bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wide transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Flame className="w-4 h-4 text-zinc-950 fill-zinc-950 animate-bounce" /> Proceed to Match simulation
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between gap-3 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-450 mx-auto animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">Season matches finished!</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    No remaining fixtures scheduled for this campaign. Turn over the week below to secure financial standings results and final tables.
                  </p>
                </div>
                {currentWeekIndex < calendar.length - 1 && (
                  <button
                    id="btn-next-week-only"
                    onClick={onNextWeek}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-xs font-black transition tracking-wider uppercase text-white"
                  >
                    Progress Week ({currentWeekIndex + 1} / {calendar.length})
                  </button>
                )}
              </div>
            )}

            {/* FULL FIXTURE LIST */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-440" /> League Calendar Fixtures
              </h4>
              <div className="flex flex-col gap-1.5 max-h-[290px] overflow-y-auto pr-1 text-xs">
                {calendar.map((wk, i) => {
                  const isCurrent = wk.weekNumber === currentWeekObj.weekNumber;
                  const isFinished = wk.weekNumber < currentWeekObj.weekNumber;
                  const opp = wk.opponentId ? clubs.find(c => c.id === wk.opponentId) : null;

                  return (
                    <div 
                      key={wk.weekNumber} 
                      className={`flex justify-between items-center p-2 rounded-lg transition ${
                        isCurrent 
                          ? 'bg-emerald-950/40 border border-emerald-500/50 animate-pulse text-emerald-400 font-extrabold' 
                          : isFinished 
                            ? 'bg-zinc-950/30 text-zinc-550' 
                            : 'bg-zinc-855 text-zinc-350'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Week {wk.weekNumber}</span>
                        {opp ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${opp.logoBg}`} />
                            <span className={isCurrent ? 'text-white' : ''}>{opp.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 block italic mt-0.5">Scouting / Mid-season Break</span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 block">{wk.date}</span>
                        {isFinished ? (
                          <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1 rounded">Completed</span>
                        ) : isCurrent ? (
                          <span className="text-[9px] bg-emerald-500 text-zinc-950 font-black px-1 rounded animate-pulse">ACTIVE</span>
                        ) : wk.isWinterWindowOpen ? (
                          <span className="text-[9px] text-sky-400 font-bold uppercase">Window Open</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* SQUAD MEMBERS DIRECT DETAIL PANEL */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Senior Roster & Season Stats</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-855 text-[10px] uppercase tracking-wider text-zinc-450 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Player Name</th>
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-3 text-center">Age</th>
                  <th className="py-2.5 px-3 text-center">OVR</th>
                  <th className="py-2.5 px-3 text-center">POT</th>
                  <th className="py-2.5 px-3 text-center">Market Val</th>
                  <th className="py-2.5 px-3 text-center">Salary</th>
                  <th className="py-2.5 px-3 text-center">Fit / Morale</th>
                  <th className="py-2.5 px-3 text-center">Apps</th>
                  <th className="py-2.5 px-3 text-center">G (A)</th>
                  <th className="py-2.5 px-3 text-center">Lineup Status</th>
                </tr>
              </thead>
              <tbody>
                {userPlayers.map(p => (
                  <tr key={p.id} id={`roster-row-${p.id}`} className="border-b border-zinc-850 hover:bg-zinc-850/40 last:border-0 transition">
                    <td className="py-2.5 px-3 font-bold text-white">{p.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] font-black uppercase px-1 py-0.5 rounded ${getBadgeColor(p.position)}`}>
                        {p.position}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{p.age}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">{p.rating}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-zinc-450">{p.potential}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-200">£{p.value.toFixed(1)}M</td>
                    <td className="py-2.5 px-3 text-center font-mono text-zinc-450">£{p.wage}k</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={p.fitness < 70 ? 'text-red-400 font-bold' : 'text-zinc-350'}>{Math.round(p.fitness)}%</span>
                      {' '}/{' '}
                      <span className={p.morale > 85 ? 'text-emerald-400' : 'text-zinc-455'}>{p.morale}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{p.matchesPlayed}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {p.goals > 0 ? <strong className="text-white font-bold">{p.goals}</strong> : '0'} 
                      {' '}({p.assists})
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        p.squadStatus === 'Starting' ? 'bg-emerald-500/20 text-emerald-300' :
                        p.squadStatus === 'Sub' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {p.squadStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
