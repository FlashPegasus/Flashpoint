import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/authStore';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDashboard from './pages/TournamentDashboard';
import MyArea from './pages/MyArea';
import Discover from './pages/Discover';
import RankingGlobal from './pages/RankingGlobal';
import TournamentPublic from './pages/TournamentPublic';
import Leagues from './pages/Leagues';
import LeagueCreate from './pages/LeagueCreate';
import LeagueDashboard from './pages/LeagueDashboard';
import JoinLeague from './pages/JoinLeague';
import Profile from './pages/Profile';
import JoinTournament from './pages/JoinTournament';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TranslateGuide from './pages/TranslateGuide';
import { BottomNav } from './components/layout';



const App: React.FC = () => {
  const { initialize, user, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex flex-col items-center justify-center animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-t-2 border-primary border-r-2 border-transparent animate-spin" />
          <img 
            src="https://i.postimg.cc/LX1Z1Ss4/Image-1-(1).png" 
            alt="FlashPoint" 
            className="absolute inset-0 w-16 h-16 m-auto object-contain animate-pulse-subtle"
          />
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">FlashPoint</p>
          <p className="text-[11px] font-bold text-muted/40 uppercase tracking-widest">Sincronizando Deck...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/my-area" element={<ProtectedRoute><MyArea /></ProtectedRoute>} />
        <Route path="/organizer/dashboard" element={<ProtectedRoute><MyArea /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/tournament/create" element={<ProtectedRoute><TournamentCreate /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute><TournamentDashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/discover" element={<Discover />} />
        <Route path="/ranking" element={<RankingGlobal />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/league/create" element={<ProtectedRoute><LeagueCreate /></ProtectedRoute>} />
        <Route path="/league/:id" element={<ProtectedRoute><LeagueDashboard /></ProtectedRoute>} />
        <Route path="/join-league/:code" element={<JoinLeague />} />
        <Route path="/tournament/:id/public" element={<TournamentPublic />} />
        <Route path="/join/:id" element={<JoinTournament />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/en" element={<TranslateGuide />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </Router>
  );
};

export default App;
