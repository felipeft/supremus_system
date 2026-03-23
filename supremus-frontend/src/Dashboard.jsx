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
    }).catch(() => setCarregando(false));
  };

  useEffect(() => { fetchDados(); }, []);

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
      else if (diff <= 10) cor = "Amarelo";
      else if (diff <= 20) cor = "Verde";
      else cor = "Azul";
    } else { // Triagem
      if (diff <= 1) { cor = "Vermelho"; devePulsar = true; }
      else if (diff <= 3) { cor = "Laranja"; devePulsar = true; }
      else if (diff <= 5) cor = "Azul";
      else cor = "Verde";
    }

    return { texto: `${item.status.toUpperCase()} (${textoDias})`, cor, devePulsar };
  };

  const handleSalvarEdicao = async (id, dadosEditados) => {
    try {
      const res = await fetch(`${API_URL}/atualizar-os/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dadosEditados, valor_aparelho: parseFloat(dadosEditados.valor_aparelho) || 0, valor_reparo: parseFloat(dadosEditados.valor_reparo) || 0 }),
      });
      if (res.ok) { alert("✅ Alterações salvas!"); setOsSelecionada(null); fetchDados(); }
    } catch { alert("Erro de conexão."); }
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
                  <td className="p-5 font-black text-gray-300 group-hover:text-blue-500">#{item.os}</td>
                  <td className="p-5 font-bold text-[#24414d] uppercase">{item.equipamento}</td>
                  <td className="p-5 text-gray-500 font-medium">{item.cliente}</td>
                  <td className="p-5 text-center font-black bg-yellow-50/50 text-[#24414d] text-base">
                    {info.cor === "Cinza" ? "---" : item.prazo}
                  </td>
                  <td className="p-5 text-right pr-8">
                    {/* INDICADOR DE COR AMPLIADO COM PULSAÇÃO */}
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
    <div className="fixed inset-0 bg-[#24414d]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto font-sans">
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

      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col my-auto border-t-[12px] border-[#24414d] overflow-hidden print:hidden">
        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center text-[#24414d]">
          <div className="flex items-center gap-4">
            <div className="bg-[#24414d] text-[#f8e309] px-5 py-2 rounded-2xl font-black text-xl">#{os.os}</div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{os.equipamento}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} disabled={!podeImprimir} className={`p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase transition-all ${podeImprimir ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-400'}`}><Printer size={20} /> Imprimir</button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"><X size={24} /></button>
          </div>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <section className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-inner">
            <h4 className="text-[10px] font-black uppercase text-gray-300 mb-6 tracking-[0.2em] text-center">Gestão de Fluxo</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {["Triagem", "Em Reparo", "Pronto"].map(st => (
                <button key={st} onClick={() => setForm({...form, status: st, prazo_custom: st === "Em Reparo" ? "30 dias" : "7 dias"})} 
                  className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase transition-all duration-300 ${form.status === st ? 'bg-[#24414d] text-white shadow-xl scale-110' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}>{st}</button>
              ))}
            </div>
            {form.status === "Pronto" && (
              <div className="flex justify-center gap-3 mt-6 animate-in fade-in slide-in-from-top-4">
                <button onClick={() => setForm({...form, substatus_pronto: "Cliente buscou"})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.substatus_pronto === 'Cliente buscou' ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'border-green-100 text-green-200'}`}>Cliente Retirou</button>
                <button onClick={() => setForm({...form, substatus_pronto: "Cliente não buscou"})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.substatus_pronto === 'Cliente não buscou' ? 'bg-gray-800 border-black text-white shadow-lg' : 'border-gray-100 text-gray-200'}`}>Aguardando Retirada</button>
              </div>
            )}
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6 opacity-60">
                <div className="bg-gray-50 p-6 rounded-[2rem] text-xs space-y-4">
                  <div><p className="text-[9px] font-black uppercase text-gray-400">Cliente</p><p className="font-bold text-[#24414d]">{os.cliente}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-gray-400">WhatsApp</p><p className="font-mono text-blue-500">{os.whatsapp}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-gray-400">NS</p><p className="font-bold">{os.numeroSerie}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-gray-400">Relato</p><p className="italic text-orange-600 leading-relaxed">"{os.relato}"</p></div>
                </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Diagnóstico Técnico</label>
                  <textarea value={form.diagnostico_tecnico} onChange={(e) => setForm({...form, diagnostico_tecnico: e.target.value})} className="w-full p-6 bg-gray-50 border-none rounded-[2.5rem] h-56 outline-none focus:ring-4 focus:ring-blue-50 text-sm transition-all" placeholder="Relatório técnico aqui..." />
               </div>
               <div className="space-y-6">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border-2 border-blue-50">
                    <label className="text-[9px] font-black uppercase text-blue-400 block mb-2">Calculadora (Preço Estimado)</label>
                    <input type="number" value={form.valor_aparelho} onChange={(e) => handleAparelhoChange(e.target.value)} className="w-full bg-transparent font-black text-xl outline-none text-blue-800" placeholder="R$ 0,00" />
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100">
                    <label className="text-[9px] font-black uppercase text-yellow-600 block mb-2">Valor Final Reparo</label>
                    <input type="number" value={form.valor_reparo} onChange={(e) => setForm({...form, valor_reparo: e.target.value})} className="w-full bg-transparent font-black text-2xl outline-none text-[#24414d]" placeholder="R$ 0,00" />
                  </div>
                  {form.status !== "Pronto" && (
                    <div className="px-2">
                      <label className="text-[9px] font-black uppercase text-gray-300 block mb-2">Ajuste de Prazo</label>
                      <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xs text-[#24414d] appearance-none cursor-pointer" value={form.prazo_custom} onChange={(e) => setForm({...form, prazo_custom: e.target.value})}>
                          {(form.status === "Em Reparo" ? ["30 dias", "20 dias", "10 dias", "7 dias", "5 dias", "2 dias"] : ["7 dias", "5 dias", "3 dias", "1 dia"]).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
        <div className="p-10 border-t bg-gray-50 flex justify-end">
          <button onClick={() => onSave(form)} className="px-16 py-5 bg-[#f8e309] text-[#24414d] font-black rounded-3xl shadow-[0_15px_30px_-5px_rgba(248,227,9,0.4)] transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest">Salvar e Atualizar Dashboard</button>
        </div>
      </div>
    </div>
  );
}