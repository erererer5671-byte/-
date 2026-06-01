/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Tactics, FormationType, TacticalStyle, TeamMentality } from '../types';
import { Shield, Sparkles, Award, Target, Goal, Swords, Settings, Info, Users, ArrowLeftRight } from 'lucide-react';

interface TacticsScreenProps {
  players: Player[];
  tactics: Tactics;
  onUpdateTactics: (newTactics: Tactics) => void;
  onUpdateSquadStatus: (playerId: string, nextStatus: 'Starting' | 'Sub' | 'Reserve') => void;
  onSwapPlayers: (playerAId: string, playerBId: string) => void;
}

const FORMATION_SLOTS: Record<FormationType, Array<{ id: string; role: 'GK' | 'DEF' | 'MID' | 'ATT'; label: string; x: number; y: number }>> = {
  '4-4-2': [
    { id: 'gk', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'def1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'def2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'def3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'def4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'mid1', role: 'MID', label: 'LM', x: 15, y: 45 },
    { id: 'mid2', role: 'MID', label: 'CM', x: 38, y: 48 },
    { id: 'mid3', role: 'MID', label: 'CM', x: 62, y: 48 },
    { id: 'mid4', role: 'MID', label: 'RM', x: 85, y: 45 },
    { id: 'att1', role: 'ATT', label: 'ST', x: 35, y: 20 },
    { id: 'att2', role: 'ATT', label: 'ST', x: 65, y: 20 },
  ],
  '4-3-3': [
    { id: 'gk', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'def1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'def2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'def3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'def4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'mid1', role: 'MID', label: 'CM', x: 25, y: 48 },
    { id: 'mid2', role: 'MID', label: 'DM', x: 50, y: 54 },
    { id: 'mid3', role: 'MID', label: 'CM', x: 75, y: 48 },
    { id: 'att1', role: 'ATT', label: 'LW', x: 20, y: 22 },
    { id: 'att2', role: 'ATT', label: 'ST', x: 50, y: 18 },
    { id: 'att3', role: 'ATT', label: 'RW', x: 80, y: 22 },
  ],
  '3-5-2': [
    { id: 'gk', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'def1', role: 'DEF', label: 'CB', x: 25, y: 72 },
    { id: 'def2', role: 'DEF', label: 'CB', x: 50, y: 75 },
    { id: 'def3', role: 'DEF', label: 'CB', x: 75, y: 72 },
    { id: 'mid1', role: 'MID', label: 'LWB', x: 12, y: 50 },
    { id: 'mid2', role: 'MID', label: 'DM', x: 35, y: 52 },
    { id: 'mid3', role: 'MID', label: 'AM', x: 50, y: 40 },
    { id: 'mid4', role: 'MID', label: 'DM', x: 65, y: 52 },
    { id: 'mid5', role: 'MID', label: 'RWB', x: 88, y: 50 },
    { id: 'att1', role: 'ATT', label: 'ST', x: 35, y: 20 },
    { id: 'att2', role: 'ATT', label: 'ST', x: 65, y: 20 },
  ],
  '4-2-3-1': [
    { id: 'gk', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'def1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'def2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'def3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'def4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'mid1', role: 'MID', label: 'LDM', x: 33, y: 55 },
    { id: 'mid2', role: 'MID', label: 'RDM', x: 67, y: 55 },
    { id: 'mid3', role: 'MID', label: 'LAM', x: 20, y: 38 },
    { id: 'mid4', role: 'MID', label: 'CAM', x: 50, y: 36 },
    { id: 'mid5', role: 'MID', label: 'RAM', x: 80, y: 38 },
    { id: 'att1', role: 'ATT', label: 'ST', x: 50, y: 18 },
  ],
  '5-3-2': [
    { id: 'gk', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'def1', role: 'DEF', label: 'LWB', x: 12, y: 65 },
    { id: 'def2', role: 'DEF', label: 'CB', x: 32, y: 72 },
    { id: 'def3', role: 'DEF', label: 'CB', x: 50, y: 74 },
    { id: 'def4', role: 'DEF', label: 'CB', x: 68, y: 72 },
    { id: 'def5', role: 'DEF', label: 'RWB', x: 88, y: 65 },
    { id: 'mid1', role: 'MID', label: 'CM', x: 30, y: 46 },
    { id: 'mid2', role: 'MID', label: 'CM', x: 50, y: 48 },
    { id: 'mid3', role: 'MID', label: 'CM', x: 70, y: 46 },
    { id: 'att1', role: 'ATT', label: 'ST', x: 35, y: 20 },
    { id: 'att2', role: 'ATT', label: 'ST', x: 65, y: 20 },
  ],
};

const STYLES: TacticalStyle[] = ['Balanced', 'Tiki-Taka', 'Counter-Attack', 'Gegenpress', 'Park the Bus'];
const MENTALITIES: TeamMentality[] = ['Defensive', 'Cautious', 'Balanced', 'Attacking', 'All-Out Attack'];

export default function TacticsScreen({
  players,
  tactics,
  onUpdateTactics,
  onUpdateSquadStatus,
  onSwapPlayers,
}: TacticsScreenProps) {
  const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'pitch' | 'list'>('pitch');

  const startingXI = players.filter(p => p.squadStatus === 'Starting');
  const substitutes = players.filter(p => p.squadStatus === 'Sub');
  const reserves = players.filter(p => p.squadStatus === 'Reserve');

  // Handle player clicking for click-to-swap mechanic
  const handlePlayerClick = (player: Player) => {
    if (!selectedPlayerForSwap) {
      setSelectedPlayerForSwap(player);
    } else {
      if (selectedPlayerForSwap.id !== player.id) {
        // Swap their statuses or swap actual players if we swap Starting with Subs/Reserves
        onSwapPlayers(selectedPlayerForSwap.id, player.id);
      }
      setSelectedPlayerForSwap(null);
    }
  };

  const currentSlots = FORMATION_SLOTS[tactics.formation];

  // Map starting players to formation slots
  // We want to find the best match or assign players in slot order
  const MapStartingPlayersToSlots = () => {
    const assignedPlayers: Array<{ slot: typeof currentSlots[0]; player: Player }> = [];
    const remainingPlayers = [...startingXI];

    // First assign GK
    const gkSlots = currentSlots.filter(s => s.role === 'GK');
    gkSlots.forEach(slot => {
      const bestGKIndex = remainingPlayers.findIndex(p => p.position === 'GK');
      if (bestGKIndex !== -1) {
        assignedPlayers.push({ slot, player: remainingPlayers[bestGKIndex] });
        remainingPlayers.splice(bestGKIndex, 1);
      }
    });

    // Then assign DEF, MID, ATT positions with their corresponding slots
    const roles: Array<'DEF' | 'MID' | 'ATT'> = ['DEF', 'MID', 'ATT'];
    roles.forEach(role => {
      const roleSlots = currentSlots.filter(s => s.role === role);
      roleSlots.forEach(slot => {
        // Find match with exact position
        let pIndex = remainingPlayers.findIndex(p => p.position === role);
        if (pIndex === -1 && remainingPlayers.length > 0) {
          // fallback to any position
          pIndex = 0;
        }
        if (pIndex !== -1) {
          assignedPlayers.push({ slot, player: remainingPlayers[pIndex] });
          remainingPlayers.splice(pIndex, 1);
        }
      });
    });

    // Fallback if anything left or vacant slots
    currentSlots.forEach(slot => {
      const alreadyAssigned = assignedPlayers.some(a => a.slot.id === slot.id);
      if (!alreadyAssigned && remainingPlayers.length > 0) {
        assignedPlayers.push({ slot, player: remainingPlayers[0] });
        remainingPlayers.splice(0, 1);
      }
    });

    return assignedPlayers;
  };

  const assignedPitchPlayers = MapStartingPlayersToSlots();

  // Sort overall squad nicely by position rating
  const sortedPlayers = [...players].sort((a, b) => {
    const posVal = { GK: 1, DEF: 2, MID: 3, ATT: 4 };
    if (posVal[a.position] !== posVal[b.position]) {
      return posVal[a.position] - posVal[b.position];
    }
    return b.rating - a.rating;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration & Selection Column - Left side */}
      <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-6 text-zinc-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" /> General Instructions
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Set your team lineup, style, and set-piece roles.</p>
        </div>

        {/* Formation Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Formation</label>
          <div className="grid grid-cols-3 gap-2">
            {(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'] as FormationType[]).map(form => (
              <button
                key={form}
                id={`btn-formation-${form}`}
                onClick={() => onUpdateTactics({ ...tactics, formation: form })}
                className={`py-2 px-3 text-sm rounded-lg border font-medium transition ${
                  tactics.formation === form
                    ? 'bg-emerald-650 text-white border-emerald-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {form}
              </button>
            ))}
          </div>
        </div>

        {/* Style Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Tactical Style</label>
          <select
            id="select-style"
            value={tactics.style}
            onChange={(e) => onUpdateTactics({ ...tactics, style: e.target.value as TacticalStyle })}
            className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STYLES.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-400 italic">
            {tactics.style === 'Tiki-Taka' && 'Increases possession control and passing accuracy at the cost of defense.'}
            {tactics.style === 'Counter-Attack' && 'Devastating fast counters from defensively secured positions.'}
            {tactics.style === 'Gegenpress' && 'Forces opponent errors with extreme front defense pressing, high fatigue.'}
            {tactics.style === 'Park the Bus' && 'Ultimate defensive rigidity, extremely hard to break down but low goals.'}
            {tactics.style === 'Balanced' && 'A standard balanced tactic safe for all situations.'}
          </p>
        </div>

        {/* Mentality Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Team Mentality</label>
          <div className="relative pt-1">
            <span className="text-[11px] text-emerald-400 font-medium">
              Current: <strong className="text-white">{tactics.mentality}</strong>
            </span>
            <div className="flex gap-1 mt-2">
              {MENTALITIES.map(ment => (
                <button
                  key={ment}
                  id={`btn-mentality-${ment}`}
                  onClick={() => onUpdateTactics({ ...tactics, mentality: ment })}
                  className={`flex-1 text-[10px] uppercase tracking-wider py-1.5 rounded text-center font-bold transition ${
                    tactics.mentality === ment
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                      : 'bg-zinc-855 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {ment.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Roles */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Set Piece Assignments</h3>

          {/* Captain */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Captain
            </span>
            <select
              id="select-captain"
              value={tactics.captainId}
              onChange={(e) => onUpdateTactics({ ...tactics, captainId: e.target.value })}
              className="p-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-white max-w-[150px]"
            >
              {startingXI.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>
              ))}
            </select>
          </div>

          {/* Penalty Corner */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" /> Penalties
            </span>
            <select
              id="select-penalties"
              value={tactics.penaltyTakerId}
              onChange={(e) => onUpdateTactics({ ...tactics, penaltyTakerId: e.target.value })}
              className="p-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-white max-w-[150px]"
            >
              {startingXI.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>
              ))}
            </select>
          </div>

          {/* FreeKicker */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-300 flex items-center gap-1.5">
              <Goal className="w-4 h-4 text-amber-400" /> Free Kicks
            </span>
            <select
              id="select-freekicks"
              value={tactics.freekickTakerId}
              onChange={(e) => onUpdateTactics({ ...tactics, freekickTakerId: e.target.value })}
              className="p-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-white max-w-[150px]"
            >
              {startingXI.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected swap instruction */}
        {selectedPlayerForSwap && (
          <div className="mt-auto bg-emerald-950/40 border border-emerald-500/50 p-2.5 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 animate-pulse flex-shrink-0" />
            <div>
              Ready to swap <strong className="text-white">{selectedPlayerForSwap.name}</strong>. Select another player below or on the field to swap them.
            </div>
            <button
              id="btn-cancel-swap"
              onClick={() => setSelectedPlayerForSwap(null)}
              className="ml-auto underline font-bold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Pitch / Layout Area */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* View mode buttons */}
        <div className="flex justify-between items-center bg-zinc-950 rounded-xl p-1 border border-zinc-800">
          <div className="flex gap-2">
            <button
              id="btn-pitch-view"
              onClick={() => setActiveTab('pitch')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
                activeTab === 'pitch'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tactical Pitch
            </button>
            <button
              id="btn-list-view"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
                activeTab === 'list'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Squad List Detail
            </button>
          </div>
          <div className="text-xs text-zinc-400 pr-3 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-450" /> Starting XI Overall: {' '}
            <strong className="text-emerald-400">
              {Math.round(startingXI.reduce((sum, p) => sum + p.rating, 0) / 11)} OVR
            </strong>
          </div>
        </div>

        {activeTab === 'pitch' ? (
          /* PITCH CONTAINER */
          <div className="relative aspect-[4/5] sm:aspect-[4/3] w-full rounded-2xl bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 border border-emerald-600 shadow-2xl overflow-hidden active:cursor-grabbing">
            {/* Soccer Pitch Lines overlay */}
            <div className="absolute inset-0 border-[3px] border-white/20 m-4 rounded pointer-events-none" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/3 aspect-[3/1] border-b-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[16%] aspect-[3/1] border-b-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/3 aspect-[3/1] border-t-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[16%] aspect-[3/1] border-t-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] aspect-square rounded-full border-2 border-white/20 pointer-events-none" />

            {/* Render Players on the Pitch */}
            {assignedPitchPlayers.map(({ slot, player }) => {
              const isSelected = selectedPlayerForSwap?.id === player.id;
              const isCaptain = tactics.captainId === player.id;

              return (
                <button
                  key={player.id}
                  id={`pitch-player-${player.id}`}
                  onClick={() => handlePlayerClick(player)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5 focus:outline-none group flex flex-col items-center hover:scale-105 transition active:scale-95"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  {/* Player Shirt Badge */}
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white relative shadow-lg ${
                      isSelected
                        ? 'bg-emerald-400 border-4 border-amber-400 animate-pulse'
                        : 'bg-zinc-950 border-2 border-zinc-100 group-hover:border-emerald-355'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{player.rating}</span>

                    {/* Position Label Tag */}
                    <span className="absolute -top-2 -right-2 text-[8px] bg-amber-500 text-zinc-950 px-1 font-extrabold rounded-full scale-90 border border-zinc-900 uppercase">
                      {slot.label}
                    </span>

                    {/* Captain C */}
                    {isCaptain && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-yellow-400 border border-yellow-750 text-neutral-900 px-[3px] font-black rounded-lg">
                        C
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <div className="mt-1 bg-zinc-950/85 backdrop-blur-sm shadow border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-tight text-center max-w-[85px] truncate">
                    {player.name.split(' ').pop()}
                  </div>
                </button>
              );
            })}

            {/* Swap instructions in center if selected */}
            {!selectedPlayerForSwap && (
              <div className="absolute top-12 left-4 text-[10px] text-zinc-150 bg-black/60 px-3 py-1.5 rounded-md pointer-events-none max-w-[200px] leading-relaxed">
                <Info className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                Click any player on the pitch to start swapping, then swap them with substitutes or reserves.
              </div>
            )}
          </div>
        ) : (
          /* DETAILED SQUAD LIST (TABS & SWAPS) */
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Liney Selection / Squad Details</h3>
            <p className="text-xs text-zinc-400 mb-4">You must maintain exactly 11 Starting players to play. Click a player to trigger manual swaps.</p>

            <div className="flex flex-col gap-4">
              {/* Starting XI Section */}
              <div>
                <h4 className="text-xs font-bold text-emerald-450 border-b border-zinc-800 pb-1 mb-2">STARTING XI ({startingXI.length} / 11)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {startingXI.map(p => {
                    const isSelected = selectedPlayerForSwap?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePlayerClick(p)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-400'
                            : 'bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            p.position === 'GK' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            p.position === 'DEF' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            p.position === 'MID' ? 'bg-emerald-500/20 text-emerald-405 border border-emerald-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {p.position}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-zinc-400">Age: {p.age} • Pot: {p.potential} • Form: {p.form}/10</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-emerald-400">{p.rating} OVR</p>
                          <p className="text-[10px] text-zinc-400">Fit: {p.fitness}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Substitutes Section */}
              <div>
                <h4 className="text-xs font-bold text-amber-500 border-b border-zinc-800 pb-1 mb-2">SUBSTITUTES ({substitutes.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {substitutes.map(p => {
                    const isSelected = selectedPlayerForSwap?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePlayerClick(p)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-400'
                            : 'bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                            {p.position}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-zinc-450">Age: {p.age} • Pot: {p.potential}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-300">{p.rating} OVR</p>
                          <p className="text-[10px] text-zinc-450">Fit: {p.fitness}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reserves Section */}
              <div>
                <h4 className="text-xs font-bold text-zinc-450 border-b border-zinc-805 pb-1 mb-2">RESERVES / RESTING ({reserves.length})</h4>
                <div className="max-h-[250px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-1">
                  {reserves.map(p => {
                    const isSelected = selectedPlayerForSwap?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePlayerClick(p)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-400'
                            : 'bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                            {p.position}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-zinc-300">{p.name}</p>
                            <p className="text-[10px] text-zinc-500">Age: {p.age}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-400">{p.rating} OVR</p>
                          <p className="text-[10px] text-zinc-500">Fit: {p.fitness}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Substitutes Swap Block */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200 block mb-0.5">Tactical Synergy Bonuses:</strong>
            - Aligning player positions (e.g., playing an ATT in attack) preserves player effectiveness. Playing someone out-of-position triggers minor match stat penalties.
            - Higher squad <strong className="text-white">Fitness</strong> keeps match simulation performance stable. Keep players rotated!
            - Click any player slot above to easily arrange your starting lines.
          </div>
        </div>
      </div>
    </div>
  );
}
