(function () {
  'use strict';
  const lang = document.documentElement.lang;
  const copy = lang.startsWith('zh') ? {
    baseline:'历史基数', cached:'上次记录', live:'历史基数 + 接入后增量；访客为跨服务估算，未去重',
    offline:'统计连接未完成，当前显示历史基数或上次记录', online:'连接中', failed:'未连接'
  } : lang === 'ja' ? {
    baseline:'過去の基準値', cached:'前回の記録', live:'過去の基準値＋導入後の増分。訪問者はサービス間の重複を含む推定値。',
    offline:'接続できないため基準値または前回値を表示', online:'接続中', failed:'未接続'
  } : {
    baseline:'Historical baseline', cached:'Last recorded', live:'Historical baseline + new counts; visitors are an estimate without cross-service deduplication',
    offline:'Counter not connected; displaying baseline or last recorded counts', online:'Connecting', failed:'Disconnected'
  };
  const base = {site_pv:318, site_uv:119};
  // Server snapshot taken once at migration, not per browser. Never synthesize visits locally.
  const anchor = {site_pv:1, site_uv:1};
  const key = 'visitor-counts:ibruce:2026-11-12:' + location.pathname;
  const fields = ['site_pv','site_uv','page_pv'];
  const nodes = fields.map(field => document.getElementById('busuanzi_' + field));
  const feedback = document.querySelector('[data-counter-feedback]');
  const valid = n => Number.isSafeInteger(n) && n >= 0;
  function show(counts, label) {
    nodes.forEach((node, i) => { if(node) { node.textContent = valid(counts[fields[i]]) ? counts[fields[i]].toLocaleString(lang) : '—'; node.title = label; }});
    if(feedback) feedback.textContent = label;
  }
  let last = base;
  try { const cached = JSON.parse(localStorage.getItem(key)); if(cached && fields.every(k => valid(cached[k]))) last = cached; } catch (_) {}
  show(last, last === base ? copy.baseline + ': Views 318 · Visitors 119' : copy.cached);
  const isLive = location.hostname === 'zxhuizhang.github.io';
  if (isLive) {
    const script = document.createElement('script');
    let finished = false;
    const timer = setTimeout(fail, 15000);
    function fail() { if(finished) return; finished=true; show(last,copy.offline); }
    window.siteVisitorCount = function(data) {
      if(finished) return;
      if(!data || !fields.every(k => valid(data[k]))) { fail(); return; }
      // A provider reset cannot be interpreted as a new positive increment.
      if(data.site_pv < anchor.site_pv || data.site_uv < anchor.site_uv) { fail(); return; }
      finished=true; clearTimeout(timer);
      const counts = {site_pv:base.site_pv + data.site_pv-anchor.site_pv, site_uv:base.site_uv + data.site_uv-anchor.site_uv, page_pv:data.page_pv};
      show(counts,copy.live);
      try {localStorage.setItem(key,JSON.stringify(counts));} catch (_) {}
      script.remove();
    };
    script.src='https://busuanzi.ibruce.info/busuanzi?jsonpCallback=siteVisitorCount';
    script.referrerPolicy='no-referrer-when-downgrade';
    script.onerror=fail;
    document.head.appendChild(script);
  }
  const widget=document.querySelector('.visitor-online-widget');
  const status=document.querySelector('[data-online-status]');
  if(widget && status) {
    let expired=false;
    function inspect() {
      const pictures=Array.from(widget.querySelectorAll('img'));
      const link=widget.querySelector('a');
      const ready=pictures.some(img=>img.complete && img.naturalWidth>0) || Boolean(link && /\d/.test(link.textContent));
      widget.hidden=!ready; status.hidden=ready;
      status.textContent=expired ? copy.failed : copy.online;
    }
    new MutationObserver(inspect).observe(widget,{childList:true,subtree:true,characterData:true});
    widget.addEventListener('load',inspect,true); widget.addEventListener('error',inspect,true);
    setTimeout(()=>{expired=true;inspect();},15000); inspect();
  }
})();
