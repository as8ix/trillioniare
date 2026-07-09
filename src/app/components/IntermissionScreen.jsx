"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, ArrowUpCircle, HeartPulse, UserCheck, ChevronDown, Shield } from "lucide-react";
import intermissionsData from "../data/intermissions.json";

function CustomDropdown({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-right" dir="rtl" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-baseera-primary-dark text-white p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center font-bold text-lg shadow-inner ${isOpen ? 'border-baseera-accent ring-2 ring-baseera-accent/30' : 'border-baseera-accent/50 hover:border-baseera-accent/80'}`}
      >
        <span className={!selectedOption ? "text-white/60" : "text-white"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`transition-transform duration-300 text-baseera-accent ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-[100] mt-2 bg-baseera-primary-dark border-2 border-baseera-accent/80 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          >
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className="p-4 text-white hover:bg-baseera-accent/20 cursor-pointer font-bold border-b border-white/10 last:border-0 transition-colors"
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntermissionTimer({ duration, isStopwatch }) {
  const [timeLeft, setTimeLeft] = useState(duration || 0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setTimeLeft(duration || 0);
    setIsActive(false);
  }, [duration, isStopwatch]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      if (isStopwatch) {
        interval = setInterval(() => setTimeLeft(t => t + 1), 1000);
      } else {
        if (timeLeft > 0) {
          interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else {
          setIsActive(false);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isActive, isStopwatch, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/30 rounded-2xl p-6 mb-6 flex flex-col items-center border border-white/10 shadow-inner relative z-10">
      <div className={`text-6xl font-black tabular-nums tracking-wider mb-4 ${!isStopwatch && timeLeft <= 5 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-baseera-accent'}`}>
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 ${isActive ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-baseera-accent text-baseera-primary shadow-[0_0_15px_rgba(212,184,149,0.5)]'}`}
        >
          {isActive ? "إيقاف المؤقت" : "بدء المؤقت"}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTimeLeft(duration || 0); }}
          className="px-8 py-3 rounded-full font-bold text-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
        >
          إعادة ضبط
        </button>
      </div>
    </div>
  );
}

export default function IntermissionScreen({ onContinue, roundIndex, teams }) {
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [rewardType, setRewardType] = useState(""); // 'levelUp' or 'restoreLifeline'
  const [selectedLifeline, setSelectedLifeline] = useState(""); // 'fiftyFifty', 'phone', 'sheikhs'

  const intermissionNumber = Math.floor(roundIndex / 5) - 1;
  const challenge = intermissionsData[intermissionNumber % intermissionsData.length] || intermissionsData[0];

  const activeTeams = teams?.filter(t => !t.isEliminated) || [];

  const handleComplete = () => {
    if (!winnerTeamId) {
      // No winner selected, just continue
      onContinue(null);
      return;
    }

    if (rewardType === "restoreLifeline" && !selectedLifeline) {
      alert("الرجاء اختيار الوسيلة المراد استرجاعها!");
      return;
    }

    onContinue({
      teamId: parseInt(winnerTeamId),
      rewardType: rewardType,
      lifeline: selectedLifeline
    });
  };

  const getUsedLifelines = (teamId) => {
    const team = teams.find(t => t.id === parseInt(teamId));
    if (!team) return [];
    const used = [];
    if (team.lifelines.fiftyFifty) used.push({ id: 'fiftyFifty', name: 'حذف إجابتين (50:50)' });
    if (team.lifelines.phone) used.push({ id: 'phone', name: 'اتصال بصديق' });
    if (team.lifelines.sheikhs) used.push({ id: 'sheikhs', name: 'مساعدة المشايخ' });
    return used;
  };

  const usedLifelinesForSelected = getUsedLifelines(winnerTeamId);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0, y: 50 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-gradient-to-br from-baseera-primary-dark to-baseera-primary border-4 border-baseera-accent rounded-[40px] p-8 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 mx-auto bg-baseera-accent/20 rounded-full flex items-center justify-center mb-4 border-2 border-baseera-accent shadow-[0_0_30px_rgba(212,184,149,0.4)]"
        >
          <Trophy size={40} className="text-baseera-accent" />
        </motion.div>

        <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg relative z-10">فاصل تحدي ميداني!</h2>
        <h3 className="text-2xl font-bold text-baseera-accent mb-4 relative z-10">{challenge.title}</h3>
        
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 mb-6 relative z-10 shadow-inner">
          <p className="text-white text-xl leading-relaxed font-medium">
            {challenge.description}
          </p>
        </div>

        {(challenge.duration || challenge.stopwatch) && (
          <IntermissionTimer duration={challenge.duration} isStopwatch={challenge.stopwatch} />
        )}

        {/* Winner Selection */}
        <div className="bg-baseera-bg/10 rounded-2xl p-6 border border-baseera-accent/30 text-right mb-8">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="text-baseera-accent" /> 
            تحديد الفائز بالتحدي (اختياري):
          </h4>
          
          <div className="mb-6 relative z-50">
            <CustomDropdown 
              value={winnerTeamId}
              onChange={(val) => {
                setWinnerTeamId(val);
                setRewardType("");
                setSelectedLifeline("");
              }}
              options={[{ value: "", label: "لا يوجد فائز (استكمال اللعب فقط)" }, ...activeTeams.map(t => ({ value: t.id.toString(), label: t.name }))]}
              placeholder="لا يوجد فائز (استكمال اللعب فقط)"
            />
          </div>

          {/* Reward Selection */}
          <AnimatePresence>
            {winnerTeamId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <h5 className="font-bold text-baseera-accent mt-2 mb-2">اختر الجائزة للفريق:</h5>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${rewardType === 'levelUp' ? 'bg-baseera-accent/20 border-baseera-accent' : 'border-white/10 hover:bg-white/5 text-white/70'}`}>
                  <input type="radio" name="reward" value="levelUp" checked={rewardType === "levelUp"} onChange={() => setRewardType("levelUp")} className="hidden" />
                  <ArrowUpCircle size={24} className={rewardType === 'levelUp' ? 'text-baseera-accent' : 'text-gray-400'} />
                  <span className="text-lg font-bold">التقدم درجة في سلم النقاط (كسب نقاط)</span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${rewardType === 'immunity' ? 'bg-baseera-accent/20 border-baseera-accent' : 'border-white/10 hover:bg-white/5 text-white/70'}`}>
                  <input type="radio" name="reward" value="immunity" checked={rewardType === "immunity"} onChange={() => setRewardType("immunity")} className="hidden" />
                  <Shield size={24} className={rewardType === 'immunity' ? 'text-baseera-accent' : 'text-gray-400'} />
                  <span className="text-lg font-bold">حصانة من الإقصاء في السؤال القادم</span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${rewardType === 'restoreLifeline' ? 'bg-baseera-accent/20 border-baseera-accent' : 'border-white/10 hover:bg-white/5 text-white/70'} ${usedLifelinesForSelected.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="radio" name="reward" value="restoreLifeline" checked={rewardType === "restoreLifeline"} onChange={() => setRewardType("restoreLifeline")} className="hidden" disabled={usedLifelinesForSelected.length === 0} />
                  <HeartPulse size={24} className={rewardType === 'restoreLifeline' ? 'text-baseera-accent' : 'text-gray-400'} />
                  <div className="flex-1">
                    <span className="text-lg font-bold">استرجاع وسيلة مساعدة</span>
                    {usedLifelinesForSelected.length === 0 && <span className="block text-sm text-red-400">هذا الفريق لم يستخدم أي وسيلة بعد.</span>}
                  </div>
                </label>

                {rewardType === "restoreLifeline" && usedLifelinesForSelected.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pr-10 relative z-40">
                    <CustomDropdown 
                      value={selectedLifeline}
                      onChange={setSelectedLifeline}
                      options={usedLifelinesForSelected.map(lf => ({ value: lf.id, label: lf.name }))}
                      placeholder="اختر الوسيلة التي تريد استرجاعها..."
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleComplete} 
          disabled={winnerTeamId && !rewardType}
          className={`relative z-10 px-10 py-4 text-2xl font-black rounded-full transition-all flex items-center gap-3 mx-auto ${
            winnerTeamId && !rewardType 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-baseera-accent text-baseera-primary hover:scale-105 hover:shadow-[0_0_40px_rgba(212,184,149,0.6)]'
          }`}
        >
          <Play size={28} /> {winnerTeamId ? "تطبيق الجائزة واستكمال اللعبة" : "استكمال اللعبة بدون فائز"}
        </button>
      </motion.div>
    </div>
  );
}
