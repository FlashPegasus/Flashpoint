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
  const { initialize, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/tournament/create" element={<ProtectedRoute><TournamentCreate /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute><TournamentDashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/discover" element={<Discover />} />
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
