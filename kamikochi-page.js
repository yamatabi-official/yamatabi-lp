(() => {
  const hero = document.querySelector('.detail-hero');
  const heroFilm = document.querySelector('#hero-film');
  const heroPlay = document.querySelector('[data-hero-play]');
  if (hero && heroFilm && heroPlay) {
    const image = hero.querySelector('.film-hero-image img');
    const tools = hero.querySelector('.hero-inline-tools');
    const sound = hero.querySelector('[data-hero-sound]');
    const captions = hero.querySelector('[data-hero-captions]');
    const status = hero.querySelector('.hero-film-status');
    function syncSound() {
      sound.textContent = heroFilm.muted ? '音を聴く' : '音を消す';
      sound.setAttribute('aria-pressed', String(!heroFilm.muted));
    }
    function syncCaptions() {
      const on = heroFilm.textTracks[0]?.mode === 'showing';
      captions.textContent = on ? '説明字幕を隠す' : '説明字幕を表示';
      captions.setAttribute('aria-pressed', String(on));
    }
    heroFilm.defaultMuted = true;
    heroPlay.addEventListener('click', event => {
      event.preventDefault();
      document.querySelectorAll('video,audio').forEach(media => { if (media !== heroFilm) media.pause(); });
      hero.classList.add('hero-has-video'); heroPlay.setAttribute('aria-expanded', 'true'); image.hidden = true; heroFilm.hidden = false; tools.hidden = false;
      status.textContent = '';
      if (heroFilm.ended) heroFilm.currentTime = 0;
      heroFilm.play()?.catch(() => { status.textContent = '再生できない場合は、動画の再生ボタンをお試しください。下の通常プレーヤーからもご覧いただけます。'; });
      heroFilm.focus({ preventScroll: true });
      if (matchMedia('(max-width:760px)').matches) hero.querySelector('.film-hero-image').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    heroFilm.addEventListener('play', () => { document.querySelectorAll('video,audio').forEach(media => { if (media !== heroFilm) media.pause(); }); });
    heroFilm.addEventListener('volumechange', syncSound);
    heroFilm.textTracks.addEventListener('change', syncCaptions);
    sound.addEventListener('click', () => { heroFilm.muted = !heroFilm.muted; syncSound(); });
    captions.addEventListener('click', () => {
      const track = heroFilm.textTracks[0];
      if (track) track.mode = track.mode === 'showing' ? 'disabled' : 'showing';
      syncCaptions();
    });
    hero.querySelector('[data-hero-close]').addEventListener('click', () => {
      heroFilm.pause(); heroFilm.muted = true; syncSound();
      heroFilm.hidden = true; image.hidden = false; tools.hidden = true;
      hero.classList.remove('hero-has-video'); heroPlay.setAttribute('aria-expanded', 'false');
      heroPlay.focus({ preventScroll: true }); hero.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    heroFilm.addEventListener('error', () => { status.textContent = '作品を読み込めませんでした。映像を閉じて、下の通常プレーヤーやInstagramからご覧ください。'; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) heroFilm.pause(); });
    window.addEventListener('pagehide', () => heroFilm.pause());
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) heroFilm.pause(); }).observe(heroFilm);
  }
  const video = document.querySelector('[data-replay-video]');
  const play = document.querySelector('[data-river-play]');
  if (video && play) {
    play.hidden = false;
    const status = document.querySelector('[data-river-status]');
    function sync() { play.textContent = video.paused ? '流れを眺める ▶' : '立ち止まる ⏸'; }
    play.addEventListener('click', () => {
      if (!video.paused) { video.pause(); return; }
      document.querySelectorAll('video,audio').forEach(other => { if (other !== video) other.pause(); });
      video.muted = true;
      if (!video.hasAttribute('src')) video.src = 'assets/kamikochi-river-intro.mp4?v=full-film';
      video.play()?.catch(() => { status.textContent = '再生できませんでした。写真のまま眺めるか、動画の再生ボタンからお試しください。'; });
    });
    video.addEventListener('play', () => { document.querySelectorAll('video,audio').forEach(other => { if (other !== video) other.pause(); }); sync(); });
    video.addEventListener('pause', sync);
    video.addEventListener('error', () => { status.textContent = '動画を読み込めませんでした。写真の風景はそのまま楽しめます。'; });
    document.querySelector('#replay-river').addEventListener('toggle', event => { if (!event.target.open) video.pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
    window.addEventListener('pagehide', () => video.pause());
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) video.pause(); }, { threshold: 0 }).observe(video);
  }
  const trees = document.querySelector('[data-tree-toggle]');
  if (trees) {
    trees.hidden = false;
    trees.addEventListener('click', () => {
      const selected = trees.getAttribute('aria-pressed') !== 'true';
      trees.setAttribute('aria-pressed', String(selected));
      trees.textContent = selected ? '全体の眺めに戻す' : '木々を大きく見る';
      document.querySelector('[data-tree-view]').classList.toggle('is-close', selected);
    });
  }
  // Preserve existing shared companion links without adding personal fields to the URL.
  const day = new URL(location.href).searchParams.get('day');
  if (['solo', 'together', 'friends'].includes(day)) document.querySelectorAll('[data-plan-link]').forEach(link => {
    const url = new URL(link.href); url.searchParams.set('day', day); link.href = url.href;
  });
})();
