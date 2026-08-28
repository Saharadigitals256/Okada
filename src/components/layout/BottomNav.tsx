import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, History, User, QrCode } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isRider = user.user_type === 'rider';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around py-2">
        {/* Tab 1: Dashboard / Home */}
        <button
          onClick={() => onNavigate(isRider ? 'rider-dashboard' : 'landing')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentPage === 'rider-dashboard' || currentPage === 'landing'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Center Action: Big Prominent "Request Fare" (Rider) or "Scan & Pay" (Passenger) */}
        {isRider ? (
          <button
            onClick={() => onNavigate('create-payment')}
            className="flex flex-col items-center -mt-5 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform flex items-center justify-center text-slate-950">
              <PlusCircle className="w-7 h-7 fill-slate-950 stroke-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-0.5">Request Fare</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('passenger-pay-direct')}
            className="flex flex-col items-center -mt-5 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform flex items-center justify-center text-slate-950">
              <QrCode className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-0.5">Pay Ride</span>
          </button>
        )}

        {/* Tab 3: History */}
        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentPage === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">History</span>
        </button>

        {/* Tab 4: Profile & Settings */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentPage === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
