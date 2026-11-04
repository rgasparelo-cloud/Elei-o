// Importações do Firebase (usando a CDN oficial)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ⚠️ SUBSTITUA PELAS CONFIGURAÇÕES DO SEU PROJETO NO FIREBASE (gratuito)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const sites = [
  { id: 1, autor: "Camila Nogas", url: "https://camilanogas-a11y.github.io/site-CEIAS/?authuser=0" },
  { id: 2, autor: "João Ribeiro Miranda", url: "https://joaoribeiromiranda-crypto.github.io/site-C.E.I.A.S-/?authuser=0" },
  { id: 3, autor: "Manoela Santos Cruz", url: "https://manoelasantoscruz-dot.github.io/SiteCEIAS.Manoela/?authuser=0" },
  { id: 4, autor: "Maria Mudik", url: "https://mariamudik.github.io/Site_Ceias/?authuser=0" },
  { id: 5, autor: "Mariany", url: "https://amariany-cpu.github.io/site-CEIAS/?authuser=0" },
  { id: 6, autor: "Murillo Pesniaki", url: "https://murillopesniaki-afk.github.io/site-ceias-4.0/?authuser=0#sobre" },
  { id: 7, autor: "Davi Paulik", url: "https://davipaulik-star.github.io/Site-ceias/?authuser=0" }
];

let votosGlobais = {};

function jaVotouLocalmente() {
  return localStorage.getItem('usuario_ja_votou_ceias') === 'true';
}

// Ouve as atualizações do banco de dados em TEMPO REAL para todos os usuários
const votosRef = ref(db, 'votos');
onValue(votosRef, (snapshot) => {
  const data = snapshot.val() || {};
  votosGlobais = data;
  renderizarCards();
  renderizarRanking();
  atualizarEstatisticas();
});

function renderizarCards() {
  const container = document.getElementById('grid-sites');
  if (!container) return;
  const usuarioVotou = jaVotouLocalmente();

  container.innerHTML = '';

  sites.forEach(site => {
    const numVotos = votosGlobais[site.id] || 0;
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-preview-container">
        <div class="iframe-scaled-wrapper">
          <iframe src="${site.url}" title="Preview de ${site.autor}" loading="lazy"></iframe>
        </div>
        <div class="card-overlay" onclick="abrirModal('${site.url}', '${site.autor}')">
          <span class="expand-btn"><i class="fa-solid fa-expand"></i> Visualizar Projeto</span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="card-author">${site.autor}</h3>
        <div class="card-meta">
          <span class="vote-badge"><i class="fa-solid fa-fire"></i> ${numVotos} ${numVotos === 1 ? 'voto' : 'votos'}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" onclick="abrirModal('${site.url}', '${site.autor}')">Preview</button>
          <button class="btn btn-primary" id="btn-votar-${site.id}" ${usuarioVotou ? 'disabled' : ''}>
            ${usuarioVotou ? 'Votado' : 'Votar'}
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Evento de clique para votar no Firebase
    const btnVotar = card.querySelector(`#btn-votar-${site.id}`);
    if (btnVotar && !usuarioVotou) {
      btnVotar.addEventListener('click', () => registrarVotoNoFirebase(site.id));
    }
  });

  setTimeout(calcularEscala, 50);
}

// Incrementa o voto no banco de dados de forma segura (Transação)
function registrarVotoNoFirebase(idSite) {
  if (jaVotouLocalmente()) {
    alert('Você já registrou seu voto neste navegador!');
    return;
  }

  const itemVotoRef = ref(db, `votos/${idSite}`);
  
  runTransaction(itemVotoRef, (currentVotes) => {
    return (currentVotes || 0) + 1;
  }).then(() => {
    localStorage.setItem('usuario_ja_votou_ceias', 'true');
    alert('Voto computado com sucesso!');
  }).catch((error) => {
    console.error("Erro ao computar voto: ", error);
    alert('Ocorreu um erro ao registrar o voto. Tente novamente.');
  });
}

function renderizarRanking() {
  const list = document.getElementById('ranking-list');
  if (!list) return;

  const ordenados = [...sites].sort((a, b) => (votosGlobais[b.id] || 0) - (votosGlobais[a.id] || 0));
  list.innerHTML = '';

  ordenados.forEach((site, index) => {
    const numVotos = votosGlobais[site.id] || 0;
    const li = document.createElement('li');
    li.className = `ranking-item ${index < 3 ? 'rank-' + (index + 1) : ''}`;
    
    li.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span class="ranking-rank">${index + 1}</span>
        <span class="ranking-name">${site.autor}</span>
      </div>
      <span class="ranking-votes">${numVotos} ${numVotos === 1 ? 'voto' : 'votos'}</span>
    `;
    list.appendChild(li);
  });
}

function atualizarEstatisticas() {
  const total = Object.values(votosGlobais).reduce((a, b) => a + b, 0);
  const el = document.getElementById('total-votes');
  if (el) el.textContent = total;
}

function calcularEscala() {
  const containers = document.querySelectorAll('.card-preview-container');
  containers.forEach(container => {
    const wrapper = container.querySelector('.iframe-scaled-wrapper');
    if (wrapper) {
      const containerWidth = container.offsetWidth;
      wrapper.style.transform = `scale(${containerWidth / 1280})`;
    }
  });
}

window.addEventListener('resize', calcularEscala);