(function () {
  var STORAGE_KEY = 'newsim_cookie_consent_v1';
  var POLICY_VERSION = '2026-11-v1';
  var gaLoaded = false;

  function getGaMeasurementId() {
    if (window.NEWSIM_GA_MEASUREMENT_ID) {
      return String(window.NEWSIM_GA_MEASUREMENT_ID).trim();
    }
    var meta = document.querySelector('meta[name="newsim-ga-id"]');
    return meta ? (meta.getAttribute('content') || '').trim() : '';
  }

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (typeof parsed.analytics !== 'boolean' || typeof parsed.preferences !== 'boolean') {
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics, preferences) {
    var record = {
      version: POLICY_VERSION,
      essential: true,
      analytics: Boolean(analytics),
      preferences: Boolean(preferences),
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      var maxAge = 180 * 24 * 60 * 60;
      var secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie =
        'newsim_cookie_consent=' +
        encodeURIComponent(record.analytics ? 'analytics' : 'essential') +
        '; Path=/; Max-Age=' +
        maxAge +
        '; SameSite=Lax' +
        secure;
    } catch (e) {}

    if (record.analytics) {
      initAnalyticsIfConfigured();
    }
    return record;
  }

  function initAnalyticsIfConfigured() {
    var gaId = getGaMeasurementId();
    if (!gaId || gaLoaded) return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(script);
  }

  function trackEvent(eventName, params) {
    var consent = readConsent();
    if (!consent || !consent.analytics || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  function injectStyles() {
    if (document.getElementById('newsim-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'newsim-cookie-styles';
    style.textContent =
      '.newsim-cookie-banner{position:fixed;bottom:16px;right:16px;left:16px;max-width:480px;margin-left:auto;z-index:9999;background:rgba(10,22,37,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(216,196,165,0.32);border-radius:16px;padding:18px 20px;color:#e2e8f0;box-shadow:0 24px 60px rgba(0,0,0,0.65);font-family:Inter,system-ui,sans-serif;}' +
      '.newsim-cookie-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}' +
      '.newsim-cookie-title{font-family:Sora,sans-serif;font-size:15px;font-weight:700;color:#ffffff;margin:0;}' +
      '.newsim-cookie-sub{font-size:11px;color:#94a3b8;margin:2px 0 0 0;}' +
      '.newsim-cookie-body{font-size:12.5px;line-height:1.55;color:#cbd5e1;margin:12px 0;}' +
      '.newsim-cookie-body a{color:#38bdf8;text-decoration:underline;}' +
      '.newsim-cookie-options{background:rgba(7,17,28,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;margin:10px 0;display:none;flex-direction:column;gap:10px;font-size:12px;}' +
      '.newsim-cookie-options.open{display:flex;}' +
      '.newsim-cookie-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}' +
      '.newsim-cookie-row+.newsim-cookie-row{border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;}' +
      '.newsim-cookie-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(34,197,94,0.14);color:#86efac;border:1px solid rgba(34,197,94,0.3);white-space:nowrap;}' +
      '.newsim-cookie-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:12px;}' +
      '.newsim-cookie-btn{border-radius:10px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.05);color:#f8fafc;transition:background .2s,transform .15s;}' +
      '.newsim-cookie-btn:hover{background:rgba(255,255,255,0.12);}' +
      '.newsim-cookie-btn--primary{background:#d8c4a5;color:#07111c;border-color:#d8c4a5;font-weight:700;}' +
      '.newsim-cookie-btn--primary:hover{background:#e6d7bf;}' +
      '.newsim-cookie-close{background:transparent;border:none;color:#94a3b8;font-size:18px;line-height:1;cursor:pointer;padding:2px 6px;}' +
      '@media (max-width:480px){.newsim-cookie-actions{flex-direction:column;}.newsim-cookie-btn{width:100%;text-align:center;}}';
    document.head.appendChild(style);
  }

  function createBanner(showCustomize) {
    injectStyles();
    var existingEl = document.getElementById('newsim-cookie-banner');
    if (existingEl) existingEl.remove();

    var stored = readConsent();
    var banner = document.createElement('aside');
    banner.id = 'newsim-cookie-banner';
    banner.className = 'newsim-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie Consent Preferences');

    banner.innerHTML =
      '<div class="newsim-cookie-header">' +
      '  <div>' +
      '    <h2 class="newsim-cookie-title">NEWSIM Cookie Preferences</h2>' +
      '    <p class="newsim-cookie-sub">Essential session security vs. optional analytics</p>' +
      '  </div>' +
      (stored ? '<button type="button" class="newsim-cookie-close" aria-label="Close cookie preferences">&times;</button>' : '') +
      '</div>' +
      '<p class="newsim-cookie-body">' +
      'NEWSIM uses strictly necessary storage for security and navigation. Optional analytics cookies remain disabled until you consent. Review our ' +
      '<a href="privacy.html">Privacy Policy</a> and <a href="privacy.html#cookies">Cookie Policy</a>.' +
      '</p>' +
      '<div class="newsim-cookie-options' + (showCustomize ? ' open' : '') + '">' +
      '  <div class="newsim-cookie-row">' +
      '    <div><strong style="color:#fff">Essential Security &amp; Preferences</strong><div style="font-size:11px;color:#94a3b8">Session integrity and consent choice storage.</div></div>' +
      '    <span class="newsim-cookie-badge">Always Active</span>' +
      '  </div>' +
      '  <label class="newsim-cookie-row" style="cursor:pointer">' +
      '    <div><strong style="color:#fff">Privacy-Safe Analytics (GA4)</strong><div style="font-size:11px;color:#94a3b8">Tracks aggregate page visits without PII.</div></div>' +
      '    <input type="checkbox" id="newsim-consent-analytics" ' + (stored && stored.analytics ? 'checked' : '') + ' style="width:16px;height:16px;accent-color:#d8c4a5;cursor:pointer;">' +
      '  </label>' +
      '  <label class="newsim-cookie-row" style="cursor:pointer">' +
      '    <div><strong style="color:#fff">UI Preferences</strong><div style="font-size:11px;color:#94a3b8">Saves interface display preferences.</div></div>' +
      '    <input type="checkbox" id="newsim-consent-prefs" ' + (!stored || stored.preferences ? 'checked' : '') + ' style="width:16px;height:16px;accent-color:#d8c4a5;cursor:pointer;">' +
      '  </label>' +
      '</div>' +
      '<div class="newsim-cookie-actions">' +
      '  <button type="button" class="newsim-cookie-btn" data-consent-action="customize">' + (showCustomize ? 'Hide Options' : 'Customize') + '</button>' +
      '  <button type="button" class="newsim-cookie-btn" data-consent-action="reject">Reject Non-Essential</button>' +
      '  <button type="button" class="newsim-cookie-btn newsim-cookie-btn--primary" data-consent-action="' + (showCustomize ? 'save' : 'accept') + '">' + (showCustomize ? 'Save Preferences' : 'Accept All') + '</button>' +
      '</div>';

    document.body.appendChild(banner);

    var optionsEl = banner.querySelector('.newsim-cookie-options');
    var customizeBtn = banner.querySelector('[data-consent-action="customize"]');
    var primaryBtn = banner.querySelector('.newsim-cookie-btn--primary');
    var rejectBtn = banner.querySelector('[data-consent-action="reject"]');
    var closeBtn = banner.querySelector('.newsim-cookie-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        banner.remove();
      });
    }

    customizeBtn.addEventListener('click', function () {
      var isOpen = optionsEl.classList.toggle('open');
      customizeBtn.textContent = isOpen ? 'Hide Options' : 'Customize';
      primaryBtn.textContent = isOpen ? 'Save Preferences' : 'Accept All';
      primaryBtn.setAttribute('data-consent-action', isOpen ? 'save' : 'accept');
    });

    rejectBtn.addEventListener('click', function () {
      writeConsent(false, false);
      banner.remove();
    });

    primaryBtn.addEventListener('click', function () {
      var action = primaryBtn.getAttribute('data-consent-action');
      if (action === 'save') {
        var analyticsChecked = banner.querySelector('#newsim-consent-analytics').checked;
        var prefsChecked = banner.querySelector('#newsim-consent-prefs').checked;
        writeConsent(analyticsChecked, prefsChecked);
      } else {
        writeConsent(true, true);
      }
      banner.remove();
    });
  }

  window.openNewsimCookieSettings = function () {
    createBanner(true);
  };

  document.addEventListener('DOMContentLoaded', function () {
    var existing = readConsent();
    if (!existing) {
      createBanner(false);
    } else if (existing.analytics) {
      initAnalyticsIfConfigured();
    }

    var triggers = document.querySelectorAll('[data-open-cookie-settings]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        createBanner(true);
      });
    }

    var ctaButtons = document.querySelectorAll('[data-cta]');
    for (var j = 0; j < ctaButtons.length; j++) {
      ctaButtons[j].addEventListener('click', function () {
        var ctaName = this.getAttribute('data-cta') || 'primary_cta';
        trackEvent('cta_click', { cta_location: ctaName });
      });
    }
  });
})();
