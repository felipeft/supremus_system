import React, { useState } from 'react';
import { Smartphone, User, ClipboardList, Printer, Save, Hash, AlertCircle } from 'lucide-react';

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

  const [acessorios, setAcessorios] = useState({
    base: false,
    caixa: false,
    escovas: false,
    outros: false
  });

  const [osGerada, setOsGerada] = useState(null);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setFormData({ ...formData, whatsapp: value });
  };

  const handleCheckbox = (e) => {
    setAcessorios({ ...acessorios, [e.target.name]: e.target.checked });
  };

  const obterOSBase = () => {
    const numeros = formData.whatsapp.replace(/\D/g, '');
    return numeros.length >= 4 ? numeros.slice(-4) : '____';
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const listaAcessorios = Object.keys(acessorios)
      .filter(key => acessorios[key])
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(", ");

    const dadosParaEnviar = { ...formData, acessorios: listaAcessorios || "Nenhum" };

    try {
      const response = await fetch("https://supremus-system.onrender.com/registrar-os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (response.ok) {
        const resultado = await response.json();
        setOsGerada(resultado.os);
        alert(`✅ REGISTRADO!\nOS: ${resultado.os}`);
      } else {
        alert("❌ Erro ao salvar dados.");
      }
    } catch (error) {
      alert("📡 Erro de conexão! Verifique o Backend.");
    }
  };

  const prioridades = [
    { label: "Não urgente - 7 dias", valor: "Não urgente - 7 dias", cor: "bg-green-500" },
    { label: "Pouco urgente - 5 dias", valor: "Pouco urgente - 5 dias", cor: "bg-blue-500" },
    { label: "Urgente - 3 dias", valor: "Urgente - 3 dias", cor: "bg-orange-500" },
    { label: "Muito urgente - 1 dia", valor: "Muito urgente - 1 dia", cor: "bg-red-500" }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 print:shadow-none print:border-none print:m-0">
      
      {/* Cabeçalho Invertido: Fundo claro, texto e número no Azul #24414d */}
      <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-[#24414d] uppercase tracking-tight">Entrada de Equipamento</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preencha todos os campos obrigatórios</p>
        </div>
        {/* Lado direito limpo com borda de separação e texto azul */}
        <div className="text-right border-l-2 border-gray-200 pl-6">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">OS Base</span>
          <span className="text-2xl font-black text-[#24414d]">#{obterOSBase()}</span>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest">
            <User size={14} /> Identificação do Cliente
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nome" required value={formData.nome}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            <input type="text" placeholder="Sobrenome" required value={formData.sobrenome}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
              onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} />
          </div>
          <input type="text" placeholder="WhatsApp" value={formData.whatsapp} required
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#24414d] text-sm"
            onChange={handlePhoneChange} />
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest">
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

        <div className="space-y-3 border-t pt-4">
          <h3 className="flex items-center gap-2 text-[#24414d] font-bold uppercase text-[10px] tracking-widest">
            <ClipboardList size={14} /> Acessórios Deixados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['base', 'caixa', 'escovas', 'outros'].map((item) => (
              <label key={item} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-yellow-50 transition-all">
                <input type="checkbox" name={item} checked={acessorios[item]} onChange={handleCheckbox} className="w-4 h-4 accent-[#24414d]" />
                <span className="text-xs font-medium capitalize text-gray-600">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="flex items-center gap-2 text-orange-600 font-bold uppercase text-[10px] tracking-widest mb-2">
            <AlertCircle size={14} /> Prazo e Nível de Prioridade
          </h3>
          <div className="flex flex-col gap-2">
            {prioridades.map((p) => (
              <label key={p.valor} 
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.prioridade === p.valor ? 'bg-yellow-50 border-[#f8e309] ring-1 ring-[#f8e309]' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="prioridade" value={p.valor} checked={formData.prioridade === p.valor} 
                    onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    className="w-5 h-5 accent-[#24414d]" />
                  <span className="text-sm font-semibold text-[#24414d]">{p.label}</span>
                </div>
                <div className={`w-8 h-3 rounded-full shadow-sm ${p.cor}`}></div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-[#24414d] font-bold uppercase text-[10px] tracking-widest">Relato do Problema</h3>
          <textarea placeholder="O que o cliente relatou?" required value={formData.relato}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none min-h-[100px] focus:border-[#24414d] text-sm"
            onChange={(e) => setFormData({...formData, relato: e.target.value})}></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 print:hidden">
          <button type="submit" className="bg-[#24414d] hover:bg-[#1a313a] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
            <Save size={18} /> REGISTRAR ENTRADA
          </button>
          <button type="button" onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-[#24414d] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border border-gray-200">
            <Printer size={18} /> IMPRIMIR OS
          </button>
        </div>

        {osGerada && (
          <div className="mt-4 p-4 bg-yellow-50 border border-[#f8e309] rounded-2xl text-center">
            <p className="text-[#24414d] font-bold text-sm">OS GERADA COM SUCESSO!</p>
            <p className="text-2xl font-black text-[#24414d]">#{osGerada}</p>
          </div>
        )}
      </form>
    </div>
  );
}