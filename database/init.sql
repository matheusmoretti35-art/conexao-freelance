-- ==============================================================================
-- PROJETO: Conexão Freelance
-- ARQUIVO: init.sql
-- DESCRIÇÃO: Script DDL de inicialização do banco de dados PostgreSQL (Etapa 1)
-- ==============================================================================

-- 1. Habilita a extensão para geração automática de UUID v4 (randômico e seguro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criação do tipo enumerado para controle estrito dos estados do prestador
CREATE TYPE status_prestador_enum AS ENUM ('pendente', 'ativo', 'inativo');

-- 3. Criação da tabela de prestadores de serviços
CREATE TABLE prestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL UNIQUE, -- Telefone formatado (Ex: (11) 99999-9999)
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL, -- UF com exatamente 2 caracteres (Ex: SP, RJ)
    profissao VARCHAR(100) NOT NULL, -- Categoria profissional (Ex: Eletricista, Pintor)
    status status_prestador_enum NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Adição de restrição de validação para garantir que o estado esteja em maiúsculo
ALTER TABLE prestadores ADD CONSTRAINT chk_estado_uppercase CHECK (estado = UPPER(estado));

-- 5. CRIAÇÃO DO ÍNDICE COMPOSTO PARCIAL (OTIMIZAÇÃO DE BUSCA SUB-MILISSEGUNDO)
-- Este índice otimiza a query da busca filtrada (cidade, estado, profissao)
-- e inclui APENAS os prestadores com status 'ativo', economizando RAM e I/O de disco.
CREATE INDEX idx_prestadores_busca_ativa 
ON prestadores (cidade, estado, profissao) 
WHERE status = 'ativo';

-- COMENTÁRIOS DE TABELA E COLUNAS PARA DOCUMENTAÇÃO NO BANCO DE DADOS
COMMENT ON TABLE prestadores IS 'Tabela principal com dados dos prestadores de serviços autônomos';
COMMENT ON COLUMN prestadores.id IS 'Identificador único global (UUID v4)';
COMMENT ON COLUMN prestadores.status IS 'Status da conta: pendente (aguardando ativação na Etapa 2), ativo ou inativo';
COMMENT ON COLUMN prestadores.criado_em IS 'Data e hora do cadastro do perfil';
