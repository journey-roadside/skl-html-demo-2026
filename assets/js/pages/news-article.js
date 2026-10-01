/* 官方资讯 · 文章详情：按 ?id= 从 assets/js/news-data.js 取文章并渲染正文 */
(function () {
  'use strict';

  var NEWS = window.SKNews || [];
  var titleEl = document.querySelector('[data-article-title]');
  var dateEl = document.querySelector('[data-article-date]');
  var authorEl = document.querySelector('[data-article-author]');
  var bodyEl = document.querySelector('[data-article-body]');
  var prevLink = document.querySelector('[data-article-prev]');
  var prevLabel = document.querySelector('[data-article-prev-label]');
  var prevTitle = document.querySelector('[data-article-prev-title]');
  var nextLink = document.querySelector('[data-article-next]');
  var nextLabel = document.querySelector('[data-article-next-label]');
  var nextTitle = document.querySelector('[data-article-next-title]');
  if (!titleEl || !dateEl || !bodyEl) { return; }

  var id = Number(new URLSearchParams(location.search).get('id'));
  var article = NEWS.filter(function (item) { return item.id === id; })[0];

  /* 链接失效或直接输入地址：回列表页 */
  if (!article) {
    location.replace('./news.html');
    return;
  }

  document.title = article.title + ' · 湖北社科数据信息联盟';
  titleEl.textContent = article.title;
  dateEl.dateTime = article.date;
  dateEl.textContent = article.date;
  if (authorEl) { authorEl.textContent = article.author || ''; }

  /* 列表按日期倒序：上一篇是更新的一篇，下一篇是更早的一篇。
     首篇 / 末篇空出来的一侧改放「返回资讯首页」，卡片样式不变 */
  function fillNav(link, labelSpan, titleSpan, item, fallbackLabel) {
    if (!link || !titleSpan) { return; }
    if (item) {
      link.href = './news-article.html?id=' + item.id;
      titleSpan.textContent = item.title;
      titleSpan.hidden = false;
    } else {
      /* 返回首页只有一行：标题行连元素一起收起，否则它的上外边距会把文字顶偏 */
      link.href = './news.html';
      if (labelSpan) { labelSpan.textContent = fallbackLabel; }
      titleSpan.textContent = '';
      titleSpan.hidden = true;
    }
    link.hidden = false;
  }
  var idx = NEWS.indexOf(article);
  fillNav(prevLink, prevLabel, prevTitle, idx > 0 ? NEWS[idx - 1] : null, '← 返回资讯首页');
  fillNav(nextLink, nextLabel, nextTitle, idx < NEWS.length - 1 ? NEWS[idx + 1] : null, '返回资讯首页 →');

  var frag = document.createDocumentFragment();
  article.body.forEach(function (block) {
    var el;
    if (block.type === 'h2') {
      el = document.createElement('h2');
      el.textContent = block.text;
      frag.appendChild(el);
      return;
    }
    if (block.type === 'img') {
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.src = block.src;
      img.alt = block.caption || '';
      img.loading = 'lazy';
      fig.appendChild(img);
      if (block.caption) {
        var cap = document.createElement('figcaption');
        cap.textContent = block.caption;
        fig.appendChild(cap);
      }
      frag.appendChild(fig);
      return;
    }
    el = document.createElement('p');
    el.textContent = block.text;
    frag.appendChild(el);
  });
  bodyEl.replaceChildren(frag);

  /* 回到顶部：滚过一屏才出现（短文章不显示），点击平滑回顶 */
  var toTop = document.querySelector('[data-article-to-top]');
  if (toTop) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var syncToTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', syncToTop, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    syncToTop();
  }
})();
