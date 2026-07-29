/* =========================================================
   CONFIGURAÇÃO DO EMAILJS
   Preencha com os valores da sua conta em emailjs.com
   (passo a passo no README.md)
========================================================= */
const EMAILJS_PUBLIC_KEY = "S4HpxTtBbxx_V0TVB";
const EMAILJS_SERVICE_ID = "service_6w1jzfm";
const EMAILJS_TEMPLATE_ID = "template_tfckpnd";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const form = document.getElementById("ouvidoria-form");
const identificacaoRadios = document.querySelectorAll('input[name="identificacao"]');
const dadosIdentificacao = document.getElementById("dados-identificacao");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");
const confirmacao = document.getElementById("confirmacao");
const protocoloNumero = document.getElementById("protocolo-numero");
const protocoloHidden = document.getElementById("protocolo");
const dataEnvioHidden = document.getElementById("data_envio");
const novaManifestacaoBtn = document.getElementById("nova-manifestacao");

/* ---------- alterna campos de identificação ---------- */
identificacaoRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const anonimo = radio.value === "Anônimo" && radio.checked;
    if (anonimo) {
      dadosIdentificacao.style.display = "none";
      nomeInput.value = "";
      emailInput.value = "";
    } else {
      dadosIdentificacao.style.display = "block";
    }
  });
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

  const protocolo = gerarProtocolo();
  protocoloHidden.value = protocolo;
  dataEnvioHidden.value = new Date().toLocaleString("pt-BR");

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

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
  confirmacao.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
