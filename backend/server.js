const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Configuração do Servidor
app.use(cors());
app.use(express.json());

// 1. Conexão com Supabase (Usando a Service Role para permissão total)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 2. Configuração do Certificado Digital (PFX)
// Tenta carregar o certificado. Se falhar, avisa no console mas não derruba o servidor imediatamente.
let httpsAgent = null;
try {
  const pfxContent = fs.readFileSync(process.env.CERTIFICADO_PATH);
  httpsAgent = new https.Agent({
    pfx: pfxContent,
    passphrase: process.env.CERTIFICADO_SENHA,
    rejectUnauthorized: false // Importante para SEFAZ
  });
  console.log("✅ Certificado carregado com sucesso!");
} catch (error) {
  console.error("❌ Erro ao carregar certificado:", error.message);
  console.error("Verifique se o arquivo está na pasta 'backend/certificado' e se a senha no .env está correta.");
}

// URL do Web Service de Distribuição de DFe (Ambiente Nacional / RS)
const URL_SEFAZ_DISTRIBUICAO = "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";

// --- ROTAS ---

// Rota de Teste para ver se o servidor está rodando
app.get('/', (req, res) => {
  res.send('Servidor Maxsul Gestão está rodando! 🚀');
});

// Rota: Consultar Notas na SEFAZ
app.post('/api/consultar-sefaz', async (req, res) => {
  if (!httpsAgent) {
    return res.status(500).json({ error: "Certificado digital não configurado corretamente." });
  }

  try {
    const { ultimoNSU } = req.body; // Vem do Frontend (ex: "0")
    
    // Montagem do XML SOAP (Envelope básico para DistribuicaoDFe)
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <nfeDistDFeInt xmlns="http://www.portalfiscal.inf.br/nfe">
          <tpAmb>${process.env.AMBIENTE}</tpAmb>
          <cUFAutor>43</cUFAutor>
          <CNPJ>${process.env.CNPJ_MAXSUL}</CNPJ>
          <distNSU>
            <ultNSU>${(ultimoNSU || "0").padStart(15, '0')}</ultNSU>
          </distNSU>
        </nfeDistDFeInt>
      </soap12:Body>
    </soap12:Envelope>`;

    console.log("📡 Consultando SEFAZ com NSU:", ultimoNSU || "0");

    // Envio para a SEFAZ
    const response = await axios.post(URL_SEFAZ_DISTRIBUICAO, xmlBody, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      httpsAgent: httpsAgent // Usa o certificado aqui
    });

    // Parse do XML de resposta (Transforma XML em JSON)
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    const result = await parser.parseStringPromise(response.data);

    // TODO: Aqui vamos processar o retorno e salvar no Supabase
    // Por enquanto, retornamos o resultado bruto para teste
    res.json({ 
      success: true, 
      dados: result 
    });

  } catch (error) {
    console.error("Erro na requisição SEFAZ:", error.message);
    res.status(500).json({ error: error.message, details: error.response ? error.response.data : null });
  }
});

// Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});