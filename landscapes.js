/* Curated atmosphere clips, separate from finished films in works.json. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const automatic = () => 'IntersectionObserver' in window && !motion.matches && !connection?.saveData;
  const states = [...document.querySelectorAll('[data-landscape]')].map(card => ({
    card, video: card.querySelector('video'), button: card.querySelector('button'),
    status: card.querySelector('[role="status"]'), ratio: 0, userPaused: false,
    failed: false, blocked: false, pending: false
  }));
  if (!states.length) return;
  let preferred;
  const pause = state => { if (!state.video.paused) state.video.pause(); };
  const play = async (state, manual = false) => {
    if (state.failed || state.pending || !state.video.paused) return;
    state.pending = true;
    if (manual) { state.userPaused = false; state.blocked = false; preferred = state; }
    if (!state.video.hasAttribute('src')) state.video.src = state.video.dataset.src;
    try {
      await state.video.play();
      if (document.hidden || state.ratio < 0.5) pause(state);
    } catch (error) {
      if (error.name !== 'AbortError') {
        state.blocked = true;
        if (!state.failed) state.status.textContent = '再生ボタンから映像をご覧いただけます。';
      }
    } finally {
      state.pending = false;
      if (state.video.paused && !state.failed && !state.blocked && !state.userPaused
          && !document.hidden && state.ratio >= 0.5 && automatic()) update();
    }
  };
  const update = () => {
    const externalPlaying = [...document.querySelectorAll('video')].some(video =>
      !video.paused && !states.some(state => state.video === video));
    const visible = states.filter(s => s.ratio >= 0.5).sort((a, b) => b.ratio - a.ratio);
    const active = preferred?.ratio >= 0.5 ? preferred : visible[0];
    states.forEach(state => {
      if (document.hidden || state !== active || externalPlaying) pause(state);
      else if (automatic() && !state.userPaused && !state.blocked) void play(state);
    });
  };
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        states.find(state => state.video === entry.target).ratio = entry.intersectionRatio;
      });
      update();
    }, { threshold: [0, 0.5, 0.75, 1] });
  }
  states.forEach(state => {
    state.video.muted = true;
    state.button.hidden = false;
    if (observer) observer.observe(state.video);
    else state.ratio = 1; // Manual-only fallback for older browsers.
    state.button.addEventListener('click', () => {
      if (state.video.paused) void play(state, true);
      else { state.userPaused = true; pause(state); }
    });
    state.video.addEventListener('play', () => {
      state.button.textContent = 'Ⅱ 一時停止';
      state.button.setAttribute('aria-label', `${state.card.querySelector('h4').textContent}の映像を一時停止`);
      state.button.setAttribute('aria-pressed', 'true');
      state.status.textContent = '';
    });
    state.video.addEventListener('pause', () => {
      state.button.textContent = '▶ 再生';
      state.button.setAttribute('aria-label', `${state.card.querySelector('h4').textContent}の映像を再生`);
      state.button.setAttribute('aria-pressed', 'false');
    });
    state.video.addEventListener('error', () => {
      state.failed = true;
      state.card.classList.add('landscape-failed');
      state.button.hidden = true;
      state.status.textContent = '映像を読み込めなかったため、静止画を表示しています。';
    });
  });
  // Finished films and atmosphere clips share a single playback budget.
  document.addEventListener('play', event => {
    if (!(event.target instanceof HTMLVideoElement) || event.target.paused) return;
    const heroScene = event.target.closest('[data-hero-scene]');
    if (heroScene && !heroScene.classList.contains('hero-scene-active')) {
      event.target.pause();
      return;
    }
    document.querySelectorAll('video').forEach(video => {
      if (video !== event.target && !video.paused) video.pause();
    });
  }, true);
  document.addEventListener('pause', event => {
    if (event.target instanceof HTMLVideoElement && !states.some(state => state.video === event.target)) {
      queueMicrotask(update);
    }
  }, true);
  document.addEventListener('visibilitychange', update);
  const preferenceChanged = () => {
    if (!automatic()) states.forEach(pause);
    else update();
  };
  motion.addEventListener('change', preferenceChanged);
  connection?.addEventListener('change', preferenceChanged);
})();
