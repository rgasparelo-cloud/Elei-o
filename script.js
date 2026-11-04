// ⚠️ COLE AS CONFIS DO SEU PAINEL DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Inicializa Firebase se configurado
let database = null;
try {
  if (firebaseConfig.apiKey !== "SUA_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
  }
} catch (e) {
  console.warn("Firebase não inicializado. Usando modo de fallback local.", e);
}

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

function jaVotou() {
  return localStorage.getItem('usuario_ja_votou_ceias_v3') === 'true';
}

function carregarVotosDoStorageLocal() {
  const localData = localStorage.getItem('votos_ceias_fallback');
  if (localData) {
    return JSON.parse(localData);
  }
  const iniciais = {};
  sites.forEach(site => iniciais[site.id] = 0);
  return iniciais;
}

function salvarVotosNoStorageLocal(votos) {
  localStorage.setItem('votos_ceias_fallback', JSON.stringify(votos));
}

// Ouve atualizações em tempo real do Firebase
if (database) {
  database.ref('votos').on('value', (snapshot) => {
    votosGlobais = snapshot.val() || {};
    renderizarCards();
    renderizarRanking();
    atualizarEstatisticas();
  });
} else {
  // Carrega do localStorage local caso o Firebase não tenha sido conectado ainda
  votosGlobais = carregarVotosDoStorageLocal();
}

function calcularEscala() {
  const containers = document.querySelectorAll('.card-preview-container');
  containers.forEach(container => {
    const wrapper = container.querySelector('.iframe-scaled-wrapper');
    if (wrapper) {
      const scale = container.offsetWidth / 1280;
      wrapper.style.transform = `scale(${scale})`;
    }
  });
}

function renderizarCards(lista = sites) {
  const container = document.getElementById('grid-sites');
  if (!container) return;
  const usuarioVotou = jaVotou();

  container.innerHTML = '';

  lista.forEach(site => {
    const numVotos = votosGlobais[site.id] || 0;
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-preview-container">
        <div class="iframe-scaled-wrapper">
          <iframe src="${site.url}" title="Preview de ${site.autor}" loading="lazy"></iframe>
        </div>
        <div class="card-overlay" onclick="abrirModal('${site.url}', '${site.autor}')">
          <span class="expand-btn">
            <i class="fa-solid fa-expand"></i> Visualizar Projeto
          </span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="card-author" title="${site.autor}">${site.autor}</h3>
        
        <div class="card-meta">
          <span class="vote-badge">
            <i class="fa-solid fa-fire"></i> ${numVotos} ${numVotos === 1 ? 'voto' : 'votos'}
          </span>
        </div>

        <div class="card-actions">
          <button class="btn btn-secondary" onclick="abrirModal('${site.url}', '${site.autor}')">
            <i class="fa-solid fa-eye"></i> Preview
          </button>
          <button 
            class="btn btn-primary" 
            onclick="votar(${site.id})" 
            ${usuarioVotou ? 'disabled' : ''}>
            <i class="fa-solid ${usuarioVotou ? 'fa-check' : 'fa-thumbs-up'}"></i>
            ${usuarioVotou ? 'Votado' : 'Votar'}
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  setTimeout(calcularEscala, 50);
}

function votar(id) {
  if (jaVotou()) {
    showToast('Você já registrou seu voto neste navegador!', 'info');
    return;
  }

  if (database) {
    // Computa voto online no banco de dados
    database.ref(`votos/${id}`).transaction((currentVotes) => {
      return (currentVotes || 0) + 1;
    }, (error, committed) => {
      if (committed) {
        localStorage.setItem('usuario_ja_votou_ceias_v3', 'true');
        showToast('Voto computado com sucesso no servidor!', 'success');
        renderizarCards();
      } else if (error) {
        showToast('Erro ao registrar voto. Tente novamente.', 'info');
      }
    });
  } else {
    // Salva localmente (Modo offline / sem chave Firebase configurada)
    votosGlobais[id] = (votosGlobais[id] || 0) + 1;
    salvarVotosNoStorageLocal(votosGlobais);
    localStorage.setItem('usuario_ja_votou_ceias_v3', 'true');
    renderizarCards();
    renderizarRanking();
    atualizarEstatisticas();
    showToast('Voto registrado localmente!', 'success');
  }
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

function filtrarSites() {
  const termo = document.getElementById('search-input').value.toLowerCase();
  const filtrados = sites.filter(s => s.autor.toLowerCase().includes(termo));
  renderizarCards(filtrados);
}

function mudarLayout(tipo) {
  const grid = document.getElementById('grid-sites');
  const btnLarge = document.getElementById('btn-grid-large');
  const btnCompact = document.getElementById('btn-grid-compact');

  if (tipo === 'large') {
    grid.className = 'grid-sites grid-large';
    btnLarge.classList.add('active');
    btnCompact.classList.remove('active');
  } else {
    grid.className = 'grid-sites grid-compact';
    btnCompact.classList.add('active');
    btnLarge.classList.remove('active');
  }
  
  setTimeout(calcularEscala, 100);
}

function abrirModal(url, autor) {
  const modal = document.getElementById('preview-modal');
  const modalIframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');
  const modalExtLink = document.getElementById('modal-external-link');

  modalTitle.textContent = `Projeto de ${autor}`;
  modalIframe.src = url;
  modalExtLink.href = url;
  modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('preview-modal');
  const modalIframe = document.getElementById('modal-iframe');
  modal.style.display = 'none';
  modalIframe.src = '';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3500);
}

function resetarVotoLocal() {
  localStorage.removeItem('usuario_ja_votou_ceias_v3');
  showToast('Sua trava de voto local foi removida.', 'info');
  renderizarCards();
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const body = document.body;
  const isLight = body.getAttribute('data-theme') === 'light';
  const icon = document.querySelector('#theme-toggle i');

  if (isLight) {
    body.removeAttribute('data-theme');
    icon.className = 'fa-solid fa-moon';
  } else {
    body.setAttribute('data-theme', 'light');
    icon.className = 'fa-solid fa-sun';
  }
});

window.addEventListener('resize', calcularEscala);
document.addEventListener('DOMContentLoaded', () => {
  renderizarCards();
  renderizarRanking();
  atualizarEstatisticas();
});