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
}
