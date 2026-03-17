import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, Activity, History, Utensils } from 'lucide-react';
import { logout } from '../services/firebase';

interface NavbarProps {
  user: User | null;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentPage, onNavigate }) => {
  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <Activity className="h-8 w-8 text-emerald-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">NutriFlow</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`p-2 rounded-md flex items-center transition-colors ${
                currentPage === 'dashboard' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <Utensils className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">Tracker</span>
            </button>
            
            <button
              onClick={() => onNavigate('history')}
              className={`p-2 rounded-md flex items-center transition-colors ${
                currentPage === 'history' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <History className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">History</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-700">{user.displayName || user.email}</span>
                </div>
                <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Sign Out"
                >
                <LogOut className="h-5 w-5" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
