import React, { useState } from 'react';
import { Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function NFeForm({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  // Estado para guardar os dados do formulário
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteDoc: '', // CPF ou CNPJ
    produto: '',
    valor: '',
    quantidade: '1'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    try {
      // Envia os dados para o backend (vamos criar essa rota já já)
      const response = await axios.post('http://localhost:3001/emitir-nfe', formData);
      setResultado(response.data);
    } catch (error) {
      alert('Erro ao emitir: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Nova Nota Fiscal</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
              <input required name="clienteNome" value={formData.clienteNome} onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: João da Silva" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
              <input required name="clienteDoc" value={formData.clienteDoc} onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Apenas números" />
            </div>

            <div className="border-t border-gray-100 my-4 pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Produto / Serviço</label>
              <input required name="produto" value={formData.produto} onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: Consultoria de TI" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd</label>
                <input required type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Unitário (R$)</label>
                <input required type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all">
              {loading ? 'Processando...' : <><Save size={20} /> Emitir e Assinar XML</>}
            </button>
          </form>
        </div>

        {/* LADO DIREITO: RESULTADO (XML) */}
        {resultado && (
          <div className="bg-slate-900 text-green-400 p-6 rounded-lg shadow-lg overflow-auto max-h-[500px] font-mono text-xs">
            <div className="flex items-center gap-2 mb-4 text-white border-b border-gray-700 pb-2">
              <CheckCircle2 className="text-green-500" />
              <span className="font-bold text-lg">Nota Assinada com Sucesso!</span>
            </div>
            <p className="text-gray-400 mb-2">// XML Assinado pronto para envio à SEFAZ:</p>
            <pre className="whitespace-pre-wrap break-all">
              {resultado.xml_assinado}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}