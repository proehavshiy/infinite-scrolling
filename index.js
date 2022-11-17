// task: to implement infinite scrolling

const URL = 'https://picsum.photos/v2/list';

const fetchImg = (() => {
  let page = 1;
  return async function (url, limit = 10) {
    const req = await fetch(`${url}?page=${page}&limit=${limit}`);
    page = page + 1;
    return await req.json();
  }
})()

// lazy loading observer
const lazyLoadingObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;

      // change card background image and image placeholder to real image
      card.style.background = 'deepskyblue'
      const img = card.querySelector('img');
      
      img.src = img.dataset.src;
      img.removeAttribute('data-src');

      observer.unobserve(card);
    }
  })
}, {
  rootMargin: '0%',
  threshold: .1
});

// infinite scroll observer
const infiniteScrollObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // unobserve previous last element
      observer.unobserve(entry.target);

      const imgs = fetchImg(URL)
        .then(res => {
          for (let index = 0; index < res.length; index++) {

            const card = createCard(res[index].download_url, res[index].author);
            // set lazyLoading observer to each new card
            lazyLoadingObserver.observe(card);

            // add infiniteScrollObserver to the new last card
            if (index === res.length - 1) {
              infiniteScrollObserver.observe(card);
            }
          
            document.querySelector('#root').appendChild(card);
          }
        })
      .catch(err => console.log('error:', err))
    }
    
  })
}, {
  threshold: 1,
})

function createCard(imgUrl, text) {
  const cardTemplate = document.querySelector('#card-template');
  const clone = cardTemplate.content.cloneNode(true)
  const card = clone.querySelector('.card');

  const image = card.querySelector('img');
  image.dataset.src = imgUrl;
  // reserve initial dimentions of imare for the moment before the end of the loading of image to prevent layout flashing
  // and as a result, calling the observer callback
  image.width = '200';
  image.height = '150';
  image.src = './placeholder-img.png';
  const caption = card.querySelector('.card__text');
  caption.textContent = text;

  return card;
}

window.onload = async () => {
  const imgs = await fetchImg(URL);
  const rootEl = document.querySelector('#root');

  for (let index = 0; index < imgs.length; index++) {

    const card = createCard(imgs[index].download_url, imgs[index].author);
    // add lazy loading observer to each card
    lazyLoadingObserver.observe(card);

    // add infiniteScrollObserver to the last card
    if (index === imgs.length - 1) {
      infiniteScrollObserver.observe(card);
    }

    rootEl.appendChild(card);
  }
}

