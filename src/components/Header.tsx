import { Search, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({ searchQuery = '', onSearchChange }: HeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/positions?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <>
      <header
        style={{ backgroundColor: '#781914' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center md:justify-between px-3 md:px-6 py-2 md:py-0 md:h-[52px] flex-wrap md:flex-nowrap gap-2"
      >
        <Link to="/" className="flex items-center gap-1 no-underline shrink-0">
          <span className="text-white font-bold text-lg md:text-xl tracking-tight">OpenPosition</span>
        </Link>

        <form onSubmit={handleSubmit} className="order-3 md:order-none basis-full md:basis-auto flex-1 md:max-w-[500px] md:mx-8 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder="Search positions, collaborators or keywords..."
              className="w-full h-8 pl-9 pr-3 text-sm text-white placeholder:text-white/50 bg-white/20 border-0 rounded-sm outline-none focus:bg-white/25 transition-colors"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-end ml-auto">
          <Link to="/about" className="hidden md:inline text-white/90 text-sm hover:text-white transition-colors no-underline">
            About
          </Link>
          <Link to="/submit" className="text-white/90 text-sm hover:text-white transition-colors no-underline">
            <span className="md:hidden">Submit</span>
            <span className="hidden md:inline">Submit a Post</span>
          </Link>
          {isAuthenticated && (
            <Link to="/review" className="hidden md:inline text-white/90 text-sm hover:text-white transition-colors no-underline">
              Review
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:inline text-white/90 text-sm hover:text-white transition-colors no-underline">
              Admin
            </Link>
          )}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ''} className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                <span className="hidden md:inline text-white text-sm">{user.name || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-white/80 text-sm hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white transition-colors no-underline"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Tagline bar */}
      <div
        className="hidden md:flex fixed top-[52px] left-0 right-0 z-40 items-center justify-center h-[34px]"
        style={{ backgroundColor: '#E8E8E8', borderBottom: '1px solid #DCDCDC' }}
      >
        <span className="text-[13px] text-[#555]">
          Open Positions. Open Collaborations. Open Research.
        </span>
      </div>
    </>
  );
}
