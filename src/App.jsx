import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RulesModal from './components/RulesModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const location = useLocation();

  // Hide header footer in actual match game if desired, or keep navbar for easy exit
  const isMatchRunning = location.pathname.startsWith('/game/');

  return (
    <div className="min-h-screen flex flex-col bg-[#070A0F] text-slate-100 font-sans">
      <Navbar onOpenRules={() => setIsRulesOpen(true)} />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage onOpenRules={() => setIsRulesOpen(true)} />} />
          <Route path="/dashboard" element={<DashboardPage onOpenRules={() => setIsRulesOpen(true)} />} />
          <Route path="/game/:roomCode" element={<GamePage onOpenRules={() => setIsRulesOpen(true)} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isMatchRunning && <Footer onOpenRules={() => setIsRulesOpen(true)} />}

      {/* Global Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
