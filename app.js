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
iniciarGPS();
iniciarMicrofone();
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

function alternarTudo(){
if(estado.modoEspera){ligarTudo();}else{desligarTudo();}
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
iniciarGPS();
iniciarMicrofone();
falar("Intelcar iniciada. Todos os sistemas ativos.");
}

function alternarModulo(nome){
if(!(nome in estado))return;
estado[nome]=!estado[nome];
if(nome==="gps"){estado[nome]?iniciarGPS():pararGPS();}
if(nome==="microfone"){estado[nome]?iniciarMicrofone():pararMicrofone();}
falar(nome+" "+(estado[nome]?"ativo":"desligado"));
}

function falarVelocidade(){
falar("Velocidade atual "+Math.round(estado.velocidadeAtual)+" quilómetros por hora.");
}

function falarAI(){
if(estado.modoEspera){
falar("Estou em modo de espera. Diz liga tudo para continuar.");
return;
}
falar("AI Intelcar ativa. Posso ajudar com a viagem.");
}

function aiPlus(){
falar("AI Plus será uma versão premium da Intelcar.");
}

function abrirConfiguracoes(){
alert("Configurações Intelcar serão adicionadas depois.");
}

function ativarSOS(){
falar("Alerta SOS preparado. Confirma antes de chamar emergência.",true);
alert("SOS será configurado numa próxima fase.");
}function enviarPerguntaAI() {
  const pergunta = document.getElementById("aiInput").value.trim();
  if (!pergunta) return;

  let resposta = "Ainda não sei responder a essa pergunta.";

  if (pergunta.toLowerCase().includes("velocidade")) {
  resposta = "A velocidade atual é " + Math.round(estado.velocidadeAtual) + " quilómetros por hora.";
  } else if (pergunta.toLowerCase().includes("destino")) {
    resposta = estado.destino
      ? "O destino atual é " + estado.destino + "."
      : "Ainda não existe destino definido.";
  }

  document.getElementById("aiResposta").innerText = resposta;
  falar(resposta);
}

function fecharAIBox() {
  document.getElementById("aiBox").style.display = "none";
}

function abrirAIBox() {
  document.getElementById("aiBox").style.display = "block";
  document.getElementById("aiInput").focus();
}
