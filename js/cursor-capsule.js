(function () {
  'use strict';
  var preference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  var dispose;

  function sync() {
    if (dispose) { dispose(); dispose = null; }
    if (!preference.matches) return;
    var capsule = document.createElement('div');
    capsule.className = 'cursor-capsule';
    capsule.setAttribute('aria-hidden', 'true');
    capsule.innerHTML = '<span class="cursor-capsule__body"><i></i><i></i><b></b></span>';
    document.body.appendChild(capsule);
    var frame = 0, timer = 0, x = 0, y = 0, targetX = 0, targetY = 0, visible = false;
    function animate() {
      x += (targetX - x) * 0.3;
      y += (targetY - y) * 0.3;
      capsule.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2) frame = requestAnimationFrame(animate);
      else frame = 0;
    }
    function move(event) {
      if (event.pointerType && event.pointerType !== 'mouse') { hide(); return; }
      targetX = Math.max(4, Math.min(event.clientX + 20, window.innerWidth - 54));
      targetY = Math.max(4, Math.min(event.clientY + 22, window.innerHeight - 42));
      if (!visible) { x = targetX; y = targetY; visible = true; capsule.classList.add('is-visible'); }
      capsule.classList.toggle('is-hovering', Boolean(event.target.closest && event.target.closest('a,button,summary,input,select,textarea,[role="button"]')));
      if (!frame) frame = requestAnimationFrame(animate);
    }
    function open(event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      move(event);
      capsule.classList.add('is-open');
      clearTimeout(timer);
      timer = setTimeout(function () { capsule.classList.remove('is-open'); }, 650);
    }
    function hide() {
      visible = false;
      capsule.classList.remove('is-visible', 'is-open', 'is-hovering');
      cancelAnimationFrame(frame); frame = 0;
      clearTimeout(timer);
    }
    function visibility() { if (document.hidden) hide(); }
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', open, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    dispose = function () {
      hide(); capsule.remove();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerdown', open);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
    };
  }
  preference.addEventListener('change', sync);
  sync();
}());
