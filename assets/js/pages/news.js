/* 官方资讯列表：每页 10 条，数据来自 assets/js/news-data.js，底部分页仅页码
   交互模式对齐 assets/js/my-knowledge.js 的 renderPagination */
(function () {
  'use strict';

  var NEWS = window.SKNews || [];
  var PAGE_SIZE = 10;

  var listEl = document.querySelector('[data-news-list]');
  var pagerEl = document.querySelector('[data-news-pagination]');
  if (!listEl || !pagerEl) { return; }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var totalPages = Math.max(1, Math.ceil(NEWS.length / PAGE_SIZE));
  var page = 1;

  function buildItem(item) {
    var li = document.createElement('li');
    li.className = 'news-item';

    var time = document.createElement('time');
    time.className = 'news-item__date';
    time.dateTime = item.date;
    var day = document.createElement('strong');
    day.textContent = item.date.slice(8);
    var ym = document.createElement('span');
    ym.textContent = item.date.slice(0, 7);
    time.appendChild(day);
    time.appendChild(ym);

    var body = document.createElement('div');
    body.className = 'news-item__body';
    var title = document.createElement('h3');
    title.className = 'news-item__title';
    var titleLink = document.createElement('a');
    titleLink.href = './news-article.html?id=' + item.id;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener';
    titleLink.textContent = item.title;
    title.appendChild(titleLink);
    var excerpt = document.createElement('p');
    excerpt.className = 'news-item__excerpt';
    excerpt.textContent = item.excerpt;
    body.appendChild(title);
    body.appendChild(excerpt);

    li.appendChild(time);
    li.appendChild(body);
    return li;
  }

  function renderItems() {
    var start = (page - 1) * PAGE_SIZE;
    var frag = document.createDocumentFragment();
    NEWS.slice(start, start + PAGE_SIZE).forEach(function (item) {
      frag.appendChild(buildItem(item));
    });
    listEl.replaceChildren(frag);
  }

  function renderPagination() {
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.newsPage = String(i);
      btn.textContent = String(i);
      if (i === page) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'page');
      }
      btn.addEventListener('click', function () {
        goToPage(Number(this.dataset.newsPage));
      });
      frag.appendChild(btn);
    }
    pagerEl.replaceChildren(frag);
  }

  function goToPage(next) {
    page = Math.min(Math.max(1, next), totalPages);
    renderItems();
    renderPagination();
    listEl.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  renderItems();
  renderPagination();
})();
