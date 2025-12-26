import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, DollarSign, Settings, LogOut,
  ChevronDown, ChevronRight, Box, Truck, Building2, Users,
  Layers, Tags, FileText, Monitor, X, Ruler, Package, Barcode,
  Database, Network, Activity, Globe, Shield, UserCog, AlertTriangle, CheckCircle,
  FileCheck, Download, FilePlus, FileInput
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Se você ainda não tem esses componentes, pode remover ou criar mocks
// import { Modal } from '../../components/Modal';
// import { useAuth } from '../../contexts/AuthContext'; 
// import api from '../../services/api';

// --- MOCKS (Para o código rodar sem o backend configurado) ---
// Remova isso quando conectar seu AuthContext e API reais
const useAuth = () => ({
  user: { name: 'Administrador', role: 'ADMIN' },
  signOut: () => console.log('Saindo...')
});
const api = { get: () => Promise.resolve({ data: [{ id: 1, name: 'Empresa Matriz', trade_name: 'MAXSUL MATRIZ', code: '01', cert_expiration: '2025-12-31' }] }) };
const Modal = ({ isOpen, title, message, onClose }) => isOpen ? (
  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-lg">
      <h3 className="font-bold">{title}</h3>
      <p>{message}</p>
      <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Fechar</button>
    </div>
  </div>
) : null;

// --- CONSTANTS ---
const PROGRAMS_MAP = {
  // Cadastros
  '/empresas': { code: '67CDE', label: 'Cadastro de Empresas' },
  '/clientes': { code: '27CDT', label: 'Cadastro Transacionador' },
  '/fornecedores': { code: '28FNC', label: 'Cadastro Fornecedores' },
  '/funcionarios': { code: '29RHU', label: 'Cadastro Funcionários' },
  '/produtos': { code: '33EST', label: 'Estrutura Mercadológica' },
  '/unidades': { code: '32UNI', label: 'Cadastro de Unidades' },
  '/marcas': { code: '34MRC', label: 'Cadastro de Marcas' },
  '/cadastro-produto': { code: '35PRO', label: 'Cadastro de Produtos' },
  '/cadastro-gtin': { code: '36GTIN', label: 'Gestão de GTIN / Embalagens' },
  
  // Movimentos
  '/nfe-saida': { code: '80NFE', label: 'Emissão de Nota Fiscal' },
  '/pedidos': { code: '90PED', label: 'Emissão de Pedido de Venda' },
  '/manifesto': { code: '85MDE', label: 'Manifestação do Destinatário' },
  '/importar-xml': { code: '81IMP', label: 'Importação de XML (NFe)' },
  '/nfe-entrada': { code: '82ENT', label: 'Nota Fiscal de Entrada (Manual)' },

  // Outros
  '/caixa': { code: '91CFX', label: 'Frente de Caixa' },
  '/estoque': { code: '40LOG', label: 'Logística e Estoque' },
  '/financeiro': { code: '50FIN', label: 'Gestão Financeira' },
  '/fiscal': { code: '55FIS', label: 'Escrita Fiscal' },
  '/usuarios': { code: '99USR', label: 'Gestão de Usuários' },
  '/config': { code: '98CFG', label: 'Configurações Gerais' },
};

const menuItems = [
  {
    label: 'Comercial',
    icon: <ShoppingCart size={14} />,
    children: [
      {
        label: 'Cadastros',
        icon: <FileText size={14} />,
        children: [
          { label: '67CDE - Empresa / Filial', to: '/empresas', icon: <Building2 size={14} /> },
          { label: '27CDT - Transacionador', to: '/clientes', icon: <Users size={14} /> },
          { label: '33EST - Estrutura Mercadológica', to: '/produtos', icon: <Layers size={14} /> },
          { label: '32UNI - Unidades de Medida', to: '/unidades', icon: <Ruler size={14} /> },
          { label: '34MRC - Marcas', to: '/marcas', icon: <Tags size={14} /> },
          { label: '35PRO - Cadastro de Produtos', to: '/cadastro-produto', icon: <Package size={14} /> },
          { label: '36GTIN - GTIN e Embalagens', to: '/cadastro-gtin', icon: <Barcode size={14} /> },
        ]
      },
      {
        label: 'Movimentos',
        icon: <Monitor size={14} />,
        children: [
          { label: '80NFE - Emissão de Nota Fiscal', to: '/nfe-saida', icon: <FileCheck size={14} /> },
          { label: '90PED - Emissão de Pedido', to: '/pedidos', icon: <FilePlus size={14} /> },
          { label: '85MDE - Manifestação Destinatário', to: '/manifesto', icon: <Globe size={14} /> },
          { label: '81IMP - Importação XML NFe', to: '/importar-xml', icon: <Download size={14} /> },
          { label: '82ENT - Nota Fiscal Entrada', to: '/nfe-entrada', icon: <FileInput size={14} /> },
          { label: '91CFX - Frente de Caixa (PDV)', to: '/caixa', icon: <Box size={14} /> },
        ]
      }
    ]
  },
  {
    label: 'Logística',
    icon: <Truck size={14} />,
    children: [
      { label: '40LOG - Movimentações', to: '/estoque', icon: <Box size={14} /> },
      { label: '41SAL - Consulta Saldo', to: '/estoque', icon: <FileText size={14} /> },
    ]
  },
  {
    label: 'Financeiro',
    icon: <DollarSign size={14} />,
    children: [
      { label: '50FIN - Contas a Pagar/Receber', to: '/financeiro', icon: <DollarSign size={14} /> },
      { label: '55FIS - Fiscal / NFe', to: '/fiscal', icon: <FileText size={14} /> },
    ]
  },
  {
    label: 'Administrador',
    icon: <Shield size={14} />,
    children: [
      { label: '99USR - Usuários e Permissões', to: '/usuarios', icon: <UserCog size={14} /> },
      { label: '98CFG - Configurações Gerais', to: '/config', icon: <Settings size={14} /> },
    ]
  }
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [openPrograms, setOpenPrograms] = useState(() => {
    const saved = sessionStorage.getItem('openPrograms');
    return saved ? JSON.parse(saved) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [sefazStatus, setSefazStatus] = useState('online');
  const [networkIp, setNetworkIp] = useState('Verificando...');
  
  // Controle de Filiais
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  // Status do Certificado
  const [certStatus, setCertStatus] = useState({ 
    text: 'VERIFICANDO...', color: 'text-gray-400', icon: Shield 
  });

  // 1. Buscar IP Real
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setNetworkIp(data.ip))
      .catch(() => setNetworkIp('127.0.0.1'));
  }, []);

  // 2. Carregar Empresas Permitidas
  useEffect(() => {
    const loadCompanies = async () => {
        try {
            // MOCK: usando o objeto api mockado acima se o real falhar
            const res = await api.get('/empresas');
            const allCompanies = res.data;

            let allowed = allCompanies;
            if (user?.role !== 'ADMIN' && user?.allowed_companies) {
                allowed = allCompanies.filter((c) => user.allowed_companies.includes(c.id));
            }

            setBranches(allowed);
            if (allowed.length > 0 && !selectedBranch) setSelectedBranch(allowed[0]);
        } catch (error) {
            console.error("Erro ao carregar empresas", error);
        }
    };
    loadCompanies();
  }, [user, selectedBranch]); // Adicionei selectedBranch na dependência para evitar loop se mock

  // 3. Atualizar Status do Certificado quando mudar a filial
  useEffect(() => {
    if (selectedBranch) {
        if (!selectedBranch.cert_expiration) {
            setCertStatus({ text: 'NÃO INSTALADO', color: 'text-red-400', icon: AlertTriangle });
        } else {
            const today = new Date();
            const expDate = new Date(selectedBranch.cert_expiration);
            const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysLeft < 0) {
                setCertStatus({ text: 'VENCIDO', color: 'text-red-500 font-black', icon: AlertTriangle });
            } else if (daysLeft <= 30) {
                setCertStatus({ text: `VENCE EM ${daysLeft} DIAS`, color: 'text-yellow-400', icon: AlertTriangle });
            } else {
                setCertStatus({ text: `VÁLIDO ATÉ ${expDate.toLocaleDateString()}`, color: 'text-green-300', icon: CheckCircle });
            }
        }
    }
  }, [selectedBranch]);

  // Persist Tabs
  useEffect(() => {
    sessionStorage.setItem('openPrograms', JSON.stringify(openPrograms));
  }, [openPrograms]);

  // Sync URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') return;
    if (PROGRAMS_MAP[path]) {
      setOpenPrograms(prev => prev.includes(path) ? prev : [...prev, path]);
    }
  }, [location.pathname]);

  const handleCloseProgram = (e, path) => {
    e.stopPropagation();
    const newTabs = openPrograms.filter(p => p !== path);
    setOpenPrograms(newTabs);
    if (location.pathname === path) navigate(newTabs.length ? newTabs[newTabs.length - 1] : '/');
  };

  const getProgramTitle = (path) => PROGRAMS_MAP[path] ? `${PROGRAMS_MAP[path].code} - ${PROGRAMS_MAP[path].label}` : 'Programa';

  return (
    <div className="flex flex-col h-screen bg-[#EBECEF] text-sm font-sans overflow-hidden">
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Aviso" message="Muitas abas abertas." type="warning" />

      {/* --- HEADER --- */}
      <header className="bg-[#005691] text-white h-12 flex items-center justify-between px-4 shadow-md z-30 select-none border-b border-sky-800">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded"><LayoutDashboard size={20} /></div>
          <div>
            <h1 className="font-bold tracking-wide text-base leading-tight">MAX ERP</h1>
            <p className="text-[10px] text-sky-200 uppercase tracking-wider">Enterprise 2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-sky-100 flex items-center justify-end gap-1 uppercase">
                <Building2 size={12}/> {selectedBranch ? selectedBranch.trade_name || selectedBranch.name : 'SEM FILIAL'}
            </p>
            <p className="text-[10px] text-sky-300">Ambiente: Produção</p>
          </div>
          <div className="h-8 w-px bg-sky-600 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center font-bold text-xs border border-sky-400">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="leading-tight">
              <p className="font-bold text-xs truncate max-w-[100px]">{user?.name || 'Usuário'}</p>
              <button onClick={signOut} className="text-[10px] text-red-200 hover:text-white flex items-center gap-1 transition">
                  <LogOut size={10} /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MENU --- */}
      <nav className="bg-[#F8F9FA] border-b border-gray-300 h-9 flex items-center px-2 z-20 shadow-sm text-gray-700">
        {menuItems.map((item, index) => (
          <TopLevelMenu key={index} item={item} onOpen={(path) => navigate(path)} />
        ))}
        <div className="group relative h-full ml-auto">
          <button className="flex items-center px-4 h-full text-gray-600 hover:bg-gray-200 transition border-l border-gray-300">
            <Settings size={16} className="mr-2" />
          </button>
        </div>
      </nav>

      {/* --- TABS --- */}
      <div className="bg-[#DDE2E5] h-8 flex items-end px-2 border-b border-gray-400 space-x-1 shadow-inner overflow-x-auto">
        {openPrograms.map((path) => (
            <div key={path} onClick={() => navigate(path)} className={`px-3 py-1 rounded-t text-xs flex items-center min-w-[160px] shadow-sm cursor-pointer border-t border-l border-r group ${location.pathname === path ? 'bg-[#F0F2F5] text-[#005691] font-bold z-10' : 'bg-[#CFD4D8] text-gray-600 hover:bg-[#E2E6EA]'}`}>
              <span className="truncate mr-2 flex-1">{getProgramTitle(path)}</span>
              <button onClick={(e) => handleCloseProgram(e, path)} className="ml-auto text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100"><X size={12} /></button>
            </div>
        ))}
      </div>

      {/* --- MAIN --- */}
      <main className="flex-1 overflow-auto bg-[#F0F2F5] p-3 relative shadow-inner">
        {location.pathname === '/' ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-300 select-none">
            <LayoutDashboard size={64} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-bold opacity-30">Bem-vindo ao Maxsul Gestão</h2>
            <p className="opacity-30">Selecione um programa no menu para começar</p>
          </div>
        ) : <div className="h-full w-full bg-white border border-gray-300 shadow-sm rounded-sm overflow-auto"><Outlet /></div>}
      </main>

      {/* --- FOOTER (STATUS BAR) --- */}
      <footer className="bg-[#005691] text-white text-[10px] h-7 flex items-center px-3 justify-between select-none border-t border-sky-900 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] relative z-50">
        
        <div className="flex items-center gap-4 h-full">
            <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full rounded transition cursor-help">
                <Database size={12} className="text-green-300"/> <span>BANCO: <strong>SRV-DB-01</strong></span>
            </div>
            <span className="text-sky-400/50">|</span>
            <div className="relative h-full flex items-center">
                <button onClick={() => setShowBranchMenu(!showBranchMenu)} className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full rounded transition cursor-pointer">
                    <Building2 size={12} className="text-yellow-300"/>
                    <span className="uppercase font-bold">{selectedBranch ? (selectedBranch.trade_name || selectedBranch.name) : 'SELECIONE A FILIAL'}</span>
                    <ChevronDown size={10} className="opacity-70"/>
                </button>
                {showBranchMenu && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white text-gray-800 shadow-xl border border-gray-300 rounded-sm overflow-hidden">
                        <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">Filiais Permitidas</div>
                        {branches.map(branch => (
                            <div key={branch.id} onClick={() => { setSelectedBranch(branch); setShowBranchMenu(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center gap-2 ${selectedBranch?.id === branch.id ? 'bg-blue-50 font-bold text-blue-700' : ''}`}>
                                <Building2 size={12} className={selectedBranch?.id === branch.id ? 'text-blue-600' : 'text-gray-400'}/>
                                <span className="truncate">{branch.code} - {branch.trade_name || branch.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4 h-full font-mono tracking-tight">
            <div className="flex items-center gap-1.5 px-2" title="Validade do Certificado Digital (A1)">
                <certStatus.icon size={12} className={certStatus.color}/>
                <span>CERT: <strong className={certStatus.color}>{certStatus.text}</strong></span>
            </div>
            <span className="text-sky-400/50">|</span>
            <div className="flex items-center gap-1.5 px-2" title="IP Público da Rede">
                <Network size={12} className="text-sky-300"/> <span>IP: <strong>{networkIp}</strong></span>
            </div>
            <span className="text-sky-400/50">|</span>
            <div className="flex items-center gap-1.5 px-2">
                <Globe size={12} className="text-green-400"/> <span>SEFAZ: <strong className="text-green-300">{sefazStatus.toUpperCase()}</strong></span>
            </div>
            <span className="text-sky-400/50">|</span>
            <div className="flex items-center gap-1.5 px-2 bg-black/20 h-full">
               <Activity size={12} className="text-sky-300"/> <span>{new Date().toLocaleDateString()}</span>
            </div>
        </div>
      </footer>
    </div>
  );
}

const TopLevelMenu = ({ item, onOpen }) => { 
  return (
    <div className="group relative h-full">
      <button className="flex items-center px-3 h-full hover:bg-sky-100 hover:text-sky-700 transition border-r border-transparent border-gray-200/50 cursor-default">
        {item.icon && <span className="mr-1.5">{item.icon}</span>} {item.label} <ChevronDown size={10} className="ml-1 opacity-60" />
      </button>
      <div className="hidden group-hover:block absolute top-full left-0 bg-white border border-gray-400 shadow-[2px_2px_5px_rgba(0,0,0,0.2)] w-64 py-1 z-50">
        {item.children.map((child, idx) => <SubMenuItem key={idx} item={child} onOpen={onOpen} />)}
      </div>
    </div>
  );
};
const SubMenuItem = ({ item, onOpen }) => { 
  const hasChildren = item.children && item.children.length > 0;
  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-[#0078D7] hover:text-white text-gray-800 text-xs transition-colors cursor-pointer relative group/sub" onClick={() => !hasChildren && onOpen(item.to)}>
      <div className="flex items-center">
        {item.icon && <span className="mr-2 opacity-70 group-hover/sub:text-white">{item.icon}</span>} {item.label}
      </div>
      {hasChildren && <ChevronRight size={12} className="opacity-60 group-hover/sub:text-white" />}
      {hasChildren && (
        <div className="hidden group-hover/sub:block absolute left-full top-[-1px] bg-white border border-gray-400 shadow-[2px_2px_5px_rgba(0,0,0,0.2)] w-60 py-1 -ml-[1px]">
          {item.children.map((child, idx) => <SubMenuItem key={idx} item={child} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
};