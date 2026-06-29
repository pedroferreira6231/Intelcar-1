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
function processarComando(textoOriginal) {
  const texto = textoOriginal.toLowerCase().trim();
  log("Ouvi: " + textoOriginal);

  if (
  texto.includes("desliga tudo") ||
  texto.includes("desligar tudo") ||
  texto.includes("intelcar desliga") ||
  texto.includes("intelcar dorme") ||
  texto.includes("modo espera")
) {
  desligarTudo();
  return;
}

if (
  texto.includes("liga tudo") ||
  texto.includes("intelcar liga") ||
  texto.includes("intelcar acorda")
) {
  ligarTudo();
  return;
}if (estado.modoEspera) {
    log("Intelcar em modo de espera.");
    return;
  }

  if (texto.startsWith("destino ")) {
    const destino = texto.replace("destino", "").trim();

    if (destino.length > 0) {
      definirDestino(destino);
    } else {
      falar("Diz o destino. Por exemplo: destino Fátima.");
    }

    return;
  }if (
    texto.includes("abrir google maps") ||
    texto.includes("abre google maps") ||
    texto.includes("iniciar navegação")
  ) {
    abrirGoogleMaps();
    return;
  }

  if (
    texto.includes("qual é a velocidade") ||
    texto.includes("diz a velocidade") ||
    texto.includes("velocidade atual")
  ) {
    falarVelocidade();
    return;
  }if (texto.includes("desliga gps")) {
    estado.gps = false;
    pararGPS();
    falar("GPS interno desligado.");
    return;
  }

  if (texto.includes("liga gps")) {
    estado.gps = true;
    iniciarGPS();
    falar("GPS interno ativo.");
    return;
  }

  if (texto.includes("desliga alerta velocidade")) {
    estado.alertaVelocidade = false;
    falar("Alerta de velocidade desligado.");
    return;
  }

  if (texto.includes("liga alerta velocidade")) {
    estado.alertaVelocidade = true;
    falar("Alerta de velocidade ativo.");
    return;
  }

  if (texto.includes("sos")) {
    ativarSOS();
    return;
  }
  if (
    texto.includes("olá intelcar") ||
    texto.includes("ola intelcar") ||
    texto.includes("olá intercar") ||
    texto.includes("ola intercar")
  ) {
    falar("Estou aqui. Diz destino, velocidade ou desliga tudo.");
    return;
  }  if (texto.includes("qual é o destino")) {
    const destino = estado.destino || localStorage.getItem("destinoIntelcar");
    if (destino) {
      falar("O destino atual é " + destino + ".");
    } else {
      falar("Ainda não definiste nenhum destino.");
    }
    return;
  }

  if (texto.includes("que alertas estão ativos")) {
    falar("Estão ativos os alertas de velocidade, distração, cansaço, meteorologia e condução perigosa.");
    return;
  }

  if (texto.includes("estás aí") || texto.includes("estás pronta")) {
    falar("Sim. Intelcar ativa e pronta para ajudar na viagem.");
    return;
  }

  log("Comando não reconhecido: " + textoOriginal);
}

