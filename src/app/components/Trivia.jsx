"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Users, DivideCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

const Timer = ({ duration, onTimeout, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeout) onTimeout();
      return;
    }
    if (isPaused) return;

    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    
    // Removed tick sound


    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onTimeout]);
  
  return (
    <motion.div 
      animate={timeLeft <= 5 ? { scale: [1, 1.1, 1], color: ["#ef4444", "#ffffff", "#ef4444"] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`text-5xl md:text-7xl font-black my-4 md:my-8 drop-shadow-md ${timeLeft <= 5 ? 'text-red-500' : 'text-baseera-accent'}`} 
      dir="ltr"
    >
      00:{timeLeft.toString().padStart(2, '0')}
    </motion.div>
  );
};

export default function Trivia({ question, onAnswer, onWithdraw, lifelines, onUseLifeline }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState("idle"); 
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'sheikhs' or 'phone'

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerStatus("idle");
    setHiddenOptions([]);
    setActiveModal(null);
  }, [question]);

  const handleTimeout = () => {
    if (answerStatus !== "idle") return;
    setAnswerStatus("wrong");
    setTimeout(() => onAnswer(false), 3000);
  };

  const handleSelect = (index) => {
    if (answerStatus !== "idle" || hiddenOptions.includes(index)) return; 
    
    setSelectedAnswer(index);
    setAnswerStatus("selected");
    
    setTimeout(() => {
      if (index === question.correctAnswerIndex) {
        setAnswerStatus("correct");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4B895', '#0B1E36', '#ffffff']
        });
        setTimeout(() => onAnswer(true), 3000);
      } else {
        setAnswerStatus("wrong");
        setTimeout(() => onAnswer(false), 3000);
      }
    }, 2500);
  };

  const handleFiftyFifty = () => {
    if (lifelines.fiftyFifty || answerStatus !== "idle") return;
    onUseLifeline("fiftyFifty");
    
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== question.correctAnswerIndex);
    // Shuffle and pick 2
    const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
    setHiddenOptions([shuffled[0], shuffled[1]]);
  };

  const handleSheikhs = () => {
    if (lifelines.sheikhs || answerStatus !== "idle") return;
    onUseLifeline("sheikhs");
    setActiveModal("sheikhs");
  };

  const handlePhone = () => {
    if (lifelines.phone || answerStatus !== "idle") return;
    onUseLifeline("phone");
    setActiveModal("phone");
  };

  const getOptionStyle = (index) => {
    if (hiddenOptions.includes(index)) return "opacity-0 pointer-events-none"; // 50:50 applied

    if (selectedAnswer !== index) {
      if (answerStatus === "wrong" && index === question.correctAnswerIndex) {
        return "bg-green-500 text-white border-green-600 shadow-[0_0_20px_rgba(34,197,94,0.5)]";
      }
      return "bg-baseera-primary text-white border-baseera-accent/50 hover:bg-baseera-primary-dark hover:border-baseera-accent shadow-md";
    }

    switch (answerStatus) {
      case "selected":
        return "bg-orange-400 text-white border-orange-500 shadow-[0_0_20px_rgba(251,146,60,0.6)] animate-pulse";
      case "correct":
        return "bg-green-500 text-white border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.8)]";
      case "wrong":
        return "bg-red-500 text-white border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)]";
      default:
        return "";
    }
  };

  if (!question) return null;

  return (
    <motion.div 
      animate={answerStatus === "wrong" ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center w-full max-w-4xl px-4 relative"
    >
      
      {/* Lifelines & Withdraw Bar */}
      <div className="flex justify-between w-full mb-8">
        <button 
          onClick={onWithdraw}
          className="px-6 py-2 rounded-full bg-red-600/10 text-red-600 border border-red-600/30 hover:bg-red-600 hover:text-white transition-all font-bold flex items-center gap-2"
        >
          <XCircle size={20} />
          الانسحاب
        </button>

        <div className="flex gap-4">
          <button 
            onClick={handleFiftyFifty}
            disabled={lifelines.fiftyFifty || answerStatus !== "idle"}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.fiftyFifty 
                ? "bg-gray-400/50 border-gray-400/30 text-gray-500 cursor-not-allowed relative before:content-[''] before:absolute before:w-full before:h-0.5 before:bg-red-500 before:-rotate-45" 
                : "bg-baseera-primary border-baseera-accent text-baseera-accent hover:bg-baseera-accent hover:text-baseera-primary"
            }`}
            title="حذف إجابتين (50:50)"
          >
            <DivideCircle size={24} />
          </button>
          
          <button 
            onClick={handlePhone}
            disabled={lifelines.phone || answerStatus !== "idle"}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.phone 
                ? "bg-gray-400/50 border-gray-400/30 text-gray-500 cursor-not-allowed relative before:content-[''] before:absolute before:w-full before:h-0.5 before:bg-red-500 before:-rotate-45" 
                : "bg-baseera-primary border-baseera-accent text-baseera-accent hover:bg-baseera-accent hover:text-baseera-primary"
            }`}
            title="اتصال بصديق"
          >
            <Phone size={24} />
          </button>
          
          <button 
            onClick={handleSheikhs}
            disabled={lifelines.sheikhs || answerStatus !== "idle"}
            className={`w-16 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              lifelines.sheikhs 
                ? "bg-gray-400/50 border-gray-400/30 text-gray-500 cursor-not-allowed relative before:content-[''] before:absolute before:w-full before:h-0.5 before:bg-red-500 before:-rotate-45" 
                : "bg-baseera-primary border-baseera-accent text-baseera-accent hover:bg-baseera-accent hover:text-baseera-primary"
            }`}
            title="مساعدة المشايخ"
          >
            <Users size={24} />
          </button>
        </div>
      </div>

      {/* Main Question Timer */}
      <Timer 
        key={`timer-${question.id}`}
        duration={30} 
        onTimeout={handleTimeout} 
        isPaused={answerStatus !== "idle" || activeModal !== null} 
      />

      {/* Question Box */}
      <motion.div 
        key={`q-${question.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full relative mb-8"
      >
        <div className="absolute inset-0 bg-baseera-accent rounded-full translate-y-2 opacity-30 blur-md"></div>
        <div className="relative w-full bg-baseera-primary border-4 border-baseera-accent rounded-[40px] py-8 px-8 md:px-12 text-center shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
            {question.question}
          </h2>
        </div>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
        <AnimatePresence>
          {question.options.map((option, index) => (
            <motion.button
              key={`${question.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleSelect(index)}
              disabled={answerStatus !== "idle" || hiddenOptions.includes(index)}
              className={`relative w-full py-4 md:py-5 px-6 md:px-8 rounded-full border-2 text-xl md:text-2xl font-bold transition-all duration-300 ${getOptionStyle(index)}`}
            >
              <div className="flex items-center justify-start">
                <span className="text-baseera-accent mr-4 font-black">
                  {['أ', 'ب', 'ج', 'د'][index]}:
                </span>
                <span className="flex-1 text-center">{option}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Modals for Lifelines */}
      {activeModal === "sheikhs" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-baseera-primary border-2 border-baseera-accent rounded-2xl p-8 max-w-md w-full text-center">
            <h3 className="text-3xl font-bold text-baseera-accent mb-6">مساعدة المشايخ</h3>
            <p className="text-white text-xl mb-8 leading-relaxed">
              الفرصة الآن متاحة للمشايخ والجمهور الحاضر لتقديم المساعدة والإدلاء بآرائهم حول الإجابة الصحيحة.
            </p>
            <p className="text-white/80 text-lg mb-2">
              لدى المشايخ والجمهور 30 ثانية فقط للنقاش ومساعدتكم.
            </p>
            <Timer duration={30} />
            <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-baseera-accent text-baseera-primary font-bold rounded-full hover:scale-105 transition-transform">العودة للعب</button>
          </motion.div>
        </div>
      )}

      {activeModal === "phone" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-baseera-primary border-2 border-baseera-accent rounded-2xl p-8 max-w-md w-full text-center">
            <h3 className="text-3xl font-bold text-baseera-accent mb-2">الاتصال بصديق</h3>
            <p className="text-white/80 text-lg mb-2">
              لديك 30 ثانية فقط لطرح السؤال وتلقي الإجابة من صديقك.
            </p>
            <Timer duration={30} />
            <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-baseera-accent text-baseera-primary font-bold rounded-full hover:scale-105 transition-transform">إنهاء المكالمة</button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
