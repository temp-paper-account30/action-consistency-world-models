// Builds the video galleries from window.MEDIA. Renders nothing without it.
(function () {
  'use strict';
  var M = window.MEDIA || {}, S = M.sections || {}, PANELS = M.panels || [];
  var noop = function () {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Load on first sight, play while visible, pause when out of view.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (!e.isIntersecting) return v.pause();
      if (!v.src) v.src = v.dataset.file;
      v.play().catch(noop);
    });
  }, { rootMargin: '100px' });

  function clip(c) {
    var box = el('div', 'clip'), v = el('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('playsinline', '');
    v.poster = c.poster;
    if (c.width && c.height) {
      v.width = c.width; v.height = c.height;
      v.style.aspectRatio = c.width + ' / ' + c.height;
    }
    v.dataset.file = c.file;
    v.onclick = function () { v.paused ? v.play().catch(noop) : v.pause(); };
    io.observe(v);
    box.appendChild(v);
    if (c.label) box.appendChild(el('div', 'cap', c.label));
    return box;
  }

  // Optional heading and a Replay button, optional panel-name row, then the grid of clips.
  function gallery(host, clips, panels, heading) {
    var bar = host.appendChild(el('div', 'bar'));
    if (heading) bar.appendChild(el('h3', null, heading));
    bar.appendChild(el('button', null, 'Replay')).onclick = function () {
      var vs = host.querySelectorAll('video[src]');
      vs.forEach(function (v) { v.pause(); v.currentTime = 0; });
      vs.forEach(function (v) { v.play().catch(noop); });
    };
    if (panels && panels.length) {
      var row = host.appendChild(el('div', 'panels')).appendChild(el('div'));
      row.style.gridTemplateColumns = 'repeat(' + panels.length + ', 1fr)';
      panels.forEach(function (p) { row.appendChild(el('span', null, p)); });
    }
    var g = host.appendChild(el('div', 'grid'));
    clips.forEach(function (c) { g.appendChild(clip(c)); });
  }

  // A section has either clips or groups of clips (each group gets its own gallery).
  document.querySelectorAll('.gallery[data-section]').forEach(function (host) {
    var sec = S[host.dataset.section] || {}, panels = 'panels' in host.dataset && PANELS;
    if (sec.clips && sec.clips.length) gallery(host, sec.clips, panels);
    (sec.groups || []).forEach(function (g) {
      if (g.clips && g.clips.length) gallery(host.appendChild(el('div', 'group')), g.clips, panels, g.label);
    });
  });
})();
