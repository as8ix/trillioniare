"use client";

import { motion } from "framer-motion";
import { Users, DivideCircle, Phone, HeartCrack, CheckCircle2, Shield } from "lucide-react";

export default function TeamsPanel({ teams, currentTeamIndex }) {
  if (!teams || teams.length === 0) return null;

  return (
    <div className="w-full bg-baseera-primary-dark/80 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-baseera-accent/20 flex flex-wrap lg:flex-nowrap justify-center gap-4 mb-6">
      {teams.map((team, index) => {
        const isActiveTurn = index === currentTeamIndex;
        
        return (
          <motion.div
            key={team.id}
            initial={false}
            animate={{
              scale: isActiveTurn ? 1.05 : 1,
              borderColor: isActiveTurn ? "#d4b895" : team.isEliminated ? "rgba(239,68,68,0.3)" : "rgba(212,184,149,0.2)",
              backgroundColor: isActiveTurn ? "rgba(212,184,149,0.1)" : team.isEliminated ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)"
            }}
            className={`flex-1 min-w-[200px] p-3 rounded-2xl border-2 transition-colors relative overflow-hidden ${
              team.isEliminated ? "opacity-50 grayscale" : ""
            }`}
          >
            {team.isEliminated && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-[1px] z-10">
                <div className="bg-red-600 text-white px-4 py-1 rounded-full font-bold flex items-center gap-2 shadow-lg rotate-[-10deg]">
                  <HeartCrack size={16} /> مستبعد
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2 relative z-0">
              <h3 className={`font-bold text-lg ${isActiveTurn ? "text-baseera-accent" : "text-white"}`}>
                {team.name}
              </h3>
              {isActiveTurn && !team.isEliminated && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            
            {team.members && (
              <p className="text-xs text-gray-400 mb-3 truncate" title={team.members}>
                {team.members}
              </p>
            )}

            <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-2 relative z-0">
              <div className="flex gap-1.5">
                <div title="50:50" className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${team.lifelines?.fiftyFifty ? "border-red-500/30 text-red-500/30 bg-red-500/10" : "border-baseera-accent text-baseera-accent bg-baseera-accent/10"}`}>
                  <DivideCircle size={12} />
                </div>
                <div title="اتصال" className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${team.lifelines?.phone ? "border-red-500/30 text-red-500/30 bg-red-500/10" : "border-baseera-accent text-baseera-accent bg-baseera-accent/10"}`}>
                  <Phone size={12} />
                </div>
                <div title="مشايخ" className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${team.lifelines?.sheikhs ? "border-red-500/30 text-red-500/30 bg-red-500/10" : "border-baseera-accent text-baseera-accent bg-baseera-accent/10"}`}>
                  <Users size={12} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {team.hasImmunity && (
                  <div title="حصانة ضد الإقصاء" className="text-blue-400 bg-blue-400/20 p-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)] border border-blue-400/50">
                    <Shield size={14} />
                  </div>
                )}
                <div className="text-baseera-accent font-black text-sm">
                  مستوى {team.currentQuestionIndex + 1}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
