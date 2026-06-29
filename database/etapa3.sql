-- ==============================================================================
-- PROJETO: Conexão Freelance
-- ARQUIVO: database/etapa3.sql
-- DESCRIÇÃO: Avaliações, Réplicas e Trava de Contato de Clientes (Etapa 3)
-- ==============================================================================

-- 1. Enum de Moderação de Conteúdo do SAC
CREATE TYPE status_moderacao_enum AS ENUM ('aprovado', 'pendente_moderacao', 'rejeitado');

-- 2. Tabela de Registro de Contatos Iniciados (Garante que apenas quem contatou avalia)
CREATE TABLE contatos_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Avaliações de Clientes
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    cliente_nome VARCHAR(100) NOT NULL,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    status_moderacao status_moderacao_enum NOT NULL DEFAULT 'aprovado',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Réplicas (Contra-argumentos dos Prestadores)
CREATE TABLE replicas_prestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID UNIQUE NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    resposta TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. ÍNDICES DE REPUTAÇÃO
CREATE INDEX idx_avaliacoes_prestador ON avaliacoes(prestador_id) WHERE status_moderacao = 'aprovado';
CREATE INDEX idx_contatos_cliente_valida ON contatos_clientes(prestador_id, cliente_whatsapp);
