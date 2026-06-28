let recognition = null;
let microfoneLigado = false;
let reiniciarMicrofone = false;
function iniciarMicrofone() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    falar("Este navegador não suporta reconhecimento de voz.");
    return;
  }

  if (microfoneLigado) {
    falar("Microfone já está ativo.");
    return;
  }estado.microfone = true;
  microfoneLigado = true;
  reiniciarMicrofone = true;

  criarReconhecimento();
}function criarReconhecimento() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "pt-PT";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
recognition.onstart = function () {
    log("Microfone ativo. Estou a ouvir.");
  };

  recognition.onresult = function (event) {
    const ultimo = event.results[event.results.length - 1];
    const texto = ultimo[0].transcript.trim();
    processarComando(texto);
  };recognition.onerror = function (event) {
    log("Erro no microfone: " + event.error);

    if (event.error === "not-allowed") {
      microfoneLigado = false;
      reiniciarMicrofone = false;
      falar("Permissão do microfone recusada.");
    }
  };

  recognition.onend = function () {
    recognition = null;

    if (reiniciarMicrofone && estado.microfone) {
      setTimeout(function () {
        try {
          criarReconhecimento();
        } catch (e) {
          log("Falha ao reiniciar microfone.");
        }
      }, 900);
    }
  };

  try {
    recognition.start();
  } catch (e) {
    log("Microfone já estava a iniciar.");
  }
}function pararMicrofone() {
  reiniciarMicrofone = false;
  microfoneLigado = false;
  estado.microfone = false;

  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }

  recognition = null;
  log("Microfone desligado.");
}
