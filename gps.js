let gpsWatchId=null;
let ultimaPosicao=null;

function iniciarGPS(){
if(!estado.gps||estado.modoEspera)return;
if(!navigator.geolocation){
falar("GPS não disponível neste telemóvel.");
return;
}
if(gpsWatchId!==null)return;
gpsWatchId=navigator.geolocation.watchPosition(
pos=>{
const lat=pos.coords.latitude;
const lon=pos.coords.longitude;
let velocidade=0;
if(pos.coords.speed!==null&&!isNaN(pos.coords.speed)){
velocidade=Math.max(0,pos.coords.speed*3.6);
}else if(ultimaPosicao){
velocidade=calcularVelocidadePorDistancia(ultimaPosicao,{lat,lon,time:Date.now()});
}
ultimaPosicao={lat,lon,time:Date.now()};
estado.velocidadeAtual=velocidade;
atualizarVelocidadeNoEcra(velocidade);
verificarAlertasVelocidade(velocidade);
},
err=>{log("Erro GPS: "+err.message);},
{enableHighAccuracy:true,maximumAge:1000,timeout:10000}
);
log("GPS interno ativo.");
}

function pararGPS(){
if(gpsWatchId!==null){
navigator.geolocation.clearWatch(gpsWatchId);
gpsWatchId=null;
}
log("GPS interno em pausa.");
}

function atualizarVelocidadeNoEcra(v){
const el=document.getElementById("speedBox");
if(el)el.textContent=Math.round(v)+" km/h";
}

function calcularVelocidadePorDistancia(a,b){
const distanciaKm=haversine(a.lat,a.lon,b.lat,b.lon);
const horas=(b.time-a.time)/3600000;
if(horas<=0)return 0;
return distanciaKm/horas;
}

function haversine(lat1,lon1,lat2,lon2){
const R=6371;
const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;
const aa=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
const c=2*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));
return R*c;
}
