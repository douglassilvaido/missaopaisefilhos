const samples = {
  meias: ['Meias no Cesto', ['meias-passos', 'Passo a passo ilustrado'], ['meias-materiais', 'Materiais e instruções']],
  quebraCabeca: ['Quebra-cabeça de Desenho', ['quebra-cabeca-passos', 'Passo a passo ilustrado'], ['quebra-cabeca-materiais', 'Materiais e quantidades']],
  domino: ['Dominó Desenhado', ['domino-passos', 'Passo a passo ilustrado'], ['domino-materiais', 'Materiais e quantidades']],
  ponte: ['Ponte de Papel', ['ponte-passos', 'Passo a passo ilustrado'], ['ponte-materiais', 'Materiais e quantidades']],
  rapidas: ['Temos 10 minutos', ['bonus-10-minutos', 'Espelho de Bichos'], ['bonus-10-materiais', 'Materiais e instruções']],
  recortaveis: ['Kit de Peças Prontas', ['bonus-recortaveis', 'Detetive das Meias']],
  materiais: ['Use o que tem em casa', ['bonus-materiais', 'O que pode substituir?']],
  planner: ['30 Dias em Família', ['bonus-planner', 'Um pouquinho todo dia']],
};

const dialog = document.querySelector('.sample-dialog');
const sampleTitle = document.querySelector('#sample-title');
const samplePages = document.querySelector('.sample-pages');
const completeButton = document.querySelector('.plan-action .complete-cta');
const pulseObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  completeButton.classList.add('pulse-cta');
  pulseObserver.disconnect();
}, { threshold: 0.5 });
pulseObserver.observe(completeButton);

function buildPage([file, label], title) {
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  const caption = document.createElement('figcaption');
  const fullPage = document.createElement('a');
  const url = `assets/${file}.webp`;

  image.src = url;
  image.alt = `${title} · ${label}`;
  fullPage.href = url;
  fullPage.target = '_blank';
  fullPage.rel = 'noopener';
  fullPage.className = 'text-link';
  fullPage.textContent = `Ampliar: ${label}`;
  caption.append(fullPage);
  figure.append(image, caption);
  return figure;
}

document.querySelectorAll('[data-sample]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return;
    const [title, ...pages] = samples[link.dataset.sample];
    event.preventDefault();
    sampleTitle.textContent = title;
    samplePages.replaceChildren(...pages.map(page => buildPage(page, title)));
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.close-sample').focus();
  });
});

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

// Atribuição de campanhas no salto da página de vendas para a Cakto.
const attribution = new URLSearchParams(window.location.search);
for (const link of document.querySelectorAll('a[href^="https://pay.cakto.com.br/"]')) {
  const destination = new URL(link.href);
  for (const [key, value] of attribution) {
    if (/^(utm_[a-z0-9_]+|fbclid|gclid|ttclid|src|sck)$/i.test(key) && !destination.searchParams.has(key)) {
      destination.searchParams.set(key, value);
    }
  }
  link.href = destination.href;
}

const offerBanner = document.querySelector('#offer-countdown');
const offerTime = document.querySelector('#offer-time');
const offerDuration = 15 * 60 * 1000;
const offerKey = 'missao-pais-filhos-offer-deadline';
let offerDeadline = Date.now() + offerDuration;
try {
  const saved = Number(localStorage.getItem(offerKey));
  if (Number.isFinite(saved) && saved > 0) {
    offerDeadline = saved;
  } else {
    localStorage.setItem(offerKey, String(offerDeadline));
  }
} catch {
  // The countdown still runs when browser storage is unavailable.
}

function renderOfferCountdown() {
  const seconds = Math.max(0, Math.ceil((offerDeadline - Date.now()) / 1000));
  if (seconds === 0) {
    const expired = document.createElement('span');
    expired.textContent = 'Prazo da oferta encerrado';
    offerBanner.replaceWith(expired);
    return;
  }
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  offerTime.textContent = minutes + ':' + String(seconds % 60).padStart(2, '0');
  window.setTimeout(renderOfferCountdown, 250);
}

renderOfferCountdown();
