(function () {
  'use strict';
  const language = document.documentElement.lang;
  const copy = language.startsWith('zh')
    ? { loading: '加载中', unavailable: '暂不可用', cached: '缓存', failure: '访问统计服务暂时无法连接', saved: '上次记录：', online: '在线统计服务暂时无法连接' }
    : language === 'ja'
      ? { loading: '読込中', unavailable: '取得不可', cached: 'キャッシュ', failure: 'アクセス統計に接続できません', saved: '前回取得：', online: 'オンライン統計に接続できません' }
      : { loading: 'Loading', unavailable: 'Unavailable', cached: 'cached', failure: 'Visitor statistics temporarily unavailable', saved: 'Last recorded: ', online: 'Online statistics temporarily unavailable' };
  const ids = ['busuanzi_site_pv', 'busuanzi_site_uv', 'busuanzi_page_pv'];
  const nodes = ids.map(id => document.getElementById(id));
  const feedback = document.querySelector('[data-counter-feedback]');
  const storageKey = 'visitor-counts:busuanzi.cc:' + location.pathname;
  const valid = value => (typeof value === 'number' || typeof value === 'string') &&
    /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) >= 0;
  const validCounts = counts => counts && ids.every(id => valid(counts[id]));

  if (nodes.every(Boolean)) {
    nodes.forEach(node => { node.textContent = copy.loading; });
    // One count request per page load; retries could double-count a timed-out request.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    fetch('https://cdn.busuanzi.cc/api.php', {
      method: 'POST',
      body: JSON.stringify({ url: location.origin + location.pathname, referrer: document.referrer }),
      signal: controller.signal
    }).then(response => {
      if (!response.ok) throw new Error('Counter HTTP ' + response.status);
      return response.json();
    }).then(counts => {
      if (!validCounts(counts)) throw new Error('Invalid counter response');
      ids.forEach((id, i) => {
        nodes[i].textContent = Number(counts[id]).toLocaleString(language);
        nodes[i].title = 'busuanzi.cc';
      });
      if (feedback) feedback.textContent = '';
      try {
        localStorage.setItem(storageKey, JSON.stringify({ counts, savedAt: new Date().toISOString() }));
      } catch (_) { /* Storage can be disabled without affecting live counts. */ }
    }).catch(() => {
      let cached;
      try { cached = JSON.parse(localStorage.getItem(storageKey)); } catch (_) {}
      const usable = cached && validCounts(cached.counts) && Number.isFinite(Date.parse(cached.savedAt));
      nodes.forEach((node, i) => {
        node.textContent = usable ? Number(cached.counts[ids[i]]).toLocaleString(language) + ' (' + copy.cached + ')' : copy.unavailable;
        node.title = usable ? copy.saved + cached.savedAt : copy.failure;
      });
      if (feedback) feedback.textContent = copy.failure + (usable ? ' · ' + copy.saved + cached.savedAt : '');
    }).finally(() => clearTimeout(timeout));
  }

  const widget = document.querySelector('.visitor-online-widget');
  const status = document.querySelector('[data-online-status]');
  if (widget && status) {
    status.textContent = copy.loading;
    let timedOut = false;
    const inspect = function () {
      const link = widget.querySelector('a');
      const ready = Boolean(link && /\d/.test(link.textContent)) &&
        Array.from(widget.querySelectorAll('img')).every(img => img.complete && img.naturalWidth > 0);
      widget.hidden = !ready;
      status.hidden = ready;
      status.textContent = timedOut ? copy.unavailable : copy.loading;
      status.title = timedOut ? copy.online : '';
    };
    new MutationObserver(inspect).observe(widget, { childList: true, subtree: true, characterData: true });
    widget.addEventListener('load', inspect, true);
    widget.addEventListener('error', inspect, true);
    setTimeout(() => { timedOut = true; inspect(); }, 15000);
    inspect();
  }
})();
