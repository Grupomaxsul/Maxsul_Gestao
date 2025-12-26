import React, { useState } from 'react';
import axios from 'axios';
import { Download, RefreshCw, AlertTriangle, Search } from 'lucide-react';

export default function NotasRecebidas() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  
  // --- CORREÇÃO CRÍTICA AQUI ---
  // Definimos o padrão como '3068' (baseado no seu log de erro da SEFAZ).
  // Assim, quando o bloqueio de 1h acabar, o sistema pede a partir desse número e não do zero.
  const [nsuAtual, setNsuAtual] = useState(localStorage.getItem('maxsul_last_nsu') || '3068');

  const buscarNaSefaz = async () => {
    setLoading(true);
    setErro(null);
    try {
      // Usamos 127.0.0.1 para evitar problemas de IPv6/localhost no Mac
      const res = await axios.post('http://127.0.0.1:3001/consultar-sefaz-real', {
        nsu: nsuAtual
      });
      
      const { documentos, ultimoNSU } = res.data;

      if (documentos && documentos.length > 0) {
        setNotas(prev => [...documentos, ...prev]); // Adiciona as novas no topo da lista
        alert(`${documentos.length} novas notas encontradas!`);
      } else {
        alert(`Nenhuma nota NOVA encontrada. (NSU verificado na SEFAZ: ${ultimoNSU})`);
      }

      // Atualiza o ponteiro (NSU) no navegador para a próxima consulta
      if (ultimoNSU && ultimoNSU !== '0') {
        setNsuAtual(ultimoNSU);
        localStorage.setItem('maxsul_last_nsu', ultimoNSU);
      }

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Erro de conexão com o servidor (Verifique se o backend está rodando).';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const baixarXmlReal = (xmlContent, chave) => {
    try {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chave}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) { alert("Erro ao gerar o download do XML"); }
  };

  return (
    <div className="p-8 animate-fade-in bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notas de Entrada (SEFAZ)</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border">
               NSU Atual: {nsuAtual}
             </span>
             <p className="text-slate-500 text-sm">Ambiente Nacional</p>
          </div>
        </div>
        <button 
          onClick={buscarNaSefaz}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          {loading ? 'Consultando...' : 'Buscar Novas Notas'}
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle size={20} />
            <p>Atenção</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{erro}</p>
          {erro.includes("656") && (
             <p className="text-xs text-red-600 mt-2 font-bold">
               Importante: Aguarde 1 hora antes de tentar novamente para a SEFAZ desbloquear o CNPJ.
             </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b">
            <tr>
              <th className="px-6 py-4">Emitente</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Emissão</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {notas.map((nota, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{nota.nome}</div>
                    <div className="text-xs text-slate-500">CNPJ: {nota.cnpj}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{nota.chave}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    R$ {parseFloat(nota.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">{new Date(nota.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${nota.tipo === 'completa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {nota.tipo === 'completa' ? 'NFe Completa' : 'Resumo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => baixarXmlReal(nota.xml, nota.chave)} 
                      className="text-blue-600 hover:underline text-xs font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Baixar XML
                    </button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        {notas.length === 0 && !erro && (
            <div className="p-12 text-center text-slate-400">
                <Search className="mx-auto mb-2 opacity-20" size={40} />
                Nenhuma nota carregada ainda.
            </div>
        )}
      </div>
    </div>
  );
}