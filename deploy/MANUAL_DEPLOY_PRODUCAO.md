# MANUAL EXECUTIVO DE DEPLOY EM PRODUÇÃO
## Projeto: Conexão Freelance (Publicação Oficial)

---

### 🌐 1. INFRAESTRUTURA WEB E API (PRODUÇÃO)

#### 1.1. Passo a Passo para Deploy Público HTTPS no Render / Railway

##### Passo 1: Configuração do Banco de Dados PostgreSQL de Produção
1. Acesse o painel do [Render](https://render.com/) ou [Railway](https://railway.app/).
2. Crie um novo serviço **PostgreSQL Database** chamado `conexao-freelance-db-prod`.
3. Copie a `External Connection String` fornecida pelo painel (Ex: `postgres://user:pass@host:5432/db`).
4. Execute o script de migração DDL unificado diretamente no banco de produção usando o terminal:
   ```bash
   psql "postgres://user:pass@host:5432/db" -f database/migrate_production.sql
   ```

##### Passo 2: Deploy da API Backend Node.js
1. Crie um novo **Web Service** no Render/Railway conectado ao repositório GitHub do projeto.
2. Defina o diretório raiz como `/backend`.
3. Configure o comando de Build: `npm ci && npm run build`
4. Configure o comando de Inicialização: `npm start`
5. Adicione as Variáveis de Ambiente (*Environment Variables*):
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `DATABASE_URL`: `[String de conexão copiada do Passo 1]`
   - `WEBHOOK_SECRET`: `[Sua chave secreta HMAC de produção]`
   - `META_PIXEL_ID`: `[ID do Pixel do Meta Ads]`
   - `META_ACCESS_TOKEN`: `[Token de Acesso da API de Conversões]`
6. Clique em **Deploy**. O servidor gerará automaticamente uma URL pública HTTPS segura (Ex: `https://conexao-freelance-api.onrender.com`).

##### Passo 3: Deploy da Aplicação Web (Frontend)
1. Crie um novo **Static Site** ou use o `Dockerfile` do diretório `/web`.
2. Configure as variáveis de ambiente apontando a URL da API criada no Passo 2.
3. Vincule seu domínio personalizado (Ex: `conexaofreelance.com.br`).

---

### 🤖 2. COMPILAÇÃO DO APP ANDROID (GOOGLE PLAY STORE)

#### Passo 1: Gerar a Chave de Assinatura Digital (Keystore)
No terminal da sua máquina, execute o comando Keytool para criar o certificado digital de publicação:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore conexao-freelance-release.keystore -alias conexao-freelance-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### Passo 2: Configurar o arquivo `android/key.properties`
Crie o arquivo `android/key.properties` (baseado no exemplo `key.properties.example`) e adicione as senhas definidas no passo anterior:
```properties
storePassword=SuaSenhaDaKeystoreAqui123
keyPassword=SuaSenhaDaChaveAqui123
keyAlias=conexao-freelance-key-alias
storeFile=../conexao-freelance-release.keystore
```

#### Passo 3: Comandos de Compilação do App Bundle (`.aab`)
Execute no terminal para compilar e assinar o pacote oficial:
```bash
cd mobile/android
./gradlew clean
./gradlew bundleRelease
```
*O pacote oficial assinado `.aab` estará em: `mobile/android/app/build/outputs/bundle/release/app-release.aab`*

---

### 🍎 3. COMPILAÇÃO DO APP iOS (APPLE APP STORE)

#### Passo 1: Configuração no Xcode
1. Abra a pasta `mobile/ios` no Xcode em um computador Mac.
2. Selecione o projeto principal no painel esquerdo.
3. Na aba **Signing & Capabilities**, marque a opção *Automatically manage signing*.
4. Selecione o seu time de desenvolvimento oficial (*Team Apple Developer*).
5. Defina o *Bundle Identifier*: `br.com.conexaofreelance.app`.

#### Passo 2: Geração da Build (`.ipa`) via Expo EAS CLI (Fluxo Recomendado)
Execute no terminal para compilar na nuvem com gerenciamento automático de certificados Apple:
```bash
# 1. Login na CLI do EAS
eas login

# 2. Dispara compilação e assinatura automática de produção
eas build --platform ios --profile production
```
*O arquivo `.ipa` assinado será gerado e poderá ser enviado diretamente ao TestFlight e App Store Connect com o comando `eas submit --platform ios`.*

---

### ⚙️ 4. AUTOMAÇÃO DE PRODUÇÃO (SCRIPTS & CI/CD)

- **Script Bash de Deploy Local:** Execute `./deploy.sh` no terminal Linux/macOS para rodar testes, compilar TypeScript e executar migrações em lote.
- **Workflow de Produção GitHub Actions:** O arquivo `.github/workflows/deploy-production.yml` dispara automaticamente a cada push na branch `main` ou `production`, garantindo que apenas códigos testados entrem no ar.
