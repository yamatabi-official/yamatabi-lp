function startRiverIntro() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || navigator.connection?.saveData || document.querySelector('.river-intro')) return;
  const previous = document.activeElement;
  const intro = document.createElement('div');
  intro.className = 'river-intro';
  intro.setAttribute('role', 'dialog');
  intro.setAttribute('aria-modal', 'true');
  intro.setAttribute('aria-label', '上高地の梓川から、物語へ');
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.poster = 'assets/kamikochi-river-intro.webp';
  video.setAttribute('aria-hidden', 'true');
  const title = document.createElement('p');
  title.className = 'river-intro-title';
  const label = document.createElement('span');
  label.textContent = 'YAMATABI / KAMIKOCHI';
  const name = document.createElement('strong');
  name.textContent = '秋の上高地';
  title.append(label, name);
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.textContent = 'スキップして作品ページへ ↗';
  intro.append(video, title, skip);
  const content = [...document.body.children].filter(n => ['HEADER', 'MAIN', 'FOOTER'].includes(n.tagName));
  const priorInert = content.map(n => n.inert);
  document.body.append(intro);
  content.forEach(n => { n.inert = true; });
  skip.focus({ preventScroll: true });
  let closed = false;
  let playTimer;
  let removalTimer;
  const readyTimer = setTimeout(() => finish(), 1600);
  const hardTimer = setTimeout(() => finish(), 4800);
  function cleanup() {
    video.pause();
    video.removeAttribute('src');
    video.load();
    intro.remove();
  }
  function finish(immediate = false) {
    if (closed) { if (immediate) { clearTimeout(removalTimer); cleanup(); } return; }
    closed = true;
    clearTimeout(readyTimer);
    clearTimeout(hardTimer);
    clearTimeout(playTimer);
    content.forEach((n, i) => { n.inert = priorInert[i]; });
    const restoreFocus = document.activeElement === skip;
    intro.classList.add('river-intro-leaving');
    intro.setAttribute('aria-hidden', 'true');
    skip.tabIndex = -1;
    video.pause();
    if (restoreFocus) {
      const target = previous && previous !== document.body ? previous : document.querySelector('h1');
      if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }
    if (immediate || motion.matches) cleanup();
    else removalTimer = setTimeout(cleanup, 650);
    document.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', onMotion);
  }
  function onKey(e) { if (e.key === 'Escape') finish(); if (e.key === 'Tab' && !closed) { e.preventDefault(); skip.focus(); } }
  function onMotion() { if (motion.matches) finish(true); }
  skip.addEventListener('click', () => finish());
  video.addEventListener('playing', () => {
    clearTimeout(readyTimer);
    if (!closed && !playTimer) playTimer = setTimeout(() => finish(), 2800);
  });
  video.addEventListener('error', () => finish(), { once: true });
  video.addEventListener('ended', () => finish(), { once: true });
  document.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  window.addEventListener('pagehide', () => finish(true), { once: true });
  video.src = 'assets/kamikochi-river-intro.mp4?v=source-quality';
  video.play()?.catch(() => finish());
}

startRiverIntro();
window.addEventListener('pageshow', event => {
  if (event.persisted) startRiverIntro();
});
