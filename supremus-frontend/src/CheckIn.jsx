import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, User, ClipboardList, Printer, Save, Hash, Globe, Search, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

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

// Aplica máscara baseada no padrão do país
function applyMask(digits, mask) {
  let result = '';
  let dIdx = 0;
  for (let i = 0; i < mask.length && dIdx < digits.length; i++) {
    if (mask[i] === '#') {
      result += digits[dIdx++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

// Valida se o número está completo para o país
function isPhoneValid(digits, country) {
  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

// Componente Seletor de País
function CountrySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex-none w-44" ref={dropdownRef}>
      {/* Botão trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full h-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl leading-none">{selected.flag}</span>
        <span className="text-xs font-black text-[#24414d]">{selected.code}</span>
        <ChevronDown size={12} className={`ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Campo de busca */}
          <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search size={14} className="text-gray-400 flex-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar país ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[#24414d] placeholder-gray-400"
            />
          </div>

          {/* Lista de países */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">Nenhum país encontrado</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code + c.name}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected.code === c.code && selected.name === c.name ? 'bg-[#24414d]/5' : ''}`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="text-sm text-[#24414d] font-medium flex-1 truncate">{c.name}</span>
                  <span className="text-xs font-black text-gray-400">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal
export default function CheckIn() {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    whatsapp: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    relato: '',
    prioridade: 'Não urgente - 7 dias'
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Brasil por padrão
  const [phoneDigits, setPhoneDigits] = useState(''); // dígitos puros sem máscara
  const [acessorios, setAcessorios] = useState({ base: false, caixa: false, escovas: false, outros: false });
  const [osGerada, setOsGerada] = useState(null);

  const phoneValid = isPhoneValid(phoneDigits, selectedCountry);
  const phoneEmpty = phoneDigits.length === 0;

  // Ao trocar de país, limpa o telefone
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPhoneDigits('');
    setFormData(f => ({ ...f, whatsapp: '' }));
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, selectedCountry.maxDigits);
    setPhoneDigits(limited);
    setFormData(f => ({ ...f, whatsapp: applyMask(limited, selectedCountry.mask) }));
  };

  const handleCheckbox = (e) => {
    setAcessorios({ ...acessorios, [e.target.name]: e.target.checked });
  };

  const obterOSBase = () => {
    return phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '____';
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.sobrenome.trim()) {
      alert("⚠️ ERRO: O Nome Completo é obrigatório.");
      return;
    }

    if (!phoneValid) {
      const digitsNeeded = selectedCountry.minDigits === selectedCountry.maxDigits
        ? `${selectedCountry.minDigits} dígitos`
        : `${selectedCountry.minDigits}–${selectedCountry.maxDigits} dígitos`;
      alert(`⚠️ ERRO: Telefone inválido para ${selectedCountry.name}.\nEsperado: ${digitsNeeded}. Você digitou: ${phoneDigits.length}.`);
      return;
    }

    const listaAcessorios = Object.keys(acessorios)
      .filter(key => acessorios[key])
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(", ");

    const dadosParaEnviar = {
      ...formData,
      whatsapp: `${selectedCountry.code} ${formData.whatsapp}`,
      ddi: selectedCountry.code,
      acessorios: listaAcessorios || "Nenhum"
    };

    try {
      const response = await fetch(`${API_URL}/registrar-os`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (response.ok) {
        const resultado = await response.json();
        setOsGerada(resultado.os);
        alert(`✅ EQUIPAMENTO REGISTRADO!\nOS Gerada: ${resultado.os}`);
      } else {
        alert("❌ Erro ao salvar dados no servidor.");
      }
    } catch (error) {
      alert("📡 Erro de conexão! Verifique se o Backend está online.");
    }
  };

  // Indicador visual do telefone
  const phoneStatusColor = phoneEmpty
    ? 'border-gray-100'
    : phoneValid
      ? 'border-green-400 bg-green-50'
      : 'border-orange-300 bg-orange-50';

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 print:shadow-none print:border-none print:m-0 font-sans">

      {/* Cabeçalho */}
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
        {/* Identificação */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest">
            <User size={14} /> Identificação do Cliente (Obrigatório)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome" required value={formData.nome}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            <input type="text" placeholder="Sobrenome" required value={formData.sobrenome}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} />
          </div>

          {/* Telefone com seletor de país */}
          <div className="space-y-1">
            <div className="flex gap-2 items-stretch">
              <CountrySelector selected={selectedCountry} onChange={handleCountryChange} />
              <div className={`relative flex-1 border-2 rounded-xl transition-colors ${phoneStatusColor}`}>
                <input
                  type="text"
                  placeholder={applyMask('0'.repeat(selectedCountry.minDigits), selectedCountry.mask).replace(/0/g, '#')}
                  value={formData.whatsapp}
                  required
                  className="w-full h-full p-3 pr-10 bg-transparent outline-none text-sm font-mono rounded-xl"
                  onChange={handlePhoneChange}
                />
                {/* Ícone de status */}
                {!phoneEmpty && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValid
                      ? <CheckCircle2 size={16} className="text-green-500" />
                      : <AlertTriangle size={16} className="text-orange-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Hint de formato */}
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] text-gray-400 font-mono">
                Formato: {selectedCountry.code} {applyMask('0'.repeat(selectedCountry.minDigits), selectedCountry.mask).replace(/0/g, '#')}
              </p>
              {!phoneEmpty && !phoneValid && (
                <p className="text-[10px] text-orange-500 font-bold">
                  {phoneDigits.length}/{selectedCountry.minDigits} dígitos
                </p>
              )}
              {phoneValid && (
                <p className="text-[10px] text-green-600 font-bold">✓ Número válido</p>
              )}
            </div>
          </div>
        </div>

        {/* Dados do Equipamento */}
        <div className="space-y-4 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Smartphone size={14} /> Dados do Equipamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Marca" required value={formData.marca}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, marca: e.target.value})} />
            <input type="text" placeholder="Modelo" required value={formData.modelo}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
          </div>
          <div className="relative">
            <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Número de Série (NS)" required value={formData.numeroSerie}
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})} />
          </div>
        </div>

        {/* Acessórios */}
        <div className="space-y-3 border-t pt-4 text-[#24414d]">
          <h3 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
            <ClipboardList size={14} /> Acessórios Deixados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['base', 'caixa', 'escovas', 'outros'].map((item) => (
              <label key={item} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-all">
                <input type="checkbox" name={item} checked={acessorios[item]} onChange={handleCheckbox} className="w-4 h-4 accent-[#24414d]" />
                <span className="text-xs font-medium capitalize">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relato */}
        <div className="space-y-3 border-t pt-4 text-[#24414d]">
          <h3 className="font-bold uppercase text-[10px] tracking-widest">Relato do Problema</h3>
          <textarea placeholder="O que o cliente relatou?" required value={formData.relato}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none min-h-[100px] focus:border-[#24414d] text-sm"
            onChange={(e) => setFormData({...formData, relato: e.target.value})}></textarea>
        </div>

        {/* Prioridade */}
        <div className="space-y-2 border-t pt-4 text-[#24414d]">
          <h3 className="font-bold uppercase text-[10px] tracking-widest">Prazo / Prioridade</h3>
          <select
            value={formData.prioridade}
            onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm font-medium"
          >
            <option>Não urgente - 7 dias</option>
            <option>Pouco urgente - 5 dias</option>
            <option>Urgente - 3 dias</option>
            <option>Muito urgente - 1 dia</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 print:hidden">
          <button
            type="submit"
            disabled={!phoneValid}
            className={`font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase ${phoneValid ? 'bg-[#24414d] hover:bg-[#1a313a] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Save size={18} /> Registrar OS
          </button>
          <button type="button" onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-[#24414d] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border border-gray-200 uppercase">
            <Printer size={18} /> Imprimir Recibo
          </button>
        </div>

        {osGerada && (
          <div className="mt-4 p-4 bg-yellow-50 border border-[#f8e309] rounded-2xl text-center animate-bounce">
            <p className="text-[#24414d] font-bold text-sm uppercase">Equipamento Registrado!</p>
            <p className="text-2xl font-black text-[#24414d]">#{osGerada}</p>
          </div>
        )}
      </form>
    </div>
  );
}