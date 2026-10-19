/* Pins and recommendation links open the same place descriptions. */
(() => {
  function show(id,focus=true){
    const detail=document.getElementById(id);if(!detail)return;
    if(detail.tagName==='DETAILS')detail.open=true;
    document.querySelectorAll('.story-map-pin').forEach(pin=>{
      if(pin.hash==='#'+id)pin.setAttribute('aria-current','location');else pin.removeAttribute('aria-current');
    });
    if(focus){(detail.querySelector('summary')||detail).focus({preventScroll:true});detail.scrollIntoView({block:'nearest',behavior:'instant'});}
  }
  document.querySelectorAll('.story-map-pin').forEach(pin=>pin.addEventListener('click',event=>{event.preventDefault();show(pin.hash.slice(1));}));
  document.addEventListener('click',event=>{const link=event.target.closest('[data-map-target]');if(!link)return;event.preventDefault();show('map-'+link.dataset.mapTarget,false);const pin=document.querySelector('.story-map-pin[href="#map-'+link.dataset.mapTarget+'"]');pin?.focus({preventScroll:true});document.querySelector('.story-map-board')?.scrollIntoView({block:'start',behavior:'instant'});});
  if(location.hash.startsWith('#map-'))show(location.hash.slice(1),false);
})();
