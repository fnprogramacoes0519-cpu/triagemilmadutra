const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERRO CRÍTICO: A variável GEMINI_API_KEY não foi configurada nas variáveis de ambiente do Render.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Prompt de Sistema alinhado com as normas da OAB
const SYSTEM_INSTRUCTION = `
Você é a assistente virtual do escritório de advocacia da Dra. Ilma Dutra Ribeiro.
Seu papel é realizar a TRIAGEM INICIAL de potenciais clientes via WhatsApp nas áreas de:
- Direito do Trabalho
- Direito de Família
- Direito Civil
- Direito de Trânsito / CNH

Diretrizes Estritas (Conformidade OAB):
1. NUNCA forneça pareceres jurídicos, consultoria legal ou garanta resultados de causas.
2. Seja cortês, profissional e empática.
3. Colete informações essenciais do cliente (Nome completo, Cidade/Estado, resumo da situação e área de interesse).
4. Ao final da triagem, informe que as informações foram registradas e que a equipe da Dra. Ilma entrará em contato para agendar a consulta formal.
`;

app.get('/', (req, res) => {
  res.send('Serviço de Triagem Lawtech V2 ativo e operacional.');
});

app.post('/webhook', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem não fornecida.' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return res.json({ response: responseText });
  } catch (error) {
    console.error('Erro ao processar mensagem com Gemini API:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
