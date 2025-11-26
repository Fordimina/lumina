import React, { useState, useEffect } from 'react';
import { Search, Aperture, Lock, Menu, X, LogOut, Shield, User } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  title: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userRole: UserRole;
  username: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title,
  searchTerm, 
  setSearchTerm, 
  userRole, 
  username,
  onLoginClick, 
  onLogoutClick 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'ADMIN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MODERATOR': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/5 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Aperture className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              {title}
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-full leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
              placeholder="Search tags, captions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {userRole === 'GUEST' ? (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg"
              >
                <Lock className="w-3 h-3" />
                <span>Login</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
                  {userRole === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  <span className="uppercase tracking-wide">{userRole}</span>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            
             {/* Mobile Menu Toggle */}
             <button 
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 animate-fade-in space-y-4">
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {userRole !== 'GUEST' && (
              <div className="flex items-center justify-between px-1">
                 <span className="text-sm text-zinc-400">Logged in as <span className="text-white font-medium">{username}</span></span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;