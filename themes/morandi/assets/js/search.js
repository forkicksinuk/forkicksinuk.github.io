(function () {
  'use strict';

  var searchRoot = document.querySelector('[data-search]');
  if (!searchRoot) {
    return;
  }

  if (typeof window.Fuse === 'undefined') {
    return;
  }

  var input = searchRoot.querySelector('[data-search-input]');
  var trigger = searchRoot.querySelector('[data-search-button]');

  if (!input || !trigger) {
    return;
  }

  var fuse = null;
  var loading = false;
  var modal = null;
  var modalInput = null;
  var modalResults = null;
  var modalForm = null;
  var closeButton = null;
  var previousActiveElement = null;

  var MIN_QUERY_LENGTH = 1;
  var MAX_RESULTS = 12;
  var indexUrl = new URL('index.json', window.location.origin).toString();

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
      return base.length > maxLength ? base.slice(0, maxLength - 3) + '...' : base;
    }

    var normalized = base.toLowerCase();
    var queryNormalized = query.toLowerCase();
    var matchIndex = normalized.indexOf(queryNormalized);

    if (matchIndex === -1) {
      return base.length > maxLength ? base.slice(0, maxLength - 3) + '...' : base;
    }

    var start = Math.max(0, matchIndex - 40);
    var end = Math.min(base.length, matchIndex + query.length + 60);
    var snippet = base.slice(start, end);

    if (start > 0) {
      snippet = '...' + snippet;
    }
    if (end < base.length) {
      snippet = snippet + '...';
    }

    return snippet;
  };

  var formatDate = function (value) {
    if (!value) {
      return '';
    }

    try {
      var date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    } catch (error) {
      // ignore parse errors
    }

    return value;
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

  var renderMessage = function (message) {
    if (!modalResults) {
      return;
    }

    modalResults.innerHTML = '';

    var messageEl = document.createElement('p');
    messageEl.className = 'site-search__modal-message';
    messageEl.textContent = message;
    modalResults.appendChild(messageEl);
  };

  var renderResults = function (results, query) {
    if (!modalResults) {
      return;
    }

    modalResults.innerHTML = '';

    if (!results.length) {
      renderMessage('No results found.');
      return;
    }

    results.slice(0, MAX_RESULTS).forEach(function (entry) {
      var item = entry && entry.item ? entry.item : entry;
      if (!item) {
        return;
      }

      var article = document.createElement('article');
      article.className = 'post-card';

      var link = document.createElement('a');
      link.className = 'post-card__link';
      link.href = item.permalink || '#';

      var title = document.createElement('h3');
      title.className = 'post-card__title';
      title.textContent = item.title || 'Untitled';

      var meta = document.createElement('div');
      meta.className = 'post-card__meta';

      var appendMetaItem = function (value, className) {
        if (!value) {
          return;
        }
        if (meta.children.length > 0) {
          var separator = document.createElement('span');
          separator.className = 'post-card__separator';
          separator.textContent = '·';
          meta.appendChild(separator);
        }
        var span = document.createElement('span');
        span.className = className;
        span.textContent = value;
        meta.appendChild(span);
      };

      appendMetaItem(formatDate(item.date), 'post-card__date');
      appendMetaItem(item.location, 'post-card__location');
      appendMetaItem(item.author, 'post-card__author');

      link.appendChild(title);
      if (meta.children.length > 0) {
        link.appendChild(meta);
      }
      var summaryText = buildSnippet(item, query);
      if (summaryText) {
        var summary = document.createElement('p');
        summary.className = 'post-card__summary';
        summary.textContent = summaryText;
        link.appendChild(summary);
      }
      article.appendChild(link);
      modalResults.appendChild(article);
    });
  };

  var handleDocumentKeydown = function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    }
  };

  var closeModal = function () {
    if (!modal || modal.hidden) {
      return;
    }

    modal.classList.remove('is-open');
    document.body.classList.remove('is-search-open');
    document.removeEventListener('keydown', handleDocumentKeydown);
    input.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-expanded', 'false');

    var closed = false;
    var finalize = function () {
      if (closed) {
        return;
      }
      closed = true;
      modal.hidden = true;
      if (modalResults) {
        modalResults.innerHTML = '';
      }
    };

    modal.addEventListener('transitionend', finalize, { once: true });
    window.setTimeout(finalize, 250);

    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  };

  var ensureModal = function () {
    if (modal) {
      return;
    }

    modal = document.createElement('div');
    modal.className = 'site-search__modal';
    modal.id = 'site-search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'site-search-modal-title');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="site-search__modal-content" data-search-modal-content>' +
      '  <header class="site-search__modal-header">' +
      '    <h2 class="site-search__modal-title" id="site-search-modal-title">Search</h2>' +
      '    <button class="site-search__modal-close" type="button" aria-label="Close search" data-search-close>' +
      '      <span aria-hidden="true">&times;</span>' +
      '    </button>' +
      '  </header>' +
      '  <form class="site-search__modal-form" data-search-form>' +
      '    <label class="visually-hidden" for="site-search-modal-input">Search posts</label>' +
      '    <div class="site-search__modal-field">' +
      '      <input class="site-search__modal-input" id="site-search-modal-input" type="search" name="q" placeholder="Search posts..." autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" data-search-modal-input />' +
      '      <button class="site-search__modal-submit" type="submit" aria-label="Run search">' +
      '        <svg class="site-search__icon" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">' +
      '          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />' +
      '          <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />' +
      '        </svg>' +
      '      </button>' +
      '    </div>' +
      '  </form>' +
      '  <div class="site-search__modal-results post-list" data-search-modal-results aria-live="polite"></div>' +
      '</div>';

    document.body.appendChild(modal);

    modalInput = modal.querySelector('[data-search-modal-input]');
    modalResults = modal.querySelector('[data-search-modal-results]');
    modalForm = modal.querySelector('[data-search-form]');
    closeButton = modal.querySelector('[data-search-close]');

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    if (modalForm) {
      modalForm.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch(modalInput.value);
      });
    }
  };

  var openModal = function () {
    ensureModal();

    if (!modal || !modalInput || !modalResults) {
      return;
    }

    if (!modal.hidden) {
      return;
    }

    previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    modal.hidden = false;
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });

    document.body.classList.add('is-search-open');
    document.addEventListener('keydown', handleDocumentKeydown);
    input.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-expanded', 'true');

    modalResults.innerHTML = '';
    modalInput.value = input.value.trim();
    modalInput.focus();
    modalInput.select();
  };

  var runSearch = function (query) {
    if (!modalInput || !modalResults) {
      return;
    }

    var trimmed = (query || '').trim();
    input.value = trimmed;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      var unit = MIN_QUERY_LENGTH === 1 ? ' character.' : ' characters.';
      renderMessage('Please enter at least ' + MIN_QUERY_LENGTH + unit);
      return;
    }

    renderMessage('Searching...');

    loadIndex().then(function (fuseInstance) {
      if (!fuseInstance) {
        renderMessage('Search is unavailable right now.');
        return;
      }

      var results = fuseInstance.search(trimmed, { limit: MAX_RESULTS });
      renderResults(results, trimmed);
    });
  };

  trigger.addEventListener('click', function () {
    openModal();

    if (modalInput && modalResults) {
      if (modalInput.value.trim().length >= MIN_QUERY_LENGTH) {
        runSearch(modalInput.value);
      } else {
        renderMessage('Type a query and press Enter.');
      }
    }
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      openModal();

      if (modalInput && modalResults) {
        modalInput.value = input.value.trim();
        if (modalInput.value.length >= MIN_QUERY_LENGTH) {
          runSearch(modalInput.value);
        } else {
          renderMessage('Type a query and press Enter.');
        }
      }
    }
  });
})();
