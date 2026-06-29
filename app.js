const estado={
tudoLigado:true,
modoEspera:false,
microfone:true,
gps:true,
ai:true,
aiPlus:false,
alertaVelocidade:true,
alertaDistracao:true,
alertaCansaco:true,
alertaMeteo:true,
alertaConducao:true,
mapsFala:false,
velocidadeAtual:0,
destino:localStorage.getItem("destinoIntelcar")||""
};

window.addEventListener("load",()=>{
log("Intelcar pronta. Sistemas ativos.");
atualizarEstadoVisual();
atualizarLedsBotoes();
iniciarGPS();
// Na versão web, o microfone pode exigir toque do utilizador.
});

function log(t){
const el=document.getElementById("logBox");
if(el)el.textContent=t;
console.log("[Intelcar]",t);
}

function atualizarEstadoVisual(){
const geral=document.getElementById("status-geral");
if(!geral)return;
if(estado.modoEspera){
geral.textContent="ESPERA";
geral.style.color="#ff3333";
geral.style.borderColor="rgba(255,60,60,0.9)";
geral.style.background="rgba(255,0,0,0.14)";
}else{
geral.textContent="ATIVO";
geral.style.color="#00ff66";
geral.style.borderColor="rgba(0,255,100,0.8)";
geral.style.background="rgba(0,255,80,0.14)";
}
atualizarLedsBotoes();
}

function definirLed(id,ligado){
const el=document.getElementById(id);
if(!el)return;
el.classList.toggle("off",!ligado);
}

function atualizarLedsBotoes(){
definirLed("led-power",!estado.modoEspera&&estado.tudoLigado);
definirLed("led-microfone",estado.microfone);
definirLed("led-gps",estado.gps);
definirLed("led-ai-plus",true);
definirLed("led-alerta-velocidade",estado.alertaVelocidade);
definirLed("led-alerta-distracao",estado.alertaDistracao);
definirLed("led-alerta-cansaco",estado.alertaCansaco);
definirLed("led-alerta-meteo",estado.alertaMeteo);
definirLed("led-alerta-conducao",estado.alertaConducao);
// Estes três não desligam módulos, ficam sempre verdes como indicação visual.
definirLed("led-velocidade",true);
definirLed("led-destino",true);
definirLed("led-maps",true);
}

function falar(texto,urgente=false){
if(estado.mapsFala&&!urgente){
log("Silêncio: Google Maps tem prioridade.");
return;
}
if(!("speechSynthesis" in window)){
log(texto);
return;
}
window.speechSynthesis.cancel();
const msg=new SpeechSynthesisUtterance(texto);
msg.lang="pt-PT";
msg.rate=0.95;
msg.pitch=1.05;
window.speechSynthesis.speak(msg);
log(texto);
}

function botaoPrincipal(){
if(estado.modoEspera || !estado.tudoLigado){
ligarTudo();
} else {
desligarTudo();
}
}

function alternarTudo(){
botaoPrincipal();
}

function desligarTudo(){
estado.modoEspera=true;
estado.tudoLigado=false;
estado.ai=false;
estado.gps=false;
estado.alertaVelocidade=false;
estado.alertaDistracao=false;
estado.alertaCansaco=false;
estado.alertaMeteo=false;
estado.alertaConducao=false;
estado.microfone=true;
pararGPS();
atualizarEstadoVisual();
atualizarLedsBotoes();
falar("Intelcar em modo de espera.");
}

function ligarTudo(){
estado.modoEspera=false;
estado.tudoLigado=true;
estado.ai=true;
estado.microfone=true;
estado.gps=true;
estado.alertaVelocidade=true;
estado.alertaDistracao=true;
estado.alertaCansaco=true;
estado.alertaMeteo=true;
estado.alertaConducao=true;
atualizarEstadoVisual();
atualizarLedsBotoes();
iniciarGPS();
falar("Intelcar iniciada. Todos os sistemas ativos.");
}

function alternarModulo(nome){
if(!(nome in estado))return;
estado[nome]=!estado[nome];
if(nome==="gps"){estado[nome]?iniciarGPS():pararGPS();}
if(nome==="microfone"){estado[nome]?iniciarMicrofone():pararMicrofone();}
atualizarLedsBotoes();
falar(nome+" "+(estado[nome]?"ativo":"desligado"));
}

function falarVelocidade(){
falar("Velocidade atual "+Math.round(estado.velocidadeAtual)+" quilómetros por hora.");
}

function iniciarIntelcarAI(){
if(estado.modoEspera){
ligarTudo();
}
estado.ai=true;
if(estado.microfone){
iniciarMicrofone();
}
falar("Intelcar AI normal ativa. Diz olá Intelcar ou faz a tua pergunta.");
}

function falarAI(){
iniciarIntelcarAI();
}

function aiPlus(){
falar("AI Plus será uma versão premium da Intelcar. A inteligência normal abre no botão iniciar. Os pedidos por escrito ficam no logótipo Intelcar.");
}

function abrirConfiguracoes(){
const texto="Configurações Intelcar. Nesta fase podes ligar ou desligar módulos pelos botões ou por voz.";
falar(texto);
alert(texto);
}

function ativarSOS(){
falar("Alerta SOS preparado. Confirma antes de chamar emergência.",true);
alert("SOS será configurado numa próxima fase.");
}

function abrirPedidosEscritos(){
abrirAIBox();
}

function abrirAIBox(){
if(estado.modoEspera){
falar("Estou em modo de espera. Diz liga tudo para continuar.");
return;
}
const box=document.getElementById("aiBox");
const input=document.getElementById("aiInput");
const resposta=document.getElementById("aiResposta");
if(!box)return;
box.style.display="block";
if(resposta)resposta.textContent="Pedidos por escrito. Escreve sobre velocidade, destino, GPS, mapas ou módulos.";
falar("Pedidos por escrito abertos.");
if(input)setTimeout(()=>input.focus(),200);
}

function fecharAIBox(){
const box=document.getElementById("aiBox");
if(box)box.style.display="none";
}

function enviarPerguntaAI(){
const input=document.getElementById("aiInput");
const respostaEl=document.getElementById("aiResposta");
if(!input||!respostaEl)return;
const pergunta=input.value.trim();
if(!pergunta)return;
const resposta=gerarRespostaAI(pergunta);
respostaEl.textContent=resposta;
input.value="";
falar(resposta);
}

function responderAI(texto){
const resposta=gerarRespostaAI(texto);
const respostaEl=document.getElementById("aiResposta");
if(respostaEl)respostaEl.textContent=resposta;
falar(resposta);
}

function gerarRespostaAI(pergunta){
const t=pergunta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
if(t.includes("velocidade")){
return "A velocidade atual é "+Math.round(estado.velocidadeAtual)+" quilómetros por hora.";
}
if(t.includes("destino")){
return estado.destino?"O destino atual é "+estado.destino+".":"Ainda não existe destino definido. Diz destino seguido do local.";
}
if(t.includes("google maps")||t.includes("mapas")||t.includes("navegacao")){
return estado.destino?"Posso abrir o Google Maps para "+estado.destino+".":"Define primeiro um destino para eu abrir o Google Maps.";
}
if(t.includes("gps")){
return estado.gps?"O GPS interno está ativo.":"O GPS interno está desligado.";
}
if(t.includes("microfone")){
return estado.microfone?"O microfone está ativo.":"O microfone está desligado.";
}
if(t.includes("alerta")){
return "Os alertas de velocidade, distração, cansaço, meteo e condução perigosa podem ser ligados ou desligados pelos botões.";
}
if(t.includes("liga tudo")){
ligarTudo();
return "Todos os sistemas foram ligados.";
}
if(t.includes("desliga tudo")){
desligarTudo();
return "Intelcar em modo de espera.";
}
if(t.includes("ola")||t.includes("olá")){
return "Estou aqui. Posso ajudar com velocidade, destino, GPS, mapas e alertas.";
}
return "Ainda estou em versão local. Posso responder sobre velocidade, destino, GPS, Google Maps, microfone e alertas.";
}
