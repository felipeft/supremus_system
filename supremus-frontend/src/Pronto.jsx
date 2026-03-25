import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import ModalDetalhesFull from './components/ModalDetalhesFull';

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000" : "https://supremus-system.onrender.com";

export default function Pronto() {
  const [listaOS, setListaOS] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [osSelecionada, setOsSelecionada] = useState(null);

// Busca registros concluídos para listagem
  const fetchDados = () => {
    setCarregando(true);
    fetch(`${API_URL}/listar-os`).then(res => res.json()).then(data => { 
      const concluidos = data.filter(os => os.status === "Pronto");
      setListaOS(concluidos); 
      setCarregando(false); 
    }).catch(() => setCarregando(false));
  };

  useEffect(() => { fetchDados(); }, []);

// Persistência e sincronização de estado
  const handleSalvarEdicao = async (id, dadosEditados) => {
    try {
      const res = await fetch(`${API_URL}/atualizar-os/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dadosEditados,
          valor_aparelho: parseFloat(dadosEditados.valor_aparelho) || 0,
          valor_reparo: parseFloat(dadosEditados.valor_reparo) || 0
        }),
      });
      if (res.ok) {
        alert("✅ SUCESSO: Registro atualizado!");
        setOsSelecionada(null);
        fetchDados();
      }
    } catch { alert("📡 Erro de conexão."); }
  };

  if (carregando) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-green-500" size={48} /></div>;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 print:hidden">
        <table className="w-full text-left border-collapse text-[#24414d]">
          <thead>
            <tr className="bg-green-600 text-[10px] uppercase text-white border-b border-green-700">
              <th className="p-4">OS</th>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Cliente</th>
              <th className="p-4 text-center bg-green-700 font-bold">Data Conclusão</th>
              <th className="p-4 text-right">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {listaOS.map((item) => (
              <tr key={item.os} onClick={() => setOsSelecionada(item)} className="hover:bg-green-50 cursor-pointer transition-colors group">
                <td className="p-4 font-bold text-gray-400">#{item.os}</td>
                <td className="p-4 font-semibold">{item.equipamento}</td>
                <td className="p-4 text-gray-600">{item.cliente}</td>
                <td className="p-4 text-center font-black bg-green-50">{item.prazo}</td>
                <td className="p-4 flex items-center justify-end gap-3 min-w-[250px]">
                  <span className={`text-[10px] font-bold uppercase ${item.cor === 'Verde' ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.substatus_pronto || "Aguardando Retirada"}
                  </span>
                  <div className={`w-12 h-3 rounded-full ${item.cor === 'Verde' ? 'bg-green-500' : 'bg-gray-900'} shadow-sm`}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listaOS.length === 0 && (
          <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
            Nenhum equipamento pronto no momento
          </div>
        )}
      </div>

      {osSelecionada && (
        <ModalDetalhesFull 
          os={osSelecionada} 
          onClose={() => setOsSelecionada(null)} 
          onSave={(d) => handleSalvarEdicao(osSelecionada.os, d)} 
        />
      )}
    </div>
  );
}