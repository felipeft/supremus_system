import React, { useState } from 'react';
import { Smartphone, User, ClipboardList, Printer, Save } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    whatsapp: '',
    marca: '',
    modelo: '',
    acessorios: '',
    relato: ''
  });

  // Formatação de telefone nativa para evitar erros de biblioteca
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    // Aplica a máscara (85) 99999-9999
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    
    setFormData({ ...formData, whatsapp: value });
  };

  const obterOS = () => {
    const numeros = formData.whatsapp.replace(/\D/g, '');
    return numeros.length >= 4 ? numeros.slice(-4) : '____';
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    console.log("Enviando para o Firebase:", formData);
    alert(`OS #${obterOS()}-1 Registrada!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-black uppercase">Supremus Service</h1>
          <div className="mt-2 inline-block bg-blue-800 px-4 py-1 rounded-full text-xs font-bold">
            OS SUGERIDA: #{obterOS()}
          </div>
        </div>

        <form onSubmit={handleSalvar} className="p-6 space-y-6">
          
          {/* Seção Cliente */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs">
              <User size={16} /> Identificação do Cliente
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Nome" required
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
              <input 
                type="text" placeholder="Sobrenome" required
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                onChange={(e) => setFormData({...formData, sobrenome: e.target.value})}
              />
            </div>
            <input 
              type="text" 
              placeholder="(85) 99999-9999" 
              value={formData.whatsapp}
              required
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
              onChange={handlePhoneChange}
            />
          </div>

          {/* Seção Aparelho */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs">
              <Smartphone size={16} /> Dados do Aparelho
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Marca" required
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                onChange={(e) => setFormData({...formData, marca: e.target.value})}
              />
              <input 
                type="text" placeholder="Modelo" required
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                onChange={(e) => setFormData({...formData, modelo: e.target.value})}
              />
            </div>
            <input 
              type="text" placeholder="Acessórios (caixa, cabos...)"
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
              onChange={(e) => setFormData({...formData, acessorios: e.target.value})}
            />
          </div>

          {/* Relato */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs">
              <ClipboardList size={16} /> Relato do Defeito
            </h2>
            <textarea 
              placeholder="Descreva o problema..." required
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none min-h-[100px] focus:border-blue-500"
              onChange={(e) => setFormData({...formData, relato: e.target.value})}
            ></textarea>
          </div>

          {/* Botões */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              type="submit"
              className="bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Save size={20} /> SALVAR
            </button>
            <button 
              type="button"
              onClick={() => window.print()}
              className="bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <Printer size={20} /> IMPRIMIR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}