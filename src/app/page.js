"use client";

import { useState, useEffect } from "react";
import { Maximize, Minimize, Moon, Sun } from "lucide-react";
import StartScreen from "./components/StartScreen";
import ScorePyramid from "./components/ScorePyramid";
import Trivia from "./components/Trivia";
import TeamsPanel from "./components/TeamsPanel";
import IntermissionScreen from "./components/IntermissionScreen";
import questionsData from "./data/questions.json"; // Expects 60 questions (15 levels * 4 variations)

export default function Game() {
  const [gameState, setGameState] = useState("start"); // start, playing, gameover, won, withdrawn, intermission
  const [gameMode, setGameMode] = useState(null); // 'single' or 'group'
  
  // Single Player State
  const [singleCurrentQuestionIndex, setSingleCurrentQuestionIndex] = useState(0);
  const [singleLifelines, setSingleLifelines] = useState({ fiftyFifty: false, phone: false, sheikhs: false });

  // Multiplayer State
  const [teams, setTeams] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [roundCounter, setRoundCounter] = useState(1);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const resetGame = () => {
    setSingleCurrentQuestionIndex(0);
    setSingleLifelines({ fiftyFifty: false, phone: false, sheikhs: false });
    setTeams([]);
    setCurrentTeamIndex(0);
    setRoundCounter(1);
    setGameMode(null);
    setGameState("start");
  };

  const startGame = (config) => {
    setGameMode(config.mode);
    if (config.mode === "group") {
      setTeams(config.teams);
      setCurrentTeamIndex(0);
      setRoundCounter(1);
    }
    setGameState("playing");
  };

  const getActiveTeam = () => {
    if (gameMode === "single") return null;
    return teams[currentTeamIndex];
  };

  // Helper to find next active team
  const advanceToNextActiveTeam = (currentTeams, currentIndex) => {
    let nextIndex = (currentIndex + 1) % currentTeams.length;
    let loopCount = 0;
    while (currentTeams[nextIndex].isEliminated && loopCount < currentTeams.length) {
      nextIndex = (nextIndex + 1) % currentTeams.length;
      loopCount++;
    }
    if (loopCount >= currentTeams.length) {
      return -1; // All eliminated
    }
    return nextIndex;
  };

  const handleAnswer = (isCorrect) => {
    if (gameMode === "single") {
      if (isCorrect) {
        if (singleCurrentQuestionIndex >= 14) {
          setGameState("won");
        } else {
          setSingleCurrentQuestionIndex(prev => prev + 1);
        }
      } else {
        setGameState("gameover");
      }
    } else {
      // Group Mode
      const updatedTeams = [...teams];
      const team = updatedTeams[currentTeamIndex];

      if (isCorrect) {
        if (team.currentQuestionIndex >= 14) {
          setGameState("won"); // Team won!
          return;
        } else {
          team.currentQuestionIndex += 1;
        }
      } else {
        if (team.hasImmunity) {
          team.hasImmunity = false; // Lose immunity instead of being eliminated
          // Maybe we want to show an alert or something, but simply keeping them in the game is the core logic.
          alert(`لقد استخدم فريق ${team.name} حصانته! لن يتم إقصاؤه هذه المرة.`);
        } else {
          team.isEliminated = true;
        }
      }

      setTeams(updatedTeams);

      const nextActiveIndex = advanceToNextActiveTeam(updatedTeams, currentTeamIndex);
      if (nextActiveIndex === -1) {
        setGameState("gameover"); // All teams eliminated
      } else {
        if (nextActiveIndex <= currentTeamIndex) {
          const newRoundCounter = roundCounter + 1;
          setRoundCounter(newRoundCounter);
          if ((newRoundCounter - 1) % 5 === 0 && (newRoundCounter - 1) > 0) {
            setGameState("intermission");
          }
        }
        setCurrentTeamIndex(nextActiveIndex);
      }
    }
  };

  const handleUseLifeline = (type) => {
    if (gameMode === "single") {
      setSingleLifelines(prev => ({ ...prev, [type]: true }));
    } else {
      const updatedTeams = [...teams];
      updatedTeams[currentTeamIndex].lifelines[type] = true;
      setTeams(updatedTeams);
    }
  };

  const handleWithdraw = () => {
    if (gameMode === "single") {
      setGameState("withdrawn");
    } else {
      // In group mode, withdraw eliminates them with their money, and continues game
      const updatedTeams = [...teams];
      updatedTeams[currentTeamIndex].isEliminated = true;
      updatedTeams[currentTeamIndex].withdrawn = true;
      setTeams(updatedTeams);
      
      const nextActiveIndex = advanceToNextActiveTeam(updatedTeams, currentTeamIndex);
      if (nextActiveIndex === -1) {
        // If they were the last team and withdrew, game is technically over (everyone out)
        setGameState("gameover");
      } else {
        if (nextActiveIndex <= currentTeamIndex) {
          const newRoundCounter = roundCounter + 1;
          setRoundCounter(newRoundCounter);
          if ((newRoundCounter - 1) % 5 === 0 && (newRoundCounter - 1) > 0) {
            setGameState("intermission");
          }
        }
        setCurrentTeamIndex(nextActiveIndex);
      }
    }
  };

  const handleIntermissionContinue = (winnerData) => {
    if (winnerData) {
      const updatedTeams = [...teams];
      const teamIndex = updatedTeams.findIndex(t => t.id === winnerData.teamId);
      
      if (teamIndex !== -1) {
        if (winnerData.rewardType === "levelUp") {
          // They cannot win the entire game from an intermission, so cap at 14
          if (updatedTeams[teamIndex].currentQuestionIndex < 14) {
            updatedTeams[teamIndex].currentQuestionIndex += 1;
          }
        } else if (winnerData.rewardType === "restoreLifeline" && winnerData.lifeline) {
          updatedTeams[teamIndex].lifelines[winnerData.lifeline] = false;
        } else if (winnerData.rewardType === "immunity") {
          updatedTeams[teamIndex].hasImmunity = true;
        }
      }
      setTeams(updatedTeams);
    }
    setGameState("playing");
  };

  // Safe haven & amounts logic
  const getPrizeAmount = (questionIndex) => {
    const points = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
    if (questionIndex === 0) return 0;
    return points[questionIndex - 1];
  };

  const getGuaranteedAmount = (questionIndex) => {
    if (questionIndex >= 10) return 32000;
    if (questionIndex >= 5) return 1000;
    return 0;
  };

  // Compute question to show
  let currentQuestion = null;
  let activeLifelines = null;
  let currentQIndexForPyramid = 0;

  if (gameState === "playing") {
    if (gameMode === "single") {
      // Single player uses variant 0 (first family's questions)
      currentQuestion = questionsData[singleCurrentQuestionIndex * 4];
      activeLifelines = singleLifelines;
      currentQIndexForPyramid = singleCurrentQuestionIndex;
    } else {
      const activeTeam = getActiveTeam();
      // Level = activeTeam.currentQuestionIndex. Variant = currentTeamIndex
      const absoluteQuestionIndex = (activeTeam.currentQuestionIndex * 4) + currentTeamIndex;
      // Fallback in case JSON doesn't have enough questions yet
      currentQuestion = questionsData[absoluteQuestionIndex] || questionsData[0];
      activeLifelines = activeTeam.lifelines;
      currentQIndexForPyramid = activeTeam.currentQuestionIndex;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-baseera-bg">
      <button 
        onClick={toggleFullscreen}
        className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-baseera-primary/10 text-baseera-primary hover:bg-baseera-primary hover:text-baseera-accent transition-all flex items-center justify-center backdrop-blur-sm"
        title="ملء الشاشة"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 left-24 z-50 w-12 h-12 rounded-full bg-baseera-primary/10 text-baseera-text hover:bg-baseera-primary hover:text-baseera-accent transition-all flex items-center justify-center backdrop-blur-sm"
        title={isDarkMode ? "الوضع المضيء" : "الوضع الليلي"}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {gameState === "start" && (
        <StartScreen onStart={startGame} />
      )}
      
      {gameState === "playing" && (
        <div className="w-full min-h-screen flex flex-col items-center max-w-7xl mx-auto px-4 py-8 relative">
          
          {gameMode === "group" && (
            <TeamsPanel teams={teams} currentTeamIndex={currentTeamIndex} />
          )}

          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full gap-4 md:gap-8 mt-2 md:mt-4">
            <div className="flex-1 flex flex-col justify-center w-full">
              {/* Mobile Score Indicator (Hidden on Desktop) */}
              <div className="lg:hidden w-full max-w-4xl mx-auto mb-4 flex justify-between items-center bg-baseera-primary-dark/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-baseera-accent/30 shadow-lg">
                <span className="text-white font-bold">المستوى: <span className="text-baseera-accent">{currentQIndexForPyramid + 1}</span></span>
                <span className="text-white font-bold">الجائزة: <span className="text-baseera-accent">{getPrizeAmount(currentQIndexForPyramid + 1).toLocaleString()}</span></span>
              </div>
              {gameMode === "group" && (
                <div className="mb-4 text-center w-full max-w-4xl mx-auto">
                  <span className="inline-block px-6 py-2 rounded-full bg-baseera-accent text-baseera-primary font-black text-xl shadow-lg border-2 border-white/20 animate-bounce">
                    دور: {getActiveTeam()?.name}
                  </span>
                </div>
              )}
              
              <Trivia 
                question={currentQuestion} 
                onAnswer={handleAnswer} 
                onWithdraw={handleWithdraw}
                lifelines={activeLifelines}
                onUseLifeline={handleUseLifeline}
              />
            </div>
            
            <div className="hidden lg:block shrink-0">
              <ScorePyramid currentQuestionIndex={currentQIndexForPyramid} />
            </div>
          </div>
        </div>
      )}

      {gameState === "intermission" && (
        <IntermissionScreen 
          roundIndex={roundCounter - 1} 
          teams={teams}
          onContinue={handleIntermissionContinue} 
        />
      )}

      {/* Summary Screens */}
      {gameState === "gameover" && (
        <div className="text-center z-10 flex flex-col items-center bg-white/90 p-12 rounded-3xl shadow-2xl backdrop-blur-md border border-baseera-primary/10">
          <h1 className="text-6xl font-black text-red-600 mb-6 drop-shadow-md">انتهاء اللعبة!</h1>
          
          {gameMode === "single" ? (
            <>
              <p className="text-2xl text-baseera-primary font-bold mb-4">لقد خسرت.</p>
              <p className="text-3xl text-baseera-primary-dark font-black mb-8">
                رصيدك المضمون: <span className="text-green-600 dir-ltr">{getGuaranteedAmount(singleCurrentQuestionIndex).toLocaleString()}</span> نقطة
              </p>
            </>
          ) : (
            <div className="mb-8 w-full max-w-md">
              <p className="text-2xl text-baseera-primary font-bold mb-6">لقد تم إقصاء جميع الأسر!</p>
              <div className="space-y-3 text-right">
                {teams.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                    <span className="font-bold text-lg">{t.name}</span>
                    <span className="text-green-600 font-black" dir="ltr">
                      {t.withdrawn ? getPrizeAmount(t.currentQuestionIndex).toLocaleString() : getGuaranteedAmount(t.currentQuestionIndex).toLocaleString()} نقطة
                      {t.withdrawn && <span className="text-xs text-blue-500 ml-2">(منسحب)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={resetGame}
            className="px-10 py-4 rounded-full bg-baseera-primary text-baseera-accent text-xl font-bold hover:scale-105 hover:shadow-xl transition-all"
          >
            العب مرة أخرى
          </button>
        </div>
      )}

      {gameState === "withdrawn" && gameMode === "single" && (
        <div className="text-center z-10 flex flex-col items-center bg-white/90 p-12 rounded-3xl shadow-2xl backdrop-blur-sm border border-baseera-primary/10">
          <h1 className="text-5xl font-black text-baseera-primary mb-6 drop-shadow-md">لقد انسحبت بذكاء!</h1>
          <p className="text-4xl text-baseera-primary-dark font-black mb-8">
            جائزتك هي: <span className="text-green-600 dir-ltr">{getPrizeAmount(singleCurrentQuestionIndex).toLocaleString()}</span> نقطة
          </p>
          <button onClick={resetGame} className="px-10 py-4 rounded-full bg-baseera-primary text-baseera-accent text-xl font-bold">العب مرة أخرى</button>
        </div>
      )}

      {gameState === "won" && (
        <div className="text-center z-10 flex flex-col items-center bg-white/90 p-12 rounded-3xl shadow-2xl backdrop-blur-md border border-baseera-primary/10">
          <h1 className="text-7xl font-black text-baseera-accent mb-6 drop-shadow-lg">بطل بصيرة!</h1>
          {gameMode === "group" && (
            <p className="text-4xl text-baseera-primary font-black mb-4">
              ألف مبروك لـ <span className="text-green-600">{getActiveTeam()?.name}</span>
            </p>
          )}
          <p className="text-3xl text-baseera-primary font-bold mb-8">
            لقد فزت بـ: <span className="text-green-600 dir-ltr">1,000,000</span> نقطة!
          </p>
          <button onClick={resetGame} className="px-10 py-4 rounded-full bg-baseera-primary text-baseera-accent text-xl font-bold">العب مرة أخرى</button>
        </div>
      )}
    </main>
  );
}
