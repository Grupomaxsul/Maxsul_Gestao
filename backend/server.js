require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const zlib = require('zlib');
const xml2js = require('xml2js');

const app = express();

// CORREÇÃO 1: CORS PERMISSIVO (Resolve o "Offline")
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- CONFIGURAÇÕES ---
const PFX_PATH = path.resolve(__dirname, process.env.CERTIFICADO_PATH);
const PFX_PASS = process.env.CERTIFICADO_SENHA;
const CNPJ = process.env.CNPJ_MAXSUL ? process.env.CNPJ_MAXSUL.replace(/\D/g, '') : '';
const UF_RS = '43'; 

// Validações de segurança ao iniciar
if (!fs.existsSync(PFX_PATH)) {
  console.error(`❌ ERRO: Certificado não encontrado em: ${PFX_PATH}`);
  process.exit(1);
}
if (!CNPJ) {
  console.error(`❌ ERRO: CNPJ não configurado no .env`);
  process.exit(1);
}

// --- FUNÇÃO: CONSULTAR SEFAZ (Gerenciando NSU) ---
async function consultarNFeSefaz(ultimoNSU = '0') {
  const pfx = fs.readFileSync(PFX_PATH);
  
  const agent = new https.Agent({
    pfx: pfx,
    passphrase: PFX_PASS,
    rejectUnauthorized: false 
  });

  // Garante formato de 15 dígitos
  const nsuFormatado = ultimoNSU.toString().padStart(15, '0');
  console.log(`📡 Consultando SEFAZ a partir do NSU: ${nsuFormatado}`);

  // XML SOAP 1.1 Exato
  const xmlBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
          <nfeDadosMsg>
            <distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">
              <tpAmb>1</tpAmb>
              <cUFAutor>${UF_RS}</cUFAutor>
              <CNPJ>${CNPJ}</CNPJ>
              <distNSU>
                <ultNSU>${nsuFormatado}</ultNSU>
              </distNSU>
            </distDFeInt>
          </nfeDadosMsg>
        </nfeDistDFeInteresse>
      </soap:Body>
    </soap:Envelope>
  `;

  const url = 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx';

  try {
    const response = await axios.post(url, xmlBody, {
      headers: { 
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse'
      },
      httpsAgent: agent,
      timeout: 30000 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? `Erro HTTP ${error.response.status}` : error.message);
  }
}

// --- FUNÇÃO: PROCESSAR RETORNO ---
async function processarRespostaSefaz(xmlRaw) {
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
  const result = await parser.parseStringPromise(xmlRaw);

  // Navegação segura no XML de resposta
  const body = result['soap:Envelope']?.['soap:Body'] || result['soap12:Envelope']?.['soap12:Body'];
  // Tenta pegar o elemento response, as vezes varia o prefixo
  const responseRoot = body?.['nfeDistDFeInteresseResponse'] || body?.['nfeDistDFeInteresseResult'];
  
  const corpoRetorno = responseRoot?.['nfeDistDFeInteresseResult']?.['retDistDFeInt'] || body?.['nfeDistDFeInteresseResponse']?.['nfeDistDFeInteresseResult']?.['retDistDFeInt'];

  if (!corpoRetorno) throw new Error("Estrutura XML inválida da SEFAZ");

  const novoUltNSU = corpoRetorno.ultNSU || '0';
  const maxNSU = corpoRetorno.maxNSU || '0';

  // Tratamento do Bloqueio 656
  if (corpoRetorno.cStat === '656') {
    throw new Error(`BLOQUEIO TEMPORÁRIO (656): Aguarde 1 hora. O último NSU válido é: ${novoUltNSU}`);
  }

  if (corpoRetorno.cStat !== '138' && corpoRetorno.cStat !== '137') {
     throw new Error(`SEFAZ retornou: ${corpoRetorno.xMotivo} (Cód: ${corpoRetorno.cStat})`);
  }

  const lote = corpoRetorno.loteDistDFeInt?.docZip;
  let documentos = [];

  if (lote) {
    const listaDocumentos = Array.isArray(lote) ? lote : [lote];
    documentos = await Promise.all(listaDocumentos.map(async (doc) => {
      try {
        const buffer = Buffer.from(doc._, 'base64');
        const xmlDescompactado = zlib.gunzipSync(buffer).toString('utf-8');
        const notaParsed = await parser.parseStringPromise(xmlDescompactado);
        
        // Formata os dados para o Frontend
        if (notaParsed.resNFe) {
            return { tipo: 'resumo', chave: notaParsed.resNFe.chNFe, nome: notaParsed.resNFe.xNome, cnpj: notaParsed.resNFe.CNPJ, valor: notaParsed.resNFe.vNF, data: notaParsed.resNFe.dhEmi, xml: xmlDescompactado, nsu: doc.$.NSU };
        } else if (notaParsed.nfeProc) {
            return { tipo: 'completa', chave: notaParsed.nfeProc.NFe.infNFe.Id.replace('NFe',''), nome: notaParsed.nfeProc.NFe.infNFe.emit.xNome, cnpj: notaParsed.nfeProc.NFe.infNFe.emit.CNPJ, valor: notaParsed.nfeProc.NFe.infNFe.total.ICMSTot.vNF, data: notaParsed.nfeProc.NFe.infNFe.ide.dhEmi, xml: xmlDescompactado, nsu: doc.$.NSU };
        }
        return null;
      } catch (e) { return null; }
    }));
  }

  return { 
    documentos: documentos.filter(n => n !== null),
    ultimoNSU: novoUltNSU,
    maxNSU: maxNSU
  };
}

// --- ROTAS ---
app.get('/', (req, res) => res.send('🚀 Servidor Online'));

// Rota POST que recebe o NSU do frontend
app.post('/consultar-sefaz-real', async (req, res) => {
  try {
    const { nsu } = req.body; 
    console.log("Recebido pedido de consulta com NSU:", nsu || '0');
    
    const xmlResponse = await consultarNFeSefaz(nsu || '0');
    const resultado = await processarRespostaSefaz(xmlResponse);
    
    console.log(`✅ Sucesso! Retornou até NSU: ${resultado.ultimoNSU}`);
    res.json({ success: true, ...resultado });

  } catch (error) {
    console.error("❌ Erro no Backend:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));