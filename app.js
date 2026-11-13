'use strict';

const dialog = document.querySelector('#course-dialog');
const frameContainer = document.querySelector('#frame-container');
const closeButton = document.querySelector('#close-dialog');
let lastTrigger;

function closeCourse() { dialog.close(); }
dialog.addEventListener('close', () => {
  frameContainer.replaceChildren();
  document.body.classList.remove('modal-open');
  lastTrigger?.focus({ preventScroll: true });
});
closeButton.addEventListener('click', closeCourse);
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeCourse();
});

function openCourse(event, project) {
  // Обычная ссылка остаётся рабочей при отключённом JS и для нового окна.
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || matchMedia('(max-width: 767px)').matches || !dialog.showModal) return;
  event.preventDefault();
  lastTrigger = event.currentTarget;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-external').href = project.url;
  const frame = document.createElement('iframe');
  frame.title = `Электронный курс «${project.title}»`;
  frame.src = project.url;
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.addEventListener('load', () => {
    if (dialog.open) closeButton.focus();
    // На GitHub Pages курс и портфолио имеют общий origin.
    // Клавиши из iframe не всплывают в родительский документ.
    try {
      frame.contentDocument?.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Escape') {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          closeCourse();
        }
      }, true);
    } catch { /* Для внешних доменов доступны кнопка закрытия и Escape вне iframe. */ }
  });
  frameContainer.replaceChildren(frame);
  document.body.classList.add('modal-open');
  dialog.showModal();
  closeButton.focus();
}

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

for (const [index, project] of (window.portfolioProjects || []).entries()) {
  const card = make('article', 'project');
  const preview = make('a', 'project-preview');
  preview.href = project.url;
  preview.target = '_blank';
  preview.rel = 'noopener noreferrer';
  preview.setAttribute('aria-label', `Посмотреть курс «${project.title}»`);
  const image = make('img');
  Object.assign(image, { src: project.image, alt: project.imageAlt, width: 1440, height: 900, loading: 'lazy' });
  if (project.previewScale) {
    image.style.setProperty('--preview-scale', project.previewScale);
    image.style.objectFit = 'cover';
  }
  const play = make('span', 'preview-label', 'Посмотреть курс ↗');
  preview.append(image, play);
  preview.addEventListener('click', (event) => openCourse(event, project));
  const info = make('div', 'project-info');
  info.append(make('p', 'eyebrow', `${String(index + 1).padStart(2, '0')} / ${project.category}`), make('h3', '', project.title), make('p', 'project-description', project.description));
  const tags = make('ul', 'tags');
  tags.setAttribute('aria-label', 'Технологии курса');
  project.tools.forEach(tool => tags.append(make('li', '', tool)));
  const role = make('p', 'project-role', project.role);
  const links = make('div', 'project-links');
  const view = make('a', 'text-link', 'Посмотреть курс ↗');
  Object.assign(view, { href: project.url, target: '_blank', rel: 'noopener noreferrer' });
  view.addEventListener('click', event => openCourse(event, project));
  const external = make('a', 'external-link', 'В новой вкладке ↗');
  Object.assign(external, { href: project.url, target: '_blank', rel: 'noopener noreferrer' });
  links.append(view, external);
  info.append(tags, role, links);
  card.append(preview, info);
  document.querySelector('#projects').append(card);
}

const carousel = document.querySelector('#projects');
const slides = [...carousel.querySelectorAll('.project')];
if (slides.length > 1) {
  carousel.classList.add('carousel');
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'карусель');
  carousel.setAttribute('aria-label', 'Примеры работ');
  const controls = make('div', 'carousel-controls');
  const caption = make('span', 'carousel-caption', 'ПРИМЕРЫ РАБОТ');
  const counter = make('span', 'carousel-counter');
  counter.setAttribute('aria-hidden', 'true');
  const previous = make('button', 'carousel-arrow', '←');
  const next = make('button', 'carousel-arrow', '→');
  previous.type = next.type = 'button';
  previous.setAttribute('aria-label', 'Предыдущий курс');
  next.setAttribute('aria-label', 'Следующий курс');
  const announcement = make('span', 'visually-hidden');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-atomic', 'true');
  controls.append(caption, counter, previous, next, announcement);
  carousel.before(controls);
  let currentSlide = 0;
  function showSlide(index, announce = true) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === currentSlide;
      slide.classList.toggle('is-active', active);
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'слайд');
      slide.setAttribute('aria-label', `${i + 1} из ${slides.length}`);
    });
    counter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (announce) announcement.textContent = `Курс ${currentSlide + 1} из ${slides.length}: ${slides[currentSlide].querySelector('h3').textContent}`;
  }
  previous.addEventListener('click', () => showSlide(currentSlide - 1));
  next.addEventListener('click', () => showSlide(currentSlide + 1));
  function handleArrow(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const withinSlide = carousel.contains(document.activeElement);
    showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
    if (withinSlide) slides[currentSlide].querySelector('a').focus({ preventScroll: true });
  }
  controls.addEventListener('keydown', handleArrow);
  carousel.addEventListener('keydown', handleArrow);
  let touchStart;
  let suppressClick = false;
  carousel.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  });
  carousel.addEventListener('pointercancel', () => { touchStart = null; });
  carousel.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch') return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClick = true;
    showSlide(currentSlide + (dx < 0 ? 1 : -1));
    setTimeout(() => { suppressClick = false; }, 400);
  });
  carousel.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  showSlide(0, false);
}
document.querySelector('#year').textContent = new Date().getFullYear();
