// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/server.ts
// DESCRIÇÃO: Ponto de entrada do servidor Express.js (Todas as Etapas + Admin + Static)
// ==============================================================================

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Importação dos Módulos de Rotas das Etapas 1 a 5 + Admin
import prestadorRoutes from './routes/prestadorRoutes';
import cobrancaRoutes from './routes/cobrancaRoutes';
import avaliacaoRoutes from './routes/avaliacaoRoutes';
import anuncioRoutes from './routes/anuncioRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Configuração de Middlewares globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Frontend (index.html, admin.html)
app.use(express.static(path.join(__dirname, '../../web')));
app.use(express.static(path.join(__dirname, '../../')));

// Rota Raiz ( / ) para recepção amigável
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    sucesso: true,
    projeto: 'Conexão Freelance - API & Plataforma Web',
    mensagem: 'Bem-vindo ao servidor backend do Conexão Freelance!',
    links_uteis: {
      health_check: '/health',
      prototipo_interativo: '/index.html',
      painel_administrador: '/admin.html',
      documentacao_api: '/api/prestadores/busca?estado=SP&cidade=Campinas&profissao=Eletricista'
    }
  });
});

// Registro de Todos os Módulos de API do Projeto
app.use('/api', prestadorRoutes);
app.use('/api', cobrancaRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', anuncioRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', adminRoutes);

// Rota de verificação de integridade (Health Check)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    projeto: 'Conexão Freelance - Backend API Completo',
    etapas_ativas: ['1 - Cadastro/Busca', '2 - Cobrança/Webhooks', '3 - Avaliações/SAC', '4 - Publicidade Contextual', '5 - Rastreamento CAPI', 'ADM - Painel do Proprietário'],
    timestamp: new Date().toISOString(),
  });
});

// Tratamento para rotas inexistentes (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota ${req.originalUrl} não encontrada no servidor.`,
  });
});

// Inicialização do servidor HTTP
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor Conexão Freelance Ativo e Integrado (Porta ${PORT})!`);
  console.log(`🌐 Rota Raiz: http://localhost:${PORT}/`);
  console.log(`💻 Protótipo Interativo: http://localhost:${PORT}/index.html`);
  console.log(`📊 Painel Administrador: http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
