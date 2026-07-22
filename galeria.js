const grid = document.getElementById('full-gallery-grid');
const count = document.getElementById('gallery-count');
const filters = document.querySelectorAll('.filter-btn');
const dialog = document.querySelector('.gallery-lightbox');
const dialogImage = dialog?.querySelector('img');
const dialogCaption = dialog?.querySelector('p');
let photos = [];
let visiblePhotos = [];
let currentIndex = 0;
const labels = { podios: 'Pódios', competicoes: 'Competições', equipe: 'Equipe' };

async function loadGallery() {
  try {
    const response = await fetch('galeria-data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar galeria');
    photos = await response.json();
    renderGallery('todos');
  } catch (error) {
    grid.innerHTML = '<p>Não foi possível carregar as fotos agora.</p>';
  }
}

function renderGallery(filter) {
  visiblePhotos = filter === 'todos' ? photos : photos.filter(photo => photo.categoria === filter);
  grid.innerHTML = visiblePhotos.map((photo, index) => `
    <button class="gallery-card" type="button" data-index="${index}" data-label="${labels[photo.categoria] || 'Galeria'}">
      <img src="${photo.src}" alt="${photo.alt}" loading="lazy" decoding="async">
    </button>`).join('');
  count.textContent = `${visiblePhotos.length} ${visiblePhotos.length === 1 ? 'foto' : 'fotos'}`;
  grid.querySelectorAll('.gallery-card').forEach(card => card.addEventListener('click', () => openPhoto(Number(card.dataset.index))));
}

function openPhoto(index) {
  if (!dialog || !dialogImage || !visiblePhotos[index]) return;
  currentIndex = index;
  const photo = visiblePhotos[index];
  dialogImage.src = photo.src;
  dialogImage.alt = photo.alt;
  dialogCaption.textContent = labels[photo.categoria] || 'Galeria';
  dialog.showModal();
}
function movePhoto(direction) {
  currentIndex = (currentIndex + direction + visiblePhotos.length) % visiblePhotos.length;
  openPhoto(currentIndex);
}
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderGallery(button.dataset.filter);
}));
dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
dialog?.querySelector('.lightbox-prev')?.addEventListener('click', () => movePhoto(-1));
dialog?.querySelector('.lightbox-next')?.addEventListener('click', () => movePhoto(1));
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
window.addEventListener('keydown', event => {
  if (!dialog?.open) return;
  if (event.key === 'ArrowLeft') movePhoto(-1);
  if (event.key === 'ArrowRight') movePhoto(1);
});
dialog?.addEventListener('close', () => dialogImage?.removeAttribute('src'));
loadGallery();
