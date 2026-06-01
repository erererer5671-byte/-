/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Club, Player, GameState } from '../types';
import { 
  Building2, School, Dumbbell, ShieldAlert, Star, Users, ArrowUpCircle, Sparkles, Check, Flame, Trophy, Info 
} from 'lucide-react';
import { createPlayer } from '../data/initialData';

interface InfrastructureScreenProps {
  gameState: GameState;
  onUpgradeInfrastructure: (category: 'academy' | 'training' | 'stadium' | 'scouting', cost: number) => void;
  academyProspects: Player[];
  onSignAcademyProspect: (prospect: Player) => void;
  onRejectAcademyProspect: (prospectId: string) => void;
}

const UPGRADE_COSTS: Record<number, number> = {
  1: 4.0,   // Level 1 -> 2 costs £4.0M
  2: 8.0,   // Level 2 -> 3 costs £8.0M
  3: 15.0,  // Level 3 -> 4 costs £15.0M
  4: 30.0,  // Level 4 -> 5 costs £30.0M
};

const CAPACITY_INCREMENTS: Record<number, number> = {
  2: 5000,
  3: 10000,
  4: 15000,
  5: 25000,
};

export default function InfrastructureScreen({
  gameState,
  onUpgradeInfrastructure,
  academyProspects,
  onSignAcademyProspect,
  onRejectAcademyProspect,
}: InfrastructureScreenProps) {
  const { clubs, userClubId } = gameState;
  const userClub = clubs.find(c => c.id === userClubId)!;

  const [activeTab, setActiveTab] = useState<'facilities' | 'academy'>('facilities');

  const getUpgradeCost = (currentLvl: number) => {
    return UPGRADE_COSTS[currentLvl] || 0;
  };

  const handleUpgradeClick = (category: 'academy' | 'training' | 'stadium' | 'scouting') => {
    const currentLvl = userClub.infrastructure[category];
    if (currentLvl >= 5) {
      alert("Facility is already upgraded to maximum level!");
      return;
    }

    const cost = getUpgradeCost(currentLvl);
    if (userClub.budget >= cost) {
      onUpgradeInfrastructure(category, cost);
    } else {
      alert(`Insufficient funds! Upgrading this facility requires £${cost.toFixed(1)}M (Your Balance: £${userClub.budget.toFixed(1)}M).`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Overview / Stats - Left 3 cols */}
      <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 text-zinc-200">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-450" /> Club Operations
        </h2>

        {/* Stadium Info Card */}
        <div className="bg-zinc-855 p-3.5 rounded-xl border border-zinc-750 space-y-3">
          <div>
            <div className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Club Stadium</div>
            <div className="text-sm font-black text-white mt-0.5">Capacity Stadium Network</div>
            <p className="text-xs text-zinc-450 mt-1">{userClub.stadiumCapacity.toLocaleString()} seats</p>
          </div>
          <div className="border-t border-zinc-800 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Home Ticket Sale multiplier:</span>
            <span className="text-xs font-bold text-emerald-400">x{(userClub.infrastructure.stadium * 0.4 + 1).toFixed(1)}</span>
          </div>
        </div>

        {/* Dynamic Tips based on facilities */}
        <div className="text-xs text-zinc-450 space-y-2.5 mt-2 bg-zinc-900/40 p-2 rounded-lg">
          <div className="flex gap-1.5 text-zinc-300 font-semibold items-center">
            <Info className="w-4 h-4 text-emerald-450 shrink-0" /> Operation advice:
          </div>
          <p>
            Upgraded <strong className="text-zinc-200">Training Facilities</strong> protect squad fitness from decaying rapidly between intense league match schedules.
          </p>
          <p>
            A Level 5 <strong className="text-zinc-200">Youth Academy</strong> brings weekly prospects with potentials reaching up to <strong className="text-yellow-405">95+</strong>, adding invaluable free assets to your rosters.
          </p>
        </div>

        {/* Tabs for content display */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-805">
          <button
            id="infra-tab-facilities"
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'facilities'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" /> Facility Upgrades
          </button>
          
          <button
            id="infra-tab-academy"
            onClick={() => setActiveTab('academy')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase rounded-lg text-left transition ${
              activeTab === 'academy'
                ? 'bg-emerald-950 text-emerald-400 border-l-4 border-emerald-500'
                : 'text-zinc-450 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <School className="w-4 h-4" /> Youth Academy
            </span>
            {academyProspects.length > 0 && (
              <span className="bg-emerald-505 text-zinc-950 font-black px-1.5 rounded-full text-[9px] animate-pulse">
                {academyProspects.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Column - Right 9 cols */}
      <div className="lg:col-span-9 flex flex-col gap-4">
        
        {/* TAB 1: FACILITY UPGRADES MODULE */}
        {activeTab === 'facilities' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Stadium & Infrastructure Upgrades</h3>
              <p className="text-xs text-zinc-400 mt-1">Invest heavy capitals into facilities. Upgrades require cash and unlock powerful bonuses.</p>
            </div>

            {/* Grid of facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* FACILITY A: ACADEMY */}
              <div className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                      <School className="w-5 h-5" />
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < userClub.infrastructure.academy ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Youth Academy Infrastructure</h4>
                    <p className="text-xs text-zinc-400 mt-1">Develops junior football prospects and feeds your squad with young, raw potential stars for free.</p>
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-[10px] text-zinc-400">
                    <strong className="text-zinc-200">Current Benefit:</strong> Potential crop stars rated with peak prospects up to {60 + userClub.infrastructure.academy * 7} OVR.
                  </div>
                </div>

                {userClub.infrastructure.academy < 5 ? (
                  <button
                    id="btn-upgrade-academy"
                    onClick={() => handleUpgradeClick('academy')}
                    className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 hover:border-emerald-500/50 text-white font-bold py-2 rounded-lg text-xs transition border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    Upgrade to Lvl {userClub.infrastructure.academy + 1} — £{getUpgradeCost(userClub.infrastructure.academy).toFixed(1)}M
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-black text-amber-400 bg-zinc-900 rounded-lg flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> MAX LEVEL REACHED
                  </div>
                )}
              </div>

              {/* FACILITY B: TRAINING FACILITIES */}
              <div className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 bg-blue-500/10 p-2 rounded-lg">
                      <Dumbbell className="w-5 h-5" />
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < userClub.infrastructure.training ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Training Ground & Medical Center</h4>
                    <p className="text-xs text-zinc-400 mt-1">Affects match-weary recovery. Better grounds increase ratings growth and prevent fitness drop counts.</p>
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-[10px] text-zinc-400">
                    <strong className="text-zinc-200">Current Benefit:</strong> Weekly squad energy recovery bonus added: +{userClub.infrastructure.training * 4}% fit restoration on turns.
                  </div>
                </div>

                {userClub.infrastructure.training < 5 ? (
                  <button
                    id="btn-upgrade-training"
                    onClick={() => handleUpgradeClick('training')}
                    className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 hover:border-emerald-500/50 text-white font-bold py-2 rounded-lg text-xs transition border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    Upgrade to Lvl {userClub.infrastructure.training + 1} — £{getUpgradeCost(userClub.infrastructure.training).toFixed(1)}M
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-black text-amber-400 bg-zinc-900 rounded-lg flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> MAX LEVEL REACHED
                  </div>
                )}
              </div>

              {/* FACILITY C: STADIUM SEATING CAPACITY */}
              <div className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 bg-yellow-500/10 p-2 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < userClub.infrastructure.stadium ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Stadium Expansion</h4>
                    <p className="text-xs text-zinc-400 mt-1">Expands capacity and seats to generate additional matchday ticket revenue for home league games.</p>
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-[10px] text-zinc-400">
                    <strong className="text-zinc-200">Current Benefit:</strong> Maximum {userClub.stadiumCapacity.toLocaleString()} ticket sale seats per home fixture.
                  </div>
                </div>

                {userClub.infrastructure.stadium < 5 ? (
                  <button
                    id="btn-upgrade-stadium"
                    onClick={() => handleUpgradeClick('stadium')}
                    className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 hover:border-emerald-500/50 text-white font-bold py-2 rounded-lg text-xs transition border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    Upgrade to Lvl {userClub.infrastructure.stadium + 1} — £{getUpgradeCost(userClub.infrastructure.stadium).toFixed(1)}M
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-black text-amber-400 bg-zinc-900 rounded-lg flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> MAX LEVEL REACHED
                  </div>
                )}
              </div>

              {/* FACILITY D: SCOUTING INFRASTRUCTURE */}
              <div className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-400 bg-orange-500/10 p-2 rounded-lg">
                      <Star className="w-5 h-5" />
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < userClub.infrastructure.scouting ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Global Scouting & IT Data Center</h4>
                    <p className="text-xs text-zinc-400 mt-1">Extends technological tracking systems. Cuts scout durations and expenses while filtering wider ratings.</p>
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-[10px] text-zinc-400">
                    <strong className="text-zinc-200">Current Benefit:</strong> Unlocks Europe/South America networks and trims search lengths by {userClub.infrastructure.scouting * 20}%.
                  </div>
                </div>

                {userClub.infrastructure.scouting < 5 ? (
                  <button
                    id="btn-upgrade-scouting"
                    onClick={() => handleUpgradeClick('scouting')}
                    className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 hover:border-emerald-500/50 text-white font-bold py-2 rounded-lg text-xs transition border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    Upgrade to Lvl {userClub.infrastructure.scouting + 1} — £{getUpgradeCost(userClub.infrastructure.scouting).toFixed(1)}M
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-black text-amber-400 bg-zinc-900 rounded-lg flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> MAX LEVEL REACHED
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: YOUTH ACADEMY CULTIVATION MODULE */}
        {activeTab === 'academy' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-405" /> Youth Development Farm
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Promising youngsters are rising through the developmental tiers. Secure creative prospects directly to your senior roster for free!</p>
            </div>

            {academyProspects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {academyProspects.map(prospect => {
                  return (
                    <div key={prospect.id} className="bg-zinc-855 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-405 font-bold uppercase tracking-wider py-0.5 px-1 rounded">
                            {prospect.position} • Youth
                          </span>
                          <h4 className="font-extrabold text-white text-sm mt-1">{prospect.name}</h4>
                          <span className="text-[10px] text-zinc-450">{prospect.nationality} • Age {prospect.age}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-450 uppercase block">Cur OVR</span>
                          <span className="font-black text-white text-base">{prospect.rating}</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800 flex justify-between text-xs">
                        <div>
                          <span className="text-zinc-500 text-[10px] block font-mono">POTENTIAL RANGE</span>
                          <strong className="text-yellow-450 text-sm flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> {prospect.potential - 4} - {prospect.potential + 2}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 text-[10px] block font-mono">WAGE VALUE</span>
                          <strong className="text-white">£{prospect.wage}k / wk</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800">
                        <button
                          id={`btn-reject-prospect-${prospect.id}`}
                          onClick={() => onRejectAcademyProspect(prospect.id)}
                          className="bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 font-bold py-1.5 rounded-lg text-xs transition border border-zinc-700"
                        >
                          Decline Target
                        </button>
                        <button
                          id={`btn-sign-prospect-${prospect.id}`}
                          onClick={() => onSignAcademyProspect(prospect)}
                          className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black py-1.5 rounded-lg text-xs transition shadow flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Sign Professional
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-xl my-6">
                <School className="w-10 h-10 text-zinc-700 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-sm text-zinc-400">Scouting Prospects...</h4>
                <p className="text-xs text-zinc-550 max-w-[340px] mx-auto mt-1 leading-relaxed">
                  Your youth instructors are tracking fresh talent options. Academy prospects will emerge at standard week turns!
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
