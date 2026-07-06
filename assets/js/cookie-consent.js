(function () {
  'use strict';

  var script = document.currentScript;
  var config = window.CookieConsentConfig || {};

  function parseJson(value, fallback) {
    if (!value) return fallback;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  if (script) {
    config.analyticsUrl = config.analyticsUrl || script.getAttribute('data-analytics-url') || '';
    config.yandexCounters = config.yandexCounters || parseJson(script.getAttribute('data-yandex-counters'), []);
    config.storageKey = config.storageKey || script.getAttribute('data-storage-key') || 'cookie_consent';
    config.version = config.version || script.getAttribute('data-version') || '1.0.0';
  }

  var storageKey = config.storageKey || 'cookie_consent';
  var consentVersion = config.version || '1.0.0';
  var analyticsLoaded = false;
  var yandexTagLoading = false;

  function readConsent() {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey));
    } catch (error) {
      return null;
    }
  }

  function writeConsent(analyticsAccepted) {
    var consent = {
      version: consentVersion,
      necessary: true,
      analytics: Boolean(analyticsAccepted),
      acceptedAt: new Date().toISOString()
    };

    window.localStorage.setItem(storageKey, JSON.stringify(consent));
    return consent;
  }

  function consentIsActual(consent) {
    return consent && consent.version === consentVersion;
  }

  function loadExternalScript(src) {
    if (!src) return;

    var externalScript = document.createElement('script');
    externalScript.src = src;
    externalScript.async = true;
    externalScript.dataset.cookieCategory = 'analytics';
    document.head.appendChild(externalScript);
  }

  function activateMarkedScripts() {
    var scripts = document.querySelectorAll('script[data-cookie-script="analytics"]:not([data-cookie-activated])');

    Array.prototype.forEach.call(scripts, function (originalScript) {
      var executableScript = document.createElement('script');
      var source = originalScript.getAttribute('data-src') || originalScript.getAttribute('src');

      Array.prototype.forEach.call(originalScript.attributes, function (attribute) {
        if (
          attribute.name === 'type' ||
          attribute.name === 'src' ||
          attribute.name === 'data-src' ||
          attribute.name === 'data-cookie-script' ||
          attribute.name === 'data-cookie-activated'
        ) {
          return;
        }

        executableScript.setAttribute(attribute.name, attribute.value);
      });

      if (source) {
        executableScript.src = source;
      } else {
        executableScript.text = originalScript.textContent;
      }

      executableScript.async = originalScript.async;
      executableScript.dataset.cookieCategory = 'analytics';

      originalScript.dataset.cookieActivated = 'true';
      originalScript.parentNode.insertBefore(executableScript, originalScript.nextSibling);
    });
  }

  function loadYandexMetrika() {
    var counters = Array.isArray(config.yandexCounters) ? config.yandexCounters : [];

    if (!counters.length) return;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };

    window.ym.l = window.ym.l || Number(new Date());

    counters.forEach(function (counter) {
      if (!counter || !counter.number) return;

      window.ym(counter.number, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: Boolean(counter.webvisor),
        ecommerce: counter.ecommerce || 'dataLayer'
      });
    });

    if (!yandexTagLoading) {
      yandexTagLoading = true;
      loadExternalScript('https://mc.yandex.ru/metrika/tag.js');
    }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;

    analyticsLoaded = true;
    activateMarkedScripts();
    loadExternalScript(config.analyticsUrl);
    loadYandexMetrika();
  }

  function applyConsent(consent) {
    if (consent && consent.analytics) {
      loadAnalytics();
    }
  }

  function createBanner() {
    if (document.querySelector('[data-cookie-consent]')) return;

    var banner = document.createElement('div');

    banner.className = 'cookie-consent';
    banner.setAttribute('data-cookie-consent', '');
    banner.hidden = true;

    banner.innerHTML =
      '<div class="cookie-consent__panel" role="dialog" aria-live="polite" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description">' +
        '<div class="cookie-consent__content">' +
          '<h2 class="cookie-consent__title" id="cookie-consent-title">Мы используем cookies</h2>' +
          '<p class="cookie-consent__text" id="cookie-consent-description">Мы используем обязательные cookies для работы сайта и можем использовать аналитические cookies, чтобы улучшать сайт и оценивать посещаемость. Аналитика включается только после вашего согласия. Продолжение просмотра, прокрутка или закрытие окна не считается согласием.</p>' +
          '<p class="cookie-consent__links">' +
            '<a href="politika-konfidencialnosti.php">Политика обработки персональных данных</a>' +
            '<a href="soglasie-na-obrabotku-personalnyh-dannyh.php">Согласие на обработку персональных данных</a>' +
          '</p>' +
          '<div class="cookie-consent__settings" data-cookie-settings hidden>' +
            '<label class="cookie-consent__option">' +
              '<input type="checkbox" checked disabled>' +
              '<span><strong>Обязательные cookies</strong><small>Нужны для работы сайта, форм и сохранения выбранных настроек.</small></span>' +
            '</label>' +
            '<label class="cookie-consent__option">' +
              '<input type="checkbox" data-cookie-analytics>' +
              '<span><strong>Аналитические cookies</strong><small>Помогают оценивать посещаемость и эффективность сайта. Можно отключить в любой момент.</small></span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="cookie-consent__actions">' +
          '<button class="cookie-consent__btn cookie-consent__btn--secondary" type="button" data-cookie-reject>Отклонить</button>' +
          '<button class="cookie-consent__btn cookie-consent__btn--secondary" type="button" data-cookie-customize>Настроить</button>' +
          '<button class="cookie-consent__btn cookie-consent__btn--primary" type="button" data-cookie-accept>Принять все</button>' +
          '<button class="cookie-consent__btn cookie-consent__btn--primary" type="button" data-cookie-save hidden>Принять</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
  }

  function initBanner() {
    createBanner();

    var banner = document.querySelector('[data-cookie-consent]');
    var title = document.getElementById('cookie-consent-title');
    var settings = document.querySelector('[data-cookie-settings]');
    var analyticsCheckbox = document.querySelector('[data-cookie-analytics]');
    var acceptButton = document.querySelector('[data-cookie-accept]');
    var rejectButton = document.querySelector('[data-cookie-reject]');
    var customizeButton = document.querySelector('[data-cookie-customize]');
    var saveButton = document.querySelector('[data-cookie-save]');
    var openButtons = document.querySelectorAll('[data-cookie-open-settings]');
    var currentConsent = readConsent();

    function showDefaultBanner() {
      if (title) title.textContent = 'Мы используем cookies';
      if (settings) settings.hidden = true;
      if (saveButton) saveButton.hidden = true;
      if (customizeButton) customizeButton.hidden = false;
      if (acceptButton) acceptButton.hidden = false;
      if (rejectButton) rejectButton.hidden = false;
      if (banner) banner.hidden = false;
    }

    function showSettings() {
      var consent = readConsent();

      if (title) title.textContent = 'Настройки cookies';
      if (analyticsCheckbox) analyticsCheckbox.checked = Boolean(consent && consent.analytics);
      if (settings) settings.hidden = false;
      if (saveButton) saveButton.hidden = false;
      if (customizeButton) customizeButton.hidden = true;
      if (acceptButton) acceptButton.hidden = true;
      if (rejectButton) rejectButton.hidden = true;
      if (banner) banner.hidden = false;
    }

    function closeBanner(consent) {
      applyConsent(consent);
      if (banner) banner.hidden = true;
    }

    if (consentIsActual(currentConsent)) {
      applyConsent(currentConsent);
    } else {
      showDefaultBanner();
    }

    if (acceptButton) {
      acceptButton.addEventListener('click', function () {
        closeBanner(writeConsent(true));
      });
    }

    if (rejectButton) {
      rejectButton.addEventListener('click', function () {
        closeBanner(writeConsent(false));
      });
    }

    if (customizeButton) {
      customizeButton.addEventListener('click', showSettings);
    }

    if (saveButton) {
      saveButton.addEventListener('click', function () {
        var analyticsAccepted = Boolean(analyticsCheckbox && analyticsCheckbox.checked);
        var consent = writeConsent(analyticsAccepted);

        closeBanner(consent);

        if (!analyticsAccepted && analyticsLoaded) {
          window.location.reload();
        }
      });
    }

    Array.prototype.forEach.call(openButtons, function (button) {
      button.addEventListener('click', showSettings);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
