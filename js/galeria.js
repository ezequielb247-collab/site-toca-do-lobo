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
    const staticResponse = await fetch('galeria-data.json', { cache: 'no-store' });
    if (!staticResponse.ok) throw new Error('Falha ao carregar galeria');
    const staticPhotos = await staticResponse.json();

    let managedPhotos = [];
    try {
      const apiResponse = await fetch('https://painel.tocadolobojiujitsu.com.br/api/public/gallery', { cache: 'no-store' });
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        managedPhotos = Array.isArray(apiData.photos) ? apiData.photos : [];
      }
    } catch (apiError) {
      console.warn('Galeria administrável temporariamente indisponível.', apiError);
    }

    photos = [...managedPhotos.filter(photo => photo.destaque), ...staticPhotos, ...managedPhotos.filter(photo => !photo.destaque)];
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
