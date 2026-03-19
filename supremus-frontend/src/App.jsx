import React, { useState } from 'react';
import CheckIn from './CheckIn';
import Dashboard from './Dashboard';
import { LayoutDashboard, UserPlus } from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('checkin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-blue-700 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-black uppercase tracking-tighter text-xl">Supremus Service</h1>
          <div className="flex gap-2">
            <button onClick={() => setAbaAtiva('checkin')} className={`p-2 rounded-lg flex items-center gap-2 ${abaAtiva === 'checkin' ? 'bg-white text-blue-700' : 'hover:bg-blue-600'}`}>
              <UserPlus size={20} /> <span className="text-xs font-bold uppercase hidden md:block">Nova Entrada</span>
            </button>
            <button onClick={() => setAbaAtiva('dashboard')} className={`p-2 rounded-lg flex items-center gap-2 ${abaAtiva === 'dashboard' ? 'bg-white text-blue-700' : 'hover:bg-blue-600'}`}>
              <LayoutDashboard size={20} /> <span className="text-xs font-bold uppercase hidden md:block">Dashboard</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6">{abaAtiva === 'checkin' ? <CheckIn /> : <Dashboard />}</main>
    </div>
  );
}