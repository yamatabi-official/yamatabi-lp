(() => {
  const rail=document.querySelector('.k-replay-grid'),controls=document.querySelector('.k-replay-controls');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(rail&&controls){
    let paused=reduced.matches,visible=false,hover=false,focused=false,timer;
    controls.hidden=false;
    function step(direction=1){const cards=[...rail.children];const current=cards.reduce((best,c,i)=>Math.abs(c.offsetLeft-rail.offsetLeft-rail.scrollLeft)<Math.abs(cards[best].offsetLeft-rail.offsetLeft-rail.scrollLeft)?i:best,0);const next=(current+direction+cards.length)%cards.length;rail.scrollTo({left:cards[next].offsetLeft-rail.offsetLeft,behavior:reduced.matches?'instant':'smooth'});}
    function schedule(){clearInterval(timer);if(!paused&&!reduced.matches&&!document.hidden&&visible&&!hover&&!focused&&!rail.querySelector('details[open]'))timer=setInterval(()=>step(),3500);}
    controls.querySelector('[data-replay-prev]').addEventListener('click',()=>{paused=true;schedule();step(-1);});
    controls.querySelector('[data-replay-next]').addEventListener('click',()=>{paused=true;schedule();step();});
    rail.addEventListener('pointerdown',()=>{paused=true;schedule();});
    rail.addEventListener('mouseenter',()=>{hover=true;schedule();});rail.addEventListener('mouseleave',()=>{hover=false;schedule();});
    rail.addEventListener('focusin',()=>{focused=true;schedule();});rail.addEventListener('focusout',()=>setTimeout(()=>{focused=rail.contains(document.activeElement);schedule();},0));
    rail.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',schedule));
    document.addEventListener('visibilitychange',schedule);window.addEventListener('pagehide',()=>clearInterval(timer));window.addEventListener('pageshow',schedule);
    reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;schedule();});
    if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;schedule();},{threshold:.25}).observe(rail);

  }
  const weather=document.querySelector('.k-weather');if(!weather)return;
  const status=weather.querySelector('[data-weather-status]'),reading=weather.querySelector('.k-weather-reading'),time=weather.querySelector('[data-weather-time]'),refresh=weather.querySelector('[data-weather-refresh]');
  const endpoint='https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=36.249&lon=137.637&altitude=1500';
  function sky(code){if(code.includes('thunder'))return'雷を伴う予報';if(code.includes('sleet'))return'みぞれ';if(code.includes('snow'))return'雪';if(code.includes('rain'))return'雨';if(code.includes('fog'))return'霧';if(code.includes('partlycloudy'))return'晴れ時々くもり';if(code.includes('fair'))return'晴れ';if(code.includes('cloudy'))return'くもり';if(code.includes('clearsky'))return'快晴';return'天気の詳細は取得元へ';}
  let busy=false,last=0;
  async function load(){
    if(busy)return;busy=true;refresh.disabled=true;status.textContent='最新の天気を確認しています。';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch(endpoint,{signal:controller.signal,credentials:'omit'});if(!response.ok)throw Error('weather');const data=await response.json();const now=Date.now();const rows=data.properties?.timeseries;if(!Array.isArray(rows)||!rows.length)throw Error('format');
      const point=rows.reduce((a,b)=>Math.abs(Date.parse(a.time)-now)<Math.abs(Date.parse(b.time)-now)?a:b);
      const stamp=Date.parse(point.time),temp=point.data?.instant?.details?.air_temperature,code=point.data?.next_1_hours?.summary?.symbol_code||point.data?.next_6_hours?.summary?.symbol_code||'';
      if(!Number.isFinite(temp)||!Number.isFinite(stamp)||Math.abs(stamp-now)>3*3600000)throw Error('stale');
      weather.querySelector('[data-weather-temp]').textContent=`${temp.toFixed(1)}°C`;weather.querySelector('[data-weather-sky]').textContent=sky(code);reading.hidden=false;
      const fmt=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
      time.textContent=`対象：${fmt.format(stamp)}（日本時間）／取得：${fmt.format(now)}`;status.textContent='現在時刻に近い予報値';last=now;
    }catch{reading.hidden=true;time.textContent='';status.textContent='天気を取得できませんでした。下の公式リンクから最新情報をご確認ください。';}
    finally{clearTimeout(timeout);busy=false;refresh.disabled=false;}
  }
  refresh.addEventListener('click',load);
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){observer.disconnect();load();}});observer.observe(weather);}else load();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&last&&Date.now()-last>30*60000)load();});
})();
