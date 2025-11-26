import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, username: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication Logic
    if (username === 'admin' && password === 'password') {
      onLogin('ADMIN', 'Administrator');
      onClose();
    } else if (username === 'mod' && password === 'password') {
      onLogin('MODERATOR', 'Moderator');
      onClose();
    } else {
      setError('Invalid credentials. Try "admin/password" or "mod/password"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        
        <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Restricted Access
            </h2>
            <p className="text-sm text-zinc-400">Sign in to manage gallery content</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute top-3 left-3 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors mt-2"
          >
            Sign In
          </button>
          
          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500">
              Demo: Use <span className="text-zinc-300">admin</span> / <span className="text-zinc-300">password</span> or <span className="text-zinc-300">mod</span> / <span className="text-zinc-300">password</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;