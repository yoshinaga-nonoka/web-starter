// The site's script (one classic file, no build step): the phone menu, blocks rising in, the header marking the
// section on screen, looping films that play when on screen (iOS included), and the switch that stops all motion.

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const STILL_KEY = 'site-still';

/* ---------------------------------------------------------------- the phone and tablet menu */
const toggle = document.querySelector('.nav__toggle');
if (toggle) {
  const setOpen = open => {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  toggle.addEventListener('click', () => setOpen(!root.classList.contains('nav-open')));
  document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

/* ---------------------------------------------------------------- blocks rise in as they come on screen */
// Only with script and motion on: without them every block simply shows (site.css hides them under .has-reveal only).
const reveals = document.querySelectorAll('[data-reveal]');
if (reveals.length && !reduced && store.get(STILL_KEY) !== '1' && 'IntersectionObserver' in window) {
  root.classList.add('has-reveal');
  const rise = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      rise.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => rise.observe(el));
}

/* ---------------------------------------------------------------- the header menu follows the page */
const marked = [...document.querySelectorAll('.nav__links [data-section]')]
  .map(a => [a, document.getElementById(a.dataset.section)]).filter(([, el]) => el);
if (marked.length) {
  const mark = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const pair = marked.find(([, el]) => el === e.target);
      if (pair) pair[0].classList.toggle('is-current', e.isIntersecting);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  marked.forEach(([, el]) => mark.observe(el));
}

/* ---------------------------------------------------------------- films (Film.astro) */
const films = [...document.querySelectorAll('video[data-autoplay]')].map(video => ({
  video, button: video.parentElement.querySelector('.film__toggle'), visible: false, userPaused: false,
}));
// quiet loops play whenever they are on screen (reduced motion too: each has its pause button), unless the
// footer's switch has stopped motion
let still = store.get(STILL_KEY) === '1';
// a phone may refuse to start a film by itself (iOS Low Power Mode): the next touch starts the ones on screen
let refused = false;

const label = f => {
  if (!f.button) return;
  const paused = f.video.paused;
  f.button.setAttribute('aria-pressed', String(paused));
  f.button.setAttribute('aria-label', paused ? '動画を再生' : '動画を一時停止');
};
const sync = f => {
  const want = f.visible && !f.userPaused && !still;
  if (want && f.video.paused) {
    if (f.video.preload === 'none') f.video.preload = 'auto';
    f.video.play().then(() => label(f)).catch(() => { refused = true; label(f); });
  } else if (!want && !f.video.paused) {
    f.video.pause();
  }
  label(f);
};
films.forEach(f => {
  // muted and inline as properties too: iOS checks these before it lets a film start by itself
  f.video.muted = true;
  f.video.defaultMuted = true;
  f.video.playsInline = true;
  f.video.addEventListener('canplay', () => sync(f));
  f.video.addEventListener('pause', () => label(f));
  f.video.addEventListener('play', () => label(f));
  f.button?.addEventListener('click', () => {
    if (f.video.paused) {
      f.userPaused = false;
      if (still) setStill(false); else sync(f);
    } else {
      f.userPaused = true;
      f.video.pause();
    }
  });
});
if (films.length) {
  const seen = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const f = films.find(x => x.video === e.target);
      if (f) { f.visible = e.isIntersecting; sync(f); }
    });
  }, { threshold: 0.15 });
  films.forEach(f => seen.observe(f.video));
  const retry = () => { if (!refused) return; refused = false; films.forEach(sync); };
  ['touchend', 'click', 'keydown'].forEach(t => addEventListener(t, retry, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) films.forEach(sync); });
}

/* ---------------------------------------------------------------- the motion switch (footer) */
const motionToggle = document.querySelector('[data-motion-toggle]');
function setStill(on) {
  still = on;
  root.classList.toggle('is-still', on);
  store.set(STILL_KEY, on ? '1' : '0');
  if (motionToggle) {
    motionToggle.textContent = on ? '動きを再開する' : '動きを止める';
    motionToggle.setAttribute('aria-pressed', String(on));
  }
  films.forEach(sync);
}
motionToggle?.addEventListener('click', () => setStill(!still));
if (still) setStill(true);
