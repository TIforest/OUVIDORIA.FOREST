# Canal de Ouvidoria — Forest Paper

Site estático (HTML/CSS/JS puro) para registro de reclamações, sugestões,
elogios e denúncias, com envio automático por e-mail via EmailJS.com.

## Estrutura

- `index.html` — formulário e tela de confirmação
- `style.css` — visual (tons verdes, fundo claro)
- `script.js` — validações, geração de protocolo e integração com EmailJS

---

## PASSO A PASSO — EmailJS

### 1. Criar conta
Acesse https://www.emailjs.com/ e crie uma conta (pode ser com o e-mail da empresa).

### 2. Conectar o serviço de e-mail
1. No painel, vá em **Email Services → Add New Service**.
2. Escolha o provedor (Gmail, Outlook, ou "Custom SMTP" se a empresa tiver servidor próprio).
3. Autorize a conta que vai **receber** as manifestações (ex: `ouvidoria@forestpaper.com`).
4. Copie o **Service ID** gerado (algo como `service_xxxxxxx`).

### 3. Criar o template de e-mail
1. Vá em **Email Templates → Create New Template**.
2. Configure o destinatário fixo (To Email) como o e-mail da ouvidoria.
3. No corpo do template, use as mesmas variáveis usadas no formulário
   (os `name="..."` dos campos em `index.html`):

```
Novo registro no Canal de Ouvidoria — Forest Paper

Protocolo: {{protocolo}}
Data/hora: {{data_envio}}
Tipo de manifestação: {{tipo}}
Identificação: {{identificacao}}
Nome: {{nome}}
Contato: {{email}}
Setor relacionado: {{setor}}
Link de evidências: {{evidencias}}

Descrição:
{{mensagem}}
```

4. Copie o **Template ID** gerado (algo como `template_xxxxxxx`).

> **Nota sobre anexos:** o plano gratuito do EmailJS não permite anexar
> arquivos direto no formulário (recurso pago). Por isso o site usa um campo
> de **link** (`{{evidencias}}`) em vez de upload — a pessoa sobe o arquivo
> em um serviço como Google Drive ou WeTransfer e cola o link no formulário.

### 5. Pegar a Public Key
1. Vá em **Account → General**.
2. Copie a **Public Key**.

### 6. Colar as chaves no código
Abra `script.js` e substitua as três primeiras constantes:

```js
const EMAILJS_PUBLIC_KEY = "sua_public_key_aqui";
const EMAILJS_SERVICE_ID = "service_xxxxxxx";
const EMAILJS_TEMPLATE_ID = "template_xxxxxxx";
```

### 7. Restringir domínio (segurança)
Como a Public Key fica visível no código-fonte do site, restrinja de onde ela
pode ser usada:
1. Vá em **Account → Security**.
2. Em **Allowed origins**, adicione a URL final do site (ex:
   `https://seuusuario.github.io`) para que ninguém use sua chave em outro site.

### 8. Testar
Abra o `index.html` localmente (duplo clique ou `Live Server` no VS Code),
preencha o formulário e envie um teste para confirmar que o e-mail chega
com o protocolo e o link de evidências.

---

## PASSO A PASSO — Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público, o formulário não tem
   nenhum dado sensível fixo no código — só as chaves públicas do EmailJS,
   que já ficam restritas por domínio no passo 7 acima).
2. Suba estes 4 arquivos (`index.html`, `style.css`, `script.js`, `README.md`)
   para o repositório.
3. Vá em **Settings → Pages**.
4. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
5. Salve. Em alguns minutos o GitHub mostrará a URL pública, algo como:
   `https://seuusuario.github.io/forest-paper-ouvidoria/`
6. Use essa URL no botão da intranet.

---

## Pendências de conteúdo (ajustar antes de publicar)

- [ ] Confirmar o e-mail oficial da Ouvidoria que vai receber as mensagens
- [ ] Confirmar se o logo da Forest Paper deve substituir o ícone "FP" no topo
- [ ] Validar o texto de aviso de LGPD com o jurídico/RH da empresa
- [ ] Confirmar se o site será público (GitHub Pages) ou hospedado internamente
