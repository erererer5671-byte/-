/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Tactics, FormationType, TacticalStyle, TeamMentality } from '../types';
import { 
  Shield, Sparkles, Award, Target, Goal, Swords, Settings, Info, Users, ArrowLeftRight,
  Heart, Dumbbell, Zap, Coins, Flame, Clock, Plus, Trash2, ArrowRight, Activity, Trash
} from 'lucide-react';

interface TacticsScreenProps {
  players: Player[];
  tactics: Tactics;
  onUpdateTactics: (newTactics: Tactics) => void;
  onUpdateSquadStatus: (playerId: string, nextStatus: 'Starting' | 'Sub' | 'Reserve') => void;
  onSwapPlayers: (playerAId: string, playerBId: string) => void;
  onUpdatePlayers?: (updatedPlayers: Player[]) => void;
  userClub?: any;
  onUpdateBudget?: (amount: number) => void;
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
  onUpdatePlayers,
  userClub,
  onUpdateBudget,
}: TacticsScreenProps) {
  const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'pitch' | 'list' | 'coaching' | 'medical'>('pitch');

  // Coaching & Rehabilitation Logs
  const [coachingLogs, setCoachingLogs] = useState<string[]>(["[المدرب الفني] حدد خطة تدريب مكثفة لأي نجم كروي لتطوير تقييمه الفني مقابل بعض اللياقة."]);
  const [medicalLogs, setMedicalLogs] = useState<string[]>(["[الحقيبة الطبية] متاح 3 غرف علاج سريرية لشفاء وإعادة تأهيل نجومك الفتاكيين وتجهيزهم باللياقة الكاملة."]);
  const [selectedTrainingPlayerId, setSelectedTrainingPlayerId] = useState<string>('');

  // Medical slots recovery configuration
  const recoveryProtocols = [
    { id: 'ice_bath', name: 'جلسة مغطس الثلج ❄️ (Ice Bath Protocol)', cost: 0.1, benefit: 'استعادة اللياقة +15% ومقاومة التعب', description: 'يقلل الالتهابات العضلية بعد مباريات الكوب بسرعة خاطفة ومجاني التكلفة التمويلية تقريباً.', amount: 15 },
    { id: 'massage', name: 'تدليك طبيعي عميق 💆‍♂️ (Therapeutic Massage)', cost: 0.3, benefit: 'استعادة اللياقة +35% والروح المعنوية +10%', description: 'طاقم المساج والتدليك يبدد تعب الفخذ والساق مع منح النجوم المنهكين دفعة روح معنوية هائلة.', amount: 35 },
    { id: 'hyperbaric', name: 'غرفة الأكسجين المضغوط 🧬 (Hyperbaric Chamber)', cost: 0.8, benefit: 'استعادة اللياقة والجاهزية 100% فورياً', description: 'التقنية الطبية المتطورة الأكثر سرعة لعلاج كوابيس الإصابة والإجهاد وجعل النجم بكامل عنفوانه.', amount: 100 }
  ];

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

  // Train Option to upgrade individual tactics and attributes
  const handleTrainPlayStyle = (playerId: string, skillType: 'attacking' | 'passing' | 'defending' | 'conditioning') => {
    if (!onUpdatePlayers) return;
    const roster = JSON.parse(JSON.stringify(players)) as Player[];
    const player = roster.find(p => p.id === playerId);
    if (!player) return;

    if (player.fitness < 20) {
      setCoachingLogs(prev => [
        `[خطأ ⚠️] اللاعب ${player.name} منهك تماماً (لياقته ${player.fitness}%). يرجى إراحته أو نقله لمركز التأهيل الطبي قبل تفعيل التدريبات المتعبة!`,
        ...prev
      ]);
      return;
    }

    let msg = '';
    // Consumes fitness
    player.fitness = Math.max(0, player.fitness - 15);

    switch(skillType) {
      case 'attacking':
        player.rating = Math.min(99, player.rating + 1);
        player.potential = Math.min(99, player.potential + 1);
        player.morale = Math.min(100, player.morale + 5);
        msg = `[نجاح ⚽] تم بنجاح تدريب النجم ${player.name} على التسديد القاتل والتحرك خلف المدافعين! ارتفعت قدراته (+1 OVR) وانخفضت لياقته (-15%).`;
        break;
      case 'passing':
        player.rating = Math.min(99, player.rating + 1);
        player.potential = Math.min(99, player.potential + 1);
        player.morale = Math.min(100, player.morale + 10);
        msg = `[نجاح 🎯] أكمل ${player.name} مناورة التمرير "تيكي تاكا" القصير والتقواطير الهندسية! زاد التقييم (+1 OVR) وارتفعت المعنويات بالكامل.`;
        break;
      case 'defending':
        player.rating = Math.min(99, player.rating + 1);
        player.potential = Math.min(99, player.potential + 1);
        player.morale = Math.min(100, player.morale + 4);
        msg = `[نجاح 🛡️] أنهى المدافع الصلب ${player.name} بروتوكول الرقابة اللصيقة والضغط الخلفي! ارتفع تقييمه الدفاعي ميكانيكياً (+1 OVR).`;
        break;
      case 'conditioning':
        player.potential = Math.min(99, player.potential + 2);
        player.morale = Math.min(100, player.morale + 15);
        msg = `[نجاح 💪] تمرين تهيئة بدنية ولياقة عامة للنجم الواعد ${player.name}. زادت القيمة الكامنة (+2 POT) وروحه التنافسية بمعدل كبير!`;
        break;
    }

    onUpdatePlayers(roster);
    setCoachingLogs(prev => [msg, ...prev]);
  };

  // Physio Therapy rehabilitation service with queue integration
  const handleTriggerPhysioService = (playerId: string, protocolId: string) => {
    if (!onUpdatePlayers || !onUpdateBudget) return;
    const protocol = recoveryProtocols.find(x => x.id === protocolId);
    if (!protocol) return;

    // Budget check
    const currentBudget = userClub?.budget || 0;
    if (currentBudget < protocol.cost) {
      setMedicalLogs(prev => [
        `[مرفوض ❌] ميزانية النادي غير كافية لتمويل علاج البروتوكول المختار. التكلفة المطلوبة: £${protocol.cost}M، بينما رصيدك الحالي: £${currentBudget}M.`,
        ...prev
      ]);
      return;
    }

    const roster = JSON.parse(JSON.stringify(players)) as Player[];
    const player = roster.find(p => p.id === playerId);
    if (!player) return;

    // Apply heal
    if (protocolId === 'ice_bath') {
      player.fitness = Math.min(100, player.fitness + 15);
    } else if (protocolId === 'massage') {
      player.fitness = Math.min(100, player.fitness + 35);
      player.morale = Math.min(100, player.morale + 10);
    } else if (protocolId === 'hyperbaric') {
      player.fitness = 100;
      player.morale = Math.min(100, player.morale + 20);
    }

    onUpdateBudget(-protocol.cost);
    onUpdatePlayers(roster);
    setMedicalLogs(prev => [
      `[تم الشفاء ✅] تم توجيه ${player.name} لغرفة العلاج وتنشيط بروتوكول (${protocol.name}). تم خصم £${protocol.cost}M من الخزانة. لياقته الحالية ارتفعت إلى ${player.fitness}%.`,
      ...prev
    ]);
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-zinc-950 rounded-xl p-1 border border-zinc-800 gap-2">
          <div className="flex flex-wrap gap-1">
            <button
              id="btn-pitch-view"
              onClick={() => setActiveTab('pitch')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition ${
                activeTab === 'pitch'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              📋 تشكيلة الملعب (Pitch)
            </button>
            <button
              id="btn-list-view"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition ${
                activeTab === 'list'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              👥 قائمة اللاعبين (Squad List)
            </button>
            <button
              id="btn-coaching-view"
              onClick={() => {
                setActiveTab('coaching');
                if (players.length > 0 && !selectedTrainingPlayerId) {
                  setSelectedTrainingPlayerId(players[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition flex items-center gap-1 ${
                activeTab === 'coaching'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" /> خطط التدريب (Training Drills)
            </button>
            <button
              id="btn-medical-view"
              onClick={() => {
                setActiveTab('medical');
                if (players.length > 0 && !selectedTrainingPlayerId) {
                  setSelectedTrainingPlayerId(players[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition flex items-center gap-1 ${
                activeTab === 'medical'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-rose-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> مركز التأهيل الطبي (Physio)
            </button>
          </div>
          <div className="text-[11px] text-zinc-400 px-2 font-medium flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-900 pt-1.5 sm:pt-0">
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              💰 ميزانية النادي: £{userClub?.budget !== undefined ? userClub.budget : 100}M
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-450" /> قوة التشكيلة: {' '}
              <strong className="text-emerald-400">
                {startingXI.length > 0 ? Math.round(startingXI.reduce((sum, p) => sum + p.rating, 0) / 11) : 75} OVR
              </strong>
            </span>
          </div>
        </div>

        {activeTab === 'pitch' && (
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
        )}

        {activeTab === 'list' && (
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
                            : 'bg-zinc-850 border-zinc-805 hover:border-zinc-700'
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
                          <p className="text-sm font-extrabold text-emerald-404">{p.rating} OVR</p>
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

        {activeTab === 'coaching' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6 text-right" dir="rtl">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <Dumbbell className="w-5 h-5 text-amber-500" />
                أجندة التدريب الفردي وتطوير المراكز البدنية 🏋️‍♂️
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                صمم برامج التدريبات التكتيكية لنجوم فريقك. ترفع هذه الدريلات نقاط التقييم العام (OVR) مقابل بعض المجهود اللياقي والبدني للاعب.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Squad list sidebar for training */}
              <div className="md:col-span-5 bg-zinc-955/80 border border-zinc-800 p-3 rounded-xl flex flex-col gap-2 max-h-[350px] overflow-y-auto">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block border-b border-zinc-800 pb-1.5 mb-1 text-center">قائمة الفريق للتدريب المستمر</span>
                {sortedPlayers.map(p => (
                  <button
                    key={p.id}
                    id={`btn-train-select-${p.id}`}
                    onClick={() => setSelectedTrainingPlayerId(p.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-right transition border ${
                      selectedTrainingPlayerId === p.id 
                        ? 'bg-amber-950/40 border-amber-500/50 text-white font-bold' 
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-300 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        p.position === 'GK' ? 'bg-amber-500/20 text-amber-400' :
                        p.position === 'DEF' ? 'bg-blue-500/20 text-blue-400' :
                        p.position === 'MID' ? 'bg-emerald-505/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {p.position}
                      </span>
                      <div>
                        <p className="text-xs font-bold leading-normal">{p.name}</p>
                        <p className="text-[9px] text-zinc-500">لياقة: {p.fitness}% • وضع: {p.squadStatus}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-amber-400">{p.rating} OVR</p>
                      <p className="text-[8px] text-zinc-450 font-mono">POT: {p.potential}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action panels for training */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {(() => {
                  const trainingPlayer = players.find(p => p.id === selectedTrainingPlayerId);
                  if (!trainingPlayer) {
                    return (
                      <div className="bg-zinc-950/40 p-12 text-center rounded-xl text-xs text-zinc-500 italic">
                        يرجى اختيار أحد اللاعبين من القائمة الجانبية لتنشيط التدريبات الفنية له.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col gap-4">
                      {/* Active Player Status */}
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                        <div>
                          <p className="text-[10px] text-zinc-500 font-mono">اللاعب المستهدف بالتدريب الحالي:</p>
                          <h4 className="text-sm font-extrabold text-white">{trainingPlayer.name}</h4>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-xs bg-amber-500/10 text-amber-450 font-bold px-2.5 py-1 rounded border border-amber-500/20">
                            {trainingPlayer.rating} OVR ➔ القدرة الكامنة: POT {trainingPlayer.potential}
                          </span>
                        </div>
                      </div>

                      {/* Training category blocks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleTrainPlayStyle(trainingPlayer.id, 'attacking')}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-500/20 p-2.5 rounded-lg text-right transition flex flex-col justify-between h-[95px] group"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-black text-amber-450">⚽ تكتيك الإنهاء الهجومي</span>
                            <span className="text-[10px] font-mono text-rose-500 font-bold">-15% لياقة</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">تطوير مهارات OVR للتسديد بلمسة واحدة والتحرك الفعّال أمام الشباك.</p>
                        </button>

                        <button
                          onClick={() => handleTrainPlayStyle(trainingPlayer.id, 'passing')}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-500/20 p-2.5 rounded-lg text-right transition flex flex-col justify-between h-[95px] group"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-black text-emerald-450">🎯 صناعة وتمرير التيكي تاكا</span>
                            <span className="text-[10px] font-mono text-rose-500 font-bold">-15% لياقة</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">تحسين مستويات صانعي الألعاب ودقة التمرير القصيرة والهندسة التكتيكية.</p>
                        </button>

                        <button
                          onClick={() => handleTrainPlayStyle(trainingPlayer.id, 'defending')}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-500/20 p-2.5 rounded-lg text-right transition flex flex-col justify-between h-[95px] group"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-black text-sky-450">🛡️ الرقابة والالتحام الدفاعي</span>
                            <span className="text-[10px] font-mono text-rose-500 font-bold font-bold">-15% لياقة</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">تعزيز تكتيك الرقابة اللصيقة والافتكاك الجسدي الصلب للهجمات المرتدة.</p>
                        </button>

                        <button
                          onClick={() => handleTrainPlayStyle(trainingPlayer.id, 'conditioning')}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-505/20 p-2.5 rounded-lg text-right transition flex flex-col justify-between h-[95px] group"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-black text-pink-400">💪 تمرين الجاهزية والكومبو</span>
                            <span className="text-[10px] font-mono text-rose-500 font-bold font-bold">-5% لياقة</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">تحفيز مستويات المرونة الكامنة لسرعة التطور البدني والروحي (+2 POT).</p>
                        </button>
                      </div>

                      {/* Training assistance logs */}
                      <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg flex flex-col gap-1 h-[100px] overflow-y-auto">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase block border-b border-zinc-900 pb-1 font-mono">سجل التدريبات للمكتب الفني:</span>
                        {coachingLogs.map((log, lIdx) => (
                          <p key={lIdx} className="text-[10px] text-zinc-350 font-mono leading-relaxed">
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6 text-right" dir="rtl">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-rose-555 text-rose-500 animate-pulse" />
                مركز الاستشفاء وعيادة التأهيل الطبي المتقدمة 🏥
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                انقل نجوم فريقك المجهدين والمنهكين لبروتوكول العلاج الطبيعي لاستجرار طاقتهم الكاملة قبل المباراة القادمة مقابل التكلفة المالية المطلوبة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Fatigue squad check lists */}
              <div className="md:col-span-5 bg-zinc-955/80 border border-zinc-800 p-3 rounded-xl flex flex-col gap-2 max-h-[350px] overflow-y-auto">
                <span className="text-[10px] text-rose-455 text-rose-400 font-bold uppercase tracking-wider block border-b border-zinc-800 pb-1.5 mb-1 text-center font-mono">سجل جاهزية اللياقة البدنية والقلب:</span>
                {sortedPlayers.map(p => {
                  const isLow = p.fitness < 50;
                  const isMid = p.fitness >= 50 && p.fitness < 80;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTrainingPlayerId(p.id)}
                      className={`flex flex-col p-2 rounded-lg text-right transition border ${
                        selectedTrainingPlayerId === p.id 
                          ? 'bg-rose-950/40 border-rose-500/55 text-white font-bold' 
                          : 'bg-zinc-900/40 border-zinc-900 text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold leading-normal">{p.name} ({p.position})</span>
                        <span className={`text-[10px] font-mono font-bold ${isLow ? 'text-rose-500 animate-pulse' : isMid ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.fitness}% للياقة
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-zinc-950 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isLow ? 'bg-gradient-to-r from-rose-600 to-rose-500' : isMid ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${p.fitness}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action panels for clinical recovery slots */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {(() => {
                  const patient = players.find(p => p.id === selectedTrainingPlayerId);
                  if (!patient) {
                    return (
                      <div className="bg-zinc-950/40 p-12 text-center rounded-xl text-xs text-zinc-500 italic">
                        يرجى تحديد اللاعب المنهك من الجانب الأيمن للمعاينة وحقن المغذيات الطبية له.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                      {/* Active patient diagnosis */}
                      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-900 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-zinc-550 font-mono">الجهاز الطبي • المعاينة السريرية:</p>
                          <h4 className="text-sm font-extrabold text-white">{patient.name}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">اللياقة البدنية: {patient.fitness}% • المعنويات والتركيز: {patient.morale}%</p>
                        </div>
                        <div className="text-left shrink-0">
                          {patient.fitness < 60 ? (
                            <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded font-bold animate-pulse inline-block">
                              بحاجة علاجية فورية 🚨
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold inline-block">
                              مكتمل الاستشفاء والقلب ✅
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Physio protocols queues */}
                      <div className="space-y-2.5">
                        {recoveryProtocols.map(protocol => (
                          <div 
                            key={protocol.id} 
                            className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-850 hover:border-rose-500/15 transition flex items-center justify-between"
                          >
                            <div className="flex-1 max-w-[65%]">
                              <p className="text-xs font-black text-white">{protocol.name}</p>
                              <p className="text-[9px] text-zinc-450 leading-relaxed mt-0.5">{protocol.description}</p>
                              <p className="text-[10px] text-emerald-400 font-bold mt-1 font-mono">تأثير العلاج: {protocol.benefit}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <button
                                onClick={() => handleTriggerPhysioService(patient.id, protocol.id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] sm:text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-md hover:scale-103"
                              >
                                {protocol.cost > 0 ? `خصم £${protocol.cost}M 💰` : 'تفعيل مجاني'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Medical logs feedback queue console */}
                      <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg flex flex-col gap-1 h-[100px] overflow-y-auto">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase block border-b border-zinc-900 pb-1 font-mono">سجل غرف الاستشفاء الطبي:</span>
                        {medicalLogs.map((log, lIdx) => (
                          <p key={lIdx} className="text-[10px] text-zinc-350 font-mono leading-relaxed">
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
