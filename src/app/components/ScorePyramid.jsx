"use client";

import { motion } from "framer-motion";

const pyramidLevels = [
  { id: 15, points: 1000000 },
  { id: 14, points: 500000 },
  { id: 13, points: 250000 },
  { id: 12, points: 125000 },
  { id: 11, points: 64000 },
  { id: 10, points: 32000, safe: true },
  { id: 9, points: 16000 },
  { id: 8, points: 8000 },
  { id: 7, points: 4000 },
  { id: 6, points: 2000 },
  { id: 5, points: 1000, safe: true },
  { id: 4, points: 500 },
  { id: 3, points: 300 },
  { id: 2, points: 200 },
  { id: 1, points: 100 },
];

export default function ScorePyramid({ currentQuestionIndex }) {
  // currentQuestionIndex starts at 0 (first question)
  const currentLevelId = currentQuestionIndex + 1;

  return (
    <div className="w-72 bg-baseera-primary-dark/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-baseera-accent/20 flex flex-col justify-end h-[600px] overflow-hidden hidden lg:flex">
      <h2 className="text-baseera-accent text-center font-bold mb-4 text-xl pb-4 border-b border-baseera-accent/20">
        سلم الجوائز
      </h2>
      <div className="flex flex-col gap-1.5 flex-grow justify-end">
        {pyramidLevels.map((level) => {
          const isActive = currentLevelId === level.id;
          const isPassed = currentLevelId > level.id;

          return (
            <motion.div
              key={level.id}
              initial={false}
              animate={{
                scale: isActive ? 1.05 : 1,
                backgroundColor: isActive ? "#d4b895" : isPassed ? "rgba(212,184,149,0.15)" : "rgba(0,0,0,0)",
                color: isActive ? "#121c2d" : isPassed ? "#d4b895" : "rgba(212,184,149,0.4)",
              }}
              className={`flex justify-between items-center px-4 py-1.5 rounded-lg font-bold transition-colors ${
                level.safe && !isActive ? "border-l-4 border-r-4 border-baseera-accent/50 text-baseera-accent/80" : ""
              } ${level.safe && isActive ? "border-l-4 border-r-4 border-baseera-primary" : ""}`}
            >
              <span className="text-lg w-6 text-center">{level.id}</span>
              <span className="text-lg" dir="ltr">{level.points.toLocaleString()}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
