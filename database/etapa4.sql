-- ==============================================================================
-- PROJETO: Conexão Freelance
-- ARQUIVO: database/etapa4.sql
-- DESCRIÇÃO: Tabela de Anúncios Patrocinados e Métricas de Impressão (Etapa 4)
-- ==============================================================================

-- 1. Tabela de Banners e Destaques Patrocinados
CREATE TABLE anuncios_patrocinados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    imagem_banner_url TEXT NOT NULL,
    link_destino TEXT NOT NULL,
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    profissao VARCHAR(100) NOT NULL, -- Segmentação por categoria profissional
    peso_prioridade INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Métricas de Analytics de Publicidade (Impressões e Cliques)
CREATE TABLE metricas_anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios_patrocinados(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(20) NOT NULL, -- 'impressao' ou 'clique'
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ÍNDICE PARCIAL PARA ADSERVER HIPER-LOCALIZADO
CREATE INDEX idx_anuncios_alvo ON anuncios_patrocinados (estado, cidade, profissao) WHERE ativo = true;
