import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [listaOS, setListaOS] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("https://supremus-system.onrender.com/listar-os")
      .then(res => res.json())
      .then(data => {
        setListaOS(data);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao buscar OS:", err);
        setCarregando(false);
      });
  }, []);

  const mapaCores = {
    "Verde": "bg-green-500",
    "Azul": "bg-blue-500",
    "Laranja": "bg-orange-500",
    "Vermelho": "bg-red-500",
    "Preto": "bg-gray-900"
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#24414d]">
        <Loader2 className="animate-spin" size={48} />
        <p className="mt-4 font-bold uppercase text-xs tracking-widest">Sincronizando com Firebase...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-black uppercase text-[#24414d] tracking-tighter">Fila de Trabalho</h2>
        <div className="flex gap-2">
           <span className="text-[10px] bg-[#f8e309] text-[#24414d] px-2 py-1 rounded-full font-bold uppercase">Prazo Atualizado</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#24414d] text-[10px] uppercase tracking-widest text-white border-b border-[#f8e309]">
              <th className="p-4">OS</th>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Entrada</th>
              <th className="p-4 text-center">Prazo Final</th>
              <th className="p-4 text-right">Prioridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listaOS.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400 text-sm italic">Nenhuma ordem de serviço pendente.</td>
              </tr>
            ) : (
              listaOS.map((item) => (
                <tr key={item.os} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-bold text-sm text-gray-400">#{item.os}</td>
                  <td className="p-4 font-semibold text-sm text-[#24414d]">{item.equipamento}</td>
                  <td className="p-4 text-sm text-gray-600">{item.cliente}</td>
                  <td className="p-4 text-xs text-gray-400">{item.entrada}</td>
                  <td className="p-4 text-center font-black text-[#24414d] text-sm bg-yellow-50 border-x border-yellow-100">{item.prazo}</td>
                  <td className="p-4 flex items-center justify-end gap-3">
                    <span className="text-[10px] font-bold uppercase text-gray-400">{item.status}</span>
                    <div className={`w-12 h-3 rounded-full ${mapaCores[item.cor] || 'bg-gray-300'} shadow-sm group-hover:scale-110 transition-transform`}></div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}