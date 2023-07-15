import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery) {
    currentQuery = searchQuery;
    currentPage = 1;
    gallery.innerHTML = '';
    searchImages(currentQuery, currentPage);
  }
}

function loadMoreImages() {
  currentPage++;
  searchImages(currentQuery, currentPage);
}

async function searchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '38179044-0b179ee03efa6bc6d9a5998f4',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    const images = response.data.hits;
    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.style.display = 'none';
      return;
    }

    showImages(images);

    if (page === 1) {
      loadMoreBtn.style.display = 'block';
    }

    if (images.length < 40) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.style.display = 'block';
    }
    refreshLightbox();
    smoothScrollTo(gallery);
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure(
      'An error occurred while fetching images. Please try again later.'
    );
    loadMoreBtn.style.display = 'none';
  }
}

function showImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.innerHTML += imageCards.join('');
}

function createImageCard(image) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;

  return `
    <div class="photo-card">
    <a href="${largeImageURL}" data-lightbox="gallery" data-title="${tags}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy">
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${likes}</p>
        <p class="info-item"><b>Views:</b> ${views}</p>
        <p class="info-item"><b>Comments:</b> ${comments}</p>
        <p class="info-item"><b>Downloads:</b> ${downloads}</p>
      </div>
    </div>
  `;
}
function refreshLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}
function smoothScrollTo() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
