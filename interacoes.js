const samples = {
  meias: ['Meias no Cesto', ['meias-passos', 'Passo a passo ilustrado'], ['meias-materiais', 'Materiais e quantidades']],
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
const upgradeOffer = document.querySelector('#upgrade-offer');
document.querySelector('#choose-basic').addEventListener('click', () => upgradeOffer.showModal());
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

const testimonialTrack = document.querySelector('.testimonials-track');
if (testimonialTrack.children.length > 1) {
  const controls = document.createElement('div');
  controls.className = 'testimonials-controls';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const indicators = document.createElement('div');
  indicators.className = 'testimonials-indicators';
  const count = testimonialTrack.children.length;
  let visible = false;
  let timer;
  function currentIndex() {
    return Math.round(testimonialTrack.scrollLeft / testimonialTrack.clientWidth);
  }
  function show(index) {
    const width = testimonialTrack.clientWidth;
    const next = (index + count) % count;
    testimonialTrack.scrollTo({ left: next * width, behavior: motion.matches ? 'instant' : 'smooth' });
  }
  function restart() {
    clearInterval(timer);
    if (visible && !motion.matches && !document.hidden) timer = setInterval(() => show(currentIndex() + 1), 8000);
  }
  for (const [label, direction] of [['Anterior', -1], ['Próximo', 1]]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = direction < 0 ? '‹' : '›';
    button.setAttribute('aria-label', label + ' depoimento');
    button.addEventListener('click', () => {
      show(currentIndex() + direction);
      restart();
    });
    controls.append(button);
  }
  const positions = Array.from(testimonialTrack.children, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Depoimento ${index + 1} de ${count}`);
    button.addEventListener('click', () => {
      show(index);
      restart();
    });
    indicators.append(button);
    return button;
  });
  function updatePosition() {
    const active = currentIndex();
    positions.forEach((button, index) => button.setAttribute('aria-current', String(index === active)));
  }
  testimonialTrack.after(controls, indicators);
  testimonialTrack.addEventListener('scroll', updatePosition, { passive: true });
  updatePosition();
  testimonialTrack.addEventListener('pointerdown', restart);
  document.addEventListener('visibilitychange', restart);
  motion.addEventListener('change', restart);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  }, { threshold: 0.25 }).observe(testimonialTrack);
}
