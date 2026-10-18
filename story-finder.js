/* Curated tags only: no external AI calls, generated works, or stored preferences. */
(() => {
  const form = document.querySelector('#story-finder-form');
  if (!form) return;
  const results = document.querySelector('#finder-results');
  const status = document.querySelector('#finder-status');
  const submit = form.querySelector('button');
  const moods = { calm: 'ひと息つきたい', romance: 'ときめきたい', inspired: '刺激がほしい', adventure: '冒険したい' };
  const experiences = { riverside: '川辺をのんびり歩く', scenery: '山の景色を眺める', summit: '山頂を目指す', camping: 'キャンプで過ごす' };
  let catalogue;
  const node = (tag, className, text) => {
    const n = document.createElement(tag);
    n.className = className;
    if (text) n.textContent = text;
    return n;
  };
  const localUrl = value => {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Missing local URL');
    const url = new URL(value, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) throw new Error('Invalid local URL');
    return url.href;
  };
  const load = async () => {
    if (catalogue) return catalogue;
    const response = await fetch('works.json');
    if (!response.ok) throw new Error('Cannot load catalogue');
    const works = await response.json();
    if (!Array.isArray(works)) throw new Error('Invalid catalogue');
    catalogue = works.map(work => {
      if (!work || typeof work.title !== 'string' || typeof work.description !== 'string') throw new Error('Invalid work');
      return { ...work, poster: localUrl(work.poster), detailUrl: localUrl(work.detailUrl),
        recommendation: work.recommendation ? { ...work.recommendation,
          experienceUrl: localUrl(work.recommendation.experienceUrl) } : null };
    });
    return catalogue;
  };
  form.hidden = false;
  load().then(works => {
    if (!form.hasAttribute('aria-busy') && results.hidden) {
      status.textContent = `現在公開中は${works.length}作品です。条件に一致しない場合も、その旨をお伝えします。`;
    }
  }).catch(() => {
    if (!form.hasAttribute('aria-busy')) status.textContent = '作品情報を取得できませんでした。選択して再度探すか、下の作品一覧をご覧ください。';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const mood = values.get('mood');
    const experience = values.get('experience');
    if (!moods[mood] || !experiences[experience]) return;
    submit.disabled = true;
    results.hidden = true;
    results.replaceChildren();
    status.textContent = '物語を探しています。';
    form.setAttribute('aria-busy', 'true');
    try {
      const works = await load();
      const ranked = works.map((work, index) => {
        const rec = work.recommendation;
        const moodMatch = Array.isArray(rec?.moods) && rec.moods.includes(mood);
        const experienceMatch = Array.isArray(rec?.experiences) && rec.experiences.includes(experience);
        return { work, index, moodMatch, experienceMatch, score: Number(moodMatch) + Number(experienceMatch) };
      }).sort((a, b) => b.score - a.score || a.index - b.index);
      const best = ranked[0]?.score || 0;
      const heading = node('h4', 'finder-result-heading', !works.length ? '公開中の作品はまだありません。'
        : best === 2 ? '今のあなたへ、この物語。'
        : best === 1 ? '選んだ条件のひとつに合う物語です。'
        : '選んだ条件に合う作品は、まだありません。');
      heading.tabIndex = -1;
      results.append(heading);
      results.append(node('p', 'finder-selection', `選んだ気分：${moods[mood]} ／ 体験：${experiences[experience]}`));
      const selected = ranked.filter(item => best ? item.score === best : true).slice(0, 3);
      if (!best && works.length) results.append(node('p', 'finder-explanation', '条件に合う提案ではありませんが、公開中の作品をご紹介します。'));
      selected.forEach(({ work, moodMatch, experienceMatch, score }) => {
        const card = node('article', 'finder-result-card');
        const image = document.createElement('img');
        image.src = work.poster;
        image.alt = `${work.title}の作品ビジュアル`;
        image.loading = 'lazy';
        image.width = 1152;
        image.height = 1536;
        const body = node('div', 'finder-result-body');
        body.append(node('span', 'finder-match-label', score === 2 ? '気分と体験の両方にマッチ' : score === 1 ? '一部の条件にマッチ' : '公開中の作品'));
        body.append(node('h5', '', work.title), node('p', '', work.description));
        const reasons = [];
        if (moodMatch) reasons.push(`「${moods[mood]}」という気分に合う作品として選びました。`);
        if (experienceMatch) reasons.push(`「${experiences[experience]}」のヒントを作品ページで見つけられます。`);
        if (score === 1) reasons.push(`「${moodMatch ? experiences[experience] : moods[mood]}」には一致していません。`);
        if (reasons.length) body.append(node('p', 'finder-reason', reasons.join('')));
        const detail = node('a', 'link', 'この物語を観る ↗');
        detail.href = work.detailUrl + (work.detailUrl.includes('#') ? '' : '#scene');
        body.append(detail);
        if (experienceMatch && typeof work.recommendation?.experienceTip === 'string') {
          body.append(node('p', 'finder-experience-tip', work.recommendation.experienceTip));
          const walk = node('a', 'finder-trip-link', 'この場所での過ごし方を見る ↗');
          walk.href = work.recommendation.experienceUrl;
          body.append(walk);
        }
        card.append(image, body);
        results.append(card);
      });
      status.textContent = `公開中${works.length}作品から、${selected.length}作品をご案内しています。`;
      results.hidden = false;
      heading.focus({ preventScroll: true });
      results.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } catch {
      status.textContent = '作品情報を読み込めませんでした。もう一度試すか、下の作品一覧をご覧ください。';
    } finally {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
