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

function normalizarComandoVoz(texto){
return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
}

function numeroFaladoParaInteiro(trecho){
const numeroEmAlgarismos=trecho.match(/\b(\d{1,3})\b/);
if(numeroEmAlgarismos)return Number(numeroEmAlgarismos[1]);

const unidades={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9};
const especiais={dez:10,onze:11,doze:12,treze:13,catorze:14,quatorze:14,quinze:15,dezasseis:16,dezassete:17,dezoito:18,dezanove:19};
const dezenas={vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90};
const centenas={cem:100,cento:100,duzentos:200};
const palavras=trecho.split(" ");
let total=0;
let encontrou=false;

for(const palavra of palavras){
if(palavra==="e")continue;
if(Object.prototype.hasOwnProperty.call(centenas,palavra)){
total+=centenas[palavra];encontrou=true;continue;
}
if(Object.prototype.hasOwnProperty.call(dezenas,palavra)){
total+=dezenas[palavra];encontrou=true;continue;
}
if(Object.prototype.hasOwnProperty.call(especiais,palavra)){
total+=especiais[palavra];encontrou=true;continue;
}
if(Object.prototype.hasOwnProperty.call(unidades,palavra)){
total+=unidades[palavra];encontrou=true;
}
}
return encontrou?total:null;
}

function extrairNovoLimite(textoNormalizado){
let trecho=textoNormalizado;
const posicaoLimite=trecho.lastIndexOf("limite");
if(posicaoLimite>=0){
const depois=trecho.slice(posicaoLimite+"limite".length).trim();
if(depois)trecho=depois;
}
trecho=trecho.replace(/^de velocidade\s*/,"").replace(/^(para|em|a)\s*/,"");
let valor=numeroFaladoParaInteiro(trecho);
if(valor===null)valor=numeroFaladoParaInteiro(textoNormalizado);
return valor;
}

function processarComando(textoOriginal){
const texto=textoOriginal.toLowerCase().trim();
const comando=normalizarComandoVoz(textoOriginal);
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
if(comando.includes("limite")&&(comando.includes("qual")||comando.includes("diz me")||comando.includes("diz o")||comando.includes("quanto"))){
falarLimiteVelocidade();return;
}
if(comando.includes("limite")&&(comando.startsWith("limite ")||comando.includes("define")||comando.includes("definir")||comando.includes("muda")||comando.includes("alterar")||comando.includes("altera")||comando.includes("coloca")||comando.includes("poe")||comando.includes("ajusta")||comando.includes("fixa"))){
const novoLimite=extrairNovoLimite(comando);
if(novoLimite===null){
falar("Não percebi o valor. Diz, por exemplo, limite 80.");
}else{
definirLimiteVelocidade(novoLimite);
}
return;
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
falar("Estou aqui. Diz destino, velocidade, limite 80, abre AI ou liga tudo.");
return;
}
}
