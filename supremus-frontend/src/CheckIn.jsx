import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, User, ClipboardList, Save, Hash, Globe, Search, ChevronDown, CheckCircle2, AlertTriangle, Loader2, Printer } from 'lucide-react';

// IMPORTAÇÕES DOS SEUS MÓDULOS
import { COUNTRIES } from './constants/countries';
import { gerarReciboPDF } from './utils/pdfGenerator';

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000" : "https://supremus-system.onrender.com";

// Helpers locais de UI
function applyMask(digits, mask) {
  let result = '';
  let dIdx = 0;
  for (let i = 0; i < mask.length && dIdx < digits.length; i++) {
    if (mask[i] === '#') { result += digits[dIdx++]; } else { result += mask[i]; }
  }
  return result;
}

function isPhoneValid(digits, country) {
  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

// Sub-componente de seleção de países
function CountrySelector({ selected, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search));
  
  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative flex-none w-44 ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <button type="button" onClick={() => { setOpen(!open); setSearch(''); }} className="w-full h-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
        <span className="text-xl leading-none">{selected.flag}</span>
        <span className="text-xs font-black text-[#24414d]">{selected.code}</span>
        <ChevronDown size={12} className={`ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search size={14} className="text-gray-400 flex-none" />
            <input ref={searchRef} type="text" placeholder="Buscar país..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none text-sm text-[#24414d]" />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map(c => (
              <button key={c.code + c.name} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(''); }} className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected.code === c.code ? 'bg-[#24414d]/5' : ''}`}>
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="text-sm text-[#24414d] font-medium flex-1 truncate">{c.name}</span>
                <span className="text-xs font-black text-gray-400">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckIn() {
  const [formData, setFormData] = useState({ 
    nome: '', sobrenome: '', whatsapp: '', marca: '', modelo: '', 
    numeroSerie: '', relato: '', prioridade: 'Não urgente - 7 dias' 
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [acessorios, setAcessorios] = useState({ base: false, kit_escovas: false, caixa_sac: false, acess_comp: false });
  
  // ESTADOS DE ENGENHARIA
  const [osGerada, setOsGerada] = useState(null);
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [formModificado, setFormModificado] = useState(false);

  const phoneValid = isPhoneValid(phoneDigits, selectedCountry);
  const phoneEmpty = phoneDigits.length === 0;

  // Lógica para detectar mudança e invalidar a OS atual
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormModificado(true);
  };

  const handleCountryChange = (country) => { 
    setSelectedCountry(country); 
    setPhoneDigits(''); 
    setFormData(f => ({ ...f, whatsapp: '' })); 
    setFormModificado(true);
  };
  
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, selectedCountry.maxDigits);
    setPhoneDigits(limited);
    setFormData(f => ({ ...f, whatsapp: applyMask(limited, selectedCountry.mask) }));
    setFormModificado(true);
  };

  const handleCheckbox = (e) => { 
    setAcessorios({ ...acessorios, [e.target.name]: e.target.checked }); 
    setFormModificado(true);
  };

  const obterOSBase = () => phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '____';

  const handleImprimirNovamente = () => {
    if (osGerada && !formModificado) {
      gerarReciboPDF(formData, selectedCountry, acessorios, osGerada);
    }
  };

  const handleSalvarERecibo = async (e) => {
    e.preventDefault();
    if (estaSalvando) return; // Bloqueio contra clique duplo
    if (!formData.nome.trim() || !formData.sobrenome.trim() || !phoneValid) return alert("⚠️ Verifique os dados obrigatórios.");

    setEstaSalvando(true);
    const listaAcessorios = Object.keys(acessorios).filter(key => acessorios[key]).map(key => key.replace('_', ' ').toUpperCase()).join(", ");
    const dadosParaEnviar = { ...formData, whatsapp: `${selectedCountry.code} ${formData.whatsapp}`, ddi: selectedCountry.code, acessorios: listaAcessorios || "Nenhum" };

    try {
      const response = await fetch(`${API_URL}/registrar-os`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(dadosParaEnviar) 
      });

      if (response.ok) {
        const resultado = await response.json();
        setOsGerada(resultado.os);
        setFormModificado(false); // Reset da trava
        
        // Impressão automática apenas após sucesso
        await gerarReciboPDF(formData, selectedCountry, acessorios, resultado.os);
        
        alert(`✅ EQUIPAMENTO REGISTRADO!\nOS Gerada: ${resultado.os}`);
      } else {
        alert("❌ Erro ao salvar dados no servidor.");
      }
    } catch (error) {
      alert("📡 Erro de conexão! Verifique se o Backend está online.");
    } finally {
      setEstaSalvando(false); // Libera o sistema
    }
  };

  const phoneStatusColor = phoneEmpty ? 'border-gray-100' : phoneValid ? 'border-green-400 bg-green-50' : 'border-orange-300 bg-orange-50';

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 font-sans">
      
      {/* Cabeçalho */}
      <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center text-[#24414d]">
        <div><h2 className="text-lg font-black uppercase tracking-tight">Entrada de Equipamento</h2><p className="text-[10px] text-gray-400 font-bold uppercase">Registro de Ordem de Serviço</p></div>
        <div className="text-right border-l-2 border-gray-200 pl-6"><span className="block text-[10px] font-bold text-gray-400 uppercase">OS Base</span><span className="text-2xl font-black">#{obterOSBase()}</span></div>
      </div>

      <form onSubmit={handleSalvarERecibo} className="p-6 space-y-6">
        {/* Identificação */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest"><User size={14} /> Identificação do Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome" disabled={estaSalvando} required value={formData.nome} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => handleInputChange('nome', e.target.value)} />
            <input type="text" placeholder="Sobrenome" disabled={estaSalvando} required value={formData.sobrenome} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => handleInputChange('sobrenome', e.target.value)} />
          </div>
          <div className="flex gap-2 items-stretch">
            <CountrySelector selected={selectedCountry} onChange={handleCountryChange} disabled={estaSalvando} />
            <div className={`relative flex-1 border-2 rounded-xl transition-colors ${phoneStatusColor}`}>
              <input type="text" placeholder="Número" disabled={estaSalvando} value={formData.whatsapp} required className="w-full h-full p-3 bg-transparent outline-none text-sm font-mono rounded-xl" onChange={handlePhoneChange} />
              {!phoneEmpty && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {phoneValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-orange-400" />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dados do Equipamento */}
        <div className="space-y-4 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><Smartphone size={14} /> Dados do Equipamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Marca" disabled={estaSalvando} required value={formData.marca} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => handleInputChange('marca', e.target.value)} />
            <input type="text" placeholder="Modelo" disabled={estaSalvando} required value={formData.modelo} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => handleInputChange('modelo', e.target.value)} />
          </div>
          <div className="relative">
            <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Número de Série (NS)" disabled={estaSalvando} required value={formData.numeroSerie} className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => handleInputChange('numeroSerie', e.target.value)} />
          </div>
        </div>

        {/* Acessórios */}
        <div className="space-y-3 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><ClipboardList size={14} /> Acessórios Deixados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['base', 'kit_escovas', 'caixa_sac', 'acess_comp'].map((item) => (
              <label key={item} className={`flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-all ${estaSalvando ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="checkbox" name={item} checked={acessorios[item]} onChange={handleCheckbox} className="w-4 h-4 accent-[#24414d]" />
                <span className="text-[10px] font-medium uppercase text-gray-600">{item.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relato */}
        <div className="space-y-3 border-t pt-4 text-[#24414d]">
          <textarea placeholder="O que o cliente relatou?" disabled={estaSalvando} required value={formData.relato} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none min-h-[100px] text-sm focus:border-[#24414d]" onChange={(e) => handleInputChange('relato', e.target.value)}></textarea>
        </div>

        {/* Prazo / Prioridade */}
        <div className="space-y-2 border-t pt-4 text-[#24414d]">
          <h3 className="font-bold uppercase text-[10px] tracking-widest">Prazo / Prioridade</h3>
          <select disabled={estaSalvando} value={formData.prioridade} onChange={(e) => handleInputChange('prioridade', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm font-medium">
            <option>Não urgente - 7 dias</option>
            <option>Pouco urgente - 5 dias</option>
            <option>Urgente - 3 dias</option>
            <option>Muito urgente - 1 dia</option>
          </select>
        </div>

        {/* Botões de Ação Dinâmicos */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            type="submit" 
            disabled={estaSalvando}
            className={`font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase ${estaSalvando ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#24414d] hover:bg-[#1a313a] text-white'}`}
          >
            {estaSalvando ? <><Loader2 className="animate-spin" size={18} /> Salvando...</> : <><Save size={18} /> Registrar OS</>}
          </button>
          
          {/* Botão de segurança para re-impressão */}
          <button 
            type="button" 
            onClick={handleImprimirNovamente}
            className={`font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border uppercase transition-all ${osGerada && !formModificado && !estaSalvando ? 'bg-gray-100 hover:bg-gray-200 text-[#24414d] border-gray-200' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-30'}`}
          >
            <Printer size={18} /> {formModificado ? 'Dados Alterados' : 'Recibo'}
          </button>
        </div>

        {osGerada && !estaSalvando && (
          <div className={`mt-4 p-4 rounded-2xl text-center border animate-in fade-in ${formModificado ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className="text-[#24414d] font-black text-sm uppercase">
              {formModificado ? '⚠️ Salve novamente para gerar nova OS' : `Equipamento Registrado! #${osGerada}`}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}