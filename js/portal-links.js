(function () {
  function getMetaContent(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? (el.getAttribute('content') || '').trim() : '';
  }

  function isLocalHost(hostname) {
    return (
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.lan')
    );
  }

  function inferProductionPortalUrl(portal, hostname, protocol) {
    var proto = protocol === 'http:' ? 'https:' : protocol || 'https:';
    var lower = String(hostname || '').toLowerCase();
    if (!lower) return '';

    // Vercel deployment naming convention: e.g. newsim-landing.vercel.app -> newsim-trainee.vercel.app
    if (lower.endsWith('.vercel.app')) {
      if (lower.indexOf('landing') !== -1) {
        return proto + '//' + lower.replace('landing', portal);
      }
      var prefix = lower.replace(/\.vercel\.app$/, '');
      return proto + '//' + prefix + '-' + portal + '.vercel.app';
    }

    // Custom domain convention: e.g. www.newsim.ph or newsim.ph -> trainee.newsim.ph
    var rootDomain = lower.replace(/^(www|landing)\./, '');
    return proto + '//' + portal + '.' + rootDomain;
  }

  function resolvePortalBase(portal) {
    var globalConfig = window.NEWSIM_PORTALS || {};
    if (globalConfig[portal]) {
      return String(globalConfig[portal]).replace(/\/+$/, '');
    }
    var metaVal = getMetaContent('newsim-' + portal + '-url');
    if (metaVal) {
      return metaVal.replace(/\/+$/, '');
    }
    if (isLocalHost(window.location.hostname)) {
      var defaults = {
        management: 'http://localhost:3000',
        instructor: 'http://localhost:3001',
        trainee: 'http://localhost:3002',
      };
      return defaults[portal] || defaults.trainee;
    }
    return inferProductionPortalUrl(portal, window.location.hostname, window.location.protocol);
  }

  function applyPortalLinks() {
    if (
      window.location.protocol === 'http:' &&
      !isLocalHost(window.location.hostname)
    ) {
      window.location.replace(
        'https://' +
          window.location.host +
          window.location.pathname +
          window.location.search +
          window.location.hash
      );
      return;
    }

    var portalLinks = document.querySelectorAll('[data-portal]');
    for (var i = 0; i < portalLinks.length; i++) {
      var anchor = portalLinks[i];
      var portal = anchor.getAttribute('data-portal');
      var path = anchor.getAttribute('data-portal-path') || '/login';
      if (!portal) continue;
      var baseUrl = resolvePortalBase(portal);
      if (baseUrl) {
        anchor.setAttribute('href', baseUrl + path);
        anchor.removeAttribute('aria-disabled');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPortalLinks);
  } else {
    applyPortalLinks();
  }
})();
