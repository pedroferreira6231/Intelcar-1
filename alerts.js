let ultimoAlertaVelocidade=0;

/* Alerta de condução perigosa por movimento do telemóvel. */
let sensorConducaoLigado=false;
let ultimaIntensidadeMovimento=null;
let inicioJanelaMovimentos=0;
let movimentosFortes=0;
let ultimoAlertaConducao=0;

function obterLimiteVelocidade(){
const valor=Number(localStorage.getItem("limiteVelocidadeIntelcar"));
if(Number.isFinite(valor)&&valor>=10&&valor<=200)return Math.round(valor);
return 90;
}

function definirLimiteVelocidade(novoLimite){
const limite=Math.round(Number(novoLimite));
if(!Number.isFinite(limite)||limite<10||limite>200){
falar("Diz um limite entre 10 e 200 quilómetros por hora.");
return false;
}
localStorage.setItem("limiteVelocidadeIntelcar",String(limite));
ultimoAlertaVelocidade=0;
falar("Limite de velocidade alterado para "+limite+" quilómetros por hora.");
log("Limite definido: "+limite+" km/h");
return true;
}

function falarLimiteVelocidade(){
const limite=obterLimiteVelocidade();
falar("O limite de velocidade está definido para "+limite+" quilómetros por hora.");
}

function verificarAlertasVelocidade(v){
if(!estado.alertaVelocidade||estado.modoEspera)return;
const limite=obterLimiteVelocidade();
const agora=Date.now();
if(v>limite&&agora-ultimoAlertaVelocidade>20000){
ultimoAlertaVelocidade=agora;
falar("Atenção. Ultrapassou o limite definido de "+limite+" quilómetros por hora.");
}
}

async function iniciarSensorConducao(pedidoPorToque=false){
if(sensorConducaoLigado)return true;

if(!("DeviceMotionEvent" in window)){
log("Sensor de movimento não suportado neste navegador.");
return false;
}

/* Alguns aparelhos exigem autorização iniciada por um toque. */
if(typeof DeviceMotionEvent.requestPermission==="function"){
if(!pedidoPorToque){
log("O sensor de movimento necessita de um toque inicial.");
return false;
}
try{
const permissao=await DeviceMotionEvent.requestPermission();
if(permissao!=="granted"){
log("Autorização do sensor de movimento recusada.");
return false;
}
}catch(e){
log("Não foi possível ativar o sensor de movimento.");
return false;
}
}

window.addEventListener("devicemotion",analisarMovimentoConducao,{passive:true});
sensorConducaoLigado=true;
log("Sensor de condução perigosa ativo.");
return true;
}

function analisarMovimentoConducao(evento){
if(!estado.alertaConducao||estado.modoEspera)return;

const a=evento.accelerationIncludingGravity||evento.acceleration;
if(!a)return;

const x=Number(a.x)||0;
const y=Number(a.y)||0;
const z=Number(a.z)||0;
const intensidade=Math.sqrt(x*x+y*y+z*z);

if(ultimaIntensidadeMovimento===null){
ultimaIntensidadeMovimento=intensidade;
return;
}

const variacao=Math.abs(intensidade-ultimaIntensidadeMovimento);
const eixoMaisForte=Math.max(Math.abs(x),Math.abs(y),Math.abs(z));
ultimaIntensidadeMovimento=intensidade;

/* Dois movimentos fortes em menos de 0,9 s evitam alertas por um pequeno toque. */
if(variacao>=6.5||eixoMaisForte>=18){
const agora=Date.now();
if(agora-inicioJanelaMovimentos>900){
inicioJanelaMovimentos=agora;
movimentosFortes=0;
}
movimentosFortes++;

if(movimentosFortes>=2&&agora-ultimoAlertaConducao>12000){
ultimoAlertaConducao=agora;
movimentosFortes=0;
if("vibrate" in navigator){navigator.vibrate([180,100,180]);}
falar("Atenção. Movimento brusco detetado. Conduza com cuidado.",true);
}
}
}
