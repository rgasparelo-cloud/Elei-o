const sites = [
  { id: 1, autor: "Camila Nogas", url: "https://camilanogas-a11y.github.io/site-CEIAS/?authuser=0" },
  { id: 2, autor: "João Ribeiro Miranda", url: "https://joaoribeiromiranda-crypto.github.io/site-C.E.I.A.S-/?authuser=0" },
  { id: 3, autor: "Manoela Santos Cruz", url: "https://manoelasantoscruz-dot.github.io/SiteCEIAS.Manoela/?authuser=0" },
  { id: 4, autor: "Maria Mudik", url: "https://mariamudik.github.io/Site_Ceias/?authuser=0" },
  { id: 5, autor: "Mariany", url: "https://amariany-cpu.github.io/site-CEIAS/?authuser=0" },
  { id: 6, autor: "Murillo Pesniaki", url: "https://murillopesniaki-afk.github.io/site-ceias-4.0/?authuser=0#sobre" },
  { id: 7, autor: "Davi Paulik", url: "https://davipaulik-star.github.io/Site-ceias/?authuser=0" }
];

function getVotos() {
  const votosSalvos = localStorage.getItem('votos_ceias');
  if (votosSalvos) {
    return JSON.parse(votosSalvos);
  }
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

function renderizarCards(listaSites = sites) {
  const gridContainer = document.getElementById('grid-sites');
  const votos = getVotos();
  const usuarioVotou = jaVotou();

  gridContainer.innerHTML = '';

  listaSites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="iframe-wrapper" onclick="abrirModal('${site.url}', '${site.autor}')">
        <iframe class="iframe-scaled" src="${site.url}" title="Preview ${site.autor}"></iframe>
        <div class="iframe-overlay">
          <span class="preview-badge">🔍 Clique para expandir</span>
        </div>
      </div>
      <div class="card-content">
        <div class="card-title">Projeto de ${site.autor}</div>
        <div class="vote-info">
          <span>Total de votos:</span>
          <span class="vote-count">${votos[site.id] || 0}</span>
        </div>
        <div class="btn-actions">
          <button class="btn btn-preview" onclick="abrirModal('${site.url}', '${site.autor}')">Visualizar</button>
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

function votar(idSite) {
  if (jaVotou()) {
    alert('Você já votou!');
    return;
  }

  const votos = getVotos();
  votos[idSite] = (votos[idSite] || 0) + 1;

  salvarVotos(votos);
  localStorage.setItem('usuario_ja_votou', 'true');

  renderizarCards();
  renderizarRanking();
  alert('Seu voto foi registrado com sucesso!');
}

function renderizarRanking() {
  const rankingList = document.getElementById('ranking-list');
  const votos = getVotos();

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

function filtrarSites() {
  const termo = document.getElementById('search-input').value.toLowerCase();
  const sitesFiltrados = sites.filter(site => site.autor.toLowerCase().includes(termo));
  renderizarCards(sitesFiltrados);
}

// Modal de Tela Cheia
function abrirModal(url, autor) {
  const modal = document.getElementById('preview-modal');
  const modalIframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');

  modalTitle.textContent = `Projeto de ${autor}`;
  modalIframe.src = url;
  modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('preview-modal');
  const modalIframe = document.getElementById('modal-iframe');

  modal.style.display = 'none';
  modalIframe.src = '';
}

function resetarVotacao() {
  if (confirm("Deseja resetar os votos armazenados neste navegador?")) {
    localStorage.removeItem('votos_ceias');
    localStorage.removeItem('usuario_ja_votou');
    renderizarCards();
    renderizarRanking();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarCards();
  renderizarRanking();
});