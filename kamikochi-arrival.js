/* A short visual greeting, never a required step or an audio gate. */
(() => {
  function start(){
    if(location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData||document.querySelector('.k-river-arrival'))return;
    const cover=document.createElement('div');cover.className='k-river-arrival';cover.setAttribute('aria-hidden','true');
    const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.autoplay=true;video.playsInline=true;
    video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
    video.poster='assets/kamikochi-river-intro.webp';video.preload='auto';cover.append(video);document.body.append(cover);
    let ended=false,removal;const timers=[];
    function clear(){video.pause();video.removeAttribute('src');video.load();cover.remove();}
    function finish(immediate=false){
      if(ended){if(immediate){clearTimeout(removal);clear();}return;}ended=true;timers.forEach(clearTimeout);
      document.removeEventListener('pointerdown',tap,true);document.removeEventListener('keydown',key);
      document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leave);
      cover.classList.add('is-leaving');video.pause();document.dispatchEvent(new Event('kamikochi:arrivalend'));if(immediate)clear();else removal=setTimeout(clear,450);
    }
    function tap(event){if(event.target===cover||cover.contains(event.target))event.preventDefault();finish(true);}function key(event){if(event.key==='Escape'||event.key==='Tab')finish(true);}function leave(){finish(true);}function visibility(){if(document.hidden)finish(true);}
    document.addEventListener('pointerdown',tap,true);document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);
    video.addEventListener('playing',()=>{if(ended){video.pause();return;}timers.push(setTimeout(()=>finish(),1800));},{once:true});
    video.addEventListener('error',()=>finish(),{once:true});timers.push(setTimeout(()=>finish(),2800));
    video.src='assets/kamikochi-arrival.mp4';video.play()?.catch(()=>finish());
  }
  start();window.addEventListener('pageshow',event=>{if(event.persisted)start();});
})();
