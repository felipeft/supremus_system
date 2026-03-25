import React, { useState, useEffect } from 'react';
import { X, Save, Printer, FileText, Loader2 } from 'lucide-react';
import { gerarReciboPDF } from '../utils/pdfGenerator';
import { gerarOrcamentoPDF } from '../utils/orcamentoGenerator';

export default function ModalDetalhesFull({ os, onClose, onSave }) {
  const [form, setForm] = useState({
    status: os.status || "Triagem", 
    substatus_pronto: os.substatus_pronto || "Cliente não buscou",
    diagnostico_tecnico: os.diagnostico_tecnico || "", 
    valor_aparelho: os.valor_aparelho || "",
    valor_reparo: os.valor_reparo || "", 
    prazo_custom: os.prazo?.includes("/") ? "7 dias" : (os.prazo || "7 dias")
  });

// Listener para fechar modal com a tecla Esc
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

// Controle de concorrência e integridade
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [formModificado, setFormModificado] = useState(false);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormModificado(true);
  };

  const handleAparelhoChange = (val) => {
    const vAparelho = parseFloat(val) || 0;
    setForm(prev => ({ 
      ...prev, 
      valor_aparelho: val, 
      valor_reparo: vAparelho > 0 ? (vAparelho * 0.3).toFixed(2) : prev.valor_reparo 
    }));
    setFormModificado(true);
  };

// Derivação de estados para UI
  const podeImprimirOrcamento = form.diagnostico_tecnico.trim().length > 5 && parseFloat(form.valor_reparo) > 0;
  const ehOrcamentoParaTriagem = form.status === "Triagem" && podeImprimirOrcamento;

  const handleImprimirOrcamento = () => {
    const nomeTecnico = prompt("Digite o nome do técnico responsável pelo diagnóstico:");
    if (!nomeTecnico || nomeTecnico.trim() === "") {
      alert("Impressão cancelada. O nome do técnico é obrigatório.");
      return;
    }
    gerarOrcamentoPDF(os, form, nomeTecnico);
  };

// Parsing reverso de strings para regeneração de PDF
  const handleImprimirReciboOriginal = () => {
    const nomes = os.cliente.split(' ');
    const formDataPDF = { 
      nome: nomes[0], 
      sobrenome: nomes.slice(1).join(' '), 
      whatsapp: os.whatsapp, 
      marca: '', 
      modelo: os.equipamento, 
      numeroSerie: os.numeroSerie, 
      relato: os.relato 
    };

    const acessObj = { 
      base: os.acessorios?.toUpperCase().includes('BASE'), 
      kit_escovas: os.acessorios?.toUpperCase().includes('KIT ESCOVAS'), 
      caixa_sac: os.acessorios?.toUpperCase().includes('CAIXA'), 
      acess_comp: os.acessorios?.toUpperCase().includes('ACESS') 
    };

    gerarReciboPDF(formDataPDF, { code: '' }, acessObj, os.os);
  };

// Persistência com gatilho condicional de impressão
  const handleSalvarEDashboard = async () => {
    if (estaSalvando) return;
    
    setEstaSalvando(true);
    try {
      await onSave(form); 
      if (ehOrcamentoParaTriagem) handleImprimirOrcamento();
      setFormModificado(false);
    } catch (error) {
      alert("Erro ao salvar alterações.");
    } finally {
      setEstaSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#24414d]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col my-auto border-t-[12px] border-[#24414d] overflow-hidden">
        
        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center text-[#24414d]">
          <div className="flex items-center gap-4">
            <div className="bg-[#24414d] text-[#f8e309] px-5 py-2 rounded-2xl font-black text-xl">#{os.os}</div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{os.equipamento}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImprimirReciboOriginal} className="p-4 bg-gray-100 text-[#24414d] rounded-2xl flex items-center gap-2 font-black text-xs uppercase transition-all hover:bg-gray-200">
              <FileText size={20} /> Recibo de Entrada
            </button>

            <button 
              onClick={handleImprimirOrcamento} 
              disabled={!podeImprimirOrcamento || formModificado} 
              className={`p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase transition-all ${podeImprimirOrcamento && !formModificado ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-300'}`}
            >
              <Printer size={20} /> {formModificado ? 'Salve para Imprimir' : 'Imprimir Orçamento'}
            </button>

            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"><X size={24} /></button>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <section className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-inner">
            <h4 className="text-[10px] font-black uppercase text-gray-300 mb-6 tracking-[0.2em] text-center">Gestão de Fluxo</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {["Triagem", "Em Reparo", "Pronto"].map(st => (
                <button 
                  key={st} 
                  disabled={estaSalvando}
                  onClick={() => handleInputChange('status', st)} 
                  className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase transition-all duration-300 ${form.status === st ? 'bg-[#24414d] text-white shadow-xl scale-110' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                >
                  {st}
                </button>
              ))}
            </div>
            {form.status === "Pronto" && (
              <div className="flex justify-center gap-3 mt-6 animate-in fade-in slide-in-from-top-4">
                <button onClick={() => handleInputChange('substatus_pronto', 'Cliente buscou')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.substatus_pronto === 'Cliente buscou' ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'border-green-100 text-green-200'}`}>Cliente Retirou</button>
                <button onClick={() => handleInputChange('substatus_pronto', 'Cliente não buscou')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.substatus_pronto === 'Cliente não buscou' ? 'bg-gray-800 border-black text-white shadow-lg' : 'border-gray-100 text-gray-200'}`}>Aguardando Retirada</button>
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
                  <textarea 
                    disabled={estaSalvando}
                    value={form.diagnostico_tecnico} 
                    onChange={(e) => handleInputChange('diagnostico_tecnico', e.target.value)} 
                    className="w-full p-6 bg-gray-50 border-none rounded-[2.5rem] h-56 outline-none focus:ring-4 focus:ring-blue-50 text-sm transition-all" 
                    placeholder="Relatório técnico aqui..." 
                  />
               </div>

               <div className="space-y-6">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border-2 border-blue-50">
                    <label className="text-[9px] font-black uppercase text-blue-400 block mb-2">Calculadora (Preço Estimado)</label>
                    <input type="number" disabled={estaSalvando} value={form.valor_aparelho} onChange={(e) => handleAparelhoChange(e.target.value)} className="w-full bg-transparent font-black text-xl outline-none text-blue-800" placeholder="R$ 0,00" />
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100">
                    <label className="text-[9px] font-black uppercase text-yellow-600 block mb-2">Valor Final Reparo</label>
                    <input type="number" disabled={estaSalvando} value={form.valor_reparo} onChange={(e) => handleInputChange('valor_reparo', e.target.value)} className="w-full bg-transparent font-black text-2xl outline-none text-[#24414d]" placeholder="R$ 0,00" />
                  </div>
                  {form.status !== "Pronto" && (
                    <div className="px-2">
                      <label className="text-[9px] font-black uppercase text-gray-300 block mb-2">Ajuste de Prazo</label>
                      <select disabled={estaSalvando} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xs text-[#24414d] cursor-pointer" value={form.prazo_custom} onChange={(e) => handleInputChange('prazo_custom', e.target.value)}>
                          {(form.status === "Em Reparo" ? ["30 dias", "20 dias", "10 dias", "7 dias", "5 dias", "2 dias"] : ["7 dias", "5 dias", "3 dias", "1 dia"]).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="p-10 border-t bg-gray-50 flex justify-end">
          <button 
            disabled={estaSalvando}
            onClick={handleSalvarEDashboard} 
            className={`px-16 py-5 font-black rounded-3xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center gap-3 ${estaSalvando ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#f8e309] text-[#24414d] hover:scale-105'}`}
          >
            {estaSalvando ? (
              <><Loader2 className="animate-spin" size={18} /> Registrando...</>
            ) : (
              ehOrcamentoParaTriagem ? <><Save size={18} /> Salvar e Imprimir Orçamento</> : <><Save size={18} /> Salvar e Atualizar Dashboard</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}