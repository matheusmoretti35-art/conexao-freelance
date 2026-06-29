-- ==============================================================================
-- PROJETO: Conexão Freelance
-- ARQUIVO: database/etapa2.sql
-- DESCRIÇÃO: Tabela de Assinaturas, Transações e Triggers de Automação (Etapa 2)
-- ==============================================================================

-- 1. Enumerações para controle de métodos de pagamento e status da assinatura
CREATE TYPE status_assinatura_enum AS ENUM ('aguardando_pagamento', 'pago', 'recusado', 'cancelado', 'expirado');
CREATE TYPE metodo_pagamento_enum AS ENUM ('pix', 'cartao_credito');

-- 2. Tabela de Assinaturas Recorrentes dos Prestadores (R$ 29,90/mês)
CREATE TABLE assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    gateway_subscription_id VARCHAR(100) UNIQUE,
    valor DECIMAL(10,2) NOT NULL DEFAULT 29.90,
    metodo_pagamento metodo_pagamento_enum NOT NULL,
    status status_assinatura_enum NOT NULL DEFAULT 'aguardando_pagamento',
    data_proxima_cobranca TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Histórico de Faturas / Transações
CREATE TABLE transacoes (
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

-- 4. ÍNDICES DE DESEMPENHO PARA COBRANÇA
CREATE INDEX idx_assinaturas_prestador ON assinaturas(prestador_id);
CREATE INDEX idx_transacoes_gateway_id ON transacoes(gateway_transaction_id);

-- 5. TRIGGER DE AUTOMAÇÃO DE STATUS DO PRESTADOR
-- Esta função altera o status do prestador no banco para 'ativo' imediatamente quando o pagamento é aprovado
CREATE OR REPLACE FUNCTION sincronizar_status_prestador()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pago' THEN
        UPDATE prestadores 
        SET status = 'ativo'
        WHERE id = NEW.prestador_id;
    ELSIF NEW.status IN ('expirado', 'cancelado') THEN
        UPDATE prestadores 
        SET status = 'inativo'
        WHERE id = NEW.prestador_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sincronizar_status_prestador
AFTER INSERT OR UPDATE OF status ON transacoes
FOR EACH ROW EXECUTE PROCEDURE sincronizar_status_prestador();
