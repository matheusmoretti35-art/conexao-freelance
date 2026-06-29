# PROTOCOLO DE TESTES DE HOMOLOGAÇÃO & QA
## Projeto: Conexão Freelance (Validação de Campo e Estresse)

---

### 📋 Checklist de Testes de Fumaça (Smoke Tests) - Aplicativo & Web

#### 🔹 1. Módulo de Cadastro do Prestador (Etapa 1)
- [ ] **CT-01.1 (Campos Obrigatórios):** Tentar enviar o formulário com campos vazios. Verificar se as mensagens de erro em vermelho aparecem abaixo dos campos correspondentes.
- [ ] **CT-01.2 (Máscara de WhatsApp):** Digitar números no campo WhatsApp. Verificar se a formatação `(XX) 9XXXX-XXXX` ocorre em tempo real de forma fluida.
- [ ] **CT-01.3 (Validação de UF):** Digitar mais de 2 letras no campo Estado. Verificar se o campo limita estritamente a 2 caracteres maiúsculos.
- [ ] **CT-01.4 (Envio com Sucesso):** Preencher todos os dados válidos e clicar em "Cadastrar". Confirmar se o alerta de sucesso exibe a mensagem de perfil registrado com status "Pendente".

#### 🔹 2. Motor de Cobrança R$ 29,90 & Ativação (Etapa 2)
- [ ] **CT-02.1 (Geração de QRCode PIX):** Após o cadastro, abrir a tela de checkout. Verificar se o valor de R$ 29,90/mês é exibido claramente e a chave PIX Copia e Cola é gerada.
- [ ] **CT-02.2 (Cópia de Chave PIX):** Clicar no botão "Copiar Código PIX". Verificar se o feedback visual muda para "✓ Código PIX Copiado!" e a string é enviada à área de transferência.
- [ ] **CT-02.3 (Simulação de Confirmação em Tempo Real):** Realizar o pagamento simulado. Verificar se o aplicativo detecta a aprovação em menos de 5 segundos via polling e exibe o alerta de perfil "Ativo".

#### 🔹 3. Busca Otimizada e Visibilidade dos Profissionais (Etapas 1 e 2)
- [ ] **CT-03.1 (Trava de Perfil Pendente):** Buscar por Cidade + Estado + Profissão antes de pagar a assinatura. Garantir que o perfil pendente **NÃO** aparece nos resultados.
- [ ] **CT-03.2 (Exibição de Perfil Ativo):** Realizar a busca após a confirmação do pagamento. Garantir que o perfil ativado aparece no topo da lista instantaneamente.

#### 🔹 4. Avaliações, Réplicas e Trava de Contato (Etapa 3)
- [ ] **CT-04.1 (Trava Antispam):** Tentar avaliar um profissional sem ter clicado antes para abrir conversa no WhatsApp. Verificar se o sistema bloqueia exibindo mensagem de aviso.
- [ ] **CT-04.2 (Envio de Avaliação Válida):** Abrir contato com o prestador e enviar uma nota de 1 a 5 estrelas com comentário. Confirmar se a avaliação aparece na lista do perfil.
- [ ] **CT-04.3 (Réplica do Prestador):** Acessar a tela como o próprio prestador e responder à avaliação. Confirmar se a réplica oficial é exibida com a tag "💬 Resposta do Profissional".

#### 🔹 5. Banners Patrocinados e Rastreamento (Etapas 4 e 5)
- [ ] **CT-05.1 (Banner Contextual):** Buscar por uma categoria que possua patrocinador. Verificar se o banner amarelo com o selo "PATROCINADO" é renderizado acima da lista de resultados.
- [ ] **CT-05.2 (Redirecionamento de Anúncio):** Clicar no banner patrocinado e verificar se o link externo é aberto corretamente.
