/* 社科智联 · 官网门户首页 交互脚本 */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast 轻提示 ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) { return; }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2400);
  }

  /* 占位链接：点击给轻提示 */
  $$('[data-toast]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      toast(el.getAttribute('data-toast'));
    });
  });

  /* ---------- 顶部导航：滚动态 ---------- */
  var header = $('#siteHeader');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 移动端抽屉 ---------- */
  var drawer = $('#drawer');
  var drawerMask = $('#drawerMask');
  var hamburger = $('#hamburger');
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawerMask.classList.toggle('is-visible', open);
    drawerMask.hidden = !open;
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  }
  hamburger.addEventListener('click', function () { setDrawer(true); });
  $('#drawerClose').addEventListener('click', function () { setDrawer(false); });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) { setDrawer(false); }
  });
  drawerMask.addEventListener('click', function () { setDrawer(false); });
  $$('a, button', drawer).forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(false); });
  });

  /* Esc 关闭抽屉 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setDrawer(false); }
  });

  /* ---------- 最新动态：空列表时隐藏模块 ---------- */
  var newsSection = $('#news');
  var newsStrip = $('#newsStrip');
  if (newsSection && newsStrip && !newsStrip.querySelector('.news-card')) {
    newsSection.hidden = true;
  }

  /* ---------- 入场动效 ---------- */
  var reveals = $$('.reveal');
  if (reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 数字增长 ---------- */
  if (!reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var el = en.target;
        countIO.unobserve(el);
        var target = Number(el.getAttribute('data-count') || '0') || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var dur = 900;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('zh-CN') + suffix;
          if (p < 1) { requestAnimationFrame(tick); }
        })(start);
      });
    }, { threshold: 0.4 });
    $$('.stat strong').forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- 导航高亮跟随（scrollspy） ---------- */
  var navLinks = $$('.nav-link');
  var spySections = $$('main section[id]').filter(function (s) {
    return navLinks.some(function (l) { return l.getAttribute('href') === '#' + s.id; });
  });
  var clickLocked = false;
  function updateSpy() {
    if (clickLocked) { return; }
    var line = Math.min(window.innerHeight * 0.55, 420);
    var current = null;
    var i, r;
    // 滚动到底部：选中最后一个导航模块（超高视口下最后模块无法滚过激活线）
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && spySections.length) {
      current = spySections[spySections.length - 1];
    } else {
      // 优先：横跨激活线的 section（当前可视区主体）
      for (i = 0; i < spySections.length; i++) {
        r = spySections[i].getBoundingClientRect();
        if (r.top <= line && r.bottom > line) { current = spySections[i]; break; }
      }
      // 兜底：激活线上方最靠下的 section
      if (!current) {
        for (i = 0; i < spySections.length; i++) {
          r = spySections[i].getBoundingClientRect();
          if (r.top <= line) { current = spySections[i]; }
        }
      }
    }
    navLinks.forEach(function (l) {
      l.classList.toggle('is-active', current !== null && l.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', updateSpy, { passive: true });
  // 点击导航项：立即高亮并锁定，直到用户手动滚动
  function highlightLink(l) {
    navLinks.forEach(function (x) { x.classList.toggle('is-active', x === l); });
  }
  navLinks.forEach(function (l) {
    l.addEventListener('click', function () {
      clickLocked = true;
      highlightLink(l);
    });
  });
  ['wheel', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      if (clickLocked) { clickLocked = false; updateSpy(); }
    }, { passive: true });
  });
  window.addEventListener('resize', function () { clickLocked = false; updateSpy(); });
  window.addEventListener('resize', updateSpy);
  updateSpy();

  /* ---------- Hero WebGL2 粒子背景 ---------- */
  var canvas = $('#heroCanvas');
  var gl = canvas && canvas.getContext('webgl2');
  if (!gl) {
    var hero = canvas && canvas.closest('.hero');
    if (hero) { hero.classList.add('no-webgl'); }
    return;
  }

  var VS = '#version 300 es\n' +
    'in vec2 a_pos;\n' +
    'uniform vec2 u_res;\n' +
    'uniform float u_size;\n' +
    'void main() {\n' +
    '  vec2 p = a_pos / u_res * 2.0 - 1.0;\n' +
    '  gl_Position = vec4(p, 0.0, 1.0);\n' +
    '  gl_PointSize = u_size;\n' +
    '}';
  var FS = '#version 300 es\n' +
    'precision mediump float;\n' +
    'uniform vec4 u_color;\n' +
    'out vec4 outColor;\n' +
    'void main() { outColor = u_color; }';

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  gl.useProgram(program);

  var aPos = gl.getAttribLocation(program, 'a_pos');
  var uRes = gl.getUniformLocation(program, 'u_res');
  var uColor = gl.getUniformLocation(program, 'u_color');
  var uSize = gl.getUniformLocation(program, 'u_size');

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  var LINK_DIST = 190;
  var COUNT = window.innerWidth < 768 ? 36 : 64;

  var pts = [];
  for (var i = 0; i < COUNT; i++) {
    pts.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12
    });
  }

  var buf = gl.createBuffer();
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width * dpr));
    H = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* 移动粒子 */
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx / W;
      p.y += p.vy / H;
      if (p.x < 0 || p.x > 1) { p.vx *= -1; }
      if (p.y < 0 || p.y > 1) { p.vy *= -1; }
    }

    /* 连线 */
    var linePts = [];
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = (pts[a].x - pts[b].x) * W;
        var dy = (pts[a].y - pts[b].y) * H;
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) { linePts.push(pts[a], pts[b]); }
      }
    }
    if (linePts.length) {
      var lineData = new Float32Array(linePts.length * 2);
      for (var l = 0; l < linePts.length; l++) {
        lineData[l * 2] = linePts[l].x * W;
        lineData[l * 2 + 1] = linePts[l].y * H;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPos);
      gl.uniform2f(uRes, W, H);
      gl.uniform4f(uColor, 0.13, 0.15, 0.17, 0.12);
      gl.uniform1f(uSize, 3.0);
      gl.drawArrays(gl.LINES, 0, linePts.length / 2);
    }

    /* 常规粒子点 */
    var pointData = new Float32Array(pts.length * 2);
    for (var c = 0; c < pts.length; c++) {
      pointData[c * 2] = pts[c].x * W;
      pointData[c * 2 + 1] = pts[c].y * H;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(uColor, 0.13, 0.15, 0.17, 0.45);
    gl.uniform1f(uSize, 3.0);
    gl.drawArrays(gl.POINTS, 0, pts.length);

    /* 橙色点缀 */
    var accData = new Float32Array(Math.ceil(pts.length / 4) * 2);
    var k = 0;
    for (var d = 0; d < pts.length; d++) {
      if (d % 4 === 0) {
        accData[k * 2] = pts[d].x * W;
        accData[k * 2 + 1] = pts[d].y * H;
        k++;
      }
    }
    if (k) {
      gl.bufferData(gl.ARRAY_BUFFER, accData, gl.DYNAMIC_DRAW);
      gl.uniform4f(uColor, 0.98, 0.51, 0.28, 0.7);
      gl.uniform1f(uSize, 6.0);
      gl.drawArrays(gl.POINTS, 0, k);
    }
  }

  if (reduceMotion) { draw(); }
  else { (function loop() { draw(); requestAnimationFrame(loop); })(); }
})();
















