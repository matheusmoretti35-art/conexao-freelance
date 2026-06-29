# GUIA DE RELEASE E HOMOLOGAÇÃO FINAL DE PRODUÇÃO
## Projeto: Conexão Freelance (Lançamento Oficial)

---

### 📱 1. BUILD DE PRODUÇÃO - MOBILE (Android & iOS)

Assumindo a arquitetura híbrida construída em React Native / Expo, apresentamos os procedimentos exatos de empacotamento.

#### 🤖 1.1. Android: Geração do arquivo `.aab` (Android App Bundle)

O formato `.aab` é o padrão obrigatório da Google Play Store que otimiza o tamanho do aplicativo instalado no celular do cliente.

##### Passo 1: Geração da Keystore de Assinatura (Terminal)
Execute o comando abaixo no terminal para gerar a chave criptográfica de publicação (guarde este arquivo e a senha em local seguro):
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore conexao-freelance-release.keystore -alias conexao-freelance-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

##### Passo 2: Configuração de Variáveis (`android/gradle.properties`)
Adicione as credenciais da Keystore no arquivo de propriedades do Android:
```properties
CONEXAO_FREELANCE_RELEASE_STORE_FILE=conexao-freelance-release.keystore
CONEXAO_FREELANCE_RELEASE_KEY_ALIAS=conexao-freelance-key-alias
CONEXAO_FREELANCE_RELEASE_STORE_PASSWORD=SuaSenhaSeguraAqui123
CONEXAO_FREELANCE_RELEASE_KEY_PASSWORD=SuaSenhaSeguraAqui123
```

##### Passo 3: Comando de Compilação do Bundle (`.aab`)
Navegue até a pasta do projeto mobile e execute o comando Gradle:
```bash
cd mobile/android
./gradlew bundleRelease
```
*O arquivo `.aab` gerado estará disponível em: `mobile/android/app/build/outputs/bundle/release/app-release.aab`*

*(Opção Nuvem com Expo EAS)*:
```bash
eas build --platform android --profile production
```

---

#### 🍎 1.2. iOS: Geração do arquivo `.ipa` para Apple App Store

O empacotamento iOS exige integração com o Apple Developer Program.

##### Requisitos de Ambiente:
1. Conta de Desenvolvedor Apple Ativa (*Apple Developer Program*).
2. Certificado de Distribuição (*Apple Distribution Certificate*) instalado nas Chaves do Mac (Keychain).
3. Identificador do App (*App ID / Bundle Identifier*: `br.com.conexaofreelance.app`).
4. Perfil de Provisionamento (*App Store Provisioning Profile*).

##### Fluxo via Expo EAS CLI (Recomendado & Automatizado):
```bash
# 1. Instalar CLI do EAS globalmente
npm install -g eas-cli

# 2. Login na conta Expo
eas login

# 3. Disparar Build de Produção iOS na Nuvem (Gera o .ipa e assina automaticamente)
eas build --platform ios --profile production
```
*Ao finalizar, o arquivo `.ipa` é enviado automaticamente para o TestFlight e App Store Connect.*

---

### 🌐 2. BUILD DE PRODUÇÃO - WEB & DOMÍNIO DEFINITIVO

#### 2.1. Comando de Compilação Web Minificada
Navegue até a pasta da aplicação Web e execute o comando de build otimizado:
```bash
cd web
npm run build
```
*Este comando executa a minificação de scripts, otimização de imagens, treeshaking e geração dos arquivos estáticos de altíssima performance para SEO na pasta `dist/` ou `build/`.*

#### 2.2. Apontamento do Domínio Definitivo (DNS)
Para apontar o domínio comprado pelo cliente (ex: `conexaofreelance.com.br`) para o servidor de hospedagem de produção (Ex: Vercel / Cloudflare Pages / Railway), configure as entradas na tabela DNS do registro de domínio (Registro.br):

| Tipo | Nome / Host | Valor / Destino | Finalidade |
| :--- | :--- | :--- | :--- |
| **A** | `@` (raiz) | `76.76.21.21` (ou IP da hospedagem) | Aponta o site principal |
| **CNAME** | `www` | `cname.vercel-dns.com` (ou URL do servidor) | Redireciona www para o domínio principal |
| **CNAME** | `api` | `backend-production.up.railway.app` | Subdomínio exclusivo da API Backend |

---

### 📝 3. CHECKLIST PRÉ-LANÇAMENTO (Ficha das Lojas)

Envie esta lista de materiais para o cliente providenciar para a publicação nas lojas:

#### 📷 Capturas de Tela (Screenshots):
- **Android:** Pelo menos 4 imagens por tamanho de tela (Telefone e Tablet) no formato PNG ou JPEG (1080x1920 px).
- **iOS:** Capturas de tela sem transparência para iPhone de 6.7" (1290x2796 px) e iPhone de 5.5" (1242x2208 px).

#### 📄 Textos Descritivos:
- **Nome do App:** Conexão Freelance (Até 30 caracteres).
- **Descrição Curta:** O guia completo para encontrar eletricistas, pintores, pedreiros e profissionais autônomos na sua região. (Até 80 caracteres).
- **Descrição Longa:** Texto completo destacando as facilidades de busca por categoria, perfis verificados e contato direto via WhatsApp sem intermediários.
- **Palavras-chave (iOS):** `freelance, servicos, eletricista, pintor, pedreiro, autonomo, reformas, manutencao` (Até 100 caracteres separados por vírgula).

#### 🔒 Links Jurídicos e Suporte:
- **URL de Política de Privacidade:** `https://conexaofreelance.com.br/privacidade`
- **URL de Suporte / Contato:** `https://conexaofreelance.com.br/suporte`
- **E-mail de Contato Comercial:** `contato@conexaofreelance.com.br`

---

### 🎉 4. MENSAGEM DE PARABENIZAÇÃO E ENTREGA FINAL (Para o Cliente)

> 💬 **Modelo de Mensagem Formal e Comemorativa:**
>
> ---
>
> **Assunto: 🚀 Projeto Conexão Freelance Concluído com Sucesso! Seu Aplicativo está Pronto para o Mundo!**
>
> Prezado(a) [Nome do Cliente],
>
> É com enorme orgulho e satisfação profissional que anunciamos a **conclusão bem-sucedida de todas as etapas de desenvolvimento, integração e testes do projeto Conexão Freelance**!
>
> O ecossistema técnico completo da plataforma — abrangendo o **Aplicativo Mobile (Android e iOS)**, a **Plataforma Web**, os **Servidores de API** e o **Banco de Dados de Alta Performance** — foi compilado na sua versão final de produção e aprovado com nota máxima em todos os testes de estresse e segurança.
>
> 🏆 **Destaques da Plataforma Entregue:**
> 1. **Tecnologia de Busca em Milissegundos**: Seus clientes encontrarão profissionais por cidade e profissão com velocidade instantânea de navegação.
> 2. **Automação Financeira 100% Blindada**: O motor de assinatura recorrente de R$ 29,90/mês via PIX está integrado e validado com criptografia bancária. Pagou, o perfil é ativado na hora sem nenhuma necessidade de trabalho manual da sua equipe!
> 3. **Sistema de Reputação e Réplica**: Plataforma justa com avaliações auditadas e canal de resposta oficial para os prestadores de serviço.
> 4. **Pronto para Escalar**: Infraestrutura moderníssima com rastreamento Server-Side preparado para receber suas primeiras campanhas de marketing no Facebook, Instagram e Google Ads com o menor custo por aquisição do mercado.
>
> Os aplicativos já foram empacotados e estão prontos para submissão na Google Play Store e Apple App Store!
>
> Parabéns pela visão empreendedora do projeto. Estamos à disposição para acompanhar o lançamento oficial e celebrar o sucesso do **Conexão Freelance** no mercado!
>
> Atenciosamente,  
> **Equipe de Engenharia de Software & Release Management**
