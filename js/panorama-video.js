(function () {
  'use strict';
  var banner = document.querySelector('.site-panorama');
  var video = document.querySelector('.panorama-screen video');
  var toggle = document.querySelector('.panorama-motion');
  var dialog = document.querySelector('#liposome-dialog');
  if (!banner || !video || !toggle || !dialog) return;
  var enlarged = dialog.querySelector('video');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var wanted = !reduced.matches, inView = true, opener;
  function load(target) {
    var source = target.querySelector('source');
    if (!source.hasAttribute('src')) { source.src = source.dataset.src; target.load(); }
  }
  function label() {
    toggle.textContent = video.paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel;
  }
  function reconcile() {
    if (wanted && inView && !document.hidden && !dialog.open) {
      load(video);
      video.muted = true;
      var promise = video.play();
      if (promise) promise.catch(label);
    } else video.pause();
    label();
  }
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  toggle.addEventListener('click', function () { wanted = video.paused; reconcile(); });
  document.querySelectorAll('[data-liposome-open]').forEach(function (button) {
    button.addEventListener('click', function () {
      opener = button;
      dialog.showModal();
      video.pause(); load(enlarged);
      // Opening is an explicit playback request, including with reduced motion enabled.
      enlarged.play().catch(function () {});
    });
  });
  dialog.querySelector('[data-liposome-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () { enlarged.pause(); reconcile(); if (opener) opener.focus(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) enlarged.pause(); reconcile(); });
  reduced.addEventListener('change', function () { wanted = !reduced.matches; reconcile(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting; reconcile();
  }, { threshold: 0.05 }).observe(banner);
  reconcile();
}());
