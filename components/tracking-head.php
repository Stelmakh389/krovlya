<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="shortcut icon" href="favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#25ae34">
<script>
  window.CookieConsentConfig = window.CookieConsentConfig || {};
  window.CookieConsentConfig.storageKey = 'roof_cookie_consent';
  window.CookieConsentConfig.version = '1.0.0';
  window.CookieConsentConfig.yandexCounters = [
    {
      number: 110583219,
      ssr: true,
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
      ecommerce: 'dataLayer'
    }
  ];
</script>
<script>
  (function(window, document, n, project_ids) {
    window.GudokData = n;
    if (typeof project_ids !== 'object') {
      project_ids = [project_ids];
    }
    window[n] = {};
    window[n].projects = project_ids;
    config_load(project_ids.join(','));

    function config_load(cId) {
      var a = document.getElementsByTagName('script')[0];
      var s = document.createElement('script');
      var i = function() {
        a.parentNode.insertBefore(s, a);
      };
      var cMrs = '';

      s.async = true;
      if (document.location.search && document.location.search.indexOf('?gudok_check=') === 0) {
        cMrs += document.location.search.replace('?', '&');
      }
      s.src = '//mod.gudok.tel/script.js?sid=' + cId + cMrs;

      if (window.opera == '[object Opera]') {
        document.addEventListener('DOMContentLoaded', i, false);
      } else {
        i();
      }
    }
  })(window, document, 'gd', 'soppijp66b');
</script>
