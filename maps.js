function definirDestinoManual(){
const destino=prompt("Qual é o destino?");
if(!destino)return;
definirDestino(destino);
}

function definirDestino(destino){
destino=destino.trim();
if(!destino)return;
estado.destino=destino;
localStorage.setItem("destinoIntelcar",destino);
falar("A abrir navegação para "+destino+".");
setTimeout(()=>abrirGoogleMaps(),700);
}

function abrirGoogleMaps(){
const destino=estado.destino||localStorage.getItem("destinoIntelcar");
if(!destino){
falar("Define primeiro um destino.");
alert("Define primeiro um destino.");
return;
}

const url="google.navigation:q="+encodeURIComponent(destino);
window.location.href=url;
}

function mapsComecouAFalar(){estado.mapsFala=true;}
function mapsParouDeFalar(){estado.mapsFala=false;}
