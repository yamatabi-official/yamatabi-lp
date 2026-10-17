/* Ordinary anchor links and native details remain usable without JavaScript. */
document.querySelectorAll('.story-map-pin').forEach(pin => {
  pin.addEventListener('click', event => {
    const detail = document.getElementById(pin.hash.slice(1));
    if (!detail) return;
    event.preventDefault();
    detail.open = true;
    document.querySelectorAll('.story-map-pin').forEach(other => {
      other.removeAttribute('aria-current');
    });
    pin.setAttribute('aria-current', 'location');
    detail.querySelector('summary').focus({ preventScroll: true });
    detail.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
});
