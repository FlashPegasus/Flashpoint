import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/authStore';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDashboard from './pages/TournamentDashboard';
import Discover from './pages/Discover';
import RankingGlobal from './pages/RankingGlobal';

import Leagues from './pages/Leagues';
import LeagueCreate from './pages/LeagueCreate';
import LeagueDashboard from './pages/LeagueDashboard';
import JoinLeague from './pages/JoinLeague';
import Profile from './pages/Profile';
import JoinTournament from './pages/JoinTournament';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TranslateGuide from './pages/TranslateGuide';
import NewArea from './pages/NewArea';
import { BottomNav } from './components/layout';
import { LoadingScreen } from './components/ui';

const ProtectedRoute = ({ children, user }: { children: React.ReactNode, user: any }) => {
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { initialize, user, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex flex-col items-center justify-center animate-fade-in text-secondary">
        <LoadingScreen message="Sincronizando Deck..." />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/my-area" element={<ProtectedRoute user={user}><NewArea /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
        <Route path="/tournament/create" element={<ProtectedRoute user={user}><TournamentCreate /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute user={user}><TournamentDashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/discover" element={<Discover />} />
        <Route path="/ranking" element={<RankingGlobal />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/league/create" element={<ProtectedRoute user={user}><LeagueCreate /></ProtectedRoute>} />
        <Route path="/league/:id" element={<ProtectedRoute user={user}><LeagueDashboard /></ProtectedRoute>} />
        <Route path="/join-league/:code" element={<JoinLeague />} />
        <Route path="/tournament/:id/public" element={<TournamentDashboard />} />
        <Route path="/join/:id" element={<JoinTournament />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/en" element={<TranslateGuide />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </Router>
  );
};

export default App;
