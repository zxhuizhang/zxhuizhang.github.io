(function () {
  const clockNodes = document.querySelectorAll('[data-beijing-time]');
  if (!clockNodes.length) return;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const updateClock = function () {
    const parts = {};
    formatter.formatToParts(new Date()).forEach(function (part) {
      parts[part.type] = part.value;
    });
    const text = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
    clockNodes.forEach(function (node) {
      node.textContent = text;
    });
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  document.addEventListener('click', function (event) {
    document.querySelectorAll('.visitor-globe[open]').forEach(function (panel) {
      if (!panel.contains(event.target)) {
        panel.removeAttribute('open');
      }
    });
  });
})();
