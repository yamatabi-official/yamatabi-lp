(() => {
  const form=document.querySelector('#mood-form'),data=window.YamatabiKamikochi;
  if(!form)return;
  if(!data){document.querySelector('#mood-status').textContent='提案を読み込めませんでした。下の一日の流れと短縮案をご覧いただけます。';return;}
  const result=document.querySelector('#mood-result'),status=document.querySelector('#mood-status');
  function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
  function render(focus=false){
    const mood=form.querySelector('input[name="mood"]:checked')?.value;
    const pace=form.querySelector('input[name="pace"]:checked')?.value;
    const rec=data.suggest(mood,pace);if(!rec)return;
    result.replaceChildren();
    const title=el('h3',rec.title);title.tabIndex=-1;
    result.append(el('p',`「${data.moods[mood].label}」の今に`,'eyebrow'),title,el('p',rec.reason),el('p',`${rec.label} ／ ${rec.distance}・${rec.time}（休憩を除く）`,'mood-route-facts'));
    const list=el('ol',null,'mood-route');rec.route.forEach(stop=>list.append(el('li',stop)));result.append(list,el('p',rec.pause));
    result.append(el('p','雪・凍結がなく園路・交通・施設が開いている通常期の散策案です。高低差や路面の詳細、混雑・利用可否は訪問前に確認してください。歩く範囲は、ご自身の体調と当日の状況に合わせて調整してください。','k-caption'));
    result.append(el('p','距離・歩行時間は公式区間目安の合計です。休憩や写真の時間は含みません。出典・確認日は下の「一日の流れ」に掲載しています。','k-caption'));
    const links=el('div',null,'mood-actions');
    const map=el('a','おすすめの場所をマップで見る ↑','source');map.href='#map-'+rec.place;map.dataset.mapTarget=rec.place;
    const plan=el('a','この過ごし方を計画にする ↗','journey-primary');const url=new URL('kamikochi-plan.html',location.href);url.searchParams.set('mood',mood);url.searchParams.set('walk',rec.walk);
    const day=new URL(location.href).searchParams.get('day');if(['solo','together','friends'].includes(day))url.searchParams.set('day',day);
    plan.href=url.href;links.append(map,plan);result.append(links);
    document.querySelectorAll('.story-map-pin').forEach(pin=>pin.classList.toggle('is-recommended',pin.hash==='#map-'+rec.place));
    result.hidden=false;status.textContent='今の気分と歩く量に合わせた提案を表示しました。';
    if(focus)title.focus({preventScroll:true});
  }
  form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())render(true);});
  const url=new URL(location.href),mood=url.searchParams.get('mood'),walk=url.searchParams.get('walk');
  if(Object.hasOwn(data.moods,mood)){form.querySelector(`input[name="mood"][value="${mood}"]`).checked=true;if(['short','standard'].includes(walk))form.querySelector(`input[name="pace"][value="${walk}"]`).checked=true;render();}
  form.hidden=false;
})();
