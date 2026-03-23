import React, { useEffect, useState } from 'react';
import { Loader2, X, Save, Smartphone, User, FileText, AlertCircle, DollarSign, Clock, Printer } from 'lucide-react';

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000" : "https://supremus-system.onrender.com";

export default function Dashboard() {
  const [listaOS, setListaOS] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [osSelecionada, setOsSelecionada] = useState(null);

  const fetchDados = () => {
    setCarregando(true);
    fetch(`${API_URL}/listar-os`).then(res => res.json()).then(data => { 
      const ativos = data.filter(os => os.status !== "Pronto");
      
      // ALGORITMO DE ORDENAÇÃO DE ENGENHARIA
      ativos.sort((a, b) => {
        // Chave 1: Prazo Final (Data Limite)
        const [dA, mA, yA] = a.prazo.split('/');
        const [dB, mB, yB] = b.prazo.split('/');
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        
        if (dateA - dateB !== 0) return dateA - dateB;

        // Chave 2 (Desempate): Data de Chegada (Entrada Full com Segundos)
        const [dEA, mEA, yEA] = a.entrada_full.split(' ')[0].split('/');
        const [hA, minA, sA] = a.entrada_full.split(' ')[1].split(':');
        const [dEB, mEB, yEB] = b.entrada_full.split(' ')[0].split('/');
        const [hB, minB, sB] = b.entrada_full.split(' ')[1].split(':');
        
        const entryA = new Date(yEA, mEA - 1, dEA, hA, minA, sA);
        const entryB = new Date(yEB, mEB - 1, dEB, hB, minB, sB);
        
        return entryA - entryB; // Quem chegou primeiro (menor data) fica acima
      });

      setListaOS(ativos); 
      setCarregando(false); 
    });
  };

  useEffect(() => { fetchDados(); }, []);

  const getStatusInfo = (item) => {
    if (item.cor === "Cinza") return { texto: "Aguardando aprovação", cor: "Cinza", prazoVisivel: "" };
    const partes = item.prazo.split("/");
    const dFinal = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const diff = Math.ceil((dFinal - hoje) / (1000 * 60 * 60 * 24));
    let cor = "Verde";
    let texto = diff <= 0 ? (diff === 0 ? "Vence hoje" : "Atrasado") : `${diff} dias restante${diff > 1 ? 's' : ''}`;
    if (item.status === "Em Reparo") {
      if (diff <= 2) cor = "Roxo"; else if (diff <= 5) cor = "Vermelho"; else if (diff <= 7) cor = "Laranja"; else if (diff <= 10) cor = "Amarelo"; else if (diff <= 20) cor = "Verde"; else cor = "Azul";
    } else {
      if (diff <= 1) cor = "Vermelho"; else if (diff <= 3) cor = "Laranja"; else if (diff <= 5) cor = "Azul"; else cor = "Verde";
    }
    return { texto: `${item.status} - ${texto}`, cor, prazoVisivel: item.prazo };
  };

  const handleSalvarEdicao = async (id, dadosEditados) => {
    try {
      const res = await fetch(`${API_URL}/atualizar-os/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dadosEditados, valor_aparelho: parseFloat(dadosEditados.valor_aparelho) || 0, valor_reparo: parseFloat(dadosEditados.valor_reparo) || 0 }),
      });
      if (res.ok) { alert("✅ SUCESSO: Dashboard Ordenado!"); setOsSelecionada(null); fetchDados(); }
    } catch { alert("📡 Erro de conexão."); }
  };

  const mapaCores = { "Verde": "bg-green-500", "Azul": "bg-blue-500", "Laranja": "bg-orange-500", "Vermelho": "bg-red-500", "Preto": "bg-gray-900", "Cinza": "bg-gray-400", "Amarelo": "bg-yellow-400", "Roxo": "bg-purple-900" };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#24414d] text-[10px] uppercase text-white border-b border-[#f8e309]">
              <th className="p-4">OS</th><th className="p-4">Equipamento</th><th className="p-4">Cliente</th>
              <th className="p-4 text-center bg-[#f8e309] text-[#24414d] font-bold">Prazo Final</th>
              <th className="p-4 text-right">Prioridade de Manutenção</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {listaOS.map((item) => {
              const info = getStatusInfo(item);
              return (
                <tr key={item.os} onClick={() => setOsSelecionada(item)} className="hover:bg-gray-50 cursor-pointer transition-colors group text-[#24414d]">
                  <td className="p-4 font-bold text-gray-400">#{item.os}</td>
                  <td className="p-4 font-semibold">{item.equipamento}</td>
                  <td className="p-4 text-gray-600">{item.cliente}</td>
                  <td className="p-4 text-center font-black bg-yellow-50">{info.prazoVisivel}</td>
                  <td className="p-4 flex items-center justify-end gap-3 min-w-[320px]">
                    <span className="text-[10px] font-black uppercase text-gray-400 text-right">{info.texto}</span>
                    <div className={`w-12 h-3 rounded-full ${mapaCores[info.cor] || 'bg-gray-300'} shadow-sm animate-pulse`}></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {osSelecionada && <ModalDetalhesFull os={osSelecionada} onClose={() => setOsSelecionada(null)} onSave={(d) => handleSalvarEdicao(osSelecionada.os, d)} />}
    </div>
  );
}

function ModalDetalhesFull({ os, onClose, onSave }) {
  const [form, setForm] = useState({
    status: os.status || "Triagem", substatus_pronto: os.substatus_pronto || "Cliente não buscou",
    diagnostico_tecnico: os.diagnostico_tecnico || "", valor_aparelho: os.valor_aparelho || "",
    valor_reparo: os.valor_reparo || "", prazo_custom: os.prazo?.includes("/") ? "7 dias" : (os.prazo || "7 dias")
  });
  const handleAparelhoChange = (val) => {
    const vAparelho = parseFloat(val) || 0;
    setForm({ ...form, valor_aparelho: val, valor_reparo: vAparelho > 0 ? (vAparelho * 0.3).toFixed(2) : form.valor_reparo });
  };
  const podeImprimir = form.diagnostico_tecnico.trim().length > 5 && parseFloat(form.valor_reparo) > 0;

  return (
    <div className="fixed inset-0 bg-[#24414d]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="hidden print:block bg-white w-full h-full p-10 text-[#24414d]">
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-6">
           <div className="flex items-center gap-4">
              <div className="bg-[#24414d] text-white p-4 rounded-2xl font-black text-2xl uppercase">Supremus</div>
              <div><h1 className="text-xl font-black uppercase">Service Soluções</h1><p className="text-[10px] text-gray-500 uppercase leading-tight">Av. Conselheiro Gomes de Freitas, 3344 - SALA - 203</p></div>
           </div>
           <div className="text-right"><h2 className="text-lg font-black text-blue-800">ORDEM DE SERVIÇO</h2><p className="text-xs font-bold uppercase">DATA: {new Date().toLocaleDateString('pt-BR')}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
           <div><p className="text-[10px] font-black text-gray-400 uppercase">A/C Cliente</p><p className="text-lg font-black">{os.cliente}</p><p className="text-sm font-mono">{os.whatsapp}</p></div>
           <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase">Número da OS</p><p className="text-3xl font-black">#{os.os}</p></div>
        </div>
        <div className="space-y-6">
          <div className="border-l-4 border-[#24414d] pl-4"><h3 className="text-xs font-black uppercase text-gray-400 mb-1">Equipamento</h3><p className="text-md font-bold uppercase">{os.equipamento}</p><p className="text-xs text-gray-500">NS: {os.numeroSerie} | Acessórios: {os.acessorios}</p></div>
          <div className="bg-gray-50 p-6 rounded-2xl"><h3 className="text-xs font-black uppercase text-blue-800 mb-2">Diagnóstico Técnico</h3><p className="text-sm leading-relaxed whitespace-pre-wrap">{form.diagnostico_tecnico}</p></div>
          <div className="flex justify-between items-center bg-yellow-50 p-6 rounded-2xl border border-yellow-200"><div><p className="text-[10px] font-black text-yellow-700 uppercase">Valor do Serviço</p><p className="text-3xl font-black">R$: {form.valor_reparo}</p></div></div>
        </div>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col my-auto border-t-8 border-[#24414d] overflow-hidden print:hidden">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center text-[#24414d]">
          <div className="flex items-center gap-4">
            <div className="border-2 border-[#24414d] p-3 rounded-2xl font-black">#{os.os}</div>
            <h2 className="text-xl font-black uppercase leading-none">{os.equipamento}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} disabled={!podeImprimir} className={`p-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase transition-all ${podeImprimir ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><Printer size={18} /> Imprimir</button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X /></button>
          </div>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto">
          <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">1. Status do Processo</h4>
            <div className="flex gap-2">
              {["Triagem", "Em Reparo", "Pronto"].map(st => (
                <button key={st} onClick={() => setForm({...form, status: st, prazo_custom: st === "Em Reparo" ? "30 dias" : "7 dias"})} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.status === st ? 'bg-[#24414d] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{st}</button>
              ))}
            </div>
            {form.status === "Pronto" && (
              <div className="flex gap-2 mt-4 animate-in fade-in zoom-in">
                <button onClick={() => setForm({...form, substatus_pronto: "Cliente buscou"})} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase border-2 ${form.substatus_pronto === 'Cliente buscou' ? 'bg-green-500 border-green-600 text-white' : 'border-green-500 text-green-600'}`}>Cliente veio retirar</button>
                <button onClick={() => setForm({...form, substatus_pronto: "Cliente não buscou"})} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase border-2 ${form.substatus_pronto === 'Cliente não buscou' ? 'bg-gray-900 border-black text-white' : 'border-gray-900 text-gray-900'}`}>Cliente não veio</button>
              </div>
            )}
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#24414d]">
            <div className="space-y-6 border-r pr-4 opacity-70">
                <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2">
                  <p><strong>Cliente:</strong> {os.cliente} <span className="text-blue-500 font-bold">{os.whatsapp}</span></p>
                  <p><strong>NS:</strong> {os.numeroSerie}</p>
                  <p><strong>Acessórios:</strong> {os.acessorios}</p>
                  <p className="italic text-orange-600">"{os.relato}"</p>
                </div>
            </div>
            <div className={`lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6`}>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Diagnóstico Técnico</label>
                  <textarea value={form.diagnostico_tecnico} onChange={(e) => setForm({...form, diagnostico_tecnico: e.target.value})} className="w-full p-4 bg-gray-50 border-2 rounded-[2rem] h-48 outline-none focus:border-[#24414d] text-sm" />
               </div>
               <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <label className="text-[10px] font-black uppercase text-blue-700 block mb-1">Calculadora (Valor Aparelho)</label>
                    <input type="number" value={form.valor_aparelho} onChange={(e) => handleAparelhoChange(e.target.value)} className="w-full bg-transparent font-black outline-none" />
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <label className="text-[10px] font-black uppercase text-yellow-700 block mb-1">Valor Reparo (R$)</label>
                    <input type="number" value={form.valor_reparo} onChange={(e) => setForm({...form, valor_reparo: e.target.value})} className="w-full bg-transparent font-black outline-none" />
                  </div>
                  {form.status !== "Pronto" && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Ajuste de Prazo</label>
                      <select className="w-full p-3 bg-white border-2 rounded-xl font-bold text-sm" value={form.prazo_custom} onChange={(e) => setForm({...form, prazo_custom: e.target.value})}>
                          {(form.status === "Em Reparo" ? ["30 dias", "20 dias", "10 dias", "7 dias", "5 dias", "2 dias"] : ["7 dias", "5 dias", "3 dias", "1 dia"]).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
        <div className="p-8 border-t bg-gray-50 flex justify-end">
          <button onClick={() => onSave(form)} className="px-12 py-4 bg-[#f8e309] text-[#24414d] font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"><Save size={20} /> SALVAR ALTERAÇÕES</button>
        </div>
      </div>
    </div>
  );
}