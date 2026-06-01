import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Landmark, Settings, Flame, MessageSquare, ArrowRight, Save, 
  HelpCircle, Sparkles, Sliders, Play, ChevronRight, CheckCircle2, AlertCircle, 
  RefreshCcw, Star, Compass, ClipboardList, MapPin, Coins, Heart, Gauge, BarChart3, Radio,
  Download, Upload, Database, Smartphone, FileJson, Edit3, Layers
} from 'lucide-react';
import { GameState, Club, Player } from '../types';

interface GDDProps {
  onBackToGame?: () => void;
  userClubName?: string;
  userClubBudget?: number;
  gameState?: GameState | null;
  setGameState?: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export default function GameDesignDocument({ onBackToGame, userClubName = "ريد بول لايبزيغ", userClubBudget = 80, gameState, setGameState }: GDDProps) {
  const [activeSection, setActiveSection] = useState<'vision' | 'tactics' | 'transfers' | 'youth' | 'management' | 'match' | 'ai-chat' | 'datapack'>('datapack');

  // Interactive State for Section 1: UI Wireframe Explorer
  const [selectedWireframeScreen, setSelectedWireframeScreen] = useState<'lobby' | 'tactical' | 'mailbox'>('lobby');

  // =========================================================================
  // DATA PACK & APK HUB STATE & METHODS
  // =========================================================================
  const [dataPackLog, setDataPackLog] = useState<string[]>(["[نظام] تم تفعيل مستودع حزم البيانات الجاهزة. يمكنك اختيار حزمة أو تصميم حزمتك المخصصة لتطبيقها فورياً."]);
  const [datapackCustomJson, setDatapackCustomJson] = useState<string>('');
  
  // Edit mode states (for easy selection of what to edit in the existing db)
  const [activeTabSub, setActiveTabSub] = useState<'presets' | 'editor' | 'apk'>('presets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editClubId, setEditClubId] = useState<string | null>(null);
  const [editClubName, setEditClubName] = useState<string>('');
  const [editClubShortName, setEditClubShortName] = useState<string>('');
  const [editClubBudget, setEditClubBudget] = useState<number>(100);

  const [editPlayerClubId, setEditPlayerClubId] = useState<string | null>(null);
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState<string>('');
  const [editPlayerRating, setEditPlayerRating] = useState<number>(80);
  const [editPlayerPotential, setEditPlayerPotential] = useState<number>(85);

  // Preset definitions
  const realEuropeDataPack = {
    clubs: [
      { id: 'c1', name: 'Manchester United', shortName: 'MUN', budget: 140 },
      { id: 'c2', name: 'Liverpool FC', shortName: 'LIV', budget: 130 },
      { id: 'c3', name: 'Manchester City', shortName: 'MCI', budget: 200 },
      { id: 'c4', name: 'Chelsea FC', shortName: 'CHE', budget: 150 },
      { id: 'c5', name: 'Arsenal FC', shortName: 'ARS', budget: 135 },
      { id: 'c6', name: 'Real Madrid', shortName: 'RMA', budget: 180 },
      { id: 'c7', name: 'Atletico Madrid', shortName: 'ATM', budget: 90 },
      { id: 'c8', name: 'FC Barcelona', shortName: 'BAR', budget: 85 },
      { id: 'c9', name: 'Bayern Munich', shortName: 'FCB', budget: 160 },
      { id: 'c10', name: 'Paris Saint-Germain', shortName: 'PSG', budget: 220 },
      { id: 'c11', name: 'AC Milan', shortName: 'ACM', budget: 75 },
      { id: 'c12', name: 'Juventus FC', shortName: 'JUV', budget: 95 }
    ],
    players: {
      'c1': [
        { id: 'p1_1', name: 'Bruno Fernandes', rating: 88, potential: 88 },
        { id: 'p1_2', name: 'Marcus Rashford', rating: 84, potential: 85 },
        { id: 'p1_3', name: 'Rasmus Højlund', rating: 81, potential: 89 },
        { id: 'p1_4', name: 'Alejandro Garnacho', rating: 80, potential: 90 },
        { id: 'p1_5', name: 'Kobbie Mainoo', rating: 79, potential: 91 }
      ],
      'c2': [
        { id: 'p2_1', name: 'Mohamed Salah', rating: 90, potential: 90 },
        { id: 'p2_2', name: 'Virgil van Dijk', rating: 89, potential: 89 },
        { id: 'p2_3', name: 'Luis Díaz', rating: 84, potential: 85 },
        { id: 'p2_4', name: 'Alexis Mac Allister', rating: 85, potential: 88 },
        { id: 'p2_5', name: 'Trent Alexander-Arnold', rating: 86, potential: 89 }
      ],
      'c3': [
        { id: 'p3_1', name: 'Erling Haaland', rating: 91, potential: 93 },
        { id: 'p3_2', name: 'Kevin De Bruyne', rating: 91, potential: 91 },
        { id: 'p3_3', name: 'Phil Foden', rating: 89, potential: 91 },
        { id: 'p3_4', name: 'Rodri', rating: 91, potential: 92 },
        { id: 'p3_5', name: 'Bernardo Silva', rating: 88, potential: 88 }
      ],
      'c6': [
        { id: 'p6_1', name: 'Kylian Mbappé', rating: 92, potential: 94 },
        { id: 'p6_2', name: 'Jude Bellingham', rating: 90, potential: 93 },
        { id: 'p6_3', name: 'Vinícius Júnior', rating: 91, potential: 93 },
        { id: 'p6_4', name: 'Federico Valverde', rating: 88, potential: 90 },
        { id: 'p6_5', name: 'Luka Modrić', rating: 86, potential: 86 }
      ]
    }
  };

  const saudiLeagueDataPack = {
    clubs: [
      { id: 'c1', name: 'نادي الهلال السعودي', shortName: 'HIL', budget: 180 },
      { id: 'c2', name: 'نادي النصر السعودي', shortName: 'NAS', budget: 160 },
      { id: 'c3', name: 'نادي الاتحاد السعودي', shortName: 'ITT', budget: 150 },
      { id: 'c4', name: 'نادي الأهلي السعودي', shortName: 'AHL', budget: 130 },
      { id: 'c5', name: 'نادي الشباب السعودي', shortName: 'SHB', budget: 65 },
      { id: 'c6', name: 'نادي الاتفاق السعودي', shortName: 'ETF', budget: 55 },
      { id: 'c7', name: 'نادي القادسية السعودي', shortName: 'QAD', budget: 90 },
      { id: 'c8', name: 'نادي التعاون السعودي', shortName: 'COW', budget: 40 },
      { id: 'c9', name: 'نادي الرائد السعودي', shortName: 'RAI', budget: 35 },
      { id: 'c10', name: 'نادي الرياض السعودي', shortName: 'RYD', budget: 30 },
      { id: 'c11', name: 'نادي الفيحاء السعودي', shortName: 'FIH', budget: 28 },
      { id: 'c12', name: 'نادي الأخدود السعودي', shortName: 'OKH', budget: 25 }
    ],
    players: {
      'c1': [
        { id: 'p1_1', name: 'Neymar Jr', rating: 88, potential: 88 },
        { id: 'p1_2', name: 'Aleksandar Mitrović', rating: 84, potential: 85 },
        { id: 'p1_3', name: 'Malcom', rating: 82, potential: 83 },
        { id: 'p1_4', name: 'Yassine Bounou', rating: 85, potential: 85 },
        { id: 'p1_5', name: 'Rúben Neves', rating: 84, potential: 86 }
      ],
      'c2': [
        { id: 'p2_1', name: 'Cristiano Ronaldo', rating: 87, potential: 87 },
        { id: 'p2_2', name: 'Sadio Mané', rating: 83, referral: 83, potential: 83 },
        { id: 'p2_3', name: 'Aymeric Laporte', rating: 84, potential: 84 },
        { id: 'p2_4', name: 'Otávio', rating: 81, potential: 82 },
        { id: 'p2_5', name: 'Marcelo Brozović', rating: 83, potential: 83 }
      ],
      'c3': [
        { id: 'p3_1', name: 'Karim Benzema', rating: 86, potential: 86 },
        { id: 'p3_2', name: 'N\'Golo Kanté', rating: 84, potential: 84 },
        { id: 'p3_3', name: 'Moussa Diaby', rating: 83, potential: 86 },
        { id: 'p3_4', name: 'Fabinho', rating: 81, potential: 82 },
        { id: 'p3_5', name: 'Houssem Aouar', rating: 79, potential: 81 }
      ]
    }
  };

  useEffect(() => {
    setDatapackCustomJson(JSON.stringify(realEuropeDataPack, null, 2));
  }, []);

  const handleApplyPreset = (type: 'europe' | 'saudi') => {
    const pack = type === 'europe' ? realEuropeDataPack : saudiLeagueDataPack;
    setDatapackCustomJson(JSON.stringify(pack, null, 2));
    
    if (!gameState || !setGameState) {
      setDataPackLog(prev => [
        `[تحذير] لم يتم تشغيل لعبة فعلية بعد. تم تحميل حزمة ${type === 'europe' ? 'النخبة الأوروبية' : 'روشن السعودي'} في نافذة المسودة. قم بالدخول للعبة أولا لتطبيقها!`,
        ...prev
      ]);
      return;
    }

    try {
      const newState: GameState = JSON.parse(JSON.stringify(gameState));
      
      pack.clubs.forEach(packClub => {
        const club = newState.clubs.find(c => c.id === packClub.id);
        if (club) {
          club.name = packClub.name;
          club.shortName = packClub.shortName;
          club.budget = packClub.budget;
        }
      });

      Object.entries(pack.players).forEach(([clubId, packPlayers]) => {
        const clubSquad = newState.playersByClub[clubId];
        if (clubSquad) {
          packPlayers.forEach((packP, index) => {
            if (clubSquad[index]) {
              clubSquad[index].name = packP.name;
              clubSquad[index].rating = packP.rating;
              clubSquad[index].potential = packP.potential;
            }
          });
        }
      });

      setGameState(newState);
      setDataPackLog(prev => [
        `[نجاح] تم تطبيق حزمة بيانات (${type === 'europe' ? 'الدوريات الأوروبية الكبرى' : 'دوري روشن السعودي والصفقات النارية'}) بنجاح على التشكيلة والمنافسين بالكامل! يمكنك مراجعة ذلك بالمكتب الآن.`,
        ...prev
      ]);
    } catch (err: any) {
      setDataPackLog(prev => [`[خطأ] فشل تطبيق حزمة البيانات: ${err.message}`, ...prev]);
    }
  };

  const handleApplyCustomJson = () => {
    if (!gameState || !setGameState) {
      setDataPackLog(prev => ["[تحذير] لم يتم العثور على لعبة نشطة. يرجى الدخول لطور اللعب أولاً ثم المحاولة لتطبيق التعديلات الحية.", ...prev]);
      return;
    }

    try {
      const parsed = JSON.parse(datapackCustomJson);
      if (!parsed.clubs || !Array.isArray(parsed.clubs)) {
        throw new Error("بُنية JSON غير سليمة: يجب أن تحتوي الحزمة على مصفوفة الأندية 'clubs'.");
      }

      const newState: GameState = JSON.parse(JSON.stringify(gameState));

      parsed.clubs.forEach((pClub: any) => {
        const club = newState.clubs.find((c: any) => c.id === pClub.id);
        if (club) {
          if (pClub.name) club.name = pClub.name;
          if (pClub.shortName) club.shortName = pClub.shortName;
          if (typeof pClub.budget === 'number') club.budget = pClub.budget;
        }
      });

      if (parsed.players && typeof parsed.players === 'object') {
        Object.entries(parsed.players).forEach(([clubId, squadPlayers]: [string, any]) => {
          const clubSquad = newState.playersByClub[clubId];
          if (clubSquad && Array.isArray(squadPlayers)) {
            squadPlayers.forEach((packP: any, index: number) => {
              if (clubSquad[index]) {
                if (packP.name) clubSquad[index].name = packP.name;
                if (typeof packP.rating === 'number') clubSquad[index].rating = packP.rating;
                if (typeof packP.potential === 'number') clubSquad[index].potential = packP.potential;
              }
            });
          }
        });
      }

      setGameState(newState);
      setDataPackLog(prev => ["[نجاح] تم تطبيق حزمة بيانات JSON المخصصة وحفظ الأسماء المحدثة فورياً على الـ Game state الخاص بالنادي!", ...prev]);
    } catch (err: any) {
      setDataPackLog(prev => [`[خطأ] تنسيق JSON غير دقيق أو خاطئ: ${err.message}`, ...prev]);
    }
  };

  const handleExportDataPackToFile = () => {
    let outputObj: any = { clubs: [], players: {} };

    if (gameState) {
      outputObj.clubs = gameState.clubs.map(c => ({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        budget: c.budget
      }));

      Object.entries(gameState.playersByClub).forEach(([clubId, squad]) => {
        outputObj.players[clubId] = squad.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          potential: p.potential
        }));
      });
    } else {
      outputObj = realEuropeDataPack;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outputObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "world_soccer_datapack.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDataPackLog(prev => ["[نظام] تم توليد وتحميل ملف 'world_soccer_datapack.json' بنجاح. يمكنك مشاركته مع محبي اللعبة الآخرين لتثبيته في أجهزتهم!", ...prev]);
  };

  const handleSaveClubEdit = () => {
    if (!gameState || !setGameState || !editClubId) return;

    const newState: GameState = JSON.parse(JSON.stringify(gameState));
    const club = newState.clubs.find(c => c.id === editClubId);
    if (club) {
      club.name = editClubName;
      club.shortName = editClubShortName;
      club.budget = editClubBudget;
      setGameState(newState);
      setDataPackLog(prev => [`[تعديل] تم تحديث اسم الفريق (${editClubName}) والميزانية بنجاح على التشكيلة!`, ...prev]);
      setEditClubId(null);
    }
  };

  const handleSavePlayerEdit = () => {
    if (!gameState || !setGameState || !editPlayerId || !editPlayerClubId) return;

    const newState: GameState = JSON.parse(JSON.stringify(gameState));
    const squad = newState.playersByClub[editPlayerClubId];
    if (squad) {
      const player = squad.find(p => p.id === editPlayerId);
      if (player) {
        player.name = editPlayerName;
        player.rating = editPlayerRating;
        player.potential = editPlayerPotential;
        setGameState(newState);
        setDataPackLog(prev => [`[تعديل] تم تحديث بيانات اللاعب (${editPlayerName}) وتثبيت التقييم بنجاح!`, ...prev]);
        setEditPlayerId(null);
        setEditPlayerClubId(null);
      }
    }
  };

  // Interactive State for Section 2: Tactical Engine
  const [tacticalStyle, setTacticalStyle] = useState<'tiki-taka' | 'gegenpress' | 'counter' | 'park-bus'>('tiki-taka');
  const [gkCoachRating, setGkCoachRating] = useState<number>(3);
  const [defCoachRating, setDefCoachRating] = useState<number>(4);
  const [midCoachRating, setMidCoachRating] = useState<number>(3);
  const [attCoachRating, setAttCoachRating] = useState<number>(5);
  const [teamCohesion, setTeamCohesion] = useState<number>(75);

  // Calculated Tactical Chemistry
  const calculateTacticalChemistry = () => {
    let base = 50;
    if (tacticalStyle === 'tiki-taka') base += 15;
    if (tacticalStyle === 'gegenpress') base += 20;
    if (tacticalStyle === 'counter') base += 10;
    if (tacticalStyle === 'park-bus') base += 5;

    const coachAverage = (gkCoachRating + defCoachRating + midCoachRating + attCoachRating) / 4;
    base += coachAverage * 5;
    base += (teamCohesion * 0.2);
    return Math.min(100, Math.round(base));
  };

  // Interactive State for Section 3: Cinematic Negotiation
  const [playerValue, setPlayerValue] = useState<number>(35); // in Millions
  const [bidOffer, setBidOffer] = useState<number>(30); // in Millions
  const [wageOffer, setWageOffer] = useState<number>(120); // k/wk
  const [hasReleaseClause, setHasReleaseClause] = useState<boolean>(true);
  const [cleanSheetBonus, setCleanSheetBonus] = useState<boolean>(true);
  const [negotiationResult, setNegotiationResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'COUNTER' | 'REJECTED';
    message: string;
    metrics?: { satisfaction: number; boardOpinion: number };
  }>({ status: 'IDLE', message: 'قم بضبط العرض المالي ثم اضغط على "تقديم العرض إلى وكيل اللاعب" لمحاكاة المفاوضات السينمائية.' });

  const handleSimulateNegotiations = () => {
    const offerRatio = bidOffer / playerValue;
    let satisfaction = 0;
    let boardOpinion = 100;

    // Offer ratio impacts
    if (offerRatio >= 1.2) satisfaction += 40;
    else if (offerRatio >= 1.0) satisfaction += 25;
    else if (offerRatio >= 0.85) satisfaction += 10;
    else satisfaction -= 30;

    // Wage impact (base expectations are ~110k for 35M player)
    const expectedWage = playerValue * 3 + 5; 
    const wageRatio = wageOffer / expectedWage;
    if (wageRatio >= 1.15) satisfaction += 35;
    else if (wageRatio >= 0.9) satisfaction += 15;
    else satisfaction -= 25;

    if (hasReleaseClause) satisfaction += 10;
    if (cleanSheetBonus) satisfaction += 10;

    // Board opinion is high if we spent less than value
    boardOpinion = Math.round(100 - (offerRatio - 1.0) * 50 - (wageRatio - 1.0) * 30);
    boardOpinion = Math.max(10, Math.min(100, boardOpinion));

    if (satisfaction >= 50) {
      setNegotiationResult({
        status: 'SUCCESS',
        message: 'تم قبول العرض والاتفاق بنجاح! صفقة ممتازة تمت بطابع سينمائي مع وكيل اللاعب. لقد أشاد الوكيل باحترافيتك في توزيع الحوافز المالية.',
        metrics: { satisfaction: Math.min(100, 70 + satisfaction / 3), boardOpinion }
      });
    } else if (satisfaction >= 15) {
      const counterBid = Math.round(playerValue * 1.05 * 10) / 10;
      const counterWage = Math.round(expectedWage * 1.05);
      setNegotiationResult({
        status: 'COUNTER',
        message: `الوكيل يرفض عرضك الحالي لكنه يقدم عرضاً مضاداً (Counter-Offer): يطالب بمبلغ انتقال لا يقل عن £${counterBid}M وراتب أسبوعي قدره £${counterWage}k لتجنب مغادرة طاولة المفاوضات.`,
        metrics: { satisfaction: Math.min(100, 45 + satisfaction), boardOpinion }
      });
    } else {
      setNegotiationResult({
        status: 'REJECTED',
        message: 'فشلت المفاوضات تماماً! غادر وكيل اللاعب الغرفة فوراً معتبراً العرض مهيناً لقيمة موكله الرياضية. لن تتمكن من التفاوض معه مرة أخرى هذا الموسم.',
        metrics: { satisfaction: Math.max(0, 10 + satisfaction), boardOpinion }
      });
    }
  };

  // Interactive State for Section 4: Youth Academy
  const [selectedYouthPlayer, setSelectedYouthPlayer] = useState<{
    name: string;
    age: number;
    position: 'DEF' | 'MID' | 'ATT';
    currentOvr: number;
    potential: number;
    weakFoot: number;
    physicality: number;
  }>({
    name: "ياسين الخالدي",
    age: 16,
    position: "MID",
    currentOvr: 62,
    potential: 89,
    weakFoot: 3,
    physicality: 58
  });

  const [developmentPlan, setDevelopmentPlan] = useState<'reposition' | 'weakfoot' | 'fitness' | 'balanced'>('balanced');

  const calculateDevelopmentOutcome = () => {
    let weeks = 0;
    let attributeUpgraded = "";
    let finalPotential = selectedYouthPlayer.potential;

    if (developmentPlan === 'reposition') {
      weeks = Math.round(24 - (selectedYouthPlayer.currentOvr * 0.15));
      attributeUpgraded = "تغيير المركز إلى (جناح مهاجم) + زيادة دقة التمريرات الطولية بنسبة +8";
    } else if (developmentPlan === 'weakfoot') {
      weeks = 16;
      attributeUpgraded = "ترقية النجم للقدم الضعيفة لتصبح 4★ نجوم بدلاً من 3★";
    } else if (developmentPlan === 'fitness') {
      weeks = 8;
      attributeUpgraded = "اللياقة البدنية وقوة التحمل +15، التسارع الهجومي +6";
    } else {
      weeks = 12;
      attributeUpgraded = "رفع التقييم الإجمالي (OVR) بمقدار +2 بشكل متوازن لجميع السمات";
    }

    return { weeks, attributeUpgraded, finalPotential };
  };

  // Interactive State for Section 5: Press Conference & Locker Room
  const [selectedPressQuestionId, setSelectedPressQuestionId] = useState<number>(0);
  const [pressConferenceMetrics, setPressConferenceMetrics] = useState({
    morale: 65,
    boardTrust: 70,
    fanSatisfaction: 60
  });
  const [lastAnswerCommentary, setLastAnswerCommentary] = useState<string>("اختر أحد الأسئلة المطروحة ثم حدد إجابتك لقياس تداعياتها الفورية.");

  const pressQuestions = [
    {
      id: 0,
      question: "مرحباً كوتش، تعرّض هذا النجم الشاب بالفريق لصافرات استهجان بعد تراجع مستواه بالآونة الأخيرة. هل ستبقيه في التشكيلة الأساسية؟",
      answers: [
        { text: "سأواصل دعمه وإشراكه أساسياً كونه ركيزة للمستقبل.", moraleEffect: 15, boardEffect: -5, fanEffect: 5, comment: "ارتفعت معنويات اللاعب الشاب بشكل هائل، وصار يثق بك، بينما أبدت الإدارة بعض الحذر من تكرار خسارة النقاط." },
        { text: "اللاعب يمر بفترة صعبة وسيتم إجلاسه على دكة البدلاء فوراً.", moraleEffect: -15, boardEffect: 5, fanEffect: 12, comment: "غضب اللاعب وتراجعت معنوياته، لكن الجماهير شعرت بالرضا لرؤيتها حزماً تكتيكياً ومحاسبة على الأداء." },
        { text: "الأداء الجماعي هو المسؤول ولا نلقي باللوم على فرد واحد.", moraleEffect: 5, boardEffect: 5, fanEffect: 0, comment: "إجابة متزنة عززت تماسك غرفة الملابس قليلاً وأثبتت هدوء عاصفة الصحافة." }
      ]
    },
    {
      id: 1,
      question: "أبدى رئيس مجلس الإدارة ارتياحه تجاه ميزانية النادي، لكن الجماهير تتساءل لم لا نرى صفقات نارية سوبرستار هذا الشتاء؟",
      answers: [
        { text: "تركيزنا منصب على بناء أكاديمية مستدامة بدلاً من تبذير الملايين.", moraleEffect: 8, boardEffect: 15, fanEffect: -10, comment: "قفزت ثقة الإدارة بمشروعك المستدام، بينما عبر مشجعو النادي على السوشيال ميديا عن خيبتهم الشديدة لغياب صفقات رنانة." },
        { text: "نحن في مفاوضات مستمرة وسندعم النادي بصفقة تاريخية تهز الدوري.", moraleEffect: 5, boardEffect: -15, fanEffect: 20, comment: "فوران من الحماس الجماهيري زاد مبيعات التذاكر، بينما انزعج رئيس مجلس الإدارة وضغط عليك خوفاً من الالتزامات المالية الطائلة!" },
        { text: "نحن نثق بالتشكيلة الحالية ولا نحتاج لشراء أي لاعب إضافي.", moraleEffect: 12, boardEffect: 8, fanEffect: -5, comment: "ارتفعت معنويات وثقة اللاعبين الحاليين بكثير لشعورهم بالتقدير والاطمئنان على مقاعدهم." }
      ]
    }
  ];

  const handleSelectAnswer = (morale: number, board: number, fan: number, comment: string) => {
    setPressConferenceMetrics(prev => ({
      morale: Math.max(0, Math.min(100, prev.morale + morale)),
      boardTrust: Math.max(0, Math.min(100, prev.boardTrust + board)),
      fanSatisfaction: Math.max(0, Math.min(100, prev.fanSatisfaction + fan))
    }));
    setLastAnswerCommentary(comment);
  };

  // Interactive State for Section 6: Match Simulation Speed Sandbox
  const [tacticalInstinct, setTacticalInstinct] = useState<'aggressive' | 'balanced' | 'defensive'>('balanced');
  const [goalFreqMultiplier, setGoalFreqMultiplier] = useState<number>(1.2);
  const [possessionWeight, setPossessionWeight] = useState<number>(55);
  const [simInProgress, setSimInProgress] = useState<boolean>(false);
  const [sandboxMatchLog, setSandboxMatchLog] = useState<string[]>([]);

  const handleSimulateSandboxMatch = () => {
    setSimInProgress(true);
    setSandboxMatchLog(["[دقيقة 1] 🟢 انطلاق صافرة البداية في محاكي الشفرة التكتيكية..."]);
    
    setTimeout(() => {
      let logs = ["[دقيقة 1] 🟢 انطلاق صافرة البداية في محاكي المباراة التكتيكية."];
      
      // Minute 23
      if (possessionWeight > 50) {
        logs.push(`[دقيقة 23] ⚽ هدف رائع للمدرب! أسلوب الاستحواذ بنسبة ${possessionWeight}% يخلق مساحة مثالية في دفاع الخصم يترجمها الجناح لهدف ممتاز.`);
      } else {
        logs.push("[دقيقة 23] ⚠️ تمريرات مقطوعة في وسط الملعب للضغط المستمر، والخصم يهدد القائم بأسلوب مباشر.");
      }

      // Minute 45+
      logs.push("[دقيقة 45] 🏁 نهاية الشوط الأول بإحصاءات تكتيكية متناسقة وإعطاء توجيهات غرف الملابس.");

      // Minute 75
      if (tacticalInstinct === 'aggressive') {
        logs.push(`[دقيقة 75] 🟥 تدخل هجومي متهور للضغط العالي بالخطط المستمرة! إصابة طفيفة للمدافع وبطاقة صفراء تثير قلق الطاقم المช่วย.`);
      } else if (tacticalInstinct === 'defensive') {
        logs.push("[دقيقة 75] 🛡️ دفاع منظم من كتلة منخفضة (Low Block) يحبط جميع الكرات الهوائية للمنافس لضمان النتيجة.");
      } else {
        logs.push("[دقيقة 75] 🔄 تبادل سريع للمراكز وتمريرات بين الخطوط لإبقاء نسق اللعب ثابتاً وسلساً.");
      }

      // Minute 90
      const finalGoalRoll = Math.random() * goalFreqMultiplier;
      if (finalGoalRoll > 1.3) {
        logs.push(`[دقيقة 88] ⚽ قذيفة مدوية بعيدة المدى مستغلة توجيهات الهجمات المرتدة تنهي آمال الضيوف وتثير حماس المدرجات!`);
      }
      logs.push("[دقيقة 90] 🏁 نهاية المباراة بنجاح وبناء تقرير تكتيكي متقدم للمحللين الفنيين.");

      setSandboxMatchLog(logs);
      setSimInProgress(false);
    }, 1800);
  };

  // Chat with Lead Game Designer state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'designer'; text: string }>>([
    {
      sender: 'designer',
      text: "أهلاً بك يا كوتش! أنا رئيس مصممي لطور مهنة المدرب (Lead Game Designer). يسعدني جداً الإجابة على أي أسئلة فنية أو تفاصيل تصميمية حول آليات ومميزات اللعبة المستوحاة من [FC 26]. اسألني عن المعادلات الرياضية للتطوير، أو آلية عمل محرك المحاكاة، أو حتى كيفية ضبط المساعدين الفنيين وتأثير نظام الـ FC IQ!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Trigger Gemini AI Chat inside GDD
  const handleSendChatToAI = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userQuery = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: userQuery }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Call server side Gemini endpoint
      const response = await fetch('/api/chat-gdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQuery })
      });
      
      const data = await response.json();
      if (data.reply) {
        setChatLog(prev => [...prev, { sender: 'designer', text: data.reply }]);
      } else {
        setChatLog(prev => [...prev, { sender: 'designer', text: "عذراً يا كوتش، تلقيت استجابة فارغة من خادم التصميم الفني. هل تود المحاولة مرة أخرى؟" }]);
      }
    } catch (e) {
      // Mock realistic design fallback in case server or key is temporarily not configured
      setTimeout(() => {
        let fallbackReply = `تصميم ذكي ومحكم! بخصوص استفسارك عن "${userQuery}": في وثيقتنا الفنية لـ FC 26، نقوم بتنظيم هذا الأمر رياضياً من خلال صياغة مصفوفة احتمالية مخصصة. إذا كان هدفك تطبيق ذلك تكتيكياً، ننصح باستخدام بنية JSON كالتالي لتخزين معاملات الضبط ونقلها عبر محاكاة المباريات:
\`\`\`json
{
  "system_identifier": "FFP_COMPLIANCE_ENGINE",
  "board_expectation_weight": 0.85,
  "dynamic_parameters": {
    "wage_to_turnover_ratio_limit": 0.70,
    "penalty_transfer_ban_weeks": 24,
    "luxury_tax_multiplier": 1.5
  }
}
\`\`\`
يمكن لهذه المعادلات الارتباط مباشرة بقاعدة بيانات اللاعبين لخفض الرغبات التعاقدية للوكلاء عند تخطي الحدود المسموحة. هل ترغب بأن نقوم بتخصيص هذا النظام للأكاديمية أم للانتقالات الشتوية؟`;
        setChatLog(prev => [...prev, { sender: 'designer', text: fallbackReply }]);
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-850 shadow-2xl p-6 md:p-8 selection:bg-emerald-500 selection:text-zinc-950 font-sans" dir="rtl">
      
      {/* HEADER SECTION */}
      <div className="border-b border-zinc-850 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              وثيقة التصميم الفنية الرسمية (GDD)
            </span>
            <span className="text-[10px] bg-zinc-850 text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full font-bold">
              مجهزة ومحدثة لـ V2.6
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            مستند تصميم طور "مهنة المدرب" (Manager Career Mode)
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            دليل هيكلي شامل ومفصل للآليات والواجهات ومحركات المحاكاة التكتيكية المستوحاة من أسلوب لعبة [FC 26] مع أدوات اختبار تفاعلية ونظام استشارة مدمج بالذكاء الاصطناعي للمطورين.
          </p>
        </div>

        {onBackToGame && (
          <button
            onClick={onBackToGame}
            className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black px-6 py-2.5 rounded-xl text-xs transition shadow-lg tracking-wider shrink-0 uppercase flex items-center gap-2"
          >
            <span>الدخول لطور المحاكاة التفاعلية 🎮</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE BAR NAVIGATION */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest px-3">الفصول التصميمية للوثيقة</div>
          
          <button
            onClick={() => setActiveSection('vision')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'vision' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>1. الرؤية العامة للطور</div>
              <div className="text-[9px] text-zinc-500 font-normal">Core Vision & Interfaces</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('tactics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'tactics' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>2. الهوية التكتيكية المتقدمة</div>
              <div className="text-[9px] text-zinc-500 font-normal">Advanced Tactical System</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('transfers')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'transfers' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>3. سوق الانتقالات والمفاوضات</div>
              <div className="text-[9px] text-zinc-500 font-normal">Cinematic Transfers</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('youth')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'youth' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>4. أكاديمية الشباب والتطوير</div>
              <div className="text-[9px] text-zinc-500 font-normal">Youth Academy Growth</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('management')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'management' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>5. إدارة غرف الملابس والإعلام</div>
              <div className="text-[9px] text-zinc-500 font-normal">Man Management & Press</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('match')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'match' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>6. أنظمة محاكاة المباريات</div>
              <div className="text-[9px] text-zinc-500 font-normal">Match Sim Options</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('datapack')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'datapack' ? 'bg-zinc-900 border border-emerald-500/30 text-white shadow' : 'text-zinc-450 hover:bg-zinc-900/45 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-450 shrink-0" />
            <div className="flex-1">
              <div>7. حزم البيانات وملف الـ APK</div>
              <div className="text-[9px] text-zinc-500 font-normal">Data Pack & APK Hub</div>
            </div>
          </button>

          <div className="border-t border-zinc-900 my-4"></div>

          <button
            onClick={() => setActiveSection('ai-chat')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeSection === 'ai-chat' ? 'bg-emerald-950/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-900 text-emerald-450 hover:bg-zinc-850 hover:text-emerald-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-450 shrink-0 animate-pulse" />
            <div className="flex-1">
              <div>💬 استشارة الذكاء الاصطناعي</div>
              <div className="text-[9px] text-zinc-500 font-normal">AI Game Designer Bot</div>
            </div>
          </button>
        </div>

        {/* DETAILS SECTION AREA */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* =======================================================
              SECTION 1: CORE VISION
              ======================================================= */}
          {activeSection === 'vision' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Compass className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">1. الرؤية العامة للطور (Core Vision)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    <strong>الرسالة التصميمية الأساسية:</strong> تهدف التجربة لمجاراة الواقع الفعلي لإدارة أندية كرة القدم النخبوية، بتمكين اللاعب من الموازنة بين العبقرية التكتيكية داخل الرقعة العشبية والاستدامة المالية وصناعة النجوم خارجها. يعيش اللاعب محاكاة يومية مستمرة، حيث يؤثر أي قرار صحفي أو مالي على ثقة الإدارة وولاء اللاعبين.
                  </p>

                  <h3 className="font-bold text-white text-base mt-6 text-emerald-405 border-r-2 border-emerald-500 pr-2">الواجهات الأساسية للعبة ولماذا تم تصميمها:</h3>
                  <ul className="list-disc list-inside space-y-2 pr-4 text-zinc-350">
                    <li>
                      <strong className="text-white">مكتب المدرب (Manager Office):</strong> يمثل العصب المركزي للتحكم. يعرض لوحة تحكم سريعة (Dashboard) تشمل جدول الترتيب الحالي للدوري، إشعار للمباراة القادمة، الملخص المالي للخزينة والرواتب، وشاشة تفصيلية لدراسة قدرة التشكيلة البدنية.
                    </li>
                    <li>
                      <strong className="text-white">مركز التكتيك المتقدم (FC IQ Tactical Panel):</strong> تم تصميمه بواجهة بصرية تفاعلية تجسد الملعب التدريبي. لا يكتفي بعرض التشكيلة كلاعبين على الخريطة العشوائية، بل يقدم إمكانية التحديد الديناميكي لأدوارهم وربطها تكتيكياً بأسلوب الكوتش لزيادة مستويات التثبيت وتجنب الثغرات الدفاعية.
                    </li>
                    <li>
                      <strong className="text-white">صندوق COMMUNICATIONS البريد الوارد (Inbox):</strong> واجهة سيناريوهات تفاعلية يتم تغذيتها برمجياً برسائل حية ومباشرة من رئيس مجلس الإدارة (تمثل التوقعات)، كشافين النادي المحترفين (تقارير المواهب)، والمستشار المالي (تحذيرات الموازنة وعروض الاستثمار).
                    </li>
                  </ul>
                </div>
              </div>

              {/* Interactive Widget for Section 1 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-amber-500">
                  <Sliders className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase text-white">أداة تفاعلية: مستكشف الـ Wireframe والتصميم البرمجي للواجهات</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  انقر على خيارات الواجهة التخطيطية أدناه لاستكشاف المكونات الفنية البرمجية وهيكل ردود الأفعال الخاص بكل واجهة من واجهات اللعبة:
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
                  <button
                    onClick={() => setSelectedWireframeScreen('lobby')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition ${selectedWireframeScreen === 'lobby' ? 'bg-zinc-850 text-white' : 'text-zinc-500'}`}
                  >
                    مكتب المدرب Dashboard
                  </button>
                  <button
                    onClick={() => setSelectedWireframeScreen('tactical')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition ${selectedWireframeScreen === 'tactical' ? 'bg-zinc-850 text-white' : 'text-zinc-500'}`}
                  >
                    مركز التكيك
                  </button>
                  <button
                    onClick={() => setSelectedWireframeScreen('mailbox')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition ${selectedWireframeScreen === 'mailbox' ? 'bg-zinc-850 text-white' : 'text-zinc-500'}`}
                  >
                    البريد الوارد Inbox
                  </button>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
                  {selectedWireframeScreen === 'lobby' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-emerald-400 border-b border-zinc-850 pb-2">
                        <span>المكون البرمجي: <code>ClubDashboard.tsx</code></span>
                        <span>حالة البيانات: <code>GameState</code></span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        مكتب المدرب يعرض لوحة بصرية بها إحصاءات متناهية الدقة، منها معامل التعبيرات والجاهزية البدنية للاعبين لتجنب الإصابة بالرباط الصليبي في حالة خوض 4 مباريات متتالية.
                      </p>
                      <div className="bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-400 space-y-1">
                        <div><strong>العناصر البصرية:</strong> جدول ترتيب تفاعلي + بطاقات الإحصاء الرياضي السريع.</div>
                        <div><strong>وظائف الزر الرئيسي:</strong> الانتقال الفوري لخطة المباراة القادمة أو التقدم أسبوعياً بالتقويم.</div>
                      </div>
                    </div>
                  )}

                  {selectedWireframeScreen === 'tactical' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-emerald-400 border-b border-zinc-850 pb-2">
                        <span>المكون البرمجي: <code>TacticsScreen.tsx</code></span>
                        <span>مصفوفة تكتيكية: <code>FormationType</code></span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        مخطط الملعب العشبي الافتراضي ثنائي الأبعاد لعقد تبديلات تكتيكية سريعة وسحب وتبديل مواقع اللاعبين بسلاسة لتحديث الهرم الهيكلي (٤-٤-٢ أو ٤-٣-٣).
                      </p>
                      <div className="bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-400 space-y-1">
                        <div><strong>العناصر البصرية:</strong> رقعة الملعب الخضراء + قائمة بطاقات اللاعبين مع مؤشر اللياقة والجاهزية.</div>
                        <div><strong>إحداثيات التعديل:</strong> تأثير كابتن الفريق وصناع القرار على معنويات زملاء الخط.</div>
                      </div>
                    </div>
                  )}

                  {selectedWireframeScreen === 'mailbox' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-emerald-400 border-b border-zinc-850 pb-2">
                        <span>نموذج تخزيني: <code>InboxMessage[]</code></span>
                        <span>عقدة المحاكاة: <code>handleNextWeekTurn</code></span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        صندوق محايد يولد بريداً يحمل طابعاً تنظيمياً هادفاً. يقوم بإرغام المدرب على الاستجابة لعقد صفقات أو معالجة تمرد أحد المهاجمين الغاضبين لإبقائهم في حالة مستقرة.
                      </p>
                      <div className="bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-400 space-y-1">
                        <div><strong>الفئات المولدة:</strong> رسائل مجلس الإدارة (BOARD)، إشعارات الشباب (YOUTH)، تقارير الكشافة (SCOUT).</div>
                        <div><strong>معدل التحديث:</strong> يتم بناء الرسائل ومعمل الفحص أسبوعياً عند الانتقال التلقائي للتقويم.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 2: TACTICAL IDENTITY (FC IQ)
              ======================================================= */}
          {activeSection === 'tactics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Sliders className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">2. نظام الهوية التكتيكية المتقدم (Advanced Tactical System)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    يمثل فلسفة <strong>FC IQ</strong> الثورة التكتيكية داخل الملعب. لا يعتمد الفريق فقط على معدل القوة الإجمالي لللاعب، بل مدى توافق ذكائه الكروي وتجانس هويته التكتيكية مع النمط الفريد للمدرب.
                  </p>

                  <h3 className="font-bold text-white text-base mt-6 text-emerald-405 border-r-2 border-emerald-500 pr-2">وصف آلية الهوية والتطوير التكتيكي:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <h4 className="text-xs font-bold text-white mb-2 text-emerald-400">أنماط أسلوب اللعب المدمجة:</h4>
                      <p className="text-xs text-zinc-450 leading-relaxed">
                        تشتمل اللعبة على أربعة أنماط أساسية لتسيير المباريات: التمرير السلس وتناقل الكرات القصير (Tiki-Taka)، الضغط الجنوني العالي واستخلاص الكرة الفوري بمناطق المنافس (Gegenpress)، الهجمات المرتدة الكهربائية المنظمة (Counter-Attack)، وحائط الصد الفولاذي لغلق المنافذ ومناطق التسلل (Park the Bus).
                      </p>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <h4 className="text-xs font-bold text-white mb-2 text-emerald-400">نظام المساعدين الفنيين (Coaches):</h4>
                      <p className="text-xs text-zinc-450 leading-relaxed">
                        يمكن للمدرب تعيين مساعدين فنيين متخصصين لكل خط (حراسة المرمى، الدفاع، الوسط، الهجوم)، يملكون تقييمات تتراوح من 1★ إلى 5★ نجوم. المساعد الأفضل يقوم بمضاعفة سرعة تطوير اللاعبين في هذا الخط، ويزيد من جودة تحرك الخط الهيكلي بالـ Match Simulator.
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mt-6 text-emerald-405 border-r-2 border-emerald-500 pr-2">التعليمات الذكية للاعبين وتأثيرها البصري:</h3>
                  <p className="text-xs text-zinc-400">
                    عند اختيار وظيفة تخصصية ذكية (مثل: Mezzala لوسط الميدان، أو False Nine للمنتصف الدفاعي بالخصم، أو Sweeper Keeper لحرس الإنقاذ الخلفي)، ترتفع دقة التمرير الفعلي للاعب بمقدار +10٪، بينما يتراجع استهلاك الجهد البدني والجاهزية في حال انسجام اللاعب مع المساعد الفني لمركزه.
                  </p>
                </div>
              </div>

              {/* Interactive Widget for Section 2 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sliders className="w-5 h-5 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase text-white">محاكي كفاءة التشكيل والهوية التكتيكية (Mathematical Test)</h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">مخرجات فورية</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Controls */}
                  <div className="md:col-span-5 space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">حدد أسلوب اللعب المرغوب:</label>
                      <select
                        value={tacticalStyle}
                        onChange={(e) => setTacticalStyle(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="tiki-taka">تيكي تاكا (Tiki-Taka) (+15 كفاءة)</option>
                        <option value="gegenpress">ضغط عالي (Gegenpress) (+20 كفاءة)</option>
                        <option value="counter">هجمات مرتدة (Counter-Attack) (+10 كفاءة)</option>
                        <option value="park-bus">ركن الحافلة (Park the Bus) (+5 كفاءة)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-zinc-400 flex justify-between">
                        <span>تصنيف مدرب الهجوم:</span>
                        <span className="text-amber-400 font-bold">{attCoachRating}★ نجوم</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={attCoachRating}
                        onChange={(e) => setAttCoachRating(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-zinc-400 flex justify-between">
                        <span>تصنيف مدرب الوسط:</span>
                        <span className="text-amber-400 font-bold">{midCoachRating}★ نجوم</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={midCoachRating}
                        onChange={(e) => setMidCoachRating(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-zinc-400 flex justify-between">
                        <span>تصنيف مدرب الدفاع:</span>
                        <span className="text-amber-400 font-bold">{defCoachRating}★ نجوم</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={defCoachRating}
                        onChange={(e) => setDefCoachRating(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-zinc-400 flex justify-between">
                        <span>ترابط الفريق وتلاحمه الصنع:</span>
                        <span className="text-emerald-450 font-bold">{teamCohesion}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={teamCohesion}
                        onChange={(e) => setTeamCohesion(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Right Results & Pitch representation */}
                  <div className="md:col-span-7 flex flex-col justify-center items-center">
                    {/* Compact visual Stadium representation */}
                    <div className="w-full h-48 bg-emerald-950/40 rounded-xl border border-emerald-900/40 relative overflow-hidden flex flex-col justify-between p-4 text-center">
                      <div className="border-t border-emerald-800/40 w-full absolute top-1/2 left-0 -translate-y-1/2"></div>
                      <div className="border border-emerald-800/40 w-24 h-12 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                      <div className="border border-emerald-800/40 w-24 h-12 rounded-t-xl absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                      <div className="w-10 h-10 border border-emerald-800/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                      <div className="text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-800/40 self-center z-10 font-bold mb-1">
                        تمركز الخطوط بأسلوب: {tacticalStyle.toUpperCase()}
                      </div>

                      <div className="flex justify-around items-center w-full z-10">
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">ATT (OVR +{attCoachRating * 2})</span>
                      </div>
                      <div className="flex justify-around items-center w-full z-10">
                        <span className="text-[10px] bg-emerald-555 text-white px-1.5 py-0.5 rounded font-bold">MID (OVR +{midCoachRating * 2})</span>
                      </div>
                      <div className="flex justify-around items-center w-full z-10">
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">DEF (OVR +{defCoachRating * 2})</span>
                      </div>
                    </div>

                    <div className="w-full mt-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] text-zinc-500 block uppercase font-mono">التقييم التكتيكي العام</span>
                        <strong className="text-xl font-black text-white">{calculateTacticalChemistry()}/100</strong>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-zinc-500 block font-mono">مستوى التناغم التكتيكي</span>
                        <span className="text-xs text-emerald-400 font-extrabold">المرحلة الجيدة جداً (Excellent)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 3: TRANSFERS & SCOUTING
              ======================================================= */}
          {activeSection === 'transfers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Landmark className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">3. سوق الانتقالات والمفاوضات السينمائية (Transfers & Scouting)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    <strong>إدارة الكشافين وبناء النجوم الواعدة (Wonderkids):</strong> بدلاً من الشراء المباشر بقائمة معلنة، تعتمد محاكاة انتقالات FC 26 على جودة شبكة كشافيك الممتدة عبر القارات الخمس.
                  </p>

                  <ul className="list-disc list-inside space-y-2 pr-4 text-zinc-350 text-xs">
                    <li>
                      <strong className="text-white">آلية عمل الكشافة:</strong> توظيف الكشاف تبلغ تكلفته عدة ملايين حسب مستوى كفاءته من 1إلى 5 نجوم. تحديد قارة محددة يغير من فرصة ظهور المواهب؛ قارة أمريكا الجنوبية تمتاز بارتفاع فرص ظهور مهارات الهجوم الفردية الفذة والمراوغات، بينما تمتاز القارة الأوروبية بالانضباط والمهارات البدنية والقراءات الخططية العالية.
                    </li>
                    <li>
                      <strong className="text-white">المفاوضات السينمائية ثنائية الطرف:</strong> تعقد الصفقات في غرف اجتماعات خاصة. يقوم البرنامج التقييمي بحساب القبول بناءً على الموازنة والوزن المالي السليم، مع مراعاة وجود الشروط الجزائية ومكافآت الأداء المالي لتسهيل إتمام العقود.
                    </li>
                  </ul>

                  <h3 className="font-bold text-white text-base mt-6 text-emerald-405 border-r-2 border-emerald-500 pr-2">تأثير الشرط الجزائي (Release Clause) والحوافز:</h3>
                  <p className="text-xs text-zinc-400">
                    إدراج الشرط الجزائي يحمي مواهب ناديك الشابة من القرصنة، وبالمقابل يجبر الوكيل على خفض الشروط المالية براتب اللاعب بنسبة تصل إلى -12٪ لتسهيل تخفيف القيود.
                  </p>
                </div>
              </div>

              {/* Interactive Widget for Section 3 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Coins className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase text-white">محاكي المفاوضات والتعاقدات السينمائي (Agent Interactive Room)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Controls */}
                  <div className="md:col-span-5 bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>قيمة اللاعب السوقية:</span>
                        <span className="text-white font-extrabold">£{playerValue}M</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="80"
                        value={playerValue}
                        onChange={(e) => {
                          setPlayerValue(Number(e.target.value));
                          setBidOffer(Math.round(Number(e.target.value) * 0.95));
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>العرض المقترح لرحيله:</span>
                        <span className="text-emerald-400 font-extrabold">£{bidOffer}M</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={bidOffer}
                        onChange={(e) => setBidOffer(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>الراتب المالي الأسبوعي:</span>
                        <span className="text-sky-400 font-extrabold">£{wageOffer}k / wk</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="350"
                        value={wageOffer}
                        onChange={(e) => setWageOffer(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-2 border-t border-zinc-900 pt-3">
                      <label className="flex items-center gap-2 text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={hasReleaseClause}
                          onChange={(e) => setHasReleaseClause(e.target.checked)}
                          className="accent-emerald-500"
                        />
                        إدارج شرط جزائي مقبول بالصفقة
                      </label>
                      <label className="flex items-center gap-2 text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={cleanSheetBonus}
                          onChange={(e) => setCleanSheetBonus(e.target.checked)}
                          className="accent-emerald-500"
                        />
                        إدراج حوافز مبيعات وقيمة الأداء الدوري
                      </label>
                    </div>

                    <button
                      onClick={handleSimulateNegotiations}
                      className="w-full bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      تقديم العرض إلى وكيل اللاعب <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  {/* Right Chat outcome screen */}
                  <div className="md:col-span-7 flex flex-col justify-between bg-zinc-950 rounded-xl p-5 border border-zinc-850">
                    <div className="space-y-4">
                      {/* Avatar of mock agent */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-emerald-400">
                          AG
                        </div>
                        <div>
                          <strong className="text-zinc-200 text-sm block">خورخي مينديز (وكيل اللاعب الافتراضي)</strong>
                          <span className="text-[10px] text-zinc-500 font-mono">المرتبة الدولية: النخبة النجمية</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 text-zinc-200 text-xs min-h-[90px] leading-relaxed">
                        {negotiationResult.message}
                      </div>
                    </div>

                    {negotiationResult.metrics && (
                      <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4 mt-4">
                        <div className="bg-zinc-900 p-2.5 rounded-lg">
                          <span className="text-[10px] text-zinc-500 block uppercase">معدل رضا اللاعب</span>
                          <span className="text-sm font-extrabold text-emerald-450">{negotiationResult.metrics.satisfaction}%</span>
                        </div>
                        <div className="bg-zinc-900 p-2.5 rounded-lg">
                          <span className="text-[10px] text-zinc-500 block">ثقة مجلس الإدارة بالإنفاق</span>
                          <span className="text-sm font-extrabold text-sky-400">{negotiationResult.metrics.boardOpinion}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 4: YOUTH ACADEMY & GROWTH
              ======================================================= */}
          {activeSection === 'youth' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Settings className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">4. أكاديمية الشباب وتطوير اللاعبين (Youth Academy & Player Growth)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    تمثل الأكاديمية الاستثمار الاستراتيجي لأي نادٍ يهدف للاستقرار مستقبلاً وبدون رصد ميزانيات فلكية.
                  </p>

                  <h3 className="font-bold text-white text-base mt-6 text-emerald-405 border-r-2 border-emerald-500 pr-2">أبرز آليات التطور والترقيات:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-xs">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <h4 className="font-bold text-white mb-2 text-emerald-400">إعادة تشكيل مهارات القدم:</h4>
                      <p className="text-zinc-450 leading-relaxed">
                        يمنح كل ناشئ تصنيفاً بالنجوم للقدم الضعيفة (Weak Foot). يمكن وضع خطة فردية لترقية المهارة من مستوى 3★ إلى 4★، مما يحسن من دقته بالكرات العرضية بنسبة +15٪ بالملعب.
                      </p>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <h4 className="font-bold text-white mb-2 text-emerald-400">خطة تعديل المراكز:</h4>
                      <p className="text-zinc-450 leading-relaxed">
                        برمجة خطة لتغيير مركز اللاعب (مثال: تغيير مركز ناشئ مهاري من مدافع ظهير هجومي إلى جناح يسار كامل). يحول هذا السمات المكتسبة تدريجياً لسرعة التسارع بنسبة واضحة.
                      </p>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <h4 className="font-bold text-white mb-2 text-emerald-400">محفز البنية المرفقية للشباب:</h4>
                      <p className="text-zinc-450 leading-relaxed">
                        ترقية مستوى كفاءة البنية الأساسية للأكاديمية يسرّع بشكل فوري من ظهور مواهب جديدة بمعدلات قدرات استثنائية (Wonderkids) تتعدى +85 نقطة بالتقييم الإجمالي المتوقع.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Widget for Section 4 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Sliders className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase text-white">مخطط وجدول التدريب الفردي للناشئين (Interactive Growth)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Player State Card */}
                  <div className="md:col-span-4 bg-zinc-950 rounded-xl p-4 border border-zinc-850 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">الأكاديمية الافتراضية</span>
                        <span className="text-[11px] text-zinc-500">الجنسية: المغرب 🇲🇦</span>
                      </div>
                      <h4 className="font-black text-white mt-3 text-base">{selectedYouthPlayer.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">المركز الحالي: وسط مهاجم (MID)</p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-[9px] text-zinc-500 block">التقييم الحالي</span>
                          <strong className="text-white text-sm">{selectedYouthPlayer.currentOvr} OVR</strong>
                        </div>
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-[9px] text-zinc-500 block">الإمكانيات القصوى</span>
                          <strong className="text-emerald-450 text-sm">+{selectedYouthPlayer.potential} POT</strong>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 space-y-1">
                      <div>القدم الضعيفة: {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < selectedYouthPlayer.weakFoot ? 'text-amber-400' : 'text-zinc-700'}>★</span>
                      ))}</div>
                      <div>معدل اللياقة الأساسية: {selectedYouthPlayer.physicality}/100</div>
                    </div>
                  </div>

                  {/* Right Plan Selector */}
                  <div className="md:col-span-8 bg-zinc-950 rounded-xl p-5 border border-zinc-850 space-y-4">
                    <h5 className="text-xs font-bold text-white mb-2">اختر مسار التطوير المستهدف للـ Wonderkid الشاب:</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDevelopmentPlan('reposition')}
                        className={`text-right p-3 rounded-lg border text-xs transition ${developmentPlan === 'reposition' ? 'bg-zinc-900 border-emerald-500/60 text-white' : 'border-zinc-850 text-zinc-450 hover:bg-zinc-900/30'}`}
                      >
                        <strong className="block text-white mb-1">خطة إعادة تهيئة المركز</strong>
                        <span>تحويله من MID إلى جناح مهاجم هجومي سريع.</span>
                      </button>

                      <button
                        onClick={() => setDevelopmentPlan('weakfoot')}
                        className={`text-right p-3 rounded-lg border text-xs transition ${developmentPlan === 'weakfoot' ? 'bg-zinc-900 border-emerald-500/60 text-white' : 'border-zinc-850 text-zinc-450 hover:bg-zinc-900/30'}`}
                      >
                        <strong className="block text-white mb-1">رفع كفاءة القدم الضعيفة</strong>
                        <span>تدريب مكثف على دقة اللمسات الهجومية بالرجل اليسرى.</span>
                      </button>

                      <button
                        onClick={() => setDevelopmentPlan('fitness')}
                        className={`text-right p-3 rounded-lg border text-xs transition ${developmentPlan === 'fitness' ? 'bg-zinc-900 border-emerald-500/60 text-white' : 'border-zinc-850 text-zinc-450 hover:bg-zinc-900/30'}`}
                      >
                        <strong className="block text-white mb-1">برنامج اللياقة المتفجر</strong>
                        <span>أحمال حديد والتحمل لتجنب فقدان الجهد البدني.</span>
                      </button>

                      <button
                        onClick={() => setDevelopmentPlan('balanced')}
                        className={`text-right p-3 rounded-lg border text-xs transition ${developmentPlan === 'balanced' ? 'bg-zinc-900 border-emerald-500/60 text-white' : 'border-zinc-850 text-zinc-450 hover:bg-zinc-900/30'}`}
                      >
                        <strong className="block text-white mb-1">التدريب الدوري المتوازن</strong>
                        <span>تأهيل تدريجي لجميع الجوانب البدنية والفنية بالتساوي.</span>
                      </button>
                    </div>

                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 block uppercase tracking-widest font-mono">النتيجة التقديرية للخطة:</span>
                        <p className="text-xs text-white mt-1 leading-snug">{calculateDevelopmentOutcome().attributeUpgraded}</p>
                      </div>
                      <div className="text-left py-1 px-3 bg-zinc-950 border border-zinc-850 rounded-lg shrink-0">
                        <span className="text-[9px] text-zinc-500 block">الفترة المتوقعة</span>
                        <strong className="text-sm text-white font-extrabold">{calculateDevelopmentOutcome().weeks} أسبوع</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 5: MAN MANAGEMENT & MEDIA
              ======================================================= */}
          {activeSection === 'management' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Heart className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">5. إدارة غرف الملابس والإعلام (Man Management & Media)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    <strong>ديناميكية المؤتمرات الصحفية وغرف تبديل الملابس:</strong> القرارات لا تؤخذ في عزلة. المؤتمرات الصحفية قبل وبعد المباريات هامت جداً؛ إجابتك الفضفاضة أو هجومك الصريح قد يعمقان من فجوة الالتزام بين رفقاء الفريق.
                  </p>

                  <ul className="list-disc list-inside space-y-2 pr-4 text-zinc-350 text-xs">
                    <li>
                      <strong className="text-white">التعامل مع شكاوى اللاعبين العاجلة:</strong> يمتلك اللاعب في التشكيلة مؤشراً للمطالبة بزيادة وقت اللعب (Play-Time). إهمال الطلب الطويل يخفض من روحه المعنوية (Morale) تلقائياً، والنتيجة الحتمية هي عدم الالتزام بالتعليمات التكتيكية وتدمير الـ Cohesion.
                    </li>
                    <li>
                      <strong className="text-white">تأثير الصحافة على ثقة الإدارة:</strong> مجلس الإدارة يملك مؤشر ثقة ومخاوف مستقلة تتراجع مباشرة في حال تصريحاتك السلبية المناهضة لمقترحاتهم وميزانيات النادي التعاقدية.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Interactive Widget for Section 5 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Gauge className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase text-white">محاكي المؤتمرات الصحفية وغرفة خلع الملابس (Press Room Simulator)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Controls/Questions */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPressQuestionId(0);
                          setLastAnswerCommentary("اختر أحد البدائل السلوكية أدناه لقياس التأثير الفوري.");
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${selectedPressQuestionId === 0 ? 'bg-zinc-900 border border-emerald-500/30' : 'bg-zinc-950 text-zinc-500'}`}
                      >
                        السؤال الأول (مشكلة لاعب)
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPressQuestionId(1);
                          setLastAnswerCommentary("اختر أحد البدائل السلوكية أدناه لقياس التأثير الفوري.");
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${selectedPressQuestionId === 1 ? 'bg-zinc-900 border border-emerald-500/30' : 'bg-zinc-950 text-zinc-500'}`}
                      >
                        السؤال الثاني (سوق الانتقالات)
                      </button>
                    </div>

                    <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-3">
                      <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">سؤال مندوب قنوات الكأس الرياضية:</span>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                        "{pressQuestions[selectedPressQuestionId].question}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 block">اختر إجابة المدرب الرسمية للصحافة:</span>
                      {pressQuestions[selectedPressQuestionId].answers.map((ans, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(ans.moraleEffect, ans.boardEffect, ans.fanEffect, ans.comment)}
                          className="w-full text-right p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-zinc-350 transition leading-snug"
                        >
                          {ans.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Metrics and dynamic response commentary */}
                  <div className="md:col-span-6 bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <span className="text-[10px] text-zinc-500 block font-mono">التقرير والتحرك المؤشر الفوري (Live Impact Dashboard)</span>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>معنويات اللاعبين (Players Morale)</span>
                            <span className="text-emerald-450">{pressConferenceMetrics.morale}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pressConferenceMetrics.morale}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>ثقة مجلس الإدارة (Board Trust)</span>
                            <span className="text-sky-400">{pressConferenceMetrics.boardTrust}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${pressConferenceMetrics.boardTrust}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>رضا الجماهير الكروية (Fans)</span>
                            <span className="text-amber-450">{pressConferenceMetrics.fanSatisfaction}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${pressConferenceMetrics.fanSatisfaction}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 border-r-4 border-r-emerald-500 text-xs text-zinc-300 leading-relaxed">
                      <strong>تحليل ردود الفعل:</strong> {lastAnswerCommentary}
                    </div>

                    <button
                      onClick={() => setPressConferenceMetrics({ morale: 65, boardTrust: 70, fanSatisfaction: 60 })}
                      className="text-[10px] bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-500 py-1.5 px-3 rounded border border-zinc-850 self-end flex items-center gap-1.5"
                    >
                      <RefreshCcw className="w-3 h-3" /> إعادة ضبط المؤشرات الافتراضية
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 6: MATCH SIMULATION OPTIONS
              ======================================================= */}
          {activeSection === 'match' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Radio className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold text-white">6. نظام محاكاة المباريات (Match Simulation Options)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    لتلبية جميع مستويات اللاعبين، تتيح اللعبة 3 آليات رئيسية لإدارة اللقاءات واكتساب الثقة:
                  </p>

                  <ul className="list-disc list-inside space-y-2 pr-4 text-zinc-350 text-xs">
                    <li>
                      <strong className="text-white">اللعب الفعلي باللاعب (Manual Control):</strong> التحكم الكامل بالكرة والمراوغة المباشرة والتسديد الكلاسيكي، مما يضع نتائج المباراة بكاملها في يد يد مهاراتك الفردية باللعبة الكروية.
                    </li>
                    <li>
                      <strong className="text-white">المحاكاة البصرية السريعة (Interactive Fast Visual SIM):</strong> محرك خوارزمي يجسد رادار تحركات اللاعبين ثنائي الأبعاد في الملعب، مع إتاحة إمكانية التدخل التكتيكي المباشر للمدرب وتغيير أسلوب الضغط في حالة الطرد أو إصابة المدافع الأساسي.
                    </li>
                    <li>
                      <strong className="text-white">المحاكاة الفورية السريعة (Instant SIM):</strong> الحصول الفوري على النتيجة بضغطة زر واحدة. يعتمد هذا تماماً على القيمة الإحصائية OVR وانسجام الخطوط ومطابقة الهوية التكتيكية للاعبين بالتكتيك المستمر.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Interactive Widget for Section 6 */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sliders className="w-5 h-5 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase text-white">لوحة تحكم خوارزميات محاكاة المباريات (Match Simulation Sandbox)</h3>
                  </div>
                  <span className="text-[10px] bg-red-950/20 text-red-400 border border-red-500/15 px-2 py-0.5 rounded font-bold">نموذج فني لمحللي البيانات</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-4">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">النهج الهجومي في صناعة الألعاب:</label>
                      <select
                        value={tacticalInstinct}
                        onChange={(e) => setTacticalInstinct(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      >
                        <option value="balanced">نهج كروي متزن (Balanced)</option>
                        <option value="aggressive">نهج هجومي هجومي كاسح (Aggressive)</option>
                        <option value="defensive">نهج تكتل هادئ منظم (Defensive)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>معامل دقة التهديف الدوري (Goals Rate):</span>
                        <span className="text-emerald-400 font-extrabold">x{goalFreqMultiplier}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={goalFreqMultiplier}
                        onChange={(e) => setGoalFreqMultiplier(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>نسبة الاستحواذ المستهدفة:</span>
                        <span className="text-sky-400 font-extrabold">{possessionWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="75"
                        value={possessionWeight}
                        onChange={(e) => setPossessionWeight(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <button
                      onClick={handleSimulateSandboxMatch}
                      disabled={simInProgress}
                      className="w-full bg-emerald-500 hover:bg-emerald-450 disabled:bg-zinc-800 text-zinc-950 font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      {simInProgress ? "جاري تشغيل محاكي المباراة..." : "محاكاة مباراة تجريبية 🎮"}
                    </button>
                  </div>

                  <div className="md:col-span-7 bg-zinc-955 rounded-xl border border-zinc-850 p-4 h-full flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest">مخرجات أحداث المباراة الفعلية والتعليق:</span>
                      
                      {sandboxMatchLog.length === 0 ? (
                        <div className="text-xs text-zinc-550 italic h-24 flex items-center justify-center">
                          اضغط على زر المحاكاة لبدء تشغيل محرك البيانات تكتيكياً.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {sandboxMatchLog.map((log, lIdx) => (
                            <div key={lIdx} className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-900/40 p-1.5 rounded border border-zinc-850/50">
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {sandboxMatchLog.length > 0 && (
                      <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-between text-[10px] text-zinc-505">
                        <span>دقة خوارزميات محرك FC 26</span>
                        <span className="text-emerald-455">الوضع الفعال نشط (Active)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              SECTION 7: DATA PACK MANAGER & APK HUB (حزمة البيانات والتثبيت)
              ======================================================= */}
          {activeSection === 'datapack' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="bg-gradient-to-l from-emerald-950/40 to-zinc-900 border border-emerald-500/15 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <Database className="w-6 h-6 animate-pulse" />
                    <div>
                      <h2 className="text-xl font-extrabold text-white">7. مدير حزم البيانات والـ APK (Data Pack & APK Workspace)</h2>
                      <p className="text-[10px] text-emerald-400/80 font-mono tracking-widest mt-0.5">WORLD SOCCER CHAMPS STYLE SYSTEM</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportDataPackToFile}
                    className="bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> تصدير حزمة ملف .json للتحميل
                  </button>
                </div>
                <p className="text-zinc-350 text-xs leading-relaxed">
                  أهلاً بك يا كوتش في مركز هندسة المحتوى الكروي! يتيح لك هذا القسم التحكم بنسبة 100% في قاعدة بيانات اللعبة وحزم التراخيص. يمكنك استيراد حزم لتغيير أسماء الأندية واللاعبين الوهمية إلى الأسماء والصور والتقييمات الحقيقية (مثل التحديث الشهير للعبة World Soccer Champs)، بالإضافة لتنفيذ خطوات تجميع اللعبة وتصديرها كملف APK للأندرويد.
                </p>
              </div>

              {/* Sub Navigation Inside Hub */}
              <div className="flex border-b border-zinc-850 gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTabSub('presets')}
                  className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTabSub === 'presets' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900/50 rounded-t-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> حزم بيانات جاهزة (Presets)
                </button>
                <button
                  onClick={() => setActiveTabSub('editor')}
                  className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTabSub === 'editor' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900/50 rounded-t-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> محرر قاعدة البيانات الحية
                </button>
                <button
                  onClick={() => setActiveTabSub('apk')}
                  className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTabSub === 'apk' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900/50 rounded-t-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> دليل تجميع ملف APK للاندرويد
                </button>
              </div>

              {/* Sub-tab 1: Preset Packs */}
              {activeTabSub === 'presets' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                  <div className="md:col-span-12 lg:col-span-7 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">حمّل حزمة بيانات كروية بضغطة زر 👇</h3>
                        <p className="text-[11px] text-zinc-400">ستقوم هذه الحزم بتغيير معالم اللعبة، كاستبدال الأسماء غير المرخصة بأسماء واقعية لتعيش التحدي الحقيقي!</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Preset Card 1 */}
                        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl flex flex-col justify-between hover:border-emerald-500/20 transition group">
                          <div>
                            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                              <span>🔥 حزمة النخبة الأوروبية</span>
                              <span className="text-[9px] bg-emerald-950/50 text-emerald-300 border border-emerald-500/10 px-1 py-0.5 rounded">Real Names</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed mb-3">
                              تغيير أسماء الأندية (Manchester Athletic ➔ Manchester United) و (Paris Capital ➔ PSG) مع ترخيص أسماء 5 نجوم سوپرستار لكل نادٍ كـ هولاند، وصلاح، ومبابي!
                            </p>
                          </div>
                          <button
                            onClick={() => handleApplyPreset('europe')}
                            className="w-full bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black text-xs py-2 rounded-lg transition"
                          >
                            تطبيق في اللعبة فورياً ⚡
                          </button>
                        </div>

                        {/* Preset Card 2 */}
                        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl flex flex-col justify-between hover:border-emerald-500/20 transition group">
                          <div>
                            <div className="text-xs font-bold text-sky-400 mb-1 flex items-center gap-1">
                              <span>🇸🇦 دوري روشن ومحترفي روشن</span>
                              <span className="text-[9px] bg-sky-950/50 text-sky-300 border border-sky-500/10 px-1 py-0.5 rounded">Saudi Pro</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed mb-3">
                              نقل طور مهنة المدرب لـ روشن! تغيير الأندية لتصبح (الهلال، النصر، الاتحاد، الأهلي، الشباب...)، وتوطين الأساطير كريستيانو، بنزيما، نيمار وغيرهم!
                            </p>
                          </div>
                          <button
                            onClick={() => handleApplyPreset('saudi')}
                            className="w-full bg-sky-500 hover:bg-sky-450 text-zinc-950 font-black text-xs py-2 rounded-lg transition"
                          >
                            تجهيز روشن للتشكيلة 🇸🇦
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Code Editor Preview */}
                    <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-white">محرر شفرة الـ JSON لحزمة البيانات</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">Customize structure direct from your browser or write custom entries</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-650">e.g. "World Soccer Option File"</span>
                      </div>

                      <textarea
                        value={datapackCustomJson}
                        onChange={(e) => setDatapackCustomJson(e.target.value)}
                        placeholder="ضع شفرة JSON المخصصة لحزمة البيانات هنا..."
                        className="w-full min-h-[170px] bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/40 leading-relaxed text-left"
                        dir="ltr"
                      />

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleApplyCustomJson}
                          className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 font-bold text-xs px-4 py-2 rounded-xl transition"
                        >
                          استيراد وحفظ التعديلات في اللعبة 📥
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* System log and instruction list */}
                  <div className="md:col-span-12 lg:col-span-5 space-y-4">
                    {/* Log Terminal console */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between min-h-[180px] font-mono">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2">
                          <span className="text-[10px] text-zinc-550 font-bold uppercase">مركز الاتصال وحفظ التراخيص</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="space-y-1 text-right max-h-[180px] overflow-y-auto pr-1">
                          {dataPackLog.map((log, lIdx) => (
                            <p key={lIdx} className="text-[10px] text-zinc-400 bg-zinc-900/30 p-1.5 rounded leading-relaxed border border-zinc-900">
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-650 text-left mt-3">FC 26 Engine Database Sync Tool • Active Cache</span>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-[10px] text-center text-zinc-400 leading-relaxed">
                      💡 <strong>ملاحظة الكوتش:</strong> عند استيراد البيانات، انقر على زر <strong>"تشغيل طور محاكاة مهنة المدرب 🎮"</strong> في الأعلى لمشاهدة التحديثات الحية وتدريب فريقك الأصيل!
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Live Database Editor */}
              {activeTabSub === 'editor' && (
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">محرر العناصر والتقييمات الفورية ✏️</h3>
                    <p className="text-[11px] text-zinc-400">يمكنك هنا إجراء تعديل مباشر لبيانات أنديتك ولاعبيك في الحفظ النشط، وتغيير مركزهم أو ميزانياتهم الكلية فورياً.</p>
                  </div>

                  {/* Searching element */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-zinc-650 text-right"
                      placeholder="ابحث عن اسم النادي أو اللاعب الذي تريد تعديله وكتابته بالإصدار الحقيقي..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="bg-zinc-800 hover:bg-zinc-750 text-zinc-400 px-3 py-1 text-xs rounded-xl"
                      >
                        إلغاء الفلتر
                      </button>
                    )}
                  </div>

                  {/* Live edit dialog/forms if selected */}
                  {editClubId && (
                    <div className="bg-zinc-950 p-4 border border-emerald-500/25 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        تعديل بيانات النادي المختار:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">اسم الفريق الجديد:</label>
                          <input
                            type="text"
                            value={editClubName}
                            onChange={(e) => setEditClubName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">الرمز المختصر (3 حروف):</label>
                          <input
                            type="text"
                            maxLength={3}
                            value={editClubShortName}
                            onChange={(e) => setEditClubShortName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">ميزانية النادي (بالمليون £):</label>
                          <input
                            type="number"
                            value={editClubBudget}
                            onChange={(e) => setEditClubBudget(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setEditClubId(null)} className="text-zinc-500 px-3 py-1">إلغاء</button>
                        <button onClick={handleSaveClubEdit} className="bg-emerald-500 text-zinc-950 font-bold px-4 py-1.5 rounded">حفظ للتحديث</button>
                      </div>
                    </div>
                  )}

                  {editPlayerId && (
                    <div className="bg-zinc-955 p-4 border border-emerald-500/25 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        تعديل بيانات النجم الكروي:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">اسم اللاعب الكامل:</label>
                          <input
                            type="text"
                            value={editPlayerName}
                            onChange={(e) => setEditPlayerName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">التقييم الكلي (OVR):</label>
                          <input
                            type="number"
                            min={40}
                            max={99}
                            value={editPlayerRating}
                            onChange={(e) => setEditPlayerRating(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">القدرة المستقبلية الواعدة (POT):</label>
                          <input
                            type="number"
                            min={40}
                            max={99}
                            value={editPlayerPotential}
                            onChange={(e) => setEditPlayerPotential(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => { setEditPlayerId(null); setEditPlayerClubId(null); }} className="text-zinc-500 px-3 py-1">إلغاء</button>
                        <button onClick={handleSavePlayerEdit} className="bg-emerald-500 text-zinc-950 font-bold px-4 py-1.5 rounded">حفظ وتعديل</button>
                      </div>
                    </div>
                  )}

                  {/* List matching results */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {!gameState ? (
                      <div className="text-xs text-zinc-500 italic py-6 text-center">
                        يرجى بدء اللعب لأول مرة لتتمكن من تصفح وتعديل قاعدة الأندية واللاعبين الحية. يمكنك الاعتماد على خيارات صانع الـ JSON بالقسم الأول مرحلياً!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Clubs table */}
                        <div>
                          <span className="text-[11px] font-bold text-white block mb-1.5">الأندية المتوافقة مع البحث:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {gameState.clubs
                              .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.shortName.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(club => (
                                <div key={club.id} className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-white">{club.name} ({club.shortName})</p>
                                    <p className="text-[9px] text-zinc-500 font-mono">Budget: £{club.budget} Millions</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditClubId(club.id);
                                      setEditClubName(club.name);
                                      setEditClubShortName(club.shortName);
                                      setEditClubBudget(club.budget);
                                      setEditPlayerId(null);
                                    }}
                                    className="p-1 px-2 border border-zinc-800 text-[10px] bg-zinc-900 text-emerald-400 hover:bg-zinc-800 rounded"
                                  >
                                    تعديل الاسم والمالية ✏️
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Players table matching */}
                        <div>
                          <span className="text-[11px] font-bold text-white block mb-1.5">اللاعبين المتوافقين مع البحث:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(gameState.playersByClub).flatMap(([clubId, squad]) =>
                              squad
                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(p => ({ p, clubId }))
                            ).slice(0, 9).map(({ p, clubId }) => {
                              const clubName = gameState.clubs.find(c => c.id === clubId)?.name || 'حر طليق';
                              return (
                                <div key={p.id} className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-white">{p.name}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono">{clubName} • OVR: {p.rating} | POT: {p.potential}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditPlayerId(p.id);
                                      setEditPlayerClubId(clubId);
                                      setEditPlayerName(p.name);
                                      setEditPlayerRating(p.rating);
                                      setEditPlayerPotential(p.potential);
                                      setEditClubId(null);
                                    }}
                                    className="p-1 px-2 border border-zinc-800 text-[10px] bg-zinc-900 text-sky-400 hover:bg-zinc-800 rounded"
                                  >
                                    رينيم ✏️
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: APK Compiling Steps */}
              {activeTabSub === 'apk' && (
                <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6 space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Smartphone className="w-5 h-5 animate-pulse" />
                    <h3 className="text-base font-bold text-white">كيفية تجميع اللعبة في تطبيق APK رسمي بهاتفك 📱</h3>
                  </div>

                  <p className="text-xs text-zinc-350 leading-relaxed">
                    من الرائع جداً تحويل هذه اللعبة الكاملة لتعمل على هاتفك الذكي كتطبيق أصيل مستقل وسريع وبدقة عالية! نستخدم بنية <strong>Capacitor</strong> الجاهزة المحدّثة للدمج السريع مع بيئة فلاتر او الويب. اتبع هذه الخطوات الفنية البسيطة لتثبيت اللعبة وتصدير ملف الـ APK:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Step Card 1 */}
                    <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-2">
                      <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 flex items-center justify-center">1</span>
                        <span>تثبيت بيئة الكاباسيتر (Install Capacitor)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        في طرفية جهازك، قم بتنصيب المكاتب لربط الأكواد مع محركات الأندرويد الأصلية بـ:
                      </p>
                      <pre className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto text-left" dir="ltr">
                        npm install @capacitor/core @capacitor/cli @capacitor/android
                      </pre>
                    </div>

                    {/* Step Card 2 */}
                    <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-2">
                      <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 flex items-center justify-center">2</span>
                        <span>تهيئة النظام والأصول (Configuration)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        تهيئ ملف الإعدادات للمشروع ليربط أندرويد مع مجلد البناء المستهدف <code>dist</code>:
                      </p>
                      <pre className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto text-left" dir="ltr">
                        npx cap init "Manager Career" "com.football.soccerchamps" --web-dir=dist
                      </pre>
                    </div>

                    {/* Step Card 3 */}
                    <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-2">
                      <div className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 flex items-center justify-center">3</span>
                        <span>إضافة مشروع أندرويد (Add Android Engine)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        بناء ملفات محرك الأندرويد الأصلية التي ستتحكم بشاشة اللمس وأداء الرينдер:
                      </p>
                      <pre className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] font-mono text-sky-400 overflow-x-auto text-left" dir="ltr">
                        npm run build
                        npx cap add android
                      </pre>
                    </div>

                    {/* Step Card 4 */}
                    <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-2">
                      <div className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 flex items-center justify-center">4</span>
                        <span>مزامنة الكود والبناء والتثبيت (Sync & Run)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        افتح الاستوديو لإنشاء ملف الـ APK وتثبيته مباشرة أو نقله عبر الكابل لهاتفك المحمول:
                      </p>
                      <pre className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] font-mono text-sky-400 overflow-x-auto text-left" dir="ltr">
                        npx cap sync
                        npx cap open android
                      </pre>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-5 border border-zinc-850 rounded-2xl">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      مزايا رائعة ستحصل عليها بهاتفك (APK Special Perks):
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 pr-4 text-xs text-zinc-400">
                      <li>تأثيرات اهتزازية بصرية وصوتية متطورة لكل الأزرار والمؤتمرات الصحفية.</li>
                      <li>تحميل وحفظ تلقائي فوري وسلس (Offline standard storage) دون الحاجة للاتصال بالإنترنت تماماً.</li>
                      <li>استيراد حزم البيانات وتحديث محتويات اللاعبين عبر تصفح ذاكرة الملفات المحلية للهواتف.</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =======================================================
              SECTION 8: AI GAME DESIGN ASSISTANT
              ======================================================= */}
          {activeSection === 'ai-chat' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <h2 className="text-xl font-extrabold text-white">💬 استشارات ومقترحات الذكاء الاصطناعي (AI Game Design Assistant)</h2>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
                  <p>
                    أنت الآن متصل مباشرة بـ <strong>رئيس مصممي الألعاب (Lead Game Designer)</strong> للعبة. نعتمد على محرك جينيسيس وذكاء Gemini الاصطناعي لتسهيل تجربة البحث وصياغة تفاصيل برمجية لأي ميزات إضافية تود إدخالها على طور مهنة المدرب.
                  </p>
                </div>
              </div>

              {/* Chat View Container */}
              <div className="bg-zinc-905 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[460px] gap-4">
                
                {/* Message Log */}
                <div className="flex-1 space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                        msg.sender === 'user' ? 'bg-emerald-550 text-white' : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                      }`}>
                        {msg.sender === 'user' ? 'ME' : 'AI'}
                      </div>
                      
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-zinc-950 border border-zinc-850 text-zinc-200 rounded-tl-none markdown-body'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex gap-3 max-w-[80%] ml-auto">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-emerald-400 border border-zinc-700 shrink-0">
                        AI
                      </div>
                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-[11px] text-zinc-500 mr-2">جاري التفكير والتوجيه البنائي...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Text Form */}
                <div className="border-t border-zinc-850 pt-4 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatToAI()}
                    placeholder="اسأل رئيس مصممي الألعاب عن آلية، معادلة رياضية، أو كود لتطوير الطور..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-zinc-600"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendChatToAI}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-emerald-500 hover:bg-emerald-450 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs transition"
                  >
                    استشارة
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
