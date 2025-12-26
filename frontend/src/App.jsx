import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

// --- IMPORTAÇÃO DO LAYOUT NOVO ---
import AppLayout from './layouts/AppLayout'; // Certifique-se de ter criado o arquivo que enviei antes

// --- SEUS COMPONENTES ---
import NFeForm from './NFeForm'; 
import NFeList from './NFeList'; 
import NotasRecebidas from './NotasRecebidas'; 

// --- COMPONENTE DASHBOARD (Recriando sua tela inicial) ---
const DashboardHome = () => {
  const [statusServer, setStatusServer] = useState('Verificando...');
  
  useEffect(() => {
    // Checagem rápida do backend
    axios.get('http://127.0.0.1:3001/')
      .then(() => setStatusServer('Online'))
      .catch(() => setStatusServer('Offline'));
  }, []);

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-700 mb-6">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Backend */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status do Servidor</h3>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${statusServer === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-2xl font-bold text-slate-700">{statusServer}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">API Node.js (Porta 3001)</p>
        </div>

        {/* Card 2: Certificado */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Certificado A1</h3>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <span className="text-lg font-bold text-slate-700 block leading-tight">Ativo</span>
              <span className="text-xs text-slate-400">Vence em: 2025</span>
            </div>
          </div>
        </div>

        {/* Card 3: Ambiente */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ambiente SEFAZ</h3>
          <div className="mt-1 flex items-center justify-between">
             <span className="text-2xl font-bold text-blue-600">Produção</span>
             <ShieldCheck className="text-gray-200" size={40} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Ambiente Nacional (DFe)</p>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENTE PLACEHOLDER (Para rotas vazias) ---
const PagePlaceholder = ({ title }) => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-gray-400">
    <Activity size={48} className="mb-4 opacity-20" />
    <h2 className="text-xl font-bold text-gray-500">{title}</h2>
    <p>Módulo em desenvolvimento.</p>
  </div>
);

// --- APP PRINCIPAL COM ROTAS ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* O Layout envolve todas as rotas internas */}
        <Route element={<AppLayout />}>
          
          {/* Rota Raiz = Dashboard */}
          <Route path="/" element={<DashboardHome />} />

          {/* === SEUS COMPONENTES CONECTADOS AQUI === */}

          {/* 80NFE - Emissão de Nota (Passamos navigate para o botão voltar funcionar) */}
          <Route path="/nfe-saida" element={<NFeWrapper />} />

          {/* 55FIS - Lista de Notas Emitidas (Histórico) */}
          <Route path="/fiscal" element={<NFeList />} />

          {/* 85MDE - Manifestação / Notas Recebidas SEFAZ */}
          <Route path="/manifesto" element={<NotasRecebidas />} />

          
          {/* === OUTRAS ROTAS (Placeholders) === */}
          <Route path="/empresas" element={<PagePlaceholder title="Cadastro de Empresas" />} />
          <Route path="/clientes" element={<PagePlaceholder title="Cadastro de Clientes" />} />
          <Route path="/produtos" element={<PagePlaceholder title="Cadastro de Produtos" />} />
          <Route path="/estoque" element={<PagePlaceholder title="Controle de Estoque" />} />
          <Route path="/financeiro" element={<PagePlaceholder title="Gestão Financeira" />} />
          <Route path="/config" element={<PagePlaceholder title="Configurações" />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper para injetar a navegação no seu NFeForm antigo
const NFeWrapper = () => {
  const navigate = useNavigate();
  // Quando clicar em "Voltar" no form, vai para o Dashboard
  return <NFeForm onBack={() => navigate('/')} />;
};

export default App;