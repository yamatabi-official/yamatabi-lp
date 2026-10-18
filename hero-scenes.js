/* The original photo stays as the first scene and the no-JavaScript fallback. */
(() => {
  const hero = document.querySelector('.brand-home .hero');
  const controls = document.querySelector('.hero-scene-controls');
  if (!hero || !controls) return;
  const scenes = [...hero.querySelectorAll('[data-hero-scene]')];
  const buttons = [...controls.querySelectorAll('[data-hero-select]')];
  const toggle = controls.querySelector('.hero-scene-auto');
  const label = controls.querySelector('.hero-scene-label');
  const status = controls.querySelector('.hero-scene-status');
  const labels = ['山の写真 / YAMATABI', '草原の道 / 実写映像', '川辺のひととき / 実写映像', '夕方の稜線 / 実写映像'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let automatic = !motion.matches && !connection?.saveData;
  let current = 0;
  let visible = false;
  let timer;
  let revision = 0;
  const video = () => scenes[current - 1]?.querySelector('video');
  const clear = () => { clearTimeout(timer); timer = undefined; };
  const sync = () => {
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
    toggle.textContent = automatic || (video() && !video().paused) ? 'Ⅱ 再生・切替を停止' : '▶ 自動切替を開始';
    label.textContent = labels[current];
  };
  const pause = () => { clear(); scenes.forEach(scene => scene.querySelector('video').pause()); };
  const schedule = (delay = 6500) => {
    clear();
    if (automatic && visible && !document.hidden) timer = setTimeout(() => select((current + 1) % 4), delay);
  };
  const start = async () => {
    if (!visible || document.hidden) return;
    const target = video();
    if (!target) { schedule(); return; }
    const token = revision;
    if (!target.hasAttribute('src')) target.src = target.dataset.src;
    try {
      await target.play();
      if (token !== revision || !visible || document.hidden) target.pause();
      else if (automatic) schedule(9000); // Bound a stalled stream as well as a normal clip.
    } catch (error) {
      if (token !== revision || error.name === 'AbortError') return;
      automatic = false;
      status.textContent = '静止画を表示しています。自動切替を開始すると再生を試せます。';
      sync();
    }
  };
  const select = (index, manual = false) => {
    revision++;
    pause();
    current = index;
    if (manual) { hero.scrollIntoView({ block: 'start', behavior: 'instant' }); visible = true; }
    scenes.forEach(scene => scene.classList.toggle('hero-scene-active', Number(scene.dataset.heroScene) === index));
    status.textContent = '';
    sync();
    if (manual || automatic) void start();
  };
  scenes.forEach(scene => {
    const target = scene.querySelector('video');
    target.muted = true;
    target.addEventListener('play', sync);
    target.addEventListener('pause', sync);
    target.addEventListener('ended', () => {
      if (target === video() && automatic && visible) select((current + 1) % 4);
    });
    target.addEventListener('error', () => {
      if (target !== video()) return;
      automatic = false;
      select(0);
      status.textContent = '映像を読み込めなかったため、山の写真を表示しています。';
    });
  });
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index, true)));
  toggle.addEventListener('click', () => {
    if (automatic || (video() && !video().paused)) {
      automatic = false; pause();
    } else {
      automatic = true;
      if (video()?.ended) video().currentTime = 0;
      void start();
    }
    sync();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].intersectionRatio >= 0.4;
      if (!visible) { revision++; pause(); }
      else if (automatic) void start();
    }, { threshold: [0, 0.4, 1] });
    observer.observe(hero);
  } else {
    visible = true;
    automatic = false; // Keep old browsers manual-only.
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { revision++; pause(); }
    else if (automatic) void start();
  });
  const preferenceChanged = () => {
    if (motion.matches || connection?.saveData) { automatic = false; revision++; pause(); sync(); }
  };
  motion.addEventListener('change', preferenceChanged);
  connection?.addEventListener('change', preferenceChanged);
  controls.hidden = false;
  sync();
})();
