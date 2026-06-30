let recognition=null;
let microfoneAReconhecer=false;
let temporizadorReinicioMicrofone=null;

function microfoneEstaAtivo(){
return microfoneAReconhecer;
}

function iniciarMicrofone(){
if(!estado.microfone||estado.modoEspera)return;
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SpeechRecognition){
log("Reconhecimento de voz não suportado neste navegador.");
return;
}
if(recognition||microfoneAReconhecer)return;

const atual=new SpeechRecognition();
recognition=atual;
atual.lang="pt-PT";
atual.continuous=true;
atual.interimResults=false;

atual.onstart=()=>{
microfoneAReconhecer=true;
log("Microfone ativo.");
};

atual.onresult=e=>{
const texto=e.results[e.results.length-1][0].transcript;
processarComando(texto);
};

atual.onerror=e=>{
if(e.error!=="no-speech"){
log("Erro microfone: "+e.error);
}
};

atual.onend=()=>{
if(recognition===atual)recognition=null;
microfoneAReconhecer=false;
if(estado.microfone&&!estado.modoEspera){
clearTimeout(temporizadorReinicioMicrofone);
temporizadorReinicioMicrofone=setTimeout(iniciarMicrofone,800);
}
};

try{
atual.start();
}catch(e){
if(recognition===atual)recognition=null;
microfoneAReconhecer=false;
log("Microfone bloqueado ou já ativo.");
}
}

function pararMicrofone(){
clearTimeout(temporizadorReinicioMicrofone);
temporizadorReinicioMicrofone=null;
const atual=recognition;
recognition=null;
microfoneAReconhecer=false;
if(atual){
try{atual.onend=null;atual.stop();}catch(e){}
}
log("Microfone parado.");
}

function processarComando(textoOriginal){
const texto=textoOriginal.toLowerCase().trim();
log("Ouvi: "+textoOriginal);

if(texto.includes("liga tudo")||texto.includes("intelcar liga")||texto.includes("intelcar acorda")){
ligarTudo();return;
}
if(texto.includes("desliga tudo")||texto.includes("intelcar dorme")||texto.includes("modo espera")){
desligarTudo();return;
}
if(estado.modoEspera){
log("Em modo espera.");
return;
}
if(texto.startsWith("destino ")){
const destino=texto.replace("destino","").trim();
definirDestino(destino);return;
}
if(texto.includes("abre google maps")||texto.includes("abrir google maps")){
abrirGoogleMaps();return;
}
if(texto.includes("qual é a velocidade")||texto.includes("diz a velocidade")||texto.includes("velocidade atual")){
falarVelocidade();return;
}
if(texto.includes("abre ai")||texto.includes("abrir ai")||texto.includes("abre inteligência")||texto.includes("intelcar ai")){
abrirAIBox();return;
}
if(texto.startsWith("pergunta ")){
responderAI(texto.replace("pergunta","").trim());return;
}
if(texto.includes("desliga gps")){
estado.gps=false;pararGPS();falar("GPS interno desligado.");return;
}
if(texto.includes("liga gps")){
estado.gps=true;iniciarGPS();falar("GPS interno ativo.");return;
}
if(texto.includes("desliga microfone")){
falar("Microfone desligado. Para voltar, toca no botão microfone.");
estado.microfone=false;
setTimeout(pararMicrofone,1000);
return;
}
if(texto.includes("sos")){
ativarSOS();return;
}
if(texto.includes("olá intelcar")||texto.includes("ola intelcar")){
falar("Estou aqui. Diz destino, velocidade, abre AI ou liga tudo.");
return;
}
}
