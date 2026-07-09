"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Users, User, Plus, Trash2, Play, ArrowRight } from "lucide-react";

export default function StartScreen({ onStart }) {
  const [mode, setMode] = useState(null); // 'single' or 'group'
  const [groups, setGroups] = useState([
    { id: 1, name: "الأسرة الأولى", members: "" },
    { id: 2, name: "الأسرة الثانية", members: "" }
  ]);

  const addGroup = () => {
    if (groups.length >= 4) return;
    setGroups([...groups, { id: Date.now(), name: `الأسرة ${groups.length + 1}`, members: "" }]);
  };

  const updateGroup = (id, field, value) => {
    setGroups(groups.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeGroup = (id) => {
    if (groups.length <= 2) return;
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleStart = () => {
    if (mode === "single") {
      onStart({ mode: "single" });
    } else {
      // Create lifelines and initial state for each group
      const initializedGroups = groups.map(g => ({
        ...g,
        isEliminated: false,
        currentQuestionIndex: 0, // Independent ladder
        lifelines: { fiftyFifty: false, phone: false, sheikhs: false }
      }));
      onStart({ mode: "group", teams: initializedGroups });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl relative z-10 px-4">
      <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center rounded-[40px] shadow-2xl relative overflow-hidden border-4 border-baseera-accent/30 bg-white">
          <Image src="/logo.jpeg" alt="بصيرة" fill className="object-cover" />
        </div>
        {!mode && (
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl text-baseera-text/80 font-bold transition-colors">مرحباً بك في تحدي</h2>
            <h1 className="text-5xl md:text-6xl text-baseera-accent font-black drop-shadow-md">من سيربح الترليون؟</h1>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col md:flex-row gap-6 w-full max-w-2xl"
          >
            <button
              onClick={() => onStart({ mode: "single" })}
              className="flex-1 flex flex-col items-center gap-4 bg-baseera-primary p-8 rounded-3xl border-2 border-baseera-accent/30 hover:border-baseera-accent hover:scale-105 transition-all shadow-xl group"
            >
              <div className="w-20 h-20 bg-baseera-accent/10 rounded-full flex items-center justify-center group-hover:bg-baseera-accent/20 transition-colors">
                <User size={40} className="text-baseera-accent" />
              </div>
              <h2 className="text-3xl font-bold text-white">لعب فردي</h2>
              <p className="text-baseera-accent/70 text-center">تحدَّ نفسك في الوصول إلى المليون بمفردك</p>
            </button>

            <button
              onClick={() => setMode("group")}
              className="flex-1 flex flex-col items-center gap-4 bg-baseera-primary p-8 rounded-3xl border-2 border-baseera-accent/30 hover:border-baseera-accent hover:scale-105 transition-all shadow-xl group"
            >
              <div className="w-20 h-20 bg-baseera-accent/10 rounded-full flex items-center justify-center group-hover:bg-baseera-accent/20 transition-colors">
                <Users size={40} className="text-baseera-accent" />
              </div>
              <h2 className="text-3xl font-bold text-white">لعب مجموعات (أسر)</h2>
              <p className="text-baseera-accent/70 text-center">تحدَّ أصدقاءك وعائلتك حتى 4 مجموعات متنافسة</p>
            </button>
          </motion.div>
        ) : mode === "group" ? (
          <motion.div
            key="group-setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-3xl bg-white/90 backdrop-blur-md p-8 rounded-[40px] shadow-2xl border border-baseera-primary/10"
          >
            <div className="flex justify-between items-center mb-8 border-b border-gray-200/20 pb-4">
              <h2 className="text-3xl font-bold text-baseera-text flex items-center gap-3 transition-colors">
                <Users className="text-baseera-accent" /> إعداد الأسر المتنافسة
              </h2>
              <button onClick={() => setMode(null)} className="text-gray-500 dark:text-gray-400 hover:text-baseera-text flex items-center gap-2 transition-colors">
                <ArrowRight size={20} /> عودة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <AnimatePresence>
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-baseera-bg/50 p-5 rounded-2xl border border-baseera-primary/10 relative group transition-colors"
                  >
                    <div className="absolute top-3 right-3 text-baseera-accent font-bold opacity-30 text-4xl">
                      {index + 1}
                    </div>
                    {groups.length > 2 && (
                      <button 
                        onClick={() => removeGroup(group.id)}
                        className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="relative z-10 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-baseera-text/80 mb-1 transition-colors">اسم الأسرة/المجموعة</label>
                        <input 
                          type="text" 
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-baseera-accent focus:ring-2 focus:ring-baseera-accent/20 outline-none transition-all"
                          placeholder="مثال: أسرة النور"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-baseera-text/80 mb-1 transition-colors">الأعضاء (اختياري)</label>
                        <input 
                          type="text" 
                          value={group.members}
                          onChange={(e) => updateGroup(group.id, "members", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-baseera-accent focus:ring-2 focus:ring-baseera-accent/20 outline-none transition-all text-sm"
                          placeholder="أحمد، محمد، خالد..."
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {groups.length < 4 && (
                <button
                  onClick={addGroup}
                  className="flex flex-col items-center justify-center gap-2 bg-baseera-primary/5 hover:bg-baseera-primary/10 border-2 border-dashed border-baseera-primary/30 rounded-2xl min-h-[160px] text-baseera-text transition-colors"
                >
                  <Plus size={32} />
                  <span className="font-bold">إضافة أسرة</span>
                </button>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStart}
                className="px-16 py-4 rounded-full bg-baseera-primary text-baseera-accent text-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-3"
              >
                <Play size={24} /> بدء التحدي
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
