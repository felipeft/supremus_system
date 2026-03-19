import React, { useState } from 'react';
import CheckIn from './CheckIn';
import Dashboard from './Dashboard';
import { LayoutDashboard, UserPlus } from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('checkin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#24414d]">
      {/* Navbar Superior com a nova cor #24414d */}
      <nav className="bg-[#24414d] text-white p-4 sticky top-0 z-50 shadow-md border-b-2 border-[#f8e309]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* INSERÇÃO DA LOGO: Substitua 'logo_supremus.svg' pelo caminho real */}
            <img src="/logo_supremus.svg" alt="Supremus Logo" className="h-10 w-auto" />
            <h1 className="font-black uppercase tracking-tighter text-xl text-white">Supremus Service</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAbaAtiva('checkin')} 
              className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${abaAtiva === 'checkin' ? 'bg-[#f8e309] text-[#24414d]' : 'hover:bg-[#325a6a]'}`}>
              <UserPlus size={20} /> <span className="text-xs font-bold uppercase hidden md:block">Nova Entrada</span>
            </button>
            <button onClick={() => setAbaAtiva('dashboard')} 
              className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${abaAtiva === 'dashboard' ? 'bg-[#f8e309] text-[#24414d]' : 'hover:bg-[#325a6a]'}`}>
              <LayoutDashboard size={20} /> <span className="text-xs font-bold uppercase hidden md:block">Dashboard</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6">{abaAtiva === 'checkin' ? <CheckIn /> : <Dashboard />}</main>
    </div>
  );
}