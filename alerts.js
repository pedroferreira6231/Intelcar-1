let ultimoAlertaVelocidade=0;

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
