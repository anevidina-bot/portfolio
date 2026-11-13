'use strict';
{
  const track = document.querySelector('.certificate-track');
  const previous = document.querySelector('#certificates-prev');
  const next = document.querySelector('#certificates-next');
  const viewer = document.querySelector('#certificate-dialog');
  const image = document.querySelector('#certificate-full');
  const close = document.querySelector('#close-certificate');
  let trigger;
  const originals = [...track.children];
  // Копии по краям позволяют показать последний и первый сертификаты рядом.
  function copyCard(card) {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelector('a').tabIndex = -1;
    return copy;
  }
  track.prepend(...originals.map(copyCard));
  track.append(...originals.map(copyCard));
  let step;
  let segment;
  let targetIndex = 0;
  let settleTimer;
  function jump(index) {
    track.scrollTo({ left: segment + index * step, behavior: 'instant' });
  }
  function layout() {
    step = originals[0].getBoundingClientRect().width + 24;
    segment = originals.length * step;
    targetIndex = ((targetIndex % originals.length) + originals.length) % originals.length;
    jump(targetIndex);
  }
  function settle() {
    const index = Math.round((track.scrollLeft - segment) / step);
    targetIndex = ((index % originals.length) + originals.length) % originals.length;
    if (index !== targetIndex) jump(targetIndex);
  }
  function move(direction) {
    clearTimeout(settleTimer);
    if (targetIndex <= -originals.length || targetIndex >= originals.length * 2 - 1) {
      targetIndex = ((targetIndex % originals.length) + originals.length) % originals.length;
      jump(targetIndex);
    }
    targetIndex += direction;
    track.scrollTo({ left: segment + targetIndex * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 180);
  }, { passive: true });
  new ResizeObserver(layout).observe(track);
  layout();
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
