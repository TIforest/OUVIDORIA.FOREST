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
Contato para retorno (anônimo): {{contato_retorno}}
Setor relacionado: {{setor}}
Link de evidências: {{evidencias}}

Descrição:
{{mensagem}}

---
ID anônimo do navegador: {{id_navegador}}
```

> **Campo `contato_retorno`:** só aparece quando a pessoa escolhe "Anônimo".
> É um meio de contato opcional (e-mail, telefone etc.) para que a equipe
> possa dar retorno sobre a apuração sem exigir identificação. Se a pessoa
> marcar "prefiro não deixar contato", esse campo chega vazio no e-mail —
> isso é esperado.
>
> **Se você já tem um template criado no EmailJS**, abra
> **Email Templates → seu template → Content** e adicione a linha
> `Contato para retorno (anônimo): {{contato_retorno}}` no corpo, senão o
> campo é ignorado e a equipe não vê o contato deixado pela pessoa.

> **Sobre o ID do navegador:** é registrado apenas para identificar padrões
> de abuso do canal (ex: várias manifestações do mesmo dispositivo), nunca
> para identificar quem enviou. É um código salvo no `localStorage` do
> navegador — se a pessoa limpar o cache ou usar outro dispositivo, o código
> muda.

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

## PASSO A PASSO — Planilha de controle (Google Sheets)

Registra `protocolo`, `data/hora`, `tipo`, `identificação`, `setor` e
`ID do navegador` de cada envio numa planilha — não registra o texto da
reclamação (isso fica só no e-mail). Serve para o time da ouvidoria cruzar
rapidamente se várias manifestações vieram do mesmo dispositivo.

### 1. Criar a planilha
1. Crie uma planilha nova em https://sheets.google.com
2. Na primeira linha, adicione as colunas:
   ```
   Data/Hora | Protocolo | Tipo | Identificação | Setor | ID do navegador
   ```

### 2. Criar o Apps Script
1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o conteúdo padrão e cole:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dados = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    dados.protocolo,
    dados.tipo,
    dados.identificacao,
    dados.setor,
    dados.id_navegador,
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Clique em **Salvar** (ícone de disquete).

### 3. Publicar como Web App
1. Clique em **Implantar → Nova implantação**.
2. Em "Selecionar tipo", escolha **App da Web**.
3. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar** e autorize as permissões pedidas.
5. Copie a **URL do app da Web** gerada.

> A URL fica "escondida" (é uma sequência longa e aleatória), mas tecnicamente
> qualquer pessoa que a descobrisse poderia mandar dados pra planilha. Não é
> um risco alto pra esse uso, mas evite divulgar essa URL publicamente.

### 4. Colar a URL no código
Abra `script.js` e substitua:

```js
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/SEU_ID_AQUI/exec";
```

### 5. Testar
Envie uma manifestação de teste pelo site e confira se uma nova linha
apareceu na planilha.

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
