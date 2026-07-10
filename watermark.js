(function () {
  function inject() {
    if (document.getElementById('__es_watermark__')) return;
    var wrap = document.createElement('div');
    wrap.id = '__es_watermark__';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;user-select:none;" +
      "font:900 clamp(44px,7.5vw,120px)/1 'Helvetica Neue',Arial,sans-serif;" +
      "letter-spacing:.15em;color:rgba(120,120,120,.45);white-space:nowrap";
    ['10%', '50%', '90%'].forEach(function (top) {
      var s = document.createElement('span');
      s.style.cssText =
        'position:absolute;top:' + top + ';left:50%;' +
        'transform:translate(-50%,-50%) rotate(-45deg)';
      s.textContent = 'EUNSEON STUDIO';
      wrap.appendChild(s);
    });
    document.body.appendChild(wrap);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
