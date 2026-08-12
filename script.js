/* =========================================================
   CONFIGURAÇÃO DO EMAILJS
   Preencha com os valores da sua conta em emailjs.com
   (passo a passo no README.md)
========================================================= */
const EMAILJS_PUBLIC_KEY = "S4HpxTtBbxx_V0TVB";
const EMAILJS_SERVICE_ID = "service_6w1jzfm";
const EMAILJS_TEMPLATE_ID = "template_tfckpnd";

/* URL do Google Apps Script (Web App) que registra cada envio na planilha.
   Passo a passo de como criar em README.md */
const SHEETS_WEBHOOK_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const form = document.getElementById("ouvidoria-form");
const identificacaoRadios = document.querySelectorAll('input[name="identificacao"]');
const dadosIdentificacao = document.getElementById("dados-identificacao");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const contatoRetornoBlock = document.getElementById("contato-retorno-anonimo");
const contatoRetornoInput = document.getElementById("contato_retorno");
const semContatoCheckbox = document.getElementById("sem_contato");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");
const confirmacao = document.getElementById("confirmacao");
const protocoloNumero = document.getElementById("protocolo-numero");
const protocoloHidden = document.getElementById("protocolo");
const dataEnvioHidden = document.getElementById("data_envio");
const idNavegadorHidden = document.getElementById("id_navegador");
const novaManifestacaoBtn = document.getElementById("nova-manifestacao");

/* ---------- identificador anônimo do navegador ---------- */
/* Mesmo dispositivo/navegador mantém o mesmo código entre envios,
   permitindo notar padrões de abuso sem identificar a pessoa. */
function getOrCreateVisitorId() {
  const STORAGE_KEY = "fp_ouvidoria_visitor_id";
  let visitorId = localStorage.getItem(STORAGE_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, visitorId);
  }
  return visitorId;
}

/* ---------- registra o envio na planilha (para detecção de padrões) ---------- */
async function registrarNaPlanilha(dados) {
  if (!SHEETS_WEBHOOK_URL || SHEETS_WEBHOOK_URL.includes("COLE_AQUI")) return;
  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados),
    });
  } catch (err) {
    console.error("Erro ao registrar na planilha:", err);
  }
}

/* ---------- alterna campos de identificação ---------- */
identificacaoRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const anonimo = radio.value === "Anônimo" && radio.checked;
    if (anonimo) {
      dadosIdentificacao.style.display = "none";
      nomeInput.value = "";
      emailInput.value = "";
      contatoRetornoBlock.hidden = false;
    } else {
      dadosIdentificacao.style.display = "block";
      contatoRetornoBlock.hidden = true;
      contatoRetornoInput.value = "";
      contatoRetornoInput.disabled = false;
      semContatoCheckbox.checked = false;
    }
  });
});

/* ---------- contato de retorno (só aparece no fluxo anônimo) ---------- */
/* as duas opções são mutuamente exclusivas: ou a pessoa deixa um contato,
   ou marca que não quer deixar — nunca os dois ao mesmo tempo. */
semContatoCheckbox.addEventListener("change", () => {
  if (semContatoCheckbox.checked) {
    contatoRetornoInput.value = "";
    contatoRetornoInput.disabled = true;
  } else {
    contatoRetornoInput.disabled = false;
  }
});

contatoRetornoInput.addEventListener("input", () => {
  if (contatoRetornoInput.value.trim() !== "") {
    semContatoCheckbox.checked = false;
  }
});

/* ---------- gera número de protocolo ---------- */
function gerarProtocolo() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FP-${yyyy}${mm}${dd}-${rand}`;
}

/* ---------- envio do formulário ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const anonimoSelecionado =
    document.querySelector('input[name="identificacao"]:checked').value === "Anônimo";
  if (
    anonimoSelecionado &&
    contatoRetornoInput.value.trim() === "" &&
    !semContatoCheckbox.checked
  ) {
    formStatus.textContent =
      "Deixe um contato para retorno ou marque que não deseja deixar contato.";
    formStatus.classList.add("error");
    contatoRetornoInput.focus();
    return;
  }

  const protocolo = gerarProtocolo();
  protocoloHidden.value = protocolo;
  dataEnvioHidden.value = new Date().toLocaleString("pt-BR");
  idNavegadorHidden.value = getOrCreateVisitorId();

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const [emailResult] = await Promise.allSettled([
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form),
      registrarNaPlanilha({
        protocolo,
        data_envio: dataEnvioHidden.value,
        tipo: document.getElementById("tipo").value,
        identificacao: document.querySelector('input[name="identificacao"]:checked').value,
        setor: document.getElementById("setor").value,
        id_navegador: idNavegadorHidden.value,
      }),
    ]);

    if (emailResult.status === "rejected") {
      throw emailResult.reason;
    }

    form.hidden = true;
    protocoloNumero.textContent = protocolo;
    confirmacao.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Erro ao enviar manifestação:", err);
    formStatus.textContent =
      "Não foi possível enviar sua manifestação agora. Tente novamente em instantes.";
    formStatus.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar manifestação";
  }
});

/* ---------- nova manifestação ---------- */
novaManifestacaoBtn.addEventListener("click", () => {
  form.reset();
  dadosIdentificacao.style.display = "block";
  contatoRetornoBlock.hidden = true;
  contatoRetornoInput.disabled = false;
  confirmacao.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
