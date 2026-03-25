import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import ModalDetalhesFull from './components/ModalDetalhesFull';

// Configuração de ambiente da API
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000" : "https://supremus-system.onrender.com";

export default function Dashboard() {
  const [listaOS, setListaOS] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [osSelecionada, setOsSelecionada] = useState(null);

  const fetchDados = () => {
    setCarregando(true);
    fetch(`${API_URL}/listar-os`)
      .then(res => res.json())
      .then(data => { 
        const ativos = data.filter(os => os.status !== "Pronto");
        
// Ordenação multinível: Prazo final e timestamp de entrada
        ativos.sort((a, b) => {
          const [dA, mA, yA] = a.prazo.split('/');
          const [dB, mB, yB] = b.prazo.split('/');
          const dateA = new Date(yA, mA - 1, dA);
          const dateB = new Date(yB, mB - 1, dB);
          
          if (dateA - dateB !== 0) return dateA - dateB;

          const entryA = new Date(a.entrada_full.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
          const entryB = new Date(b.entrada_full.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
          return entryA - entryB;
        });

        setListaOS(ativos); 
        setCarregando(false); 
      })
      .catch(() => setCarregando(false));
  };

  useEffect(() => { fetchDados(); }, []);

// Regras de negócio para estados visuais e criticidade
  const getStatusInfo = (item) => {
    if (item.cor === "Cinza") return { texto: "Aguardando aprovação", cor: "Cinza", devePulsar: true };
    
    const partes = item.prazo.split("/");
    const dFinal = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const diff = Math.ceil((dFinal - hoje) / (1000 * 60 * 60 * 24));
    
    let cor = "Verde";
    let devePulsar = false;
    let textoDias = diff <= 0 ? (diff === 0 ? "Vence hoje" : "Atrasado") : `${diff} dias restante${diff > 1 ? 's' : ''}`;

    if (item.status === "Em Reparo") {
      if (diff <= 2) { cor = "Roxo"; devePulsar = true; }
      else if (diff <= 5) { cor = "Vermelho"; devePulsar = true; }
      else if (diff <= 7) { cor = "Laranja"; devePulsar = true; }
      else if (diff <= 10) { cor = "Amarelo"; devePulsar = true; }
      else if (diff <= 20) { cor = "Verde"; devePulsar = false; }
      else { cor = "Azul"; devePulsar = false; }
    } else {
      if (diff <= 1) { cor = "Vermelho"; devePulsar = true; }
      else if (diff <= 3) { cor = "Laranja"; devePulsar = true; }
      else if (diff <= 5) { cor = "Azul"; devePulsar = false; }
      else { cor = "Verde"; devePulsar = false; }
    }

    return { texto: `${item.status.toUpperCase()} (${textoDias})`, cor, devePulsar };
  };

// Persistência de dados e atualização de grid
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
        alert("✅ Alterações salvas!"); 
        setOsSelecionada(null); 
        fetchDados(); 
      }
    } catch { 
      alert("Erro de conexão."); 
    }
  };

  const mapaCores = { 
    "Verde": "bg-green-500", "Azul": "bg-blue-500", "Laranja": "bg-orange-500", 
    "Vermelho": "bg-red-500", "Preto": "bg-gray-900", "Cinza": "bg-gray-400",
    "Amarelo": "bg-yellow-400", "Roxo": "bg-purple-900" 
  };

  if (carregando) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#24414d]" size={48} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#24414d] text-[10px] uppercase text-white font-black tracking-widest">
              <th className="p-5">OS</th>
              <th className="p-5">Equipamento</th>
              <th className="p-5">Cliente</th>
              <th className="p-5 text-center bg-[#f8e309] text-[#24414d]">Prazo Final</th>
              <th className="p-5 text-right pr-10">Urgência / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {listaOS.map((item) => {
              const info = getStatusInfo(item);
              return (
                <tr key={item.os} onClick={() => setOsSelecionada(item)} className="hover:bg-blue-50/30 cursor-pointer transition-all group">
                  <td className="p-5 font-black text-gray-500 group-hover:text-blue-500">#{item.os}</td>
                  <td className="p-5 font-bold text-[#24414d] uppercase">{item.equipamento}</td>
                  <td className="p-5 text-gray-500 font-medium">{item.cliente}</td>
                  <td className="p-5 text-center font-black bg-yellow-50/50 text-[#24414d] text-base">
                    {info.cor === "Cinza" ? "---" : item.prazo}
                  </td>
                  <td className="p-5 text-right pr-8">
                    <div className="flex justify-end items-center gap-3">
                      <div className={`
                        ${mapaCores[info.cor]} 
                        ${info.devePulsar ? 'animate-pulse scale-110 shadow-lg' : ''}
                        px-6 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-tighter
                        min-w-[180px] text-center transition-all duration-500
                      `}>
                        {info.texto}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {listaOS.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <CheckCircle2 className="text-gray-200" size={64} />
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Oficina Limpa - Tudo em dia!</p>
          </div>
        )}
      </div>

// Injeção de dependência para manipulação de registro individual
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