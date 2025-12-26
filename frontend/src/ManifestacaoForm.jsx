import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import axios from 'axios';

export default function ManifestacaoForm({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  const [formData, setFormData] = useState({
    chave: '', // 44 dígitos
    evento: '210200', // Código da Confirmação da Operação (Padrão)
    justificativa: '' // Apenas para "Operação não Realizada"
  });

  const tiposEvento = [
    { cod: '210200', label: 'Confirmação da Operação (Tudo Certo)' },
    { cod: '210210', label: 'Ciência da Emissão (Vi a nota)' },
    { cod: '210220', label: 'Desconhecimento da Operação (Não comprei)' },
    { cod: '210240', label: 'Operação não Realizada (Devolvi/Recusei)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    try {
      // Vamos criar essa rota no backend
      const response = await axios.post('http://localhost:3001/manifestar', formData);
      setResultado(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Manifestação do Destinatário</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chave de Acesso da NFe (44 dígitos)</label>
              <input 
                required 
                maxLength={44}
                value={formData.chave}
                onChange={e => setFormData({...formData, chave: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ex: 432310..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Evento</label>
              <select 
                value={formData.evento}
                onChange={e => setFormData({...formData, evento: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {tiposEvento.map(t => <option key={t.cod} value={t.cod}>{t.label}</option>)}
              </select>
            </div>

            {/* Campo Extra se for Operação não Realizada */}
            {formData.evento === '210240' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Justificativa</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.justificativa}
                  onChange={e => setFormData({...formData, justificativa: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Por que a operação não aconteceu?"
                />
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all">
              {loading ? 'Enviando Evento...' : <><Send size={18} /> Enviar Manifestação</>}
            </button>
          </form>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-4 text-green-800 border-b border-green-200 pb-2">
              <CheckCircle2 size={24} />
              <span className="font-bold text-lg">Evento Registrado!</span>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Status:</strong> {resultado.message}</p>
              <p><strong>Protocolo:</strong> {Math.floor(Math.random() * 1000000)} (Simulado)</p>
              
              <div className="mt-4 p-3 bg-slate-900 text-green-400 rounded font-mono text-xs overflow-auto">
                {resultado.xml_evento}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}