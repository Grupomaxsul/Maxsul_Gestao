import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Search, FileText, Calendar } from 'lucide-react';

export default function NFeList() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busca, setBusca] = useState('');
  
  // Pega o mês atual no formato YYYY-MM (ex: 2025-12)
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [filtroMes, setFiltroMes] = useState(mesAtual);

  useEffect(() => {
    carregarNotas();
  }, []);

  const carregarNotas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/notas');
      setNotas(res.data);
    } catch (error) {
      alert('Erro ao buscar notas');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (xml, chave) => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe-${chave}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lógica de Filtragem (Texto + Mês)
  const notasFiltradas = notas.filter(nota => {
    const dataNota = nota.data_emissao.slice(0, 7); // Pega YYYY-MM da nota
    const bateuMes = filtroMes ? dataNota === filtroMes : true;
    
    const texto = busca.toLowerCase();
    const bateuTexto = 
      nota.destinatario_nome?.toLowerCase().includes(texto) ||
      nota.numero_nota?.toString().includes(texto);

    return bateuMes && bateuTexto;
  });

  return (
    <div className="p-8 animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> Notas Emitidas
        </h2>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Filtro de Mês */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="month" 
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              title="Filtrar por Mês"
            />
          </div>

          {/* Busca Texto */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Nome ou Número..." 
              className="pl-10 pr-4 py-2 border rounded-full text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Número</th>
              <th className="px-6 py-4">Destinatário</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center">Carregando...</td></tr>
            ) : notasFiltradas.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-400 py-10">
                Nenhuma nota encontrada neste mês.
              </td></tr>
            ) : (
              notasFiltradas.map((nota) => (
                <tr key={nota.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(nota.data_emissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{nota.numero_nota}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{nota.destinatario_nome}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    R$ {parseFloat(nota.valor_total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDownload(nota.xml_completo, nota.chave_acesso)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200 flex items-center gap-2 mx-auto text-xs font-bold transition-all"
                    >
                      <Download size={14} /> XML
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-slate-500 text-right">
          Mostrando {notasFiltradas.length} notas de {filtroMes || 'todos os meses'}
        </div>
      </div>
    </div>
  );
}