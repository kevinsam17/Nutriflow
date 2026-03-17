import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Auth } from './pages/Auth';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reusedPrompt, setReusedPrompt] = useState<string>('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'dashboard') setReusedPrompt('');
  };

  const handleReusePrompt = (prompt: string) => {
    setReusedPrompt(prompt);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main>
        {currentPage === 'dashboard' && (
          <Dashboard user={user} initialPrompt={reusedPrompt} />
        )}
        {currentPage === 'history' && (
          <History user={user} onReuse={handleReusePrompt} />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
