-- ==============================================================================
-- PROJETO: Conexão Freelance
-- ARQUIVO: database/migrate_production.sql
-- DESCRIÇÃO: Script Unificado de Migração DDL para o Banco de Dados de Produção
-- ==============================================================================

BEGIN;

-- 1. Habilita extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerações Globais
CREATE TYPE status_prestador_enum AS ENUM ('pendente', 'ativo', 'inativo', 'suspenso');
CREATE TYPE status_assinatura_enum AS ENUM ('aguardando_pagamento', 'pago', 'recusado', 'cancelado', 'expirado');
CREATE TYPE metodo_pagamento_enum AS ENUM ('pix', 'cartao_credito');
CREATE TYPE status_moderacao_enum AS ENUM ('aprovado', 'pendente_moderacao', 'rejeitado');

-- 3. Tabela Principal de Prestadores
CREATE TABLE IF NOT EXISTS prestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    profissao VARCHAR(100) NOT NULL,
    descricao_servico TEXT,
    foto_perfil_url TEXT,
    status status_prestador_enum NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabelas de Assinaturas e Cobrança
CREATE TABLE IF NOT EXISTS assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    gateway_subscription_id VARCHAR(100) UNIQUE,
    valor DECIMAL(10,2) NOT NULL DEFAULT 29.90,
    metodo_pagamento metodo_pagamento_enum NOT NULL,
    status status_assinatura_enum NOT NULL DEFAULT 'aguardando_pagamento',
    data_proxima_cobranca TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assinatura_id UUID NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    gateway_transaction_id VARCHAR(100) UNIQUE NOT NULL,
    valor DECIMAL(10,2) NOT NULL DEFAULT 29.90,
    metodo_pagamento metodo_pagamento_enum NOT NULL,
    status status_assinatura_enum NOT NULL,
    pix_copia_cola TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabelas de Avaliações, Réplicas e Contatos
CREATE TABLE IF NOT EXISTS contatos_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    cliente_nome VARCHAR(100) NOT NULL,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    status_moderacao status_moderacao_enum NOT NULL DEFAULT 'aprovado',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS replicas_prestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID UNIQUE NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    resposta TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabelas de Anúncios Patrocinados e Analytics
CREATE TABLE IF NOT EXISTS anuncios_patrocinados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    imagem_banner_url TEXT NOT NULL,
    link_destino TEXT NOT NULL,
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    profissao VARCHAR(100) NOT NULL,
    peso_prioridade INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metricas_anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios_patrocinados(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prestadores_busca_ativa ON prestadores (cidade, estado, profissao) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS idx_assinaturas_prestador ON assinaturas(prestador_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_gateway_id ON transacoes(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_prestador ON avaliacoes(prestador_id) WHERE status_moderacao = 'aprovado';
CREATE INDEX IF NOT EXISTS idx_anuncios_alvo ON anuncios_patrocinados (estado, cidade, profissao) WHERE ativo = true;

-- 8. TRIGGER DE AUTOMAÇÃO DE STATUS DO PRESTADOR
CREATE OR REPLACE FUNCTION sincronizar_status_prestador()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pago' THEN
        UPDATE prestadores SET status = 'ativo', atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.prestador_id;
    ELSIF NEW.status IN ('expirado', 'cancelado') THEN
        UPDATE prestadores SET status = 'inativo', atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.prestador_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sincronizar_status_prestador ON transacoes;
CREATE TRIGGER trigger_sincronizar_status_prestador
AFTER INSERT OR UPDATE OF status ON transacoes
FOR EACH ROW EXECUTE PROCEDURE sincronizar_status_prestador();

COMMIT;
