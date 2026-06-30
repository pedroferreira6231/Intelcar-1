function definirDestinoManual(){
  const destino = prompt("Qual é o destino?");
  if(!destino) return;
  definirDestino(destino);
}

function definirDestino(destino){
  destino = String(destino || "").trim();
  if(!destino) return;

  estado.destino = destino;
  localStorage.setItem("destinoIntelcar", destino);
  falar("A abrir navegação para " + destino + ".");

  // Abrir sem atraso. O Chrome pode bloquear aplicações externas
  // quando a abertura é feita por um temporizador.
  abrirGoogleMaps();
}

function abrirGoogleMaps(){
  const destino = estado.destino || localStorage.getItem("destinoIntelcar");

  if(!destino){
    falar("Define primeiro um destino.");
    alert("Define primeiro um destino.");
    return;
  }

  const destinoCodificado = encodeURIComponent(destino);

  // URI oficial Android para iniciar diretamente a navegação no Google Maps.
  const urlAplicacao =
    "google.navigation:q=" + destinoCodificado + "&mode=d";

  // Alternativa universal, caso o navegador não consiga abrir a aplicação.
  const urlWeb =
    "https://www.google.com/maps/dir/?api=1" +
    "&destination=" + destinoCodificado +
    "&travelmode=driving" +
    "&dir_action=navigate";

  let aplicacaoAbriu = false;

  const detetarSaida = () => {
    if(document.hidden) aplicacaoAbriu = true;
  };

  document.addEventListener("visibilitychange", detetarSaida, { once: true });

  // Tenta primeiro abrir o Google Maps instalado.
  window.location.href = urlAplicacao;

  // Se o Android/Chrome bloquear o esquema da aplicação, abre a versão web.
  setTimeout(() => {
    if(!aplicacaoAbriu && !document.hidden){
      window.location.href = urlWeb;
    }
  }, 1200);
}

function mapsComecouAFalar(){ estado.mapsFala = true; }
function mapsParouDeFalar(){ estado.mapsFala = false; }
