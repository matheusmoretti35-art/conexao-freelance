"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/server.ts
// DESCRIÇÃO: Ponto de entrada do servidor Express.js (Todas as Etapas + Admin + Static)
// ==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Importação dos Módulos de Rotas das Etapas 1 a 5 + Admin
const prestadorRoutes_1 = __importDefault(require("./routes/prestadorRoutes"));
const cobrancaRoutes_1 = __importDefault(require("./routes/cobrancaRoutes"));
const avaliacaoRoutes_1 = __importDefault(require("./routes/avaliacaoRoutes"));
const anuncioRoutes_1 = __importDefault(require("./routes/anuncioRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Configuração de Middlewares globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Servir arquivos estáticos do Frontend (index.html, admin.html)
app.use(express_1.default.static(path_1.default.join(__dirname, '../../web')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../')));
// Rota Raiz ( / ) para recepção amigável
app.get('/', (req, res) => {
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
app.use('/api', prestadorRoutes_1.default);
app.use('/api', cobrancaRoutes_1.default);
app.use('/api', avaliacaoRoutes_1.default);
app.use('/api', anuncioRoutes_1.default);
app.use('/api', analyticsRoutes_1.default);
app.use('/api', adminRoutes_1.default);
// Rota de verificação de integridade (Health Check)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        projeto: 'Conexão Freelance - Backend API Completo',
        etapas_ativas: ['1 - Cadastro/Busca', '2 - Cobrança/Webhooks', '3 - Avaliações/SAC', '4 - Publicidade Contextual', '5 - Rastreamento CAPI', 'ADM - Painel do Proprietário'],
        timestamp: new Date().toISOString(),
    });
});
// Tratamento para rotas inexistentes (404)
app.use((req, res) => {
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
