import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, User, ClipboardList, Printer, Save, Hash, Globe, Search, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib'; // Você precisará instalar: npm install pdf-lib

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000" : "https://supremus-system.onrender.com";

const COUNTRIES = [
  { code: '+55',   flag: '🇧🇷', name: 'Brasil',              mask: '(##) # ####-####', minDigits: 11, maxDigits: 11 },
  { code: '+1',    flag: '🇺🇸', name: 'EUA / Canadá',        mask: '(###) ###-####',   minDigits: 10, maxDigits: 10 },
  { code: '+44',   flag: '🇬🇧', name: 'Reino Unido',         mask: '#### ### ####',    minDigits: 10, maxDigits: 11 },
  { code: '+49',   flag: '🇩🇪', name: 'Alemanha',            mask: '#### ########',    minDigits: 10, maxDigits: 12 },
  { code: '+33',   flag: '🇫🇷', name: 'França',              mask: '## ## ## ## ##',   minDigits: 9,  maxDigits: 10 },
  { code: '+34',   flag: '🇪🇸', name: 'Espanha',             mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+39',   flag: '🇮🇹', name: 'Itália',              mask: '### ### ####',     minDigits: 9,  maxDigits: 11 },
  { code: '+351',  flag: '🇵🇹', name: 'Portugal',            mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+54',   flag: '🇦🇷', name: 'Argentina',           mask: '(###) ###-####',   minDigits: 10, maxDigits: 10 },
  { code: '+56',   flag: '🇨🇱', name: 'Chile',               mask: '# #### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+57',   flag: '🇨🇴', name: 'Colômbia',            mask: '### ### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+51',   flag: '🇵🇪', name: 'Peru',                mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+58',   flag: '🇻🇪', name: 'Venezuela',           mask: '(###) ###-####',   minDigits: 10, maxDigits: 10 },
  { code: '+591',  flag: '🇧🇴', name: 'Bolívia',             mask: '########',         minDigits: 8,  maxDigits: 8  },
  { code: '+595',  flag: '🇵🇾', name: 'Paraguai',            mask: '### ######',       minDigits: 9,  maxDigits: 9  },
  { code: '+598',  flag: '🇺🇾', name: 'Uruguai',             mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+593',  flag: '🇪🇨', name: 'Equador',             mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+52',   flag: '🇲🇽', name: 'México',              mask: '## #### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+506',  flag: '🇨🇷', name: 'Costa Rica',          mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+507',  flag: '🇵🇦', name: 'Panamá',              mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+503',  flag: '🇸🇻', name: 'El Salvador',         mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+502',  flag: '🇬🇹', name: 'Guatemala',           mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+504',  flag: '🇭🇳', name: 'Honduras',            mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+505',  flag: '🇳🇮', name: 'Nicarágua',           mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+1787', flag: '🇵🇷', name: 'Porto Rico',          mask: '### ####',         minDigits: 7,  maxDigits: 7  },
  { code: '+53',   flag: '🇨🇺', name: 'Cuba',                mask: '# ### ####',       minDigits: 8,  maxDigits: 8  },
  { code: '+509',  flag: '🇭🇹', name: 'Haiti',               mask: '## ## ####',       minDigits: 8,  maxDigits: 8  },
  { code: '+1809', flag: '🇩🇴', name: 'Rep. Dominicana',     mask: '### ####',         minDigits: 7,  maxDigits: 7  },
  { code: '+7',    flag: '🇷🇺', name: 'Rússia',              mask: '(###) ###-##-##',  minDigits: 10, maxDigits: 10 },
  { code: '+380',  flag: '🇺🇦', name: 'Ucrânia',             mask: '## ### ## ##',     minDigits: 9,  maxDigits: 9  },
  { code: '+48',   flag: '🇵🇱', name: 'Polônia',             mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+31',   flag: '🇳🇱', name: 'Holanda',             mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+32',   flag: '🇧🇪', name: 'Bélgica',             mask: '### ## ## ##',     minDigits: 9,  maxDigits: 9  },
  { code: '+41',   flag: '🇨🇭', name: 'Suíça',               mask: '## ### ## ##',     minDigits: 9,  maxDigits: 9  },
  { code: '+43',   flag: '🇦🇹', name: 'Áustria',             mask: '### ######',       minDigits: 7,  maxDigits: 13 },
  { code: '+46',   flag: '🇸🇪', name: 'Suécia',              mask: '##-### ## ##',     minDigits: 9,  maxDigits: 9  },
  { code: '+47',   flag: '🇳🇴', name: 'Noruega',             mask: '### ## ###',       minDigits: 8,  maxDigits: 8  },
  { code: '+45',   flag: '🇩🇰', name: 'Dinamarca',           mask: '## ## ## ##',      minDigits: 8,  maxDigits: 8  },
  { code: '+358',  flag: '🇫🇮', name: 'Finlândia',           mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+353',  flag: '🇮🇪', name: 'Irlanda',             mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+30',   flag: '🇬🇷', name: 'Grécia',              mask: '### ### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+420',  flag: '🇨🇿', name: 'República Tcheca',    mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+36',   flag: '🇭🇺', name: 'Hungria',             mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+40',   flag: '🇷🇴', name: 'Romênia',             mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+359',  flag: '🇧🇬', name: 'Bulgária',            mask: '### ### ###',      minDigits: 9,  maxDigits: 9  },
  { code: '+385',  flag: '🇭🇷', name: 'Croácia',             mask: '## ### ####',      minDigits: 8,  maxDigits: 9  },
  { code: '+381',  flag: '🇷🇸', name: 'Sérvia',              mask: '## ### ####',      minDigits: 8,  maxDigits: 9  },
  { code: '+90',   flag: '🇹🇷', name: 'Turquia',             mask: '(###) ### ####',   minDigits: 10, maxDigits: 10 },
  { code: '+972',  flag: '🇮🇱', name: 'Israel',              mask: '##-### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+966',  flag: '🇸🇦', name: 'Arábia Saudita',      mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+971',  flag: '🇦🇪', name: 'Emirados Árabes',     mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+965',  flag: '🇰🇼', name: 'Kuwait',              mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+974',  flag: '🇶🇦', name: 'Qatar',               mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+20',   flag: '🇪🇬', name: 'Egito',               mask: '### ### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+27',   flag: '🇿🇦', name: 'África do Sul',       mask: '## ### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+234',  flag: '🇳🇬', name: 'Nigéria',             mask: '### ### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+254',  flag: '🇰🇪', name: 'Quênia',              mask: '### ######',       minDigits: 9,  maxDigits: 9  },
  { code: '+212',  flag: '🇲🇦', name: 'Marrocos',            mask: '##-######',        minDigits: 9,  maxDigits: 9  },
  { code: '+213',  flag: '🇩🇿', name: 'Argélia',             mask: '### ## ## ##',     minDigits: 9,  maxDigits: 9  },
  { code: '+216',  flag: '🇹🇳', name: 'Tunísia',             mask: '## ### ###',       minDigits: 8,  maxDigits: 8  },
  { code: '+91',   flag: '🇮🇳', name: 'Índia',               mask: '##### #####',      minDigits: 10, maxDigits: 10 },
  { code: '+86',   flag: '🇨🇳', name: 'China',               mask: '### #### ####',    minDigits: 11, maxDigits: 11 },
  { code: '+81',   flag: '🇯🇵', name: 'Japão',               mask: '##-####-####',     minDigits: 10, maxDigits: 10 },
  { code: '+82',   flag: '🇰🇷', name: 'Coreia do Sul',       mask: '##-####-####',     minDigits: 9,  maxDigits: 10 },
  { code: '+60',   flag: '🇲🇾', name: 'Malásia',             mask: '##-#### ####',     minDigits: 9,  maxDigits: 10 },
  { code: '+65',   flag: '🇸🇬', name: 'Singapura',           mask: '#### ####',        minDigits: 8,  maxDigits: 8  },
  { code: '+66',   flag: '🇹🇭', name: 'Tailândia',           mask: '##-### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+84',   flag: '🇻🇳', name: 'Vietnã',              mask: '### ### ####',     minDigits: 9,  maxDigits: 10 },
  { code: '+62',   flag: '🇮🇩', name: 'Indonésia',           mask: '####-####-####',   minDigits: 9,  maxDigits: 12 },
  { code: '+63',   flag: '🇵🇭', name: 'Filipinas',           mask: '#### ### ####',    minDigits: 10, maxDigits: 10 },
  { code: '+61',   flag: '🇦🇺', name: 'Austrália',           mask: '#### ### ###',     minDigits: 9,  maxDigits: 9  },
  { code: '+64',   flag: '🇳🇿', name: 'Nova Zelândia',       mask: '## ### ####',      minDigits: 8,  maxDigits: 9  },
  { code: '+880',  flag: '🇧🇩', name: 'Bangladesh',          mask: '####-######',      minDigits: 10, maxDigits: 10 },
  { code: '+92',   flag: '🇵🇰', name: 'Paquistão',           mask: '###-#######',      minDigits: 10, maxDigits: 10 },
  { code: '+94',   flag: '🇱🇰', name: 'Sri Lanka',           mask: '##-### ####',      minDigits: 9,  maxDigits: 9  },
  { code: '+98',   flag: '🇮🇷', name: 'Irã',                 mask: '###-### ####',     minDigits: 10, maxDigits: 10 },
  { code: '+964',  flag: '🇮🇶', name: 'Iraque',              mask: '### ### ####',     minDigits: 10, maxDigits: 10 },
];

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

function CountrySelector({ selected, onChange }) {
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
    <div className="relative flex-none w-44" ref={dropdownRef}>
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
  const [formData, setFormData] = useState({ nome: '', sobrenome: '', whatsapp: '', marca: '', modelo: '', numeroSerie: '', relato: '', prioridade: 'Não urgente - 7 dias' });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [acessorios, setAcessorios] = useState({ base: false, kit_escovas: false, caixa_sac: false, acess_comp: false });
  const [osGerada, setOsGerada] = useState(null);

  const phoneValid = isPhoneValid(phoneDigits, selectedCountry);
  const phoneEmpty = phoneDigits.length === 0;

  const handleCountryChange = (country) => { setSelectedCountry(country); setPhoneDigits(''); setFormData(f => ({ ...f, whatsapp: '' })); };
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, selectedCountry.maxDigits);
    setPhoneDigits(limited);
    setFormData(f => ({ ...f, whatsapp: applyMask(limited, selectedCountry.mask) }));
  };

  const handleCheckbox = (e) => { setAcessorios({ ...acessorios, [e.target.name]: e.target.checked }); };
  const obterOSBase = () => phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '____';

// --- MÁGICA DA IMPRESSÃO CALIBRADA  ---
  const imprimirReciboPDF = async () => {
    try {
      const existingPdfBytes = await fetch('/OS_FINAL_2.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Usando fonte padrão em Negrito para maior visibilidade
      const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
      const fontRegular = await pdfDoc.embedFont('Helvetica');
      
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // Função de desenho com coordenadas corrigidas
      const draw = (text, x, y, size = 11, font = fontBold) => {
        if (!text) return;
        firstPage.drawText(String(text), {
          x,
          y: height - y, // Inverte o eixo para começar do topo
          size,
          font,
          color: rgb(0, 0, 0),
        });
      };

      // ALTERAÇÃO SOLICITADA: DATA ESPAÇADA 
      const now = new Date();
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      const ano = now.getFullYear();
      const dataEspacada = `${dia}        ${mes}        ${ano}`;

      const nomeCompleto = `${formData.nome} ${formData.sobrenome}`.toUpperCase();
      const nrOS = osGerada || obterOSBase();

      // --- PARTE SUPERIOR (PRINCIPAL) ---
      draw(nrOS, 433, 93, 20); 
      
      draw(nomeCompleto, 143, 134, 12); 
      
      // DATA: Usando a nova versão espacada 
      draw(dataEspacada, 420, 160, 12); 
      
      // TEL e EQUIPAMENTO: Alinhados horizontalmente [cite: 69, 70]
      draw(`${selectedCountry.code} ${formData.whatsapp}`, 130, 163, 11); 
      draw(`${formData.marca} ${formData.modelo}`.toUpperCase(), 70, 240, 12); 
      
      // NS e ACESSÓRIOS [cite: 73, 75]
      draw(formData.numeroSerie.toUpperCase(), 400, 240, 12);
      
      // RELATO: Fonte menor para caber no box [cite: 78]
      draw(formData.relato, 75, 365, 12, fontRegular);

      // CHECKBOXES (X marcando os campos) [cite: 75, 77]
      if (acessorios.base)        draw('X', 80, 293, 14);
      if (acessorios.kit_escovas) draw('X', 148, 293, 14);
      if (acessorios.caixa_sac)   draw('X', 276, 293, 14);
      if (acessorios.acess_comp)  draw('X', 393, 293, 14);

      // --- PARTE INFERIOR (CANHOTO) [cite: 81-95] ---
      // N° OS Canhoto [cite: 81]
      draw(nrOS, 433, 613, 20); 
      
      // Equipamento no canhoto [cite: 82]
      draw(`${formData.marca} ${formData.modelo}`.toUpperCase(), 100, 680, 13);

      // Checkboxes canhoto [cite: 89, 90]
      if (acessorios.base)        draw('X', 80, 719, 14);
      if (acessorios.kit_escovas) draw('X', 148, 719, 14);
      if (acessorios.caixa_sac)   draw('X', 276, 719, 14);
      if (acessorios.acess_comp)  draw('X', 393, 719, 14);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Abre em uma nova aba configurado para impressão
      const win = window.open(url, '_blank');
      if (win) win.focus();

    } catch (error) {
      console.error("Erro na calibração do PDF:", error);
      alert("Falha ao gerar PDF. Verifique se o arquivo está na pasta public.");
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.sobrenome.trim()) { alert("⚠️ Nome Completo é obrigatório."); return; }
    if (!phoneValid) { alert(`⚠️ Telefone inválido.`); return; }

    const listaAcessorios = Object.keys(acessorios).filter(key => acessorios[key]).map(key => key.replace('_', ' ').toUpperCase()).join(", ");
    const dadosParaEnviar = { ...formData, whatsapp: `${selectedCountry.code} ${formData.whatsapp}`, ddi: selectedCountry.code, acessorios: listaAcessorios || "Nenhum" };

    try {
      const response = await fetch(`${API_URL}/registrar-os`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dadosParaEnviar) });
      if (response.ok) { const resultado = await response.json(); setOsGerada(resultado.os); alert(`✅ REGISTRADO! OS: ${resultado.os}`); }
    } catch (error) { alert("📡 Erro de conexão!"); }
  };

  const phoneStatusColor = phoneEmpty ? 'border-gray-100' : phoneValid ? 'border-green-400 bg-green-50' : 'border-orange-300 bg-orange-50';

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 font-sans">
      <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center text-[#24414d]">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Entrada de Equipamento</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Registro de Ordem de Serviço</p>
        </div>
        <div className="text-right border-l-2 border-gray-200 pl-6">
          <span className="block text-[10px] font-bold text-gray-400 uppercase">OS Base</span>
          <span className="text-2xl font-black">#{obterOSBase()}</span>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest"><User size={14} /> Identificação do Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome" required value={formData.nome} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            <input type="text" placeholder="Sobrenome" required value={formData.sobrenome} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm" onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} />
          </div>
          <div className="flex gap-2 items-stretch">
            <CountrySelector selected={selectedCountry} onChange={handleCountryChange} />
            <div className={`relative flex-1 border-2 rounded-xl transition-colors ${phoneStatusColor}`}>
              <input type="text" placeholder="DDD + Número" value={formData.whatsapp} required className="w-full h-full p-3 bg-transparent outline-none text-sm font-mono rounded-xl" onChange={handlePhoneChange} />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><Smartphone size={14} /> Dados do Equipamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Marca" required value={formData.marca} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm" onChange={(e) => setFormData({...formData, marca: e.target.value})} />
            <input type="text" placeholder="Modelo" required value={formData.modelo} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm" onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
          </div>
          <input type="text" placeholder="Número de Série (NS)" required value={formData.numeroSerie} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm" onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})} />
        </div>

        <div className="space-y-3 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><ClipboardList size={14} /> Acessórios Deixados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['base', 'kit_escovas', 'caixa_sac', 'acess_comp'].map((item) => (
              <label key={item} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-all">
                <input type="checkbox" name={item} checked={acessorios[item]} onChange={handleCheckbox} className="w-4 h-4 accent-[#24414d]" />
                <span className="text-[10px] font-medium uppercase text-gray-600">{item.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <textarea placeholder="Relato do problema..." required value={formData.relato} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none min-h-[100px] text-sm" onChange={(e) => setFormData({...formData, relato: e.target.value})}></textarea>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button type="submit" className="bg-[#24414d] hover:bg-[#1a313a] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm uppercase"><Save size={18} /> Registrar OS</button>
          
          <button type="button" onClick={imprimirReciboPDF} className="bg-gray-100 hover:bg-gray-200 text-[#24414d] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border border-gray-200 uppercase">
            <Printer size={18} /> Imprimir Recibo
          </button>
        </div>

        {osGerada && (
          <div className="mt-4 p-4 bg-yellow-50 border border-[#f8e309] rounded-2xl text-center">
            <p className="text-[#24414d] font-bold text-sm uppercase">Equipamento Registrado! #{osGerada}</p>
          </div>
        )}
      </form>
    </div>
  );
}