/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Club, Player, Scout, GameState, TransferRecord } from '../types';
import { 
  Search, Users, Landmark, DollarSign, Award, Target, Briefcase, ChevronRight, Check, X, Club as ClubIcon, Clock, ArrowRight, TrendingUp 
} from 'lucide-react';
import { createPlayer } from '../data/initialData';

interface TransfersScreenProps {
  gameState: GameState;
  onUpdateBudget: (amount: number) => void;
  onAddPlayerToUserClub: (player: Player, fee: number) => void;
  onHireScout: (scoutId: string) => void;
  onStartScoutSearch: (scoutId: string, position: 'GK' | 'DEF' | 'MID' | 'ATT') => void;
  onAcceptIncomingBid: (bidId: string, playerId: string, fee: number) => void;
  onRejectIncomingBid: (bidId: string) => void;
  incomingBids: Array<{ id: string; player: Player; offerFee: number; fromClub: Club }>;
}

export default function TransfersScreen({
  gameState,
  onUpdateBudget,
  onAddPlayerToUserClub,
  onHireScout,
  onStartScoutSearch,
  onAcceptIncomingBid,
  onRejectIncomingBid,
  incomingBids,
}: TransfersScreenProps) {
  const { clubs, playersByClub, scouts, userClubId, calendar, currentWeekIndex, transferHistory } = gameState;
  const userClub = clubs.find(c => c.id === userClubId)!;
  const currentWeek = calendar[currentWeekIndex];

  // Tabs: 'scout' | 'market' | 'free_agents' | 'offers'
  const [activeTab, setActiveTab] = useState<'scout' | 'market' | 'free_agents' | 'offers'>('scout');

  // Search parameters for clubs & player market
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'ATT'>('ALL');

  // Scouting assignment states
  const [scoutPositionChoice, setScoutPositionChoice] = useState<Record<string, 'GK' | 'DEF' | 'MID' | 'ATT'>>({});

  // Bidding & Negotiation Modal/Window States
  const [biddingPlayer, setBiddingPlayer] = useState<Player | null>(null);
  const [biddingPlayerClub, setBiddingPlayerClub] = useState<Club | null>(null); // null if Free Agent
  const [offerFee, setOfferFee] = useState<number>(0);
  const [offerWage, setOfferWage] = useState<number>(0);
  const [negotiationStep, setNegotiationStep] = useState<'BID' | 'WAGE' | 'ACCEPTED' | 'REJECTED' | 'WAGE_REJECTED'>('BID');

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Start a bid process
  const triggerBidWindow = (player: Player, fromClub: Club | null) => {
    setBiddingPlayer(player);
    setBiddingPlayerClub(fromClub);
    // Suggest default fee: value * 1.1 (if free agent, fee is 0)
    setOfferFee(fromClub ? Math.round(player.value * 1.15 * 10) / 10 : 0);
    // Suggest default wage demand
    setOfferWage(player.wage);
    setNegotiationStep(fromClub ? 'BID' : 'WAGE'); // Free agent skip transfer buy bid
  };

  const handleCloseNegotiation = () => {
    setBiddingPlayer(null);
    setBiddingPlayerClub(null);
  };

  // Submit Bid Logic
  const handleCalculateBid = () => {
    if (!biddingPlayer || !biddingPlayerClub) return;

    // AI acceptance logic
    // Minimum accepted is usually 0.9x to 1.3x depending on importance
    const ratio = offerFee / biddingPlayer.value;
    
    // Younger/high potential players cost premium. Reserves can go cheaper.
    let premiumRequired = 1.0;
    if (biddingPlayer.potential - biddingPlayer.rating > 8) premiumRequired += 0.2;
    if (biddingPlayer.age < 23) premiumRequired += 0.15;
    if (biddingPlayer.squadStatus === 'Starting') premiumRequired += 0.15;
    if (biddingPlayer.squadStatus === 'Reserve') premiumRequired -= 0.1;

    const threshold = premiumRequired;

    if (ratio >= threshold) {
      setNegotiationStep('WAGE');
    } else {
      setNegotiationStep('REJECTED');
    }
  };

  // Submit Wage Agreement
  const handleCalculateWage = () => {
    if (!biddingPlayer) return;

    // Player accepts if wage offered meets their expectation
    // If we are Manchester Citizens, prestige is high, maybe easier.
    // If we offer less, small chance of acceptance.
    const weeklyWageRequirement = biddingPlayer.wage;
    const wagePrefRatio = offerWage / weeklyWageRequirement;

    // Require at least 95% of wage demand
    if (wagePrefRatio >= 0.95) {
      // Complete signature!
      const fee = biddingPlayerClub ? offerFee : 0;
      onAddPlayerToUserClub(biddingPlayer, fee);
      setNegotiationStep('ACCEPTED');
    } else {
      setNegotiationStep('WAGE_REJECTED');
    }
  };

  // Scouts hire button
  const handleScoutHireBtn = (scoutId: string) => {
    const s = scouts.find(x => x.id === scoutId)!;
    if (userClub.budget >= s.cost) {
      onHireScout(scoutId);
      // set budget decrease
      onUpdateBudget(-s.cost);
    } else {
      alert("Insufficient budget to hire scout!");
    }
  };

  // Start Scout Search Action
  const handleScoutSearchStart = (scoutId: string) => {
    const pos = scoutPositionChoice[scoutId] || 'GK';
    onStartScoutSearch(scoutId, pos);
  };

  // Generate view lists
  const availableClubsForQuery = clubs.filter(c => c.id !== userClubId);

  // Compute player pool based on selected club
  const activeClubObj = clubs.find(c => c.id === selectedClubId);
  const activeClubPlayers = activeClubObj ? (playersByClub[selectedClubId] || []) : [];

  // Filter player list
  const filteredMarketPlayers = activeClubPlayers.filter(p => {
    if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const freeAgentsList = (playersByClub['free_agents'] || []).filter(p => {
    if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Controls - Left 3 cols */}
      <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 text-zinc-200">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-400" /> Transfer Center
        </h2>

        {/* Current status display */}
        <div className="bg-zinc-850 p-3.5 rounded-xl border border-zinc-750">
          <div className="text-xs text-zinc-400 font-medium">Club Balance</div>
          <div className="text-2xl font-black text-white mt-0.5">
            £{userClub.budget.toFixed(1)}M
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${currentWeek.isWinterWindowOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            Winter Transfer Window: {' '}
            <strong className={currentWeek.isWinterWindowOpen ? "text-emerald-400" : "text-red-400"}>
              {currentWeek.isWinterWindowOpen ? 'OPEN' : 'CLOSED'}
            </strong>
          </div>
        </div>

        {/* Info advice */}
        <div className="text-xs text-zinc-400 space-y-2 mt-2">
          <p>
            The <strong className="text-zinc-200">Winter Window</strong> is open between Week 8 and Week 12. Take this limited-time chance to scouts, add squad reinforcements, or offload surplus players.
          </p>
          <p>
            Free Agents can be signed instantly at any time, requiring no transfer fee, but still taking wage budget out of your funds!
          </p>
        </div>

        {/* Navigation Selector Tabs */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-805">
          <button
            id="tab-scouts"
            onClick={() => setActiveTab('scout')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'scout'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Scouting Network
          </button>

          <button
            id="tab-market"
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'market'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> League Market
          </button>

          <button
            id="tab-free-agents"
            onClick={() => setActiveTab('free_agents')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'free_agents'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Free Agent Pool
          </button>

          <button
            id="tab-bids"
            onClick={() => setActiveTab('offers')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'offers'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Incoming Offers
            </span>
            {incomingBids.length > 0 && (
              <span className="bg-amber-400 text-zinc-950 font-black px-1.5 rounded-full text-[9px] scale-90 animate-bounce">
                {incomingBids.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Column - Right 9 cols */}
      <div className="lg:col-span-9 flex flex-col gap-4">
        
        {/* SUB VIEW 1: SCOUTING */}
        {activeTab === 'scout' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" /> Professional Scouting Network
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Recruit premium scouts, assign searches in Europe, South America, or Africa, and discover exclusive, high-potential future targets!
              </p>

              {/* Scout Roster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {scouts.map(scout => {
                  return (
                    <div key={scout.id} className="bg-zinc-855 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{scout.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                            Region Specialty: {scout.region}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-sm ${i < scout.rating ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                          ))}
                        </div>
                      </div>

                      {scout.isHired ? (
                        /* HIRED OPERATIONS */
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2.5 mt-1">
                          {scout.searchDaysLeft > 0 ? (
                            /* IN SEARCH */
                            <div className="flex flex-col gap-1 text-center py-2">
                              <Clock className="w-5 h-5 text-emerald-450 mx-auto animate-spin" />
                              <span className="text-xs font-semibold text-zinc-200 mt-1">Target Search in Progress</span>
                              <p className="text-[10px] text-zinc-450">Completes search in: <strong className="text-white">{scout.searchDaysLeft} weeks</strong> ("Next Week" button clicks)</p>
                            </div>
                          ) : (
                            /* SEARCH IDLE SELECT ROUTE */
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Assign Target Position</label>
                              <div className="flex gap-2">
                                {(['GK', 'DEF', 'MID', 'ATT'] as const).map(pChoice => (
                                  <button
                                    key={pChoice}
                                    id={`scout-pChoice-${scout.id}-${pChoice}`}
                                    onClick={() => setScoutPositionChoice(prev => ({ ...prev, [scout.id]: pChoice }))}
                                    className={`flex-1 text-[10px] py-1 font-bold rounded border transition ${
                                      (scoutPositionChoice[scout.id] || 'GK') === pChoice
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    {pChoice}
                                  </button>
                                ))}
                              </div>
                              <button
                                id={`btn-start-scouting-${scout.id}`}
                                onClick={() => handleScoutSearchStart(scout.id)}
                                className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black py-2 rounded-lg text-xs transition tracking-wide uppercase"
                              >
                                Dispatch Scout (Takes 1 Week)
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* UNHIRED SIGNING CONTROLS */
                        <div className="mt-auto pt-2 border-t border-zinc-800 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-zinc-450">Agency Fee:</span>{' '}
                            <strong className="text-white">£{scout.cost}M</strong>
                          </div>
                          <button
                            id={`btn-hire-scout-${scout.id}`}
                            onClick={() => handleScoutHireBtn(scout.id)}
                            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-1.5 text-xs text-white font-bold transition"
                          >
                            Hire Agency
                          </button>
                        </div>
                      )}

                      {/* Display found players */}
                      {scout.isHired && scout.foundPlayers.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-800">
                          <h5 className="text-[10px] font-bold uppercase text-amber-500 mb-1.5">Scouted Talent Report</h5>
                          <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
                            {scout.foundPlayers.map(p => (
                              <div key={p.id} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
                                <div>
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-450 px-1 rounded uppercase mr-1">{p.position}</span>
                                  <strong className="text-xs text-zinc-200">{p.name}</strong>
                                  <p className="text-[9px] text-zinc-450 mt-0.5">Rating: <strong className="text-emerald-400">{p.rating}</strong> • Pot: <strong className="text-yellow-400">{p.potential}</strong> • Age: {p.age}</p>
                                </div>
                                <button
                                  id={`btn-sign-scouted-${p.id}`}
                                  disabled={!currentWeek.isWinterWindowOpen}
                                  onClick={() => triggerBidWindow(p, null)} // Scouted exclusive acts like free agent purchase (direct wage negotiation!)
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition uppercase ${
                                    currentWeek.isWinterWindowOpen
                                      ? 'bg-amber-450 hover:bg-amber-400 text-zinc-950'
                                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                  }`}
                                  title={!currentWeek.isWinterWindowOpen ? "Transfer Window must be open to sign players" : ""}
                                >
                                  Hire
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB VIEW 2: LEAGUE TEAM TRANSFER MARKET */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-450" /> Negotiate & Submit Bids
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Browse rosters of rival English clubs, explore potentials, and bid on star signings.</p>
                </div>
                {/* Search Text Input */}
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-48"
                />
              </div>

              {/* Selector Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Rival Club</label>
                  <select
                    id="select-rival-clubs"
                    value={selectedClubId}
                    onChange={(e) => { setSelectedClubId(e.target.value); }}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
                  >
                    <option value="">-- Choose Club --</option>
                    {availableClubsForQuery.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({Math.round(c.rating)} OVR)</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Position Filter</label>
                  <div className="flex gap-1 bg-zinc-800 p-0.5 rounded-lg border border-zinc-750">
                    {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map(posF => (
                      <button
                        key={posF}
                        id={`btn-posFilter-${posF}`}
                        onClick={() => setPositionFilter(posF)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                          positionFilter === posF
                            ? 'bg-emerald-650 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {posF}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player Grid Market Results */}
              {selectedClubId ? (
                <div className="mt-6 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">ROSTER LISTING: {activeClubObj?.name}</h4>
                  
                  {filteredMarketPlayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {filteredMarketPlayers.map(player => {
                        return (
                          <div key={player.id} className="bg-zinc-855 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex gap-2">
                              <span className="text-[9px] h-fit font-bold uppercase py-0.5 px-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {player.position}
                              </span>
                              <div>
                                <h5 className="font-bold text-sm text-white">{player.name}</h5>
                                <p className="text-[10px] text-zinc-400">
                                  Age: {player.age} • Rating: <strong className="text-emerald-400">{player.rating}</strong> • Pot: <strong className="text-yellow-400">{player.potential}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex items-center gap-3">
                              <div>
                                <div className="text-xs font-black text-white">£{player.value.toFixed(1)}M</div>
                                <div className="text-[9px] text-zinc-450">Wage: £{player.wage}k</div>
                              </div>
                              <button
                                id={`btn-bid-player-${player.id}`}
                                disabled={!currentWeek.isWinterWindowOpen}
                                onClick={() => triggerBidWindow(player, activeClubObj!)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition ${
                                  currentWeek.isWinterWindowOpen
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow'
                                    : 'bg-zinc-800 text-zinc-550 cursor-not-allowed'
                                }`}
                              >
                                Submit Bid
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-xs">No matching players on this squad roster match your filters.</div>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center border-2 border-dashed border-zinc-800 rounded-xl py-12 text-zinc-500 text-xs">
                  Select a rival club from the drop-down selector above to scout their squad and make purchase proposals.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB VIEW 3: FREE AGENT POOL */}
        {activeTab === 'free_agents' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <div className="flex justify-between items-center border-b border-zinc-805 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-405" /> Unregistered Free Agents
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Available to sign immediately outside other club demands. No transfer acquisition fees!</p>
                </div>
              </div>

              {/* Roster Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Filter Position</label>
                  <div className="flex gap-1 bg-zinc-850 p-0.5 rounded-lg border border-zinc-750">
                    {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map(posF => (
                      <button
                        key={posF}
                        id={`btn-free-posF-${posF}`}
                        onClick={() => setPositionFilter(posF)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                          positionFilter === posF
                            ? 'bg-emerald-650 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {posF}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Search Text Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Name Search</label>
                  <input
                    type="text"
                    placeholder="Search standard free agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-800 border border-zinc-705 text-xs px-3 py-2 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Free Agents List */}
              <div className="mt-6 flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
                {freeAgentsList.length > 0 ? (
                  freeAgentsList.map(player => (
                    <div key={player.id} className="bg-zinc-855 border border-zinc-800 rounded-xl p-3 flex justify-between items-center shadow-sm">
                      <div className="flex gap-2.5">
                        <span className={`text-[9px] h-fit font-bold uppercase py-0.5 px-1.5 rounded ${
                          player.position === 'GK' ? 'bg-amber-500/20 text-amber-450' :
                          player.position === 'DEF' ? 'bg-blue-500/20 text-blue-400' :
                          player.position === 'MID' ? 'bg-emerald-500/20 text-emerald-450' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {player.position}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-white">{player.name}</h5>
                            <span className="text-[10px] text-zinc-400">({player.nationality})</span>
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            Age: {player.age} • Rating: <strong className="text-emerald-400">{player.rating} OVR</strong> • Potential: <strong className="text-yellow-450">{player.potential}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-xs text-zinc-400">Demand wage:</div>
                          <div className="text-sm font-black text-white">£{player.wage}k / wk</div>
                        </div>
                        <button
                          id={`btn-sign-free-agent-${player.id}`}
                          onClick={() => triggerBidWindow(player, null)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-3.5 py-2 rounded-lg text-xs transition shadow"
                        >
                          Propose Terms
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-550 text-xs">No matching free agents available in this segment. Come back later.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUB VIEW 4: INCOMING BIDS FROM AI ON USER RESERVES */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-450" /> Incoming Transfer Proposals
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Rival AI clubs want to sign your players! Accept to generate transfer budget immediately, or reject.</p>

              {incomingBids.length > 0 ? (
                <div className="flex flex-col gap-3 mt-6">
                  {incomingBids.map(bid => {
                    const profitPercent = Math.round((bid.offerFee / bid.player.value - 1) * 100);
                    return (
                      <div key={bid.id} id={`bid-panel-${bid.id}`} className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${bid.fromClub.logoBg}`}>
                            {bid.fromClub.shortName}
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                              Proposal from <strong className="text-zinc-200">{bid.fromClub.name}</strong>
                            </div>
                            <h4 className="font-bold text-base text-white mt-0.5">{bid.player.name}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {bid.player.position} • Age {bid.player.age} • Rating: <strong className="text-emerald-405">{bid.player.rating}</strong> • Market Value: £{bid.player.value.toFixed(1)}M
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="text-xs text-zinc-450">Bid Offered:</div>
                            <div className="text-lg font-black text-emerald-400">£{bid.offerFee.toFixed(1)}M</div>
                            <span className={`text-[10px] px-1 py-0.5 rounded ${profitPercent >= 0 ? 'bg-emerald-500/10 text-emerald-405' : 'bg-red-500/10 text-red-405'}`}>
                              {profitPercent >= 0 ? `+${profitPercent}% above valuation` : `${profitPercent}% below valuation`}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              id={`btn-accept-offer-${bid.id}`}
                              onClick={() => {
                                onAcceptIncomingBid(bid.id, bid.player.id, bid.offerFee);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black p-2 rounded-lg text-xs transition"
                              title="Accept Proposal"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-reject-offer-${bid.id}`}
                              onClick={() => {
                                onRejectIncomingBid(bid.id);
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 p-2 rounded-lg text-xs transition"
                              title="Decline Offer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 text-center border-2 border-dashed border-zinc-800 rounded-xl py-12 text-zinc-550 text-xs">
                  No pending buyer proposals for your squad. Reserve players with low playcounts are more likely to attract interest from other divisions next turn!
                </div>
              )}
            </div>
            
            {/* Completed history */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Live Winter Ticker Status</h4>
              <div className="max-h-[150px] overflow-y-auto space-y-1.5 text-xs pr-1">
                {transferHistory.length > 0 ? (
                  transferHistory.map((tRec, i) => (
                    <div key={tRec.id || i} className="flex justify-between items-center bg-zinc-855 border border-zinc-800 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        <strong className="text-white">{tRec.playerName}</strong> {tRec.fromClubName === 'Free Agency' ? 'contracts with' : 'leaves ' + tRec.fromClubName + ' to join'} <strong className="text-white">{tRec.toClubName}</strong>
                      </div>
                      <div className="text-right font-bold text-zinc-300">
                        {tRec.fee === 0 ? 'Free Agent' : `£${tRec.fee.toFixed(1)}M`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500 italic text-center py-4">No completed signings recorded during this session yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BID / NEGOTIATIONS MODAL BACKDROP */}
      {biddingPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-zinc-100 animate-in fade-in zoom-in duration-100">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-indigo-950 p-5 border-b border-zinc-850 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-emerald-400 text-zinc-950 px-1.5 py-0.5 rounded font-black uppercase inline-block mb-1">
                  Contract Negotiation
                </span>
                <h3 className="text-lg font-black text-white">{biddingPlayer.name}</h3>
              </div>
              <button
                id="btn-close-neg-modal"
                onClick={handleCloseNegotiation}
                className="text-zinc-400 hover:text-white bg-black/30 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-5 space-y-4">
              
              {/* Profile Card Summary */}
              <div className="bg-zinc-855 p-3 rounded-xl flex items-center justify-between border border-zinc-750">
                <div>
                  <span className="text-xs text-indigo-400 font-bold">{biddingPlayer.position} • Age {biddingPlayer.age}</span>
                  <p className="text-xs text-zinc-400 mt-0.5">Rating: <strong className="text-white">{biddingPlayer.rating} OVR</strong> • Potential: <strong className="text-yellow-405">{biddingPlayer.potential}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">Market Value</span>
                  <p className="text-base font-black text-white">£{biddingPlayer.value.toFixed(1)}M</p>
                </div>
              </div>

              {/* STEP 1: TRANSFER BID */}
              {negotiationStep === 'BID' && biddingPlayerClub && (
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400">
                    Submit acquisition proposal to <strong className="text-zinc-200">{biddingPlayerClub.name}</strong>. Their valuation requires a realistic premium.
                  </div>

                  <div className="flex flex-col gap-2 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">PROPOSED TRANSFER FEE</span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Valuation: £{biddingPlayer.value.toFixed(1)}M</span>
                      <strong className="text-xl font-extrabold text-emerald-400">£{offerFee.toFixed(1)}M</strong>
                    </div>
                    <input
                      type="range"
                      min={Math.max(0.1, Math.round(biddingPlayer.value * 0.5 * 10) / 10)}
                      max={Math.round(biddingPlayer.value * 2.5 * 10) / 10}
                      step={0.1}
                      value={offerFee}
                      onChange={(e) => setOfferFee(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Low (Under Value)</span>
                      <span>High Premium</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      id="btn-cancel-nego-bid"
                      onClick={handleCloseNegotiation}
                      className="px-4 py-2 text-xs font-bold rounded-lg border border-zinc-700 hover:bg-zinc-800 transition"
                    >
                      Withdraw
                    </button>
                    <button
                      id="btn-submit-negotiation-bid"
                      onClick={handleCalculateBid}
                      className="px-4 py-2 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition tracking-wide uppercase"
                    >
                      Submit Bid Proposal
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WAGE OFFER / SCOUTED DIRECT OFFER */}
              {negotiationStep === 'WAGE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                    ✓ The transfer bid of <strong className="text-white">£{offerFee.toFixed(1)}M</strong> was accepted by the seller club! Now, negotiate terms with the player representative.
                  </div>

                  <div className="flex flex-col gap-2 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">PROPOSED WEEKLY SALARY</span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Demanded wage: £{biddingPlayer.wage}k / wk</span>
                      <strong className="text-xl font-extrabold text-amber-400">£{offerWage.toFixed(1)}k / wk</strong>
                    </div>
                    <input
                      type="range"
                      min={Math.max(1, Math.round(biddingPlayer.wage * 0.7))}
                      max={Math.round(biddingPlayer.wage * 2.5)}
                      step={1}
                      value={offerWage}
                      onChange={(e) => setOfferWage(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Low Counter (-30%)</span>
                      <span>High Premium (+150%)</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      id="btn-cancel-nego-wage"
                      onClick={handleCloseNegotiation}
                      className="px-4 py-2 text-xs font-bold rounded-lg border border-zinc-770 hover:bg-zinc-800 transition"
                    >
                      Decline
                    </button>
                    <button
                      id="btn-submit-negotiation-wage"
                      onClick={handleCalculateWage}
                      className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition tracking-wide uppercase"
                    >
                      Finalize Contracts
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BID REJECTED */}
              {negotiationStep === 'REJECTED' && (
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-100">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Offer Rejected!</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {biddingPlayerClub?.name} immediate response: "The initial proposal of £{offerFee.toFixed(1)}M does not reflect {biddingPlayer.name}'s true worth to our plans."
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      id="btn-retry-bid-reject"
                      onClick={() => setNegotiationStep('BID')}
                      className="px-4 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition border border-zinc-700"
                    >
                      Configure Bid Again
                    </button>
                    <button
                      id="btn-close-bid-reject"
                      onClick={handleCloseNegotiation}
                      className="px-4 py-2 text-xs font-bold bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg"
                    >
                      Decline Deal
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: WAGE REJECTED */}
              {negotiationStep === 'WAGE_REJECTED' && (
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-100">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Salary Proposal Declined</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {biddingPlayer.name}'s representative states: "£{offerWage.toFixed(1)}k is far too low. My client requires a salary in step with their status."
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      id="btn-retry-wage-reject"
                      onClick={() => setNegotiationStep('WAGE')}
                      className="px-4 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition border border-zinc-700"
                    >
                      Offer Higher Wage
                    </button>
                    <button
                      id="btn-close-wage-reject"
                      onClick={handleCloseNegotiation}
                      className="px-4 py-2 text-xs font-bold bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg"
                    >
                      Withdraw Offers
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: NEGOTIATION ACCEPTED / COMPLETED */}
              {negotiationStep === 'ACCEPTED' && (
                <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-100">
                  <div className="w-14 h-14 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-8 h-8 font-extrabold" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg">DONE DEAL!</h4>
                    <p className="text-xs text-zinc-300 mt-1">
                      <strong className="text-yellow-400">{biddingPlayer.name}</strong> has signed a professional player contract with your club!
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Wages: £{offerWage}k/week • Joined Squad Reserve Roster (Register them to Starting XI in Tactics)
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      id="btn-done-accept-modal"
                      onClick={handleCloseNegotiation}
                      className="bg-emerald-500 hover:bg-emerald-405 text-zinc-950 font-black px-6 py-2 rounded-lg text-xs tracking-wider uppercase transition shadow"
                    >
                      Done Deal
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
