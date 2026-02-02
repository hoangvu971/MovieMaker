/**
 * Client-side navigation to prevent white flash on full page loads.
 * Intercepts internal links and fetches + swaps content without reload.
 * Uses fade transitions to avoid flickering during page changes.
 */
(function () {
  const origin = location.origin;
  const FADE_DURATION = 120;

  function isInternalLink(href) {
    if (!href || href.startsWith('javascript:') || href.startsWith('#')) return false;
    try {
      const url = new URL(href, origin);
      return url.origin === origin && (url.pathname === '/' || url.pathname === '/editor');
    } catch {
      return false;
    }
  }

  function fadeOut() {
    document.body.style.transition = 'opacity ' + FADE_DURATION + 'ms ease-out';
    document.body.style.opacity = '0';
    return new Promise(function (r) {
      setTimeout(r, FADE_DURATION);
    });
  }

  function fadeIn() {
    document.body.style.opacity = '1';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.style.transition = '';
      });
    });
  }

  async function navigateTo(url) {
    const fullUrl = url.startsWith('http') ? url : origin + (url.startsWith('/') ? url : '/' + url);
    try {
      const res = await fetch(fullUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newBody = doc.body;
      const newHead = doc.head;
      const scripts = Array.from(doc.querySelectorAll('script[src]'));

      // Fade out before swap to avoid flickering
      await fadeOut();

      // Get body HTML without scripts (scripts in body wouldn't run via innerHTML anyway)
      scripts.forEach(function (s) {
        s.remove();
      });
      document.body.className = newBody.className;
      document.body.innerHTML = newBody.innerHTML;

      // Copy head elements we need (title, meta theme-color, etc.)
      const title = newHead.querySelector('title');
      if (title) document.title = title.textContent;
      const themeColor = newHead.querySelector('meta[name="theme-color"]');
      const existingTheme = document.querySelector('meta[name="theme-color"]');
      if (themeColor && existingTheme) existingTheme.setAttribute('content', themeColor.getAttribute('content') || '');

      // Load and run the page's script(s), wait for them before revealing
      const scriptPromises = [];
      scripts.forEach(function (script) {
        var el = document.createElement('script');
        el.type = 'module';
        el.src = script.src;
        scriptPromises.push(
          new Promise(function (resolve) {
            el.onload = el.onerror = resolve;
          })
        );
        document.body.appendChild(el);
      });
      await Promise.all(scriptPromises);

      // Small delay so new page's DOMContentLoaded/init can run
      await new Promise(function (r) {
        setTimeout(r, 50);
      });

      history.pushState(null, '', fullUrl);

      // Fade in new content
      fadeIn();
    } catch (err) {
      document.body.style.opacity = '1';
      document.body.style.transition = '';
      console.error('Navigation failed, falling back to full load:', err);
      location.href = fullUrl;
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || !isInternalLink(a.href)) return;
    e.preventDefault();
    navigateTo(a.href);
  });

  window.StoryboardNavigate = navigateTo;

  window.addEventListener('popstate', function () {
    location.reload();
  });
})();
