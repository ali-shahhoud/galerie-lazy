const print = console.log;
import { sleep } from './sleep.js';
import { images } from './images.js';


const $gallery = document.querySelector('#gallery');

async function showImage(id, card) {
  if (document.querySelector('#preview')) return;

  const $image = document.createElement('img');
  $image.src = `images/${id}.jpg`;
  const imageLoading = new Promise((resolve) => {
    $image.addEventListener('load', resolve, { once: true });
  });

  const metadataLoading = new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.responseType = 'json';
    request.open('GET', `images/${id}.json`);
    request.send();
    request.addEventListener('load', () => {
      resolve(request.response);
    });
  });

  await Promise.all([imageLoading, metadataLoading]);
  const metadata = await metadataLoading;

  const $name = document.createElement('h1');
  $name.textContent = metadata?.name || '<Kein Name>';

  const $creator = document.createElement('h2');
  $creator.textContent = metadata?.creator || '<Kein Ersteller>';

  const $footer = document.createElement('footer');
  $footer.append($name, $creator);

  const $preview = document.createElement('div');
  $preview.id = 'preview';
  $preview.style.top = `${card.y + card.height / 2}px`;
  $preview.style.left = `${card.x + card.width / 2}px`;
  $preview.append($image, $footer);

  await new Promise(requestAnimationFrame);
  document.body.append($preview);

  await new Promise(requestAnimationFrame);
  $preview.removeAttribute('style');
  $preview.classList.add('show');

  await sleep(0.4);
  await new Promise((resolve) => {
    $preview.addEventListener('click', resolve, { once: true });
  });
  $preview.remove();
}


images.forEach((id) => {
  const $card = document.createElement('div');
  $card.id = id;
  $card.classList.add('card', 'loading');
  $card.append(document.createElement('img'));
  $gallery.append($card);
});


const $loadingCards = [...document.querySelectorAll('.card.loading')];
while ($loadingCards.length) {
  const $card = $loadingCards.shift();

  const $image = $card.querySelector('img');

  $image.src = `images/${$card.id}-preview.jpg`;
  await new Promise((resolve) => {
    $image.addEventListener('load', resolve, { once: true });
  });

  $card.classList.remove('loading');

  $card.addEventListener('click', () => showImage($card.id, $card.getClientRects()[0]));

  await sleep(0.5);
}

