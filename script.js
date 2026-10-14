const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio >= 0.12) e.target.classList.add('in');
    else if (!e.isIntersecting) e.target.classList.remove('in');
  });
}, { threshold: [0, 0.12] });

document.querySelectorAll('.reveal').forEach(el => reduce ? el.classList.add('in') : reveal.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', ev => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView();
    history.replaceState(null, '', a.getAttribute('href'));
  });
});

const bar = document.querySelector('.nav-links');
const links = [...bar.querySelectorAll('a')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + e.target.id;
      if (on) {
        a.setAttribute('aria-current', 'true');
        bar.scrollLeft = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
      } else {
        a.removeAttribute('aria-current');
      }
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

const track = document.querySelector('.track');
const slides = [...track.children];
const dotsBox = document.querySelector('.dots');
let index = 0;
let holdUntil = 0;
let inView = true;

const dots = slides.map((_, i) => {
  const d = document.createElement('button');
  d.type = 'button';
  d.className = 'dot';
  d.setAttribute('role', 'tab');
  d.setAttribute('aria-label', `screenshot ${i + 1}`);
  d.addEventListener('click', () => go(i, true));
  dotsBox.append(d);
  return d;
});

const mark = i => {
  index = i;
  dots.forEach((d, n) => d.setAttribute('aria-selected', n === i));
};

const go = (i, user) => {
  const n = (i + slides.length) % slides.length;
  if (user) holdUntil = Date.now() + 9000;
  track.scrollTo({ left: n * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  mark(n);
};

track.addEventListener('scroll', () => {
  const i = Math.round(track.scrollLeft / track.clientWidth);
  if (i !== index) mark(i);
}, { passive: true });

document.querySelector('.prev').addEventListener('click', () => go(index - 1, true));
document.querySelector('.next').addEventListener('click', () => go(index + 1, true));
['pointerdown', 'touchstart', 'focusin', 'mouseenter'].forEach(ev =>
  track.parentElement.addEventListener(ev, () => { holdUntil = Date.now() + 9000; }, { passive: true }));

new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(track);

window.addEventListener('resize', () => { track.scrollLeft = index * track.clientWidth; });

mark(0);

if (!reduce) {
  setInterval(() => {
    if (document.hidden || !inView || Date.now() < holdUntil) return;
    go(index + 1);
  }, 4500);
}

const VIEWER = 'https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js';
let pending = null;

document.querySelectorAll('.stage').forEach(stage => {
  const open = stage.querySelector('.pfp');
  const back = stage.querySelector('.back');
  let viewer = null;

  const show = state => {
    stage.dataset.state = state;
    back.hidden = state !== 'model';
    open.setAttribute('aria-busy', state === 'loading');
  };

  open.addEventListener('click', async () => {
    if (stage.dataset.state === 'loading') return;
    if (!viewer) {
      show('loading');
      try {
        pending ||= import(VIEWER);
        await pending;
      } catch {
        pending = null;
        show('photo');
        return;
      }
      viewer = document.createElement('model-viewer');
      viewer.setAttribute('src', stage.dataset.model);
      viewer.setAttribute('alt', `${stage.dataset.name}'s minecraft skin in 3d`);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('auto-rotate', '');
      viewer.setAttribute('camera-orbit', '180deg 75deg auto');
      viewer.setAttribute('interaction-prompt', 'none');
      viewer.setAttribute('shadow-intensity', '0');
      viewer.setAttribute('touch-action', 'pan-y');
      stage.prepend(viewer);
    }
    show('model');
  });

  let leaving = false;

  back.addEventListener('click', () => {
    if (leaving) return;

    const finish = () => {
      stage.classList.remove('leaving');
      leaving = false;
      show('photo');
      if (!reduce) {
        open.classList.remove('pfp-in');
        void open.offsetWidth;
        open.classList.add('pfp-in');
        open.addEventListener('animationend', () => open.classList.remove('pfp-in'), { once: true });
      }
      open.focus();
    };

    if (reduce || !viewer) return finish();

    leaving = true;
    stage.classList.add('leaving');
    setTimeout(finish, 220);
  });
});

const quotes = [
  'cheese first... diamonds later.',
  'hard difficulty, soft hearts.',
  'built a house, lost the coords, built another house.',
  'nobody is lost in chezzyverse, just /home-less.',
  'badak dan ikan.',
  'java, bedrock, same sunset.',
  'every cozy base started as a dirt hut.',
  'mining at 3am hits different when someone else is online too.',
  'i only wanted a tiny house and now i have a village.',
  'tpa to my base, i made bread.',
  'never gonna give u up.',
  '/sethome wherever the people are.',
  'afk just means away from keyboard, not away from u.',
  'keep inventory on, keep friends closer.',
  'bunni.',
  'sheep are walking blankets, be nice to them.'
];

const quoteEl = document.querySelector('.q');
let last = NaN;
try { last = parseInt(localStorage.getItem('quote'), 10); } catch {}
let pick;
do { pick = Math.floor(Math.random() * quotes.length); } while (pick === last);
quoteEl.textContent = quotes[pick];
try { localStorage.setItem('quote', pick); } catch {}
