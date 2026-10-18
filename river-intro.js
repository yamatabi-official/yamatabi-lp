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
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
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
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'river-intro-play';
  play.textContent = 'タップして梓川の映像を再生 ▶';
  play.hidden = true;
  const status = document.createElement('p');
  status.className = 'river-intro-status';
  status.setAttribute('role', 'status');
  intro.append(video, title, play, status, skip);
  const content = [...document.body.children].filter(n => ['HEADER', 'MAIN', 'FOOTER'].includes(n.tagName));
  const priorInert = content.map(n => n.inert);
  document.body.append(intro);
  content.forEach(n => { n.inert = true; });
  skip.focus({ preventScroll: true });
  let closed = false;
  let playTimer;
  let removalTimer;
  let readyTimer = setTimeout(showPlay, 4000);
  function showPlay() {
    if (closed) return;
    clearTimeout(readyTimer);
    play.hidden = false;
    status.textContent = '自動再生できない場合は、タップしてご覧ください。';
  }
  function requestPlay() {
    if (closed) return;
    try { video.play()?.catch(showPlay); } catch { showPlay(); }
  }
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
    clearTimeout(playTimer);
    content.forEach((n, i) => { n.inert = priorInert[i]; });
    const restoreFocus = intro.contains(document.activeElement);
    intro.classList.add('river-intro-leaving');
    intro.setAttribute('aria-hidden', 'true');
    skip.tabIndex = -1;
    play.tabIndex = -1;
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
  function onKey(e) {
    if (e.key === 'Escape') finish();
    if (e.key === 'Tab' && !closed) {
      e.preventDefault();
      (play.hidden || document.activeElement === play ? skip : play).focus();
    }
  }
  function onMotion() { if (motion.matches) finish(true); }
  skip.addEventListener('click', () => finish());
  play.addEventListener('click', () => {
    play.hidden = true;
    status.textContent = '映像を読み込んでいます。';
    clearTimeout(readyTimer);
    readyTimer = setTimeout(showPlay, 4000);
    requestPlay();
  });
  video.addEventListener('playing', () => {
    clearTimeout(readyTimer);
    if (closed) { video.pause(); return; }
    if (document.activeElement === play) skip.focus({ preventScroll: true });
    play.hidden = true;
    status.textContent = '';
    if (!playTimer) playTimer = setTimeout(() => finish(), 4000);
  });
  video.addEventListener('error', () => finish(), { once: true });
  video.addEventListener('ended', () => finish(), { once: true });
  document.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  window.addEventListener('pagehide', () => finish(true), { once: true });
  video.src = 'assets/kamikochi-river-intro.mp4?v=four-seconds';
  requestPlay();
}

startRiverIntro();
window.addEventListener('pageshow', event => {
  if (event.persisted) startRiverIntro();
});
