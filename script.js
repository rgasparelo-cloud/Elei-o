// Lista de sites participantes
const sites = [
  { id: 1, autor: "Camila Nogas", url: "https://camilanogas-a11y.github.io/site-CEIAS/?authuser=0" },
  { id: 2, autor: "João Ribeiro Miranda", url: "https://joaoribeiromiranda-crypto.github.io/site-C.E.I.A.S-/?authuser=0" },
  { id: 3, autor: "Manoela Santos Cruz", url: "https://manoelasantoscruz-dot.github.io/SiteCEIAS.Manoela/?authuser=0" },
  { id: 4, autor: "Maria Mudik", url: "https://mariamudik.github.io/Site_Ceias/?authuser=0" },
  { id: 5, autor: "Mariany", url: "https://amariany-cpu.github.io/site-CEIAS/?authuser=0" },
  { id: 6, autor: "Murillo Pesniaki", url: "https://murillopesniaki-afk.github.io/site-ceias-4.0/?authuser=0#sobre" },
  { id: 7, autor: "Davi Paulik", url: "https://davipaulik-star.github.io/Site-ceias/?authuser=0" }
];

// Inicialização dos dados de votos do localStorage
function getVotos() {
  const votosSalvos = localStorage.getItem('votos_ceias');
  if (votosSalvos) {
    return JSON.parse(votosSalvos);
  }
  // Se não existir, inicializa com 0 votos para cada site
  const votosIniciais = {};
  sites.forEach(site => votosIniciais[site.id] = 0);
  return votosIniciais;
}

function salvarVotos(votos) {
  localStorage.setItem('votos_ceias', JSON.stringify(votos));
}

function jaVotou() {
  return localStorage.getItem('usuario_ja_votou') === 'true';
}

// Renderiza os cards na página
function renderizarCards() {
  const gridContainer = document.getElementById('grid-sites');
  const votos = getVotos();
  const usuarioVotou = jaVotou();

  gridContainer.innerHTML = '';

  sites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="iframe-container">
        <iframe src="${site.url}" title="Preview ${site.autor}"></iframe>
      </div>
      <div class="card-content">
        <div class="card-title">Projeto de ${site.autor}</div>
        <div class="vote-info">
          <span>Votos:</span>
          <span class="vote-count" id="votos-count-${site.id}">${votos[site.id] || 0}</span>
        </div>
        <div class="btn-actions">
          <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="btn btn-visit">Visitar</a>
          <button 
            class="btn btn-vote" 
            onclick="votar(${site.id})" 
            ${usuarioVotou ? 'disabled' : ''}>
            ${usuarioVotou ? 'Votado' : 'Votar'}
          </button>
        </div>
      </div>
    `;

    gridContainer.appendChild(card);
  });
}

// Função de Votação
function votar(idSite) {
  if (jaVotou()) {
    alert('Você já registrou seu voto!');
    return;
  }

  const votos = getVotos();
  votos[idSite] = (votos[idSite] || 0) + 1;

  salvarVotos(votos);
  localStorage.setItem('usuario_ja_votou', 'true');

  renderizarCards();
  renderizarRanking();
  alert('Obrigado pelo seu voto!');
}

// Renderiza o Ranking Atualizado
function renderizarRanking() {
  const rankingList = document.getElementById('ranking-list');
  const votos = getVotos();

  // Ordena os sites por quantidade de votos (do maior para o menor)
  const sitesOrdenados = [...sites].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));

  rankingList.innerHTML = '';

  sitesOrdenados.forEach((site, index) => {
    const li = document.createElement('li');
    li.className = 'ranking-item';
    li.innerHTML = `
      <span><strong>#${index + 1}</strong> - ${site.autor}</span>
      <strong>${votos[site.id] || 0} voto(s)</strong>
    `;
    rankingList.appendChild(li);
  });
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  renderizarCards();
  renderizarRanking();
});