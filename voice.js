let recognition=null;

function iniciarMicrofone(){
if(!estado.microfone)return;
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SpeechRecognition){
log("Reconhecimento de voz não suportado neste navegador.");
return;
}
if(recognition)return;
recognition=new SpeechRecognition();
recognition.lang="pt-PT";
recognition.continuous=true;
recognition.interimResults=false;
recognition.onresult=e=>{
const texto=e.results[e.results.length-1][0].transcript;
processarComando(texto);
};
recognition.onerror=e=>{log("Erro microfone: "+e.error);};
recognition.onend=()=>{
recognition=null;
if(estado.microfone){setTimeout(iniciarMicrofone,800);}
};
try{
recognition.start();
log("Microfone ativo.");
}catch(e){
log("Microfone bloqueado ou já ativo.");
}
}

function pararMicrofone(){
if(recognition){try{recognition.stop();}catch(e){}}
recognition=null;
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
falar("Estou aqui. Diz destino, velocidade ou liga tudo.");
return;
}
}
