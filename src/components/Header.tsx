import React from 'react';
import { BrainCircuit, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: any, tab?: any) => void;
  onAuthClick: () => void;
  currentPage: string; // 👈 NEW PROP
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onAuthClick, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleDashboard = () => {
    if (user) {
      onNavigate('dashboard', 'job-matcher');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resume Match</h1>
              <p className="text-xs text-gray-600">AI-Powered Career Optimization</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {currentPage !== 'dashboard' && ( // 👈 Hide dashboard link if already on dashboard
                  <button
                    onClick={handleDashboard}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.full_name}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </a>
                <button
                  onClick={onAuthClick}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  {currentPage !== 'dashboard' && (
                    <button
                      onClick={handleDashboard}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                    How It Works
                  </a>
                  <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Pricing
                  </a>
                  <button
                    onClick={onAuthClick}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onAuthClick}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
