'use strict';
{
  const track = document.querySelector('.certificate-track');
  const previous = document.querySelector('#certificates-prev');
  const next = document.querySelector('#certificates-next');
  const viewer = document.querySelector('#certificate-dialog');
  const image = document.querySelector('#certificate-full');
  const close = document.querySelector('#close-certificate');
  let trigger;
  function updateControls() {
    previous.disabled = track.scrollLeft <= 8;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  }
  function move(direction) {
    const step = track.firstElementChild.getBoundingClientRect().width + 24;
    track.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(track);
  updateControls();
  document.querySelectorAll('.certificate-link').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || !viewer.showModal) return;
      event.preventDefault();
      trigger = link;
      const title = link.dataset.certificateTitle;
      document.querySelector('#certificate-dialog-title').textContent = title;
      document.querySelector('#certificate-original').href = link.href;
      image.src = link.href;
      image.alt = `Сертификат Александры Невидиной: ${title}`;
      document.body.classList.add('modal-open');
      viewer.showModal();
      close.focus();
    });
  });
  close.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    image.removeAttribute('src');
    document.body.classList.remove('modal-open');
    trigger?.focus({ preventScroll: true });
  });
}
