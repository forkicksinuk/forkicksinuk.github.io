(function () {
  'use strict';

  var searchRoot = document.querySelector('[data-search]');
  if (!searchRoot) {
    return;
  }

  var input = searchRoot.querySelector('[data-search-input]');
  var resultsEl = searchRoot.querySelector('[data-search-results]');

  if (!input || !resultsEl || typeof window.Fuse === 'undefined') {
    return;
  }

  var fuse = null;
  var loading = false;
  var activeIndex = -1;
  var MIN_QUERY_LENGTH = 2;
  var MAX_RESULTS = 8;
  var indexUrl = new URL('index.json', window.location.origin).toString();

  var debounce = function (fn, delay) {
    var timerId;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timerId);
      timerId = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  var clean = function (text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  };

  var buildSnippet = function (entry, query) {
    var base = clean(entry.summary) || clean(entry.content);
    if (!base) {
      return '';
    }

    var maxLength = 160;
    if (!query) {
      return base.length > maxLength ? base.slice(0, maxLength - 1) + '…' : base;
    }

    var normalized = base.toLowerCase();
    var queryNormalized = query.toLowerCase();
    var matchIndex = normalized.indexOf(queryNormalized);

    if (matchIndex === -1) {
      return base.length > maxLength ? base.slice(0, maxLength - 1) + '…' : base;
    }

    var start = Math.max(0, matchIndex - 40);
    var end = Math.min(base.length, matchIndex + query.length + 60);
    var snippet = base.slice(start, end);

    if (start > 0) {
      snippet = '…' + snippet;
    }
    if (end < base.length) {
      snippet = snippet + '…';
    }

    return snippet;
  };

  var renderError = function () {
    resultsEl.innerHTML = '';
    var message = document.createElement('div');
    message.className = 'site-search__empty';
    message.textContent = 'Search is unavailable right now.';
    resultsEl.appendChild(message);
    resultsEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  var resetResults = function () {
    resultsEl.innerHTML = '';
    resultsEl.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  };

  var setActiveResult = function (index) {
    var items = resultsEl.querySelectorAll('.site-search__result');
    if (!items.length) {
      activeIndex = -1;
      return;
    }

    if (index < 0) {
      index = items.length - 1;
    } else if (index >= items.length) {
      index = 0;
    }

    items.forEach(function (item, idx) {
      var isActive = idx === index;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    items[index].scrollIntoView({ block: 'nearest' });
    activeIndex = index;
  };

  var renderResults = function (results, query) {
    resultsEl.innerHTML = '';
    activeIndex = -1;

    if (!results.length) {
      var empty = document.createElement('div');
      empty.className = 'site-search__empty';
      empty.textContent = 'No results found.';
      resultsEl.appendChild(empty);
      resultsEl.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      return;
    }

    var fragment = document.createDocumentFragment();

    results.slice(0, MAX_RESULTS).forEach(function (entry, idx) {
      var item = entry.item || entry;
      if (!item || !item.permalink) {
        return;
      }

      var link = document.createElement('a');
      link.className = 'site-search__result';
      link.href = item.permalink;
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', 'false');
      link.dataset.index = String(idx);

      var title = document.createElement('span');
      title.className = 'site-search__result-title';
      title.textContent = item.title || 'Untitled';
      link.appendChild(title);

      var snippetText = buildSnippet(item, input.value.trim());
      if (snippetText) {
        var snippet = document.createElement('p');
        snippet.className = 'site-search__result-summary';
        snippet.textContent = snippetText;
        link.appendChild(snippet);
      }

      fragment.appendChild(link);
    });

    resultsEl.appendChild(fragment);
    if (resultsEl.children.length === 0) {
      resetResults();
      return;
    }

    resultsEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  var loadIndex = function () {
    if (fuse || loading) {
      return Promise.resolve(fuse);
    }

    loading = true;

    return fetch(indexUrl, { credentials: 'same-origin', cache: 'force-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch search index');
        }
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error('Invalid search index format');
        }

        fuse = new window.Fuse(data, {
          includeScore: true,
          shouldSort: true,
          threshold: 0.32,
          minMatchCharLength: 2,
          ignoreLocation: true,
          keys: [
            { name: 'title', weight: 0.55 },
            { name: 'summary', weight: 0.25 },
            { name: 'content', weight: 0.2 }
          ]
        });

        return fuse;
      })
      .catch(function (error) {
        console.error('[Search]', error);
        return null;
      })
      .finally(function () {
        loading = false;
      });
  };

  var performSearch = debounce(function () {
    var query = input.value.trim();

    if (query.length < MIN_QUERY_LENGTH) {
      resetResults();
      return;
    }

    loadIndex().then(function (fuseInstance) {
      if (!fuseInstance) {
        renderError();
        return;
      }

      var results = fuseInstance.search(query, { limit: MAX_RESULTS });
      renderResults(results, query);
    });
  }, 180);

  var handleKeydown = function (event) {
    if (resultsEl.hidden && event.key !== 'Escape') {
      return;
    }

    var items = resultsEl.querySelectorAll('.site-search__result');
    if (!items.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveResult(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveResult(activeIndex <= 0 ? items.length - 1 : activeIndex - 1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < items.length) {
          event.preventDefault();
          items[activeIndex].click();
        }
        break;
      case 'Escape':
        resetResults();
        input.blur();
        break;
      default:
        break;
    }
  };

  input.addEventListener('input', performSearch);
  input.addEventListener('keydown', handleKeydown);
  input.addEventListener('focus', function () {
    if (input.value.trim().length >= MIN_QUERY_LENGTH) {
      performSearch();
    }
  });

  resultsEl.addEventListener('pointermove', function (event) {
    var target = event.target.closest('.site-search__result');
    if (!target) {
      return;
    }
    var index = Number(target.dataset.index);
    if (!Number.isNaN(index)) {
      setActiveResult(index);
    }
  });

  document.addEventListener('pointerdown', function (event) {
    if (!searchRoot.contains(event.target)) {
      resetResults();
    }
  });

  window.addEventListener('pageshow', function () {
    if (input.value.trim().length >= MIN_QUERY_LENGTH) {
      performSearch();
    }
  });
})();
