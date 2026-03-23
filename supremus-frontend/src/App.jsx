import React, { useState } from 'react';
import CheckIn from './CheckIn';
import Dashboard from './Dashboard';
import Pronto from './Pronto';
import { LayoutDashboard, UserPlus, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('checkin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#24414d]">
      <nav className="bg-[#24414d] text-white p-4 sticky top-0 z-50 shadow-md border-b-2 border-[#f8e309]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo_supremus.svg" alt="Logo" className="h-10 w-auto" />
            <h1 className="font-black uppercase tracking-tighter text-xl">Supremus Service</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAbaAtiva('checkin')} 
              className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${abaAtiva === 'checkin' ? 'bg-[#f8e309] text-[#24414d] scale-105 shadow-md' : 'hover:bg-[#325a6a]'}`}>
              <UserPlus size={18} /> <span className="text-xs font-bold uppercase hidden md:block">Nova Entrada</span>
            </button>
            <button onClick={() => setAbaAtiva('dashboard')} 
              className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${abaAtiva === 'dashboard' ? 'bg-[#f8e309] text-[#24414d] scale-105 shadow-md' : 'hover:bg-[#325a6a]'}`}>
              <LayoutDashboard size={18} /> <span className="text-xs font-bold uppercase hidden md:block">Manutenção</span>
            </button>
            <button onClick={() => setAbaAtiva('pronto')} 
              className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${abaAtiva === 'pronto' ? 'bg-green-500 text-white scale-105 shadow-md' : 'hover:bg-[#325a6a]'}`}>
              <CheckCircle2 size={18} /> <span className="text-xs font-bold uppercase hidden md:block">Prontos</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        {abaAtiva === 'checkin' && <CheckIn />}
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'pronto' && <Pronto />}
      </main>
    </div>
  );
}