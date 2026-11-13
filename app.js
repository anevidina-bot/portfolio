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
document.querySelector('#year').textContent = new Date().getFullYear();

