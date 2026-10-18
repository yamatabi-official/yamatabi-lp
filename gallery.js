/* Static hosting only: work metadata can later come from a CMS at this boundary. */
(async () => {
  const track = document.querySelector('#reel-track');
  const notice = document.querySelector('#reel-notice');
  const fallback = document.querySelector('#reel-fallback');
  notice.textContent = '作品を読み込んでいます。';
  const previous = document.querySelector('#reel-prev');
  const next = document.querySelector('#reel-next');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const automaticPlaybackAllowed = () => !reducedMotion.matches && !connection?.saveData;
  const states = [];
  let observer;

  const localUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Missing work URL');
    const url = new URL(value, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) {
      throw new Error('Work URLs must use this site');
    }
    return url.href;
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const pause = (state) => {
    if (!state.video.paused) {
      state.automaticPause = true;
      state.video.pause();
    }
  };
  const play = async (state, manual = false) => {
    if (state.pending || state.failed || !state.video.paused) return;
    state.pending = true;
    if (manual) {
      state.userPaused = false;
      state.blocked = false;
    }
    if (!state.video.hasAttribute('src')) state.video.src = state.source;
    try {
      await state.video.play();
      if (document.hidden || state.ratio < 0.5) pause(state);
    } catch (error) {
      // A visibility change can interrupt a pending play without being a policy rejection.
      if (error.name !== 'AbortError') {
        state.blocked = true;
        if (!state.failed) state.status.textContent = '再生ボタンを押してご覧ください。';
      }
    } finally {
      state.pending = false;
      // A rapid tab switch may return before the interrupted play promise settles.
      if (state.video.paused && !state.blocked && !state.failed && !state.userPaused
          && !document.hidden && state.ratio >= 0.5 && automaticPlaybackAllowed()) {
        updatePlayback();
      }
    }
  };
  const updatePlayback = () => {
    const visible = states.filter(s => s.ratio >= 0.5).sort((a, b) => b.ratio - a.ratio)[0];
    states.forEach(state => {
      if (document.hidden || state !== visible) pause(state);
      else if (automaticPlaybackAllowed() && !state.userPaused && !state.blocked) {
        void play(state);
      }
    });
  };
  const updateNavigation = () => {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };

  try {
    const response = await fetch('works.json');
    if (!response.ok) throw new Error('Cannot load works');
    const works = await response.json();
    if (!Array.isArray(works) || !works.length) throw new Error('No works');
    // Validate everything before rendering so malformed data leaves the fallback intact.
    const ids = new Set();
    const validated = works.map(work => {
      if (!work || !['id', 'title', 'location', 'description'].every(key =>
        typeof work[key] === 'string' && work[key].trim()) || ids.has(work.id)) {
        throw new Error('Invalid work metadata');
      }
      ids.add(work.id);
      return { ...work, video: localUrl(work.video), poster: localUrl(work.poster),
        detailUrl: localUrl(work.detailUrl) };
    });
    const fragment = document.createDocumentFragment();
    validated.forEach((work, index) => {
      const card = element('article', 'reel-card');
      const player = element('div', 'reel-player');
      const video = document.createElement('video');
      video.controls = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.poster = work.poster;
      video.setAttribute('aria-label', `${work.title} ショートドラマ`);
      const button = element('button', 'reel-toggle', '▶ 再生');
      button.type = 'button';
      button.setAttribute('aria-label', `${work.title}を再生`);
      const status = element('p', 'reel-status');
      status.setAttribute('role', 'status');
      const meta = element('div', 'reel-meta');
      const detail = element('a', 'link', '物語の世界を、自分の休日へ ↗');
      detail.href = work.detailUrl;
      meta.append(element('div', 'eyebrow', `FILM ${String(index + 1).padStart(3, '0')}`),
        element('h3', '', work.title), element('p', 'reel-location', `舞台：${work.location}`),
        element('p', '', work.description), detail);
      player.append(video);
      card.append(player, button, status, meta);
      const state = { video, card, button, status, source: work.video,
        ratio: 0, userPaused: false, automaticPause: false, pending: false,
        blocked: false, failed: false };
      states.push(state);
      button.addEventListener('click', () => {
        if (video.paused) void play(state, true);
        else {
          state.userPaused = true;
          video.pause();
        }
      });
      video.addEventListener('play', () => {
        states.forEach(other => { if (other !== state) pause(other); });
        if (document.hidden || state.ratio < 0.5) pause(state);
        button.textContent = 'Ⅱ 一時停止';
        button.setAttribute('aria-label', `${work.title}を一時停止`);
        status.textContent = '';
      });
      video.addEventListener('pause', () => {
        if (!state.automaticPause) state.userPaused = true;
        state.automaticPause = false;
        button.textContent = '▶ 再生';
        button.setAttribute('aria-label', `${work.title}を再生`);
      });
      video.addEventListener('error', () => {
        state.failed = true;
        button.disabled = true;
        button.textContent = '再生できません';
        button.setAttribute('aria-label', `${work.title}を再生できません`);
        status.textContent = '動画を読み込めませんでした。作品ページからもご覧いただけます。';
      });
      fragment.append(card);
    });
    track.append(fragment);
    document.querySelector('#reel-count').textContent = `${states.length}作品`;
    document.querySelector('#reel-navigation').hidden = states.length < 2;
    notice.textContent = automaticPlaybackAllowed()
      ? '表示中の作品をミュートで自動再生します。音声は動画の操作ボタンで切り替えられます。'
      : '再生ボタンを押すと動画を読み込みます。';
    fallback.hidden = true;
    if ('IntersectionObserver' in window) {
      // Observe the player, not the entire tall card, so small screens can reach the threshold.
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const state = states.find(s => s.video === entry.target);
          state.ratio = entry.intersectionRatio;
        });
        updatePlayback();
      }, { threshold: [0, 0.5, 0.75, 1] });
      states.forEach(state => observer.observe(state.video));
    } else {
      states.forEach(state => { state.ratio = 1; });
      // Older browsers keep manual playback and never eagerly fetch video.
    }
    document.addEventListener('visibilitychange', updatePlayback);
    reducedMotion.addEventListener('change', () => {
      if (!automaticPlaybackAllowed()) states.forEach(pause);
      else updatePlayback();
    });
    connection?.addEventListener('change', () => {
      if (!automaticPlaybackAllowed()) states.forEach(pause);
      else updatePlayback();
    });
    const move = direction => track.scrollBy({ left: direction *
      (states[0].card.getBoundingClientRect().width + 24),
      behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener('scroll', updateNavigation, { passive: true });
    new ResizeObserver(updateNavigation).observe(track);
    updateNavigation();
  } catch {
    notice.textContent = '作品一覧を読み込めませんでした。作品ページからご覧ください。';
  }
})();
